from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory, Response
import pymysql
from scraper import main_system
from ai_summary import generate_summary_from_text
import uuid
import os
from datetime import datetime
from werkzeug.utils import secure_filename

from auth import auth_bp  # Blueprint for auth routes

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback-insecure-dev-key")

# Register authentication blueprint
app.register_blueprint(auth_bp)

# Config for image uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'img')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# --- Anonymous / registered user handling ---
@app.before_request
def assign_user():
    if 'user_db_id' not in session:
        # Assign anonymous UUID
        session['user_id'] = str(uuid.uuid4())
        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    # Insert anonymous user if not exists
                    cursor.execute("INSERT INTO users (uuid) VALUES (%s)", (session['user_id'],))
                    db.commit()
                    # Get database ID
                    cursor.execute("SELECT id FROM users WHERE uuid = %s", (session['user_id'],))
                    user = cursor.fetchone()
                    session['user_db_id'] = user['id']
        except Exception as e:
            print("❌ User creation error:", e)

# --- Helper for image uploads ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---
@app.route('/', methods=['GET', 'POST'])
def index():
    posts = []
    results = []

    # Fetch posts
    try:
        with get_db_connection() as db:
            with db.cursor() as cursor:
                sql = """
                    SELECT p.id, p.content, p.created_at, u.username AS user_name,
                           CASE WHEN p.image_blob IS NOT NULL THEN 1 ELSE 0 END AS has_image
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    ORDER BY p.created_at DESC
                """
                cursor.execute(sql)
                posts = cursor.fetchall()
    except Exception as e:
        print("❌ Error fetching posts:", e)

    # Handle search query
    if request.method == 'POST' and 'query' in request.form:
        query = request.form['query']
        serpapi_key = request.form.get('serpapi_key') or None
        results = main_system(query, serpapi_key)

        # Save search results
        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    for item in results:
                        url = item["url"]
                        cursor.execute("INSERT INTO results (query, url) VALUES (%s, %s)", (query, url))
                        result_id = cursor.lastrowid
                        for text, label in item["entities"]:
                            cursor.execute(
                                "INSERT INTO entities (result_id, entity_text, entity_label) VALUES (%s, %s, %s)",
                                (result_id, text, label)
                            )
                db.commit()
        except Exception as e:
            print("❌ DB Insert Error:", e)

    return render_template('index.html', posts=posts, results=results)

@app.route('/add_post', methods=['POST'])
def add_post():
    if 'user_db_id' not in session:
        return jsonify({'status': 'error', 'message': 'User not identified'}), 401

    post_content = request.form.get('post_content')
    image_file = request.files.get('image')
    image_blob = image_file.read() if image_file and allowed_file(image_file.filename) else None

    if not post_content and not image_blob:
        return jsonify({'status': 'error', 'message': 'Post content or image required'}), 400

    try:
        with get_db_connection() as db:
            with db.cursor() as cursor:
                insert_post_sql = """
                    INSERT INTO posts (user_id, content, created_at, image_blob)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(insert_post_sql, (session['user_db_id'], post_content, datetime.now(), image_blob))
                new_post_id = cursor.lastrowid
                db.commit()
        return jsonify({'status': 'success', 'post_id': new_post_id})
    except Exception as e:
        print("❌ Error creating post:", e)
        return jsonify({'status': 'error', 'message': 'Failed to create post'}), 500

@app.route('/post/image/<int:post_id>')
def get_post_image(post_id):
    try:
        with get_db_connection() as db:
            with db.cursor() as cursor:
                cursor.execute("SELECT image_blob FROM posts WHERE id = %s", (post_id,))
                result = cursor.fetchone()
                if result and result['image_blob']:
                    return Response(result['image_blob'], mimetype='image/jpeg')
    except Exception as e:
        print("❌ Error fetching image:", e)
    return '', 404

@app.route('/summarize_post/<int:post_id>', methods=['GET'])
def summarize_post(post_id):
    try:
        with get_db_connection() as db:
            with db.cursor() as cursor:
                cursor.execute("SELECT content FROM posts WHERE id = %s", (post_id,))
                post = cursor.fetchone()
        if not post:
            return jsonify({'status': 'error', 'message': 'Post not found'}), 404
        result = generate_summary_from_text(post['content'])
        return jsonify(result)
    except Exception as e:
        print("❌ Summarization error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to summarize post'}), 500

if __name__ == '__main__':
    app.run(debug=True)
