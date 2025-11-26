from flask import Blueprint, render_template, redirect, url_for, request, flash, session, jsonify
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from functools import wraps
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from db_utils import AdminDB

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
        # Initialize default values
        stats = {
            'total_users': 0,
            'search_stats': {
                'total_searches': 0,
                'active_users': 0
            },
            'recent_searches': []
        }
        
        # Get users data
        try:
            users_data = AdminDB.get_users(per_page=5)
            if users_data and 'users' in users_data:
                stats['total_users'] = users_data.get('total', 0)
        except Exception as e:
            print(f"Error getting users data: {e}")
        
        # Get search statistics
        try:
            search_stats = AdminDB.get_search_statistics()
            if search_stats:
                stats['search_stats'] = {
                    'total_searches': search_stats.get('total_searches', 0),
                    'active_users': search_stats.get('active_users', 0)
                }
        except Exception as e:
            print(f"Error getting search stats: {e}")

        # Get recent searches
        try:
            stats['recent_searches'] = AdminDB.get_recent_searches(limit=5) or []
        except Exception as e:
            print(f"Error getting recent searches: {e}")
            stats['recent_searches'] = []

        return render_template(
            'VeriFact_interface/admin/dashboard.html',
            total_users=stats['total_users'],
            search_stats=stats['search_stats'],
            recent_searches=stats['recent_searches']
        )
            
    except Exception as e:
        print(f"Error in dashboard route: {e}")
        return render_template(
            'VeriFact_interface/admin/dashboard.html',
            total_users=0,
            search_stats={'total_searches': 0, 'active_users': 0},
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
            role_filter=role if role != 'all' else None,
            page=page,
            per_page=per_page
        )
        
        # Get available roles for filter dropdown
        roles = AdminDB.get_user_roles() if hasattr(AdminDB, 'get_user_roles') else []
        
        return render_template(
            'VeriFact_interface/admin/users/list.html',
            users=users_data.get('users', []),
            total=users_data.get('total', 0),
            page=users_data.get('page', 1),
            per_page=users_data.get('per_page', 20),
            total_pages=users_data.get('total_pages', 1),
            search=search,
            role_filter=role,
            roles=roles
        )
    except Exception as e:
        print(f"Error in users route: {e}")
        flash('An error occurred while loading users. Please try again.', 'error')
        return render_template('VeriFact_interface/admin/users/list.html',
                           users=[],
                           total=0,
                           page=1,
                           per_page=20,
                           total_pages=1,
                           search='',
                           role_filter='all',
                           roles=[])

# Admin reviews route
@admin_bp.route('/reviews')
@login_required
def reviews():
    """Admin reviews management page."""
    if not is_session_valid():
        return redirect(url_for('admin.login'))
    
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
    if not is_session_valid():
        return jsonify({'success': False, 'message': 'Session expired'}), 401
    
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
    if not is_session_valid():
        return jsonify({'success': False, 'message': 'Session expired'}), 401
    
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

# Admin searches route
@admin_bp.route('/searches')
@login_required
def searches():
    searches_list = AdminDB.get_searches()
    return render_template('VeriFact_interface/admin/searches.html', searches=searches_list)

# Admin articles route
@admin_bp.route('/articles')
@login_required
def articles():
    try:
        articles = AdminDB.get_articles(limit=100)
        return render_template('VeriFact_interface/admin/articles.html', articles=articles)
    except Exception as e:
        print(f"Error fetching articles: {e}")
        return str(e), 500

# Admin categories route
@admin_bp.route('/categories')
@login_required
def categories():
    categories_list = AdminDB.get_categories()
    return render_template('VeriFact_interface/admin/categories.html', categories=categories_list)

# Admin settings route
@admin_bp.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        # Handle settings update here
        flash('Settings updated successfully', 'success')
        return redirect(url_for('admin.settings'))
    
    return render_template('VeriFact_interface/admin/settings.html')
