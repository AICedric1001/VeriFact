import psycopg2
import psycopg2.extras
from functools import wraps
from datetime import datetime

def get_db_connection():
    """Create and return a database connection."""
    try:
        conn = psycopg2.connect(
            host="127.0.0.1",  # Force IPv4
            user="postgres",
            password="123",
            database="websearch_demo",
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        print("Please check your database configuration in db_utils.py")
        print("Make sure PostgreSQL is running and the credentials are correct")
        raise

def with_db_connection(func):
    """
    Decorator to handle database connection and cursor management.
    Automatically commits changes and closes the connection.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        conn = None
        try:
            conn = get_db_connection()
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                result = func(cursor, *args, **kwargs)
                conn.commit()
                return result
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    return wrapper

# Admin-specific database operations
class AdminDB:
    @staticmethod
    @with_db_connection
    def get_users(cursor, search_query=None, role_filter=None, status_filter=None, page=1, per_page=20):
        """Get paginated list of users with optional filtering and search."""
        try:
            offset = (page - 1) * per_page
            query = """
                SELECT 
                    user_id, username, role, created_at, uuid
                FROM users
                WHERE 1=1
            """
            params = []
            
            if search_query:
                query += " AND username ILIKE %s"
                params.append(f'%{search_query}%')
                
            if role_filter:
                query += " AND role = %s"
                params.append(role_filter)
                
            # Add sorting and pagination
            query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
            params.extend([per_page, offset])
            
            cursor.execute(query, params)
            users = cursor.fetchall()
            
            # Get total count for pagination
            count_query = "SELECT COUNT(*) as count FROM users WHERE 1=1"
            count_params = []
            
            if search_query:
                count_query += " AND username ILIKE %s"
                count_params.append(f'%{search_query}%')
                
            if role_filter:
                count_query += " AND role = %s"
                count_params.append(role_filter)
                
            cursor.execute(count_query, count_params)
            total_users = cursor.fetchone()['count']
            
            return {
                'users': users,
                'total': total_users,
                'page': page,
                'per_page': per_page,
                'total_pages': (total_users + per_page - 1) // per_page if per_page > 0 else 1
            }
        except Exception as e:
            print(f"Error in get_users: {e}")
            return {
                'users': [],
                'total': 0,
                'page': page,
                'per_page': per_page,
                'total_pages': 1
            }
        
    @staticmethod
    @with_db_connection
    def get_user_details(cursor, user_id):
        """Get detailed information about a specific user."""
        cursor.execute("""
            SELECT 
                u.user_id, u.username, u.role, u.created_at, u.uuid,
                (SELECT COUNT(*) FROM userreview WHERE user_id = u.user_id) as review_count
            FROM users u
            WHERE u.user_id = %s
        """, (user_id,))
        user = cursor.fetchone()
        if user:
            # Add default values for missing fields
            user['last_login'] = None
            user['login_count'] = 0
        return user
        
    @staticmethod
    @with_db_connection
    def update_user_status(cursor, user_id, is_active):
        """Activate or deactivate a user account."""
        cursor.execute("""
            UPDATE users 
            SET is_active = %s, updated_at = NOW()
            WHERE user_id = %s
            RETURNING user_id, username, is_active
        """, (is_active, user_id))
        return cursor.fetchone()
        
    @staticmethod
    @with_db_connection
    def update_user_role(cursor, user_id, new_role):
        """Update a user's role."""
        cursor.execute("""
            UPDATE users 
            SET role = %s, updated_at = NOW()
            WHERE user_id = %s
            RETURNING user_id, username, role
        """, (new_role, user_id))
        return cursor.fetchone()
        
    @staticmethod
    @with_db_connection
    def search_users(cursor, search_term):
        """Search users by username."""
        cursor.execute("""
            SELECT user_id, username, role, created_at, uuid
            FROM users
            WHERE username ILIKE %s
            ORDER BY username
            LIMIT 20
        """, (f'%{search_term}%',))
        return cursor.fetchall()

    @staticmethod
    @with_db_connection
    def get_user_roles(cursor):
        """Get list of available user roles."""
        cursor.execute("""
            SELECT DISTINCT role FROM users
            WHERE role IS NOT NULL
            ORDER BY role
        """)
        return [r[0] for r in cursor.fetchall()]
        
    @staticmethod
    @with_db_connection
    def get_user_roles(cursor):
        """Get all distinct user roles."""
        cursor.execute("""
            SELECT DISTINCT role 
            FROM users 
            WHERE role IS NOT NULL
        """)
        return [row['role'] for row in cursor.fetchall()]
        
    @staticmethod
    @with_db_connection
    def get_user_stats(cursor):
        """Get user statistics."""
        stats = {
            'total_users': 0,
            'new_users_today': 0,
            'new_users_7d': 0,
            'admin_count': 0
        }
        
        # Get total users
        cursor.execute("SELECT COUNT(*) FROM users")
        stats['total_users'] = cursor.fetchone()[0]
        
        # Get new users today
        cursor.execute("""
            SELECT COUNT(*) 
            FROM users 
            WHERE created_at >= CURRENT_DATE
        """)
        stats['new_users_today'] = cursor.fetchone()[0]
        
        # Get new users in last 7 days
        cursor.execute("""
            SELECT COUNT(*) 
            FROM users 
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        """)
        stats['new_users_7d'] = cursor.fetchone()[0]
        
        # Get admin count
        cursor.execute("""
            SELECT COUNT(*) 
            FROM users 
            WHERE role = 'admin'
        """)
        stats['admin_count'] = cursor.fetchone()[0]
        
        return stats
        
    @staticmethod
    @with_db_connection
    def get_user_activity(cursor, user_id, limit=50):
        """Get recent activity for a user."""
        try:
            # Check if user_activity table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'user_activity'
                )
            """)
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                return []
                
            cursor.execute("""
                SELECT * FROM user_activity
                WHERE user_id = %s
                ORDER BY activity_time DESC
                LIMIT %s
            """, (user_id, limit))
            return cursor.fetchall()
        except Exception as e:
            print(f"Error getting user activity: {e}")
            return []  # Return empty list if there's any error
        
    @staticmethod
    @with_db_connection
    def get_user_stats(cursor):
        """Get user statistics."""
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d
            FROM users
        """)
        stats = cursor.fetchone()
        # Add default values for missing stats
        stats['active_users'] = stats['total_users']  # Assume all users are active
        stats['active_today'] = 0  # Can't track this without user_logins
        return stats
        
    @staticmethod
    @with_db_connection
    def get_reviews(cursor, status=None):
        """Get all reviews from the database with optional status filter.
        
        Note: The status parameter is included for compatibility but not used in the query
        since the userreview table doesn't have a status column.
        """
        query = """
            SELECT 
                r.review_id,
                r.user_id,
                r.result_id,
                r.rating,
                r.created_at,
                r.review_text as comment,
                u.username as user_name,
                'approved' as status  -- Default status since it's not in the table
            FROM userreview r
            JOIN users u ON r.user_id = u.user_id
            ORDER BY r.created_at DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    
    @staticmethod
    @with_db_connection
    def get_review(cursor, review_id):
        """Get a single review by ID."""
        cursor.execute("""
            SELECT 
                r.review_id,
                r.user_id,
                r.result_id,
                r.rating,
                r.created_at,
                r.review_text as comment,
                u.username as user_name,
                'approved' as status  -- Default status since it's not in the table
            FROM userreview r
            LEFT JOIN users u ON r.user_id = u.user_id
            WHERE r.review_id = %s
        """, (review_id,))
        return cursor.fetchone()
        
    @staticmethod
    @with_db_connection
    def update_review_status(cursor, review_id, status):
        """Update the status of a review.
        
        Note: Since the userreview table doesn't have a status column,
        this function will only return the review without making any changes.
        """
        # Just return the review without updating since there's no status column
        cursor.execute("""
            SELECT 
                r.review_id,
                r.user_id,
                r.result_id,
                r.rating,
                r.created_at,
                r.review_text as comment,
                u.username as user_name,
                %s as status  -- Return the requested status
            FROM userreview r
            LEFT JOIN users u ON r.user_id = u.user_id
            WHERE r.review_id = %s
            RETURNING *
        """, (status, review_id))
        return cursor.fetchone()

    @staticmethod
    @with_db_connection
    def get_searches(cursor, limit=50):
        """Get recent searches with user information."""
        try:
            # Check if searches table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'searches'
                )
            """)
            if not cursor.fetchone()[0]:
                print("Note: 'searches' table doesn't exist.")
                return []
                
            cursor.execute("""
                SELECT s.search_id, s.query_text, s.timestamp, 
                       COALESCE(u.username, 'Anonymous') as username
                FROM searches s
                LEFT JOIN users u ON s.account_id = u.user_id
                ORDER BY s.timestamp DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        except Exception as e:
            print(f"Error getting searches: {e}")
            return []

    @staticmethod
    @with_db_connection
    def get_articles(cursor, limit=50):
        """Get recent articles with their sources."""
        try:
            # Check if articles table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'articles'
                )
            """)
            if not cursor.fetchone()[0]:
                print("Note: 'articles' table doesn't exist.")
                return []
                
            cursor.execute("""
                SELECT article_id, 
                       COALESCE(article_title, 'No title') as title,
                       article_url,
                       COALESCE(source_name, 'Unknown') as source,
                       publication_date
                FROM articles
                ORDER BY publication_date DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        except Exception as e:
            print(f"Error getting articles: {e}")
            return []

    @staticmethod
    @with_db_connection
    def get_categories(cursor, limit=50):
        """Get most used categories."""
        try:
            # Check if categories table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'categories'
                )
            """)
            if not cursor.fetchone()[0]:
                print("Note: 'categories' table doesn't exist.")
                return []
                
            cursor.execute("""
                SELECT category_id, entity_text, 
                       COUNT(*) as usage_count
                FROM categories
                GROUP BY category_id, entity_text
                ORDER BY usage_count DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        except Exception as e:
            print(f"Error getting categories: {e}")
            return []

    @staticmethod
    @with_db_connection
    def get_recent_activities(cursor, limit=5):
        """Get recent user activities from existing tables."""
        all_activities = []

        try:
            # 1. Get recent searches as activities
            try:
                cursor.execute("""
                    SELECT 
                        'search' as activity_type,
                        'Searched for: ' || query_text as details,
                        timestamp,
                        COALESCE(u.username, 'Guest') as username,
                        s.account_id as user_id
                    FROM searches s
                    LEFT JOIN users u ON s.account_id = u.user_id
                    ORDER BY timestamp DESC
                    LIMIT %s
                """, (limit,))
                all_activities.extend(cursor.fetchall())
            except Exception as e:
                print(f"Error getting search activities: {e}")
            
            # 2. Get new user registrations if users table exists
            try:
                cursor.execute("""
                    SELECT 
                        'registration' as activity_type,
                        'New user registered: ' || username as details,
                        created_at as timestamp,
                        username,
                        user_id
                    FROM users
                    ORDER BY created_at DESC
                    LIMIT %s
                """, (limit,))
                all_activities.extend(cursor.fetchall())
            except Exception as e:
                print(f"Error getting user registration activities: {e}")
            
            # 3. Get recent article activities if articles table exists
            try:
                cursor.execute("""
                    SELECT 
                        'article' as activity_type,
                        'New article: ' || COALESCE(article_title, 'Untitled') as details,
                        COALESCE(publication_date, NOW()) as timestamp,
                        'System' as username,
                        NULL as user_id
                    FROM articles
                    ORDER BY COALESCE(publication_date, NOW()) DESC
                    LIMIT %s
                """, (limit,))
                all_activities.extend(cursor.fetchall())
            except Exception as e:
                print(f"Error getting article activities: {e}")
            
            # Sort all activities by timestamp (newest first)
            all_activities.sort(key=lambda x: x.get('timestamp') or datetime.min, reverse=True)
            
            # Return only the requested number of most recent activities
            return all_activities[:limit]
            
        except Exception as e:
            print(f"Error getting recent activities: {e}")
            return []

    @staticmethod
    def _execute_raw_query(query):
        """Execute a raw query for debugging purposes."""
        import psycopg2
        import psycopg2.extras
        
        try:
            conn = psycopg2.connect(
                host="localhost",
                user="postgres",
                password="123",
                database="websearch_demo",
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            cursor = conn.cursor()
            cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                result = cursor.fetchall()
                cursor.close()
                conn.close()
                return result
            else:
                conn.commit()
                cursor.close()
                conn.close()
                return "Query executed successfully"
        except Exception as e:
            print(f"Raw query error: {e}")
            return None

    @staticmethod
    @with_db_connection
    def get_recent_searches(cursor, limit=5):
        """Get recent searches with user information from search_results table."""
        try:
            cursor.execute("""
                SELECT 
                    sr.result_id as search_id, 
                    sr.query as query_text, 
                    sr.created_at as timestamp,
                    NULL as account_id,
                    'System' as username
                FROM "search_results" sr
                ORDER BY sr.created_at DESC
                LIMIT %s
            """, (limit,))
            results = cursor.fetchall()
            print(f"Found {len(results)} recent searches from search_results")
            return results
        except Exception as e:
            print(f"Error getting recent searches: {e}")
            return []

    @staticmethod
    @with_db_connection
    def get_analytics_overview(cursor):
        """Comprehensive analytics using existing tables"""
        analytics = {
            'user_stats': {},
            'search_stats': {},
            'content_stats': {},
            'engagement_stats': {}
        }
        
        # User statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_week
            FROM users
        """)
        user_stats = cursor.fetchone()
        analytics['user_stats'] = dict(user_stats)
        
        # Search statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_searches,
                COUNT(DISTINCT account_id) as unique_searchers,
                COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE) as searches_today,
                COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as searches_week
            FROM searches
        """)
        search_stats = cursor.fetchone()
        analytics['search_stats'] = dict(search_stats)
        
        # Content statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_articles,
                COUNT(DISTINCT source_name) as unique_sources,
                COUNT(*) FILTER (WHERE publication_date >= CURRENT_DATE - INTERVAL '30 days') as recent_articles
            FROM articles
        """)
        content_stats = cursor.fetchone()
        analytics['content_stats'] = dict(content_stats)
        
        # Engagement statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as avg_rating,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as reviews_today
            FROM userreview
        """)
        engagement_stats = cursor.fetchone()
        analytics['engagement_stats'] = dict(engagement_stats)
        
        return analytics
    
    @staticmethod
    @with_db_connection
    def get_trending_searches(cursor, limit=10):
        """Get most popular search queries from search_results table"""
        cursor.execute("""
            SELECT 
                query as query_text,
                COUNT(*) as search_count,
                1 as unique_users
            FROM "search_results"
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY query
            ORDER BY search_count DESC
            LIMIT %s
        """, (limit,))
        return cursor.fetchall()
    
    @staticmethod
    @with_db_connection
    def get_popular_categories(cursor, limit=15):
        """Get most used categories"""
        cursor.execute("""
            SELECT 
                entity_text,
                COUNT(*) as usage_count,
                COUNT(DISTINCT c.search_id) as unique_searches
            FROM categories c
            JOIN searches s ON c.search_id = s.search_id
            WHERE s.timestamp >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY entity_text
            ORDER BY usage_count DESC
            LIMIT %s
        """, (limit,))
        return cursor.fetchall()
    
    @staticmethod
    @with_db_connection
    def get_user_activity_summary(cursor, user_id):
        """Get comprehensive user activity"""
        activity = {
            'searches': [],
            'reviews': [],
            'categories': []
        }
        
        # User's searches
        cursor.execute("""
            SELECT search_id, query_text, timestamp
            FROM searches
            WHERE account_id = %s
            ORDER BY timestamp DESC
            LIMIT 10
        """, (user_id,))
        activity['searches'] = cursor.fetchall()
        
        # User's reviews
        cursor.execute("""
            SELECT review_id, rating, review_text, created_at
            FROM userreview
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 10
        """, (user_id,))
        activity['reviews'] = cursor.fetchall()
        
        # Categories from user's searches
        cursor.execute("""
            SELECT DISTINCT c.entity_text, COUNT(*) as usage_count
            FROM categories c
            JOIN searches s ON c.search_id = s.search_id
            WHERE s.account_id = %s
            GROUP BY c.entity_text
            ORDER BY usage_count DESC
            LIMIT 10
        """, (user_id,))
        activity['categories'] = cursor.fetchall()
        
        return activity
    
    @staticmethod
    @with_db_connection
    def get_source_analytics(cursor):
        """Analyze article sources"""
        cursor.execute("""
            SELECT 
                source_name,
                COUNT(*) as article_count,
                COUNT(DISTINCT result_id) as unique_results,
                MAX(publication_date) as latest_article
            FROM articles
            GROUP BY source_name
            ORDER BY article_count DESC
            LIMIT 20
        """)
        return cursor.fetchall()
    
    @staticmethod
    @with_db_connection
    def get_daily_activity(cursor, days=30):
        """Get daily activity trends"""
        cursor.execute("""
            SELECT 
                DATE(created_at) as activity_date,
                COUNT(*) as new_users
            FROM users
            WHERE created_at >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY DATE(created_at)
            ORDER BY activity_date DESC
        """, (days,))
        user_registrations = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                DATE(timestamp) as activity_date,
                COUNT(*) as total_searches,
                COUNT(DISTINCT account_id) as active_users
            FROM searches
            WHERE timestamp >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY DATE(timestamp)
            ORDER BY activity_date DESC
        """, (days,))
        search_activity = cursor.fetchall()
        
        return {
            'user_registrations': user_registrations,
            'search_activity': search_activity
        }
    
    @staticmethod
    @with_db_connection
    def get_system_health(cursor):
        """Basic system health metrics"""
        health = {
            'database_status': 'healthy',
            'recent_activity': 0,
            'error_indicators': []
        }
        
        # Check recent activity (last hour)
        cursor.execute("""
            SELECT COUNT(*) as activity_count
            FROM searches
            WHERE timestamp >= NOW() - INTERVAL '1 hour'
        """)
        activity = cursor.fetchone()
        health['recent_activity'] = activity['activity_count']
        
        # Check for potential issues
        cursor.execute("""
            SELECT 'users_without_searches' as issue, COUNT(*) as count
            FROM users u
            LEFT JOIN searches s ON u.user_id = s.account_id
            WHERE s.search_id IS NULL
            AND u.created_at <= CURRENT_DATE - INTERVAL '1 day'
        """)
        inactive_users = cursor.fetchone()
        if inactive_users['count'] > 0:
            health['error_indicators'].append(f"{inactive_users['count']} inactive users")
        
        return health

    @staticmethod
    @with_db_connection
    def get_search_statistics(cursor):
        """Get search statistics including total searches and active users."""
        stats = {
            'total_searches': 0,
            'active_users': 0
        }
        
        try:
            # Get total searches
            cursor.execute("SELECT COUNT(*) as count FROM searches")
            result = cursor.fetchone()
            if result:
                stats['total_searches'] = result['count'] or 0
            
            # Get active users (users who performed searches in the last 30 minutes)
            cursor.execute("""
                SELECT COUNT(DISTINCT account_id) as count 
                FROM searches 
                WHERE timestamp >= NOW() - INTERVAL '30 minutes'
            """)
            result = cursor.fetchone()
            if result:
                stats['active_users'] = result['count'] or 0
                
        except Exception as e:
            print(f"Error getting search statistics: {e}")
        
        return stats

    @staticmethod
    @with_db_connection
    def get_user_stats(cursor):
        """Get user statistics for admin dashboard."""
        stats = {
            'active_users': 0,
            'admin_count': 0,
            'new_users_30d': 0
        }
        
        try:
            # Get active users (users who performed searches in last 24 hours)
            cursor.execute("""
                SELECT COUNT(DISTINCT account_id) as count 
                FROM searches 
                WHERE timestamp >= NOW() - INTERVAL '24 hours'
            """)
            result = cursor.fetchone()
            if result:
                stats['active_users'] = result['count'] or 0
            
            # Get admin count
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
            result = cursor.fetchone()
            if result:
                stats['admin_count'] = result['count'] or 0
            
            # Get new users in last 30 days
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM users 
                WHERE created_at >= NOW() - INTERVAL '30 days'
            """)
            result = cursor.fetchone()
            if result:
                stats['new_users_30d'] = result['count'] or 0
                
        except Exception as e:
            print(f"Error getting user stats: {e}")
        
        return stats
    
    @staticmethod
    @with_db_connection
    def get_daily_activity(cursor, days=30):
        """Get daily activity for the last N days"""
        try:
            cursor.execute("""
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as searches,
                    COUNT(DISTINCT account_id) as active_users,
                    COUNT(DISTINCT s.search_id) as unique_searches
                FROM searches s
                WHERE timestamp >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
            """, (days,))
            return cursor.fetchall()
        except Exception as e:
            print(f"Error getting daily activity: {e}")
            return []
