from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory, Response
import psycopg2
import psycopg2.extras
from scraper import main_system
import uuid
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from ai_summary import generate_summary_from_text
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback-insecure-dev-key")

# Config for image uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'img')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        user="postgres",
        password="radgelwashere4453",  #Change this to your own password
        database="websearch_demo",
        cursor_factory=psycopg2.extras.RealDictCursor
    )

@app.before_request
def assign_user():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    # Create anonymous user with role 'anonymous'
                    insert_sql = "INSERT INTO users (uuid, hashed_password, role) VALUES (%s, %s, %s) ON CONFLICT (uuid) DO NOTHING"
                    cursor.execute(insert_sql, (session['user_id'], '', 'anonymous'))
                    db.commit()
                    # Get the user's id for future use
                    cursor.execute("SELECT user_id FROM users WHERE uuid = %s", (session['user_id'],))
                    user = cursor.fetchone()
                    if user:
                        session['user_db_id'] = user['user_id']
        except Exception as e:
            print("❌ User creation error:", e)
    elif 'user_db_id' not in session:
        # If user_id exists but user_db_id doesn't, get the id
        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    cursor.execute("SELECT user_id FROM users WHERE uuid = %s", (session['user_id'],))
                    user = cursor.fetchone()
                    if user:
                        session['user_db_id'] = user['user_id']
        except Exception as e:
            print("❌ Error getting user id:", e)

@app.route('/', methods=['GET', 'POST'])
def index():
    results = []
    
    if request.method == 'POST':
        # Handle search functionality
        if 'query' in request.form:
            query = request.form['query']
            serpapi_key = request.form['serpapi_key'] or None
            results = main_system(query, serpapi_key)

            try:
                with get_db_connection() as db:
                    with db.cursor() as cursor:
                        # Store search results as JSONB in search_results table
                        import json
                        results_json = json.dumps(results)
                        
                        # Insert into search_results table
                        insert_result_sql = "INSERT INTO search_results (query, results) VALUES (%s, %s) RETURNING result_id"
                        cursor.execute(insert_result_sql, (query, results_json))
                        result_id = cursor.fetchone()['result_id']
                        
                        # Insert into searches table to link with user
                        if 'user_db_id' in session:
                            insert_search_sql = "INSERT INTO searches (account_id, query_text) VALUES (%s, %s)"
                            cursor.execute(insert_search_sql, (session['user_db_id'], query))
                        
                        # Store entities in categories table
                        for item in results:
                            for text, label in item.get("entities", []):
                                insert_entity_sql = "INSERT INTO categories (search_id, entity_text, entity_label) VALUES (%s, %s, %s)"
                                cursor.execute(insert_entity_sql, (result_id, text, label))
                    db.commit()
            except Exception as e:
                print("❌ DB Insert Error:", e)

    return render_template('index.html', results=results)

# -------- Authentication (Flask) --------
@app.route('/auth', methods=['GET'])
def auth_page():
    # Render the auth UI
    return render_template('VeriFact_interface/auth.html')

# Serve the CSS/JS that currently live alongside the template
@app.route('/css/<path:filename>')
def serve_auth_css(filename):
    base_dir = os.path.join(os.getcwd(), 'templates', 'VeriFact_interface', 'css')
    return send_from_directory(base_dir, filename)

@app.route('/js/<path:filename>')
def serve_auth_js(filename):
    base_dir = os.path.join(os.getcwd(), 'templates', 'VeriFact_interface', 'js')
    return send_from_directory(base_dir, filename)

@app.route('/api/signup', methods=['POST'])
def api_signup():
    try:
        data = request.get_json(silent=True) or request.form
        username = (data.get('username') or data.get('new_username') or '').strip()
        password = (data.get('password') or data.get('new_password') or '').strip()
        if not username or not password:
            return jsonify({'status': 'error', 'message': 'Username and password required'}), 400

        password_hash = generate_password_hash(password)

        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Create new user account with role 'user'
                insert_sql = (
                    "INSERT INTO users (uuid, hashed_password, role, username) VALUES (%s, %s, %s, %s) RETURNING user_id, uuid, username"
                )
                new_uuid = str(uuid.uuid4())
                cursor.execute(insert_sql, (new_uuid, password_hash, 'user', username))
                user = cursor.fetchone()
                db.commit()

                # Update session
                session['user_id'] = user['uuid']
                session['user_db_id'] = user['user_id']

        return jsonify({'status': 'success', 'user': {'id': user['user_id'], 'username': user['username'], 'uuid': user['uuid'], 'role': 'user'}})
    except Exception as e:
        print("❌ Signup error:", e)
        return jsonify({'status': 'error', 'message': 'Signup failed'}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json(silent=True) or request.form
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()
        if not username or not password:
            return jsonify({'status': 'error', 'message': 'Username and password required'}), 400

        # Since the new schema doesn't have username field, we'll use a simple approach
        # For now, we'll create a new user session. In a real app, you'd need to add username field to users table
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Create a new user with the provided credentials
                password_hash = generate_password_hash(password)
                new_uuid = str(uuid.uuid4())
                
                insert_sql = (
                    "INSERT INTO users (uuid, hashed_password, role, username) VALUES (%s, %s, %s, %s) RETURNING user_id, uuid, username"
                )
                cursor.execute(insert_sql, (new_uuid, password_hash, 'user', username))
                user = cursor.fetchone()
                db.commit()

                # Log the user in
                session['user_id'] = user['uuid']
                session['user_db_id'] = user['user_id']

        return jsonify({'status': 'success', 'user': {'id': user['user_id'], 'username': user['username'], 'uuid': user['uuid'], 'role': 'user'}})
    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({'status': 'error', 'message': 'Login failed'}), 500

@app.route('/home')
def home():
    # Render the home interface
    return render_template('VeriFact_interface/home.html')

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    session.pop('user_db_id', None)
    return jsonify({'status': 'success'})




if __name__ == '__main__':
    app.run(debug=True)
