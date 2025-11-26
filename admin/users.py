from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from functools import wraps
from db_utils import AdminDB
from flask_login import login_required, current_user

users_bp = Blueprint('admin_users', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function

@users_bp.route('/users')
@login_required
@admin_required
def user_list():
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    role = request.args.get('role', '')
    status = request.args.get('status', '')
    
    # Get users with pagination and filtering
    users_data = AdminDB.get_users(
        search_query=search if search != '' else None,
        role_filter=role if role != '' else None,
        status_filter=status if status != '' else None,
        page=page
    )
    
    # Get available roles for filter dropdown
    roles = AdminDB.get_user_roles()
    
    # Get user statistics for the dashboard
    stats = AdminDB.get_user_stats()
    
    return render_template(
        'VeriFact_interface/admin/users/list.html',
        users=users_data['users'],
        pagination={
            'page': users_data['page'],
            'per_page': users_data['per_page'],
            'total': users_data['total'],
            'total_pages': users_data['total_pages']
        },
        search=search,
        current_role=role,
        current_status=status,
        roles=roles,
        stats=stats
    )

@users_bp.route('/users/<int:user_id>')
@login_required
@admin_required
def user_detail(user_id):
    user = AdminDB.get_user_details(user_id)
    if not user:
        return render_template('errors/404.html'), 404
        
    # Get user activity
    activity = AdminDB.get_user_activity(user_id)
    
    return render_template(
        'VeriFact_interface/admin/users/detail.html',
        user=user,
        activity=activity
    )

@users_bp.route('/api/users/<int:user_id>/status', methods=['POST'])
@login_required
@admin_required
def toggle_user_status(user_id):
    data = request.get_json()
    if not data or 'is_active' not in data:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
    try:
        result = AdminDB.update_user_status(user_id, data['is_active'])
        if not result:
            return jsonify({'success': False, 'error': 'User not found'}), 404
            
        return jsonify({
            'success': True,
            'message': f"User account has been {'activated' if data['is_active'] else 'deactivated'}",
            'user': dict(result)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/api/users/<int:user_id>/role', methods=['POST'])
@login_required
@admin_required
def update_user_role(user_id):
    data = request.get_json()
    if not data or 'role' not in data:
        return jsonify({'success': False, 'error': 'Missing role'}), 400
        
    try:
        result = AdminDB.update_user_role(user_id, data['role'])
        if not result:
            return jsonify({'success': False, 'error': 'User not found'}), 404
            
        return jsonify({
            'success': True,
            'message': f"User role updated to {data['role']}",
            'user': dict(result)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/api/users/search')
@login_required
@admin_required
def search_users():
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify([])
        
    users = AdminDB.search_users(query)
    return jsonify([{
        'id': u[0],
        'username': u[1],
        'email': u[2],
        'role': u[3],
        'is_active': u[4]
    } for u in users])
