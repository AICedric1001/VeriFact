from flask import Blueprint, render_template, redirect, url_for, request, flash, session, jsonify
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from db_utils import AdminDB
import traceback

# Create admin blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/admin', template_folder='templates/VeriFact_interface/admin')

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# In production, these should be in environment variables or a secure config
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-me-in-production'
    ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME') or 'admin'
    ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH') or \
                         generate_password_hash('admin123')  # Change this in production
    SESSION_TIMEOUT_MINUTES = 30

# Session management
def get_session_expiry():
    return datetime.now() + timedelta(minutes=Config.SESSION_TIMEOUT_MINUTES)

def is_session_valid():
    if 'admin_logged_in' not in session or 'expires_at' not in session:
        return False
    return datetime.now() < datetime.fromisoformat(session['expires_at'])

def update_session():
    session['expires_at'] = get_session_expiry().isoformat()

def get_analytics_with_fallback():
    """Helper function to get analytics with consistent error handling"""
    try:
        return AdminDB.get_analytics_overview()
    except Exception as e:
        print(f"Error getting analytics: {e}")
        traceback.print_exc()
        return {
            'user_stats': {'total_users': 0, 'admin_count': 0, 'new_today': 0, 'new_week': 0},
            'search_stats': {'total_searches': 0, 'unique_searchers': 0, 'searches_today': 0, 'searches_week': 0},
            'content_stats': {'total_articles': 0, 'unique_sources': 0, 'recent_articles': 0},
            'engagement_stats': {'total_reviews': 0, 'avg_rating': 0, 'reviews_today': 0}
        }

# Rate limiting for login attempts
login_limiter = limiter.limit("5 per minute")

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_session_valid():
            session.clear()
            flash('Session expired. Please log in again.', 'warning')
            return redirect(url_for('admin.login'))
        update_session()
        return f(*args, **kwargs)
    return decorated_function

# Admin login route
@admin_bp.route('/login', methods=['GET', 'POST'])
@login_limiter
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        csrf_token = request.form.get('csrf_token')
        
        # Verify CSRF token
        if not csrf_token or csrf_token != session.get('csrf_token'):
            flash('Invalid request. Please try again.', 'error')
            return redirect(url_for('admin.login'))
        
        # Verify credentials
        if (username == Config.ADMIN_USERNAME and 
            check_password_hash(Config.ADMIN_PASSWORD_HASH, password)):
            session.clear()
            session['admin_logged_in'] = True
            session['user_agent'] = request.headers.get('User-Agent')
            session['ip_address'] = request.remote_addr
            session['expires_at'] = get_session_expiry().isoformat()
            session.permanent = True
            
            # Generate new CSRF token
            session['csrf_token'] = os.urandom(24).hex()
            
            flash('Login successful!', 'success')
            return redirect(url_for('admin.dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    # Generate CSRF token for GET request
    session['csrf_token'] = os.urandom(24).hex()
    return render_template('VeriFact_interface/admin/login.html', csrf_token=session['csrf_token'])

@admin_bp.route('/dashboard')
@login_required
def dashboard():
    try:
        print("Dashboard route accessed")
        
        # Get comprehensive analytics with error handling
        analytics = get_analytics_with_fallback()
        print(f"Analytics loaded: {analytics}")
        
        try:
            trending_searches = AdminDB.get_trending_searches(limit=5)
            print(f"Trending searches loaded: {len(trending_searches)} items")
        except Exception as e:
            print(f"Error getting trending searches: {e}")
            traceback.print_exc()
            trending_searches = []
        
        try:
            popular_categories = AdminDB.get_popular_categories(limit=10)
            print(f"Popular categories loaded: {len(popular_categories)} items")
        except Exception as e:
            print(f"Error getting popular categories: {e}")
            traceback.print_exc()
            popular_categories = []
        
        try:
            system_health = AdminDB.get_system_health()
            print(f"System health loaded: {system_health}")
        except Exception as e:
            print(f"Error getting system health: {e}")
            traceback.print_exc()
            system_health = {'database_status': 'error', 'recent_activity': 0, 'error_indicators': []}
        
        try:
            source_analytics = AdminDB.get_source_analytics()
            print(f"Source analytics loaded: {len(source_analytics)} items")
        except Exception as e:
            print(f"Error getting source analytics: {e}")
            traceback.print_exc()
            source_analytics = []
        
        # Get recent searches
        try:
            recent_searches = AdminDB.get_recent_searches(limit=5) or []
            print(f"Dashboard: recent_searches loaded: {len(recent_searches)} items")
            if recent_searches:
                print(f"Sample recent search: {recent_searches[0]}")
                # Check timestamps of recent searches
                latest_search_time = recent_searches[0].get('timestamp') if recent_searches else None
                print(f"Dashboard - Latest search timestamp: {latest_search_time}")
                if len(recent_searches) > 1:
                    oldest_search_time = recent_searches[-1].get('timestamp')
                    print(f"Dashboard - Oldest recent search timestamp: {oldest_search_time}")
        except Exception as e:
            print(f"Error getting recent searches: {e}")
            recent_searches = []

        print("Rendering dashboard template...")
        return render_template(
            'VeriFact_interface/admin/dashboard.html',
            analytics=analytics,
            trending_searches=trending_searches,
            popular_categories=popular_categories,
            system_health=system_health,
            source_analytics=source_analytics,
            recent_searches=recent_searches
        )
            
    except Exception as e:
        print(f"Critical error in dashboard route: {e}")
        traceback.print_exc()
        # Fallback to basic stats
        return render_template(
            'VeriFact_interface/admin/dashboard.html',
            analytics={
                'user_stats': {'total_users': 0, 'admin_count': 0, 'new_today': 0, 'new_week': 0},
                'search_stats': {'total_searches': 0, 'unique_searchers': 0, 'searches_today': 0, 'searches_week': 0},
                'content_stats': {'total_articles': 0, 'unique_sources': 0, 'recent_articles': 0},
                'engagement_stats': {'total_reviews': 0, 'avg_rating': 0, 'reviews_today': 0}
            },
            trending_searches=[],
            popular_categories=[],
            system_health={'database_status': 'error', 'recent_activity': 0, 'error_indicators': []},
            source_analytics=[],
            recent_searches=[]
        )

# Admin logout route
@admin_bp.route('/logout')
@login_required
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('admin.login'))

# API endpoint to check session status
@admin_bp.route('/api/session/check')
@login_required
def check_session():
    return jsonify({
        'logged_in': True,
        'expires_at': session.get('expires_at')
    })

# Admin users route
@admin_bp.route('/users')
@login_required
def users():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        role = request.args.get('role', '')
        
        # Get users with pagination and filtering
        users_data = AdminDB.get_users(
            search_query=search,
            role_filter=role if role != '' else None,
            page=page,
            per_page=per_page
        )
        
        # Get available roles for filter dropdown
        roles = AdminDB.get_user_roles() if hasattr(AdminDB, 'get_user_roles') else []
        
        # Get user statistics for the dashboard
        stats = AdminDB.get_user_stats() if hasattr(AdminDB, 'get_user_stats') else {}
        
        return render_template(
            'VeriFact_interface/admin/users/list.html',
            users=users_data.get('users', []),
            total=users_data.get('total', 0),
            page=users_data.get('page', 1),
            per_page=users_data.get('per_page', 20),
            total_pages=users_data.get('total_pages', 1),
            search=search,
            role_filter=role,
            roles=roles,
            stats=stats,
            active_page='users'
        )
    except Exception as e:
        print(f"Error in users route: {e}")
        traceback.print_exc()
        flash('An error occurred while loading users. Please try again.', 'error')
        return render_template('VeriFact_interface/admin/users/list.html',
                           users=[],
                           total=0,
                           page=1,
                           per_page=20,
                           total_pages=1,
                           search='',
                           role_filter='',
                           roles=[],
                           stats={},
                           active_page='users')

# Admin reviews route
@admin_bp.route('/reviews')
@login_required
def reviews():
    """Admin reviews management page."""
    status = request.args.get('status', '')
    reviews = AdminDB.get_reviews(status=status if status else None)
    return render_template('VeriFact_interface/admin/reviews.html', 
                         reviews=reviews, 
                         active_page='reviews',
                         current_status=status)

# Get review details API
@admin_bp.route('/api/reviews/<int:review_id>')
@login_required
def get_review(review_id):
    """Get review details API endpoint."""
    try:
        review = AdminDB.get_review(review_id)
        if review:
            # Convert datetime objects to ISO format for JSON serialization
            review_dict = dict(review)
            review_dict['created_at'] = review['created_at'].isoformat() if review['created_at'] else None
            review_dict['updated_at'] = review['updated_at'].isoformat() if review['updated_at'] else None
            return jsonify({'success': True, 'review': review_dict})
        return jsonify({'success': False, 'message': 'Review not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Update review status API
@admin_bp.route('/reviews/<int:review_id>/status', methods=['POST'])
@login_required
def update_review_status(review_id):
    """Update review status API endpoint."""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'success': False, 'message': 'Missing status'}), 400
    
    try:
        review = AdminDB.update_review_status(review_id, data['status'])
        if review:
            # Convert datetime objects to ISO format for JSON serialization
            review_dict = dict(review)
            review_dict['created_at'] = review['created_at'].isoformat() if review['created_at'] else None
            review_dict['updated_at'] = review['updated_at'].isoformat() if review['updated_at'] else None
            
            return jsonify({
                'success': True, 
                'message': 'Review status updated',
                'review': review_dict
            })
        return jsonify({'success': False, 'message': 'Review not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Admin analytics route
@admin_bp.route('/analytics')
@login_required
def analytics():
    """Detailed analytics page"""
    try:
        # Get comprehensive analytics with error handling
        analytics = get_analytics_with_fallback()
        
        try:
            trending_searches = AdminDB.get_trending_searches(limit=20)
            print(f"Analytics: trending_searches loaded: {len(trending_searches)} items")
            if trending_searches:
                print("Top 5 trending searches:")
                for i, search in enumerate(trending_searches[:5]):
                    print(f"  {i+1}. '{search.get('query_text', 'N/A')}' - {search.get('search_count', 0)} searches, {search.get('unique_users', 0)} users")
            else:
                print("No trending searches found")
        except Exception as e:
            print(f"Error getting trending searches: {e}")
            trending_searches = []
        
        try:
            popular_categories = AdminDB.get_popular_categories(limit=25)
        except Exception as e:
            print(f"Error getting popular categories: {e}")
            popular_categories = []
        
        try:
            source_analytics = AdminDB.get_source_analytics()
        except Exception as e:
            print(f"Error getting source analytics: {e}")
            source_analytics = []
        
        try:
            daily_activity = AdminDB.get_daily_activity(days=30)
        except Exception as e:
            print(f"Error getting daily activity: {e}")
            daily_activity = []
        
        # Get recent searches for analytics
        try:
            recent_searches = AdminDB.get_recent_searches(limit=10)
            print(f"Analytics: recent_searches loaded: {len(recent_searches)} items")
            if recent_searches:
                print("Recent searches details:")
                for i, search in enumerate(recent_searches[:5]):
                    print(f"  {i+1}. '{search.get('query_text', 'N/A')}' by {search.get('username', 'Guest')} at {search.get('timestamp', 'N/A')}")
                # Check timestamps of recent searches
                latest_search_time = recent_searches[0].get('timestamp') if recent_searches else None
                print(f"Latest search timestamp: {latest_search_time}")
                if len(recent_searches) > 1:
                    oldest_search_time = recent_searches[-1].get('timestamp')
                    print(f"Oldest recent search timestamp: {oldest_search_time}")
            else:
                print("No recent searches found")
        except Exception as e:
            print(f"Error getting recent searches for analytics: {e}")
            recent_searches = []
        
        # Debug daily activity data
        try:
            daily_activity_debug = AdminDB.get_daily_activity(days=7)  # Get last 7 days for debugging
            print(f"Daily activity debug: {len(daily_activity_debug)} days of data")
            if daily_activity_debug:
                print(f"Latest daily activity date: {daily_activity_debug[0].get('date')}")
                print(f"Sample daily activity: {daily_activity_debug[0]}")
                if len(daily_activity_debug) > 1:
                    print(f"Oldest daily activity date: {daily_activity_debug[-1].get('date')}")
        except Exception as e:
            print(f"Error getting daily activity debug: {e}")
            daily_activity_debug = []
        
        # Direct database check for data consistency
        try:
            from db_utils import get_db_connection
            conn = get_db_connection()
            with conn.cursor() as cursor:
                # Get total searches count
                cursor.execute("SELECT COUNT(*) as total FROM searches")
                total_searches = cursor.fetchone()['total']
                print(f"Total searches in database: {total_searches}")
                
                # Get latest searches in last 24 hours
                cursor.execute("""
                    SELECT COUNT(*) as total_searches_24h,
                           MAX(timestamp) as latest_search,
                           MIN(timestamp) as earliest_search_24h
                    FROM searches 
                    WHERE timestamp >= NOW() - INTERVAL '24 hours'
                """)
                recent_24h = cursor.fetchone()
                print(f"Last 24 hours: {recent_24h['total_searches_24h']} searches")
                print(f"Latest search in DB: {recent_24h['latest_search']}")
                
                # Get searches today
                cursor.execute("""
                    SELECT COUNT(*) as today_searches,
                           MAX(timestamp) as latest_today
                    FROM searches 
                    WHERE DATE(timestamp) = CURRENT_DATE
                """)
                today_searches = cursor.fetchone()
                print(f"Today: {today_searches['today_searches']} searches")
                print(f"Latest today: {today_searches['latest_today']}")
                
                # Get sample of latest searches directly
                cursor.execute("""
                    SELECT query_text, timestamp, account_id
                    FROM searches 
                    ORDER BY timestamp DESC 
                    LIMIT 5
                """)
                latest_searches_direct = cursor.fetchall()
                print("Latest 5 searches (direct query):")
                for i, search in enumerate(latest_searches_direct):
                    print(f"  {i+1}. '{search['query_text']}' at {search['timestamp']}")
                
                # Check trending searches manually
                cursor.execute("""
                    SELECT 
                        query_text,
                        COUNT(*) as search_count,
                        COUNT(DISTINCT account_id) as unique_users
                    FROM searches
                    WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
                    GROUP BY query_text
                    ORDER BY search_count DESC
                    LIMIT 5
                """)
                trending_direct = cursor.fetchall()
                print("Top 5 trending searches (direct query):")
                for i, search in enumerate(trending_direct):
                    print(f"  {i+1}. '{search['query_text']}' - {search['search_count']} searches, {search['unique_users']} users")
                
                # Compare with daily activity
                if daily_activity_debug:
                    today_in_daily = next((item for item in daily_activity_debug 
                                         if str(item.get('date')) == str(datetime.now().date())), None)
                    if today_in_daily:
                        print(f"Daily activity shows today: {today_in_daily.get('searches', 0)} searches")
                        print(f"Direct query shows today: {today_searches['today_searches']} searches")
                        if today_in_daily.get('searches', 0) != today_searches['today_searches']:
                            print("❌ DATA INCONSISTENCY DETECTED!")
                        else:
                            print("✅ Data matches between daily activity and direct query")
                
            conn.close()
        except Exception as e:
            print(f"Error in direct database check: {e}")
            import traceback
            traceback.print_exc()
        
        return render_template(
            'VeriFact_interface/admin/analytics.html',
            analytics=analytics,
            trending_searches=trending_searches,
            popular_categories=popular_categories,
            source_analytics=source_analytics,
            daily_activity=daily_activity,
            recent_searches=recent_searches
        )
    except Exception as e:
        print(f"Critical error in analytics route: {e}")
        import traceback
        traceback.print_exc()
        # Return analytics page with empty data instead of redirecting
        return render_template(
            'VeriFact_interface/admin/analytics.html',
            analytics={
                'user_stats': {'total_users': 0, 'admin_count': 0, 'new_today': 0, 'new_week': 0},
                'search_stats': {'total_searches': 0, 'unique_searchers': 0, 'searches_today': 0, 'searches_week': 0},
                'content_stats': {'total_articles': 0, 'unique_sources': 0, 'recent_articles': 0},
                'engagement_stats': {'total_reviews': 0, 'avg_rating': 0, 'reviews_today': 0}
            },
            trending_searches=[],
            popular_categories=[],
            source_analytics=[],
            daily_activity=[],
            recent_searches=[]
        )

# API endpoints for real-time data
@admin_bp.route('/api/dashboard/stats')
@login_required
def get_dashboard_stats():
    """API endpoint for real-time dashboard stats"""
    try:
        analytics = get_analytics_with_fallback()
        system_health = AdminDB.get_system_health()
        
        return jsonify({
            'success': True,
            'analytics': analytics,
            'system_health': system_health,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/api/trending/searches')
@login_required
def get_trending_searches():
    """API endpoint for trending searches"""
    try:
        limit = request.args.get('limit', 10, type=int)
        trending = AdminDB.get_trending_searches(limit=limit)
        
        return jsonify({
            'success': True,
            'trending_searches': [dict(item) for item in trending]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/api/analytics/categories')
@login_required
def get_analytics_categories():
    """API endpoint for popular categories"""
    try:
        limit = request.args.get('limit', 15, type=int)
        categories = AdminDB.get_popular_categories(limit=limit)
        
        return jsonify({
            'success': True,
            'categories': [dict(item) for item in categories]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# -------- Source Management Routes --------
@admin_bp.route('/sources')
@login_required
def sources():
    """Display sources management page"""
    try:
        # Get filter status from query parameter
        trust_status = request.args.get('status', 'all')
        
        # Get sources from database
        sources = AdminDB.get_trusted_sources(status=trust_status)
        
        return render_template('VeriFact_interface/admin/sources.html', 
                             sources=sources,
                             trust_status=trust_status)
    except Exception as e:
        print(f"Error loading sources: {e}")
        traceback.print_exc()
        flash('Error loading sources', 'error')
        return redirect(url_for('admin.dashboard'))

@admin_bp.route('/api/sources/add', methods=['POST'])
@login_required
def add_source():
    """API endpoint to add a new trusted source"""
    try:
        data = request.get_json()
        
        # Validate required fields
        domain = (data.get('domain') or '').strip().lower()
        trust_status = (data.get('trust_status') or '').strip().lower()
        
        if not domain:
            return jsonify({'success': False, 'message': 'Domain is required'}), 400
        
        if trust_status not in ['trusted', 'blocked', 'neutral']:
            return jsonify({'success': False, 'message': 'Invalid trust status'}), 400
        
        # Optional fields
        source_name = (data.get('source_name') or '').strip() or None
        reason = (data.get('reason') or '').strip() or None
        
        # Add source to database
        result = AdminDB.add_trusted_source(
            domain=domain,
            source_name=source_name,
            trust_status=trust_status,
            reason=reason
        )
        
        if result:
            return jsonify({'success': True, 'message': 'Source added successfully'})
        else:
            return jsonify({'success': False, 'message': 'Domain already exists'}), 409
    
    except Exception as e:
        print(f"Error adding source: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/api/sources/delete/<int:source_id>', methods=['DELETE'])
@login_required
def delete_source(source_id):
    """API endpoint to delete a trusted source"""
    try:
        result = AdminDB.delete_trusted_source(source_id)
        
        if result:
            return jsonify({'success': True, 'message': 'Source deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'Source not found'}), 404
    
    except Exception as e:
        print(f"Error deleting source: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
