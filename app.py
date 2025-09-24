from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory, Response
import pymysql
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
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        db="websearch_demo",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

@app.before_request
def assign_user():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    # Idempotent insert for anonymous visitor row
                    insert_sql = "INSERT IGNORE INTO accounts (accid, created_at) VALUES (%s, NOW())"
                    cursor.execute(insert_sql, (session['user_id'],))
                    db.commit()
                    # Get the user's id for future use
                    cursor.execute("SELECT id FROM accounts WHERE accid = %s", (session['user_id'],))
                    acc = cursor.fetchone()
                    if acc:
                        session['user_db_id'] = acc['id']
        except Exception as e:
            print("❌ User creation error:", e)
    elif 'user_db_id' not in session:
        # If user_id exists but user_db_id doesn't, get the id
        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    cursor.execute("SELECT id FROM accounts WHERE accid = %s", (session['user_id'],))
                    acc = cursor.fetchone()
                    if acc:
                        session['user_db_id'] = acc['id']
        except Exception as e:
            print("❌ Error getting user id:", e)

@app.route('/', methods=['GET', 'POST'])
def index():
    posts = []
    results = []
    
    # Get existing posts
    try:
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Join with accounts table to get ACCID and check if image exists
                sql = """
                    SELECT p.id, p.content, p.created_at, a.accid as user_id, 
                           CASE WHEN p.image_blob IS NOT NULL THEN 1 ELSE 0 END as has_image
                    FROM posts p 
                    JOIN accounts a ON p.user_id = a.id 
                    ORDER BY p.created_at DESC
                """
                cursor.execute(sql)
                posts = cursor.fetchall()
    except Exception as e:
        print("❌ Error fetching posts:", e)

    if request.method == 'POST':
        # This now only handles the search functionality
        if 'query' in request.form:
            # Handle search query
            query = request.form['query']
            serpapi_key = request.form['serpapi_key'] or None
            results = main_system(query, serpapi_key)

            try:
                with get_db_connection() as db:
                    with db.cursor() as cursor:
                        for item in results:
                            url = item["url"]
                            insert_result_sql = "INSERT INTO results (query, url) VALUES (%s, %s)"
                            cursor.execute(insert_result_sql, (query, url))
                            result_id = cursor.lastrowid

                            for text, label in item["entities"]:
                                insert_entity_sql = "INSERT INTO entities (result_id, entity_text, entity_label) VALUES (%s, %s, %s)"
                                cursor.execute(insert_entity_sql, (result_id, text, label))
                    db.commit()
            except Exception as e:
                print("❌ DB Insert Error:", e)

    return render_template('index.html', posts=posts, results=results)

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
                # Ensure a row exists for this visitor session
                if 'user_id' not in session:
                    session['user_id'] = str(uuid.uuid4())
                    cursor.execute("INSERT IGNORE INTO accounts (accid, created_at) VALUES (%s, NOW())", (session['user_id'],))

                # Check if username already exists
                cursor.execute("SELECT id FROM accounts WHERE username = %s", (username,))
                if cursor.fetchone():
                    return jsonify({'status': 'error', 'message': 'Username already taken'}), 409

                # Upgrade existing anonymous row to a full account
                update_sql = (
                    "UPDATE accounts SET username = %s, password_hash = %s, updated_at = NOW() WHERE accid = %s"
                )
                cursor.execute(update_sql, (username, password_hash, session['user_id']))
                if cursor.rowcount == 0:
                    # Fallback: create a row if none existed
                    insert_sql = (
                        "INSERT INTO accounts (accid, username, password_hash, created_at) VALUES (%s, %s, %s, NOW())"
                    )
                    cursor.execute(insert_sql, (session['user_id'], username, password_hash))
                db.commit()

                # Fetch db id and store in session
                cursor.execute("SELECT id, accid, username FROM accounts WHERE accid = %s", (session['user_id'],))
                acc = cursor.fetchone()
                session['user_db_id'] = acc['id']

        return jsonify({'status': 'success', 'user': {'id': acc['id'], 'uuid': acc['accid'], 'username': acc['username']}})
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

        with get_db_connection() as db:
            with db.cursor() as cursor:
                cursor.execute("SELECT id, accid, username, password_hash FROM accounts WHERE username = %s", (username,))
                acc = cursor.fetchone()
                if not acc or not check_password_hash(acc['password_hash'], password):
                    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

                # Log the user in
                session['user_id'] = acc['accid']
                session['user_db_id'] = acc['id']

        return jsonify({'status': 'success', 'user': {'id': acc['id'], 'uuid': acc['accid'], 'username': acc['username']}})
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
