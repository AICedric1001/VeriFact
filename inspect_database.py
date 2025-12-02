#!/usr/bin/env python3
"""
Database Inspection Tool for VeriFact
Run this script to inspect all tables and their contents in the database.
"""

import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db_utils import get_db_connection

def inspect_database():
    """Comprehensive database inspection"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            print("=" * 60)
            print("VERIFACT DATABASE INSPECTION")
            print("=" * 60)
            
            # Get all tables with proper case handling
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """)
            tables = [row['table_name'] for row in cursor.fetchall()]
            print(f"\n[Tables] Tables found ({len(tables)}): {', '.join(tables)}")
            
            # Check each table
            for table in tables:
                print(f"\n" + "=" * 40)
                print(f"[TABLE] {table}")
                print("=" * 40)
                
                try:
                    # Use quoted table name to handle case sensitivity
                    quoted_table = f'"{table}"'
                    
                    # Get row count
                    cursor.execute(f"SELECT COUNT(*) as count FROM {quoted_table}")
                    row_count = cursor.fetchone()['count']
                    print(f"[INFO] Row count: {row_count}")
                    
                    if row_count == 0:
                        print("[WARNING] Table is empty")
                        continue
                    
                    # Get table structure
                    cursor.execute(f"""
                        SELECT column_name, data_type, is_nullable, column_default
                        FROM information_schema.columns 
                        WHERE table_name = '{table}'
                        ORDER BY ordinal_position
                    """)
                    columns = cursor.fetchall()
                    print(f"\n[COLUMNS] Columns ({len(columns)}):")
                    for col in columns:
                        nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
                        default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
                        print(f"   * {col['column_name']}: {col['data_type']} ({nullable}{default})")
                    
                    # Get sample data (first 5 rows)
                    cursor.execute(f"SELECT * FROM {quoted_table} LIMIT 5")
                    sample_data = cursor.fetchall()
                    
                    print(f"\n[DATA] Sample data (first 5 rows):")
                    for i, row in enumerate(sample_data):
                        print(f"\n   Row {i+1}:")
                        for key, value in row.items():
                            # Truncate long text values
                            if isinstance(value, str) and len(value) > 50:
                                value = value[:47] + "..."
                            print(f"      {key}: {value}")
                    
                    # Special detailed analysis for important tables
                    if table.lower() == 'searches':
                        analyze_searches_table(cursor, quoted_table)
                    elif table.lower() == 'users':
                        analyze_users_table(cursor, quoted_table)
                    elif table.lower() == 'userreview':
                        analyze_reviews_table(cursor, quoted_table)
                        
                except Exception as e:
                    print(f"[ERROR] Error inspecting table {table}: {e}")
                    # Continue with next table instead of aborting
                    continue
            
            print("\n" + "=" * 60)
            print("INSPECTION COMPLETE")
            print("=" * 60)
            
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database connection error: {e}")
        import traceback
        traceback.print_exc()

def analyze_searches_table(cursor, table_name):
    """Detailed analysis of searches table"""
    print(f"\n[SEARCHES] Searches Table Analysis:")
    
    # Date range
    cursor.execute(f"""
        SELECT 
            MIN(timestamp) as earliest,
            MAX(timestamp) as latest,
            COUNT(*) as total,
            COUNT(DISTINCT account_id) as unique_users,
            COUNT(DISTINCT query_text) as unique_queries
        FROM {table_name}
    """)
    stats = cursor.fetchone()
    print(f"   [DATE] Date range: {stats['earliest']} to {stats['latest']}")
    print(f"   [COUNT] Total searches: {stats['total']}")
    print(f"   [USERS] Unique users: {stats['unique_users']}")
    print(f"   [QUERIES] Unique queries: {stats['unique_queries']}")
    
    # Recent activity
    cursor.execute(f"""
        SELECT COUNT(*) as recent_count
        FROM {table_name} 
        WHERE timestamp >= CURRENT_DATE - INTERVAL '24 hours'
    """)
    recent = cursor.fetchone()
    print(f"   [RECENT] Last 24 hours: {recent['recent_count']} searches")
    
    # Top searches
    cursor.execute(f"""
        SELECT 
            query_text,
            COUNT(*) as search_count,
            COUNT(DISTINCT account_id) as unique_users
        FROM {table_name}
        WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY query_text
        ORDER BY search_count DESC
        LIMIT 5
    """)
    trending = cursor.fetchall()
    print(f"   [TRENDING] Top 5 trending (last 7 days):")
    for i, search in enumerate(trending):
        print(f"      {i+1}. '{search['query_text']}' - {search['search_count']} searches by {search['unique_users']} users")

def analyze_users_table(cursor, table_name):
    """Detailed analysis of users table"""
    print(f"\n[USERS] Users Table Analysis:")
    
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_this_week,
            COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_today,
            COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_count
        FROM {table_name}
    """)
    stats = cursor.fetchone()
    print(f"   [TOTAL] Total users: {stats['total_users']}")
    print(f"   [WEEKLY] New this week: {stats['new_this_week']}")
    print(f"   [DAILY] New today: {stats['new_today']}")
    print(f"   [ADMIN] Admin users: {stats['admin_count']}")

def analyze_reviews_table(cursor, table_name):
    """Detailed analysis of reviews table"""
    print(f"\n[REVIEWS] Reviews Table Analysis:")
    
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_reviews,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
            AVG(rating) as avg_rating
        FROM {table_name}
    """)
    stats = cursor.fetchone()
    print(f"   [TOTAL] Total reviews: {stats['total_reviews']}")
    print(f"   [APPROVED] Approved: {stats['approved']}")
    print(f"   [PENDING] Pending: {stats['pending']}")
    print(f"   [REJECTED] Rejected: {stats['rejected']}")
    if stats['avg_rating']:
        print(f"   [RATING] Average rating: {stats['avg_rating']:.1f}")
    else:
        print(f"   [RATING] Average rating: N/A")

if __name__ == "__main__":
    inspect_database()
