from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory, Response
import psycopg2
import psycopg2.extras
from scraper import main_system, search_serpapi
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass
import os
# Normalize SERPAPI env var names so either works
if os.getenv("SERPAPI_KEY") and not os.getenv("SERPAPI_API_KEY"):
    os.environ["SERPAPI_API_KEY"] = os.getenv("SERPAPI_KEY")
import uuid

from datetime import datetime
from werkzeug.utils import secure_filename
from ai_summary import generate_summary_from_text
from werkzeug.security import generate_password_hash, check_password_hash
import spacy
import re

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback-insecure-dev-key")

# Load SpaCy model for category extraction
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("⚠️ SpaCy model 'en_core_web_sm' not found. Please install it with: python -m spacy download en_core_web_sm")
    nlp = None

# Config for image uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'img')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_categories_from_search(search_text):
    """
    Extract categories/keywords from user search text using SpaCy.
    Returns a list of unique, cleaned category words.
    """
    if not nlp or not search_text:
        return []
    
    # Process the search text with SpaCy
    doc = nlp(search_text.lower())
    
    # Extract relevant entities and keywords
    categories = set()
    
    # Extract named entities (PERSON, ORG, GPE, etc.)
    for ent in doc.ents:
        if ent.label_ in ['PERSON', 'ORG', 'GPE', 'EVENT', 'WORK_OF_ART', 'LAW', 'LANGUAGE']:
            # Clean and normalize the entity text
            clean_text = re.sub(r'[^\w\s]', '', ent.text.strip())
            if len(clean_text) > 2:  # Only include words longer than 2 characters
                categories.add(clean_text)
    
    # Extract important nouns and adjectives
    for token in doc:
        if (token.pos_ in ['NOUN', 'PROPN'] and 
            not token.is_stop and 
            not token.is_punct and 
            not token.is_space and
            len(token.text) > 2):
            clean_text = re.sub(r'[^\w\s]', '', token.text.strip())
            if clean_text:
                categories.add(clean_text)
    
    # Convert set to list and return
    return list(categories)

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        user="postgres",
        password="Corl4453",  #Change this to your own password
        database="websearch_demo",
        cursor_factory=psycopg2.extras.RealDictCursor
    )

@app.before_request
def assign_user():
    # Only create anonymous users for specific routes that need it
    # Skip this for auth routes, API routes, and static files
    if request.endpoint in ['auth_page', 'api_login', 'api_signup', 'api_logout', 'api_user', 'serve_auth_css', 'serve_auth_js']:
        return
    
    # Only create anonymous user if:
    # 1. No user_id in session AND
    # 2. No user_db_id in session AND  
    # 3. This is not an API route that handles authentication
    if 'user_id' not in session and 'user_db_id' not in session:
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
    elif 'user_db_id' not in session and 'user_id' in session:
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
            serpapi_key = request.form.get('serpapi_key') or os.getenv("SERPAPI_API_KEY") or "b78924b4496d3e2abba8b33f9e89fa5eb443f8e5ba0db605c98b5b6bae37e50c"
            use_trusted_sources = 'use_trusted_sources' in request.form
            results = main_system(query, serpapi_key, use_trusted_sources)

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
                        search_id = None
                        if 'user_db_id' in session:
                            insert_search_sql = "INSERT INTO searches (account_id, query_text) VALUES (%s, %s) RETURNING search_id"
                            cursor.execute(insert_search_sql, (session['user_db_id'], query))
                            search_id = cursor.fetchone()['search_id']
                        
                        # Store each article as its own row in articles table
                        for item in results:
                            url = item.get('url')
                            title = item.get('title')
                            content = item.get('content')
                            # Derive source_name from domain
                            source_name = None
                            try:
                                from urllib.parse import urlparse
                                parsed = urlparse(url) if url else None
                                source_name = parsed.netloc if parsed else None
                            except Exception:
                                source_name = None

                            if url and content:
                                insert_article_sql = (
                                    """
                                    INSERT INTO articles (article_title, content, article_url, source_name, publication_date, result_id)
                                    VALUES (%s, %s, %s, %s, %s, %s)
                                    ON CONFLICT (article_url) DO NOTHING
                                    """
                                )
                                cursor.execute(
                                    insert_article_sql,
                                    (title or '', content, url, source_name or '', None, result_id)
                                )

                        # Extract categories from user search text and store in categories table
                        if search_id:  # Only extract categories if we have a search_id
                            search_categories = extract_categories_from_search(query)
                            for category in search_categories:
                                # Check if this category already exists for this search to prevent duplicates
                                check_sql = "SELECT category_id FROM categories WHERE search_id = %s AND LOWER(entity_text) = LOWER(%s)"
                                cursor.execute(check_sql, (search_id, category))
                                existing = cursor.fetchone()
                                
                                if not existing:
                                    insert_category_sql = "INSERT INTO categories (search_id, entity_text, entity_label) VALUES (%s, %s, %s)"
                                    cursor.execute(insert_category_sql, (search_id, category, 'SEARCH_KEYWORD'))
                        
                        # Note: We only store categories extracted from search query text, not from scraped content
                        
                        # Generate AI summary using Gemini and store in usersummaries table
                        if 'user_db_id' in session and results:
                            print("🤖 Generating AI summary...")
                            try:
                                # Generate summary using the AI summary function
                                summary_data = generate_summary_from_text(query, serpapi_key)
                                summary_text = summary_data.get('summary', 'No summary available')
                                
                                # Store summary in usersummaries table
                                insert_summary_sql = """
                                    INSERT INTO usersummaries (user_id, result_id, summary_text) 
                                    VALUES (%s, %s, %s)
                                """
                                cursor.execute(insert_summary_sql, (session['user_db_id'], result_id, summary_text))
                                print("✅ AI summary stored successfully")
                                
                            except Exception as summary_error:
                                print(f"❌ AI Summary Error: {summary_error}")
                                # Store a fallback summary
                                fallback_summary = f"Summary generation failed for query: {query}"
                                insert_summary_sql = """
                                    INSERT INTO usersummaries (user_id, result_id, summary_text) 
                                    VALUES (%s, %s, %s)
                                """
                                cursor.execute(insert_summary_sql, (session['user_db_id'], result_id, fallback_summary))
                    db.commit()
            except Exception as e:
                print("❌ DB Insert Error:", e)

    return render_template('index.html', results=results)

# -------- API: Scrape Top 5 and save to search_results --------
@app.route('/api/scrape', methods=['POST'])
def api_scrape():
    try:
        data = request.get_json(silent=True) or request.form
        query = (data.get('query') or '').strip()
        if not query:
            # If no query provided, try to load the most recent one for this user
            if 'user_db_id' not in session:
                return jsonify({'status': 'error', 'message': 'query is required'}), 400
            try:
                with get_db_connection() as db:
                    with db.cursor() as cursor:
                        cursor.execute(
                            """
                            SELECT query_text
                            FROM searches
                            WHERE account_id = %s
                            ORDER BY timestamp DESC
                            LIMIT 1
                            """,
                            (session['user_db_id'],)
                        )
                        row = cursor.fetchone()
                        if row and row.get('query_text'):
                            query = (row['query_text'] or '').strip()
                        else:
                            return jsonify({'status': 'error', 'message': 'query is required'}), 400
            except Exception:
                return jsonify({'status': 'error', 'message': 'query is required'}), 400

        serpapi_key = data.get('serpapi_key') or os.getenv("SERPAPI_API_KEY") or "b78924b4496d3e2abba8b33f9e89fa5eb443f8e5ba0db605c98b5b6bae37e50c"
        use_trusted_sources = data.get('use_trusted_sources', False)
        results = main_system(query, serpapi_key, use_trusted_sources)

        with get_db_connection() as db:
            with db.cursor() as cursor:
                import json
                results_json = json.dumps(results)
                insert_result_sql = "INSERT INTO search_results (query, results) VALUES (%s, %s) RETURNING result_id"
                cursor.execute(insert_result_sql, (query, results_json))
                result_id = cursor.fetchone()['result_id']

                search_id = None
                if 'user_db_id' in session:
                    insert_search_sql = "INSERT INTO searches (account_id, query_text) VALUES (%s, %s) RETURNING search_id"
                    cursor.execute(insert_search_sql, (session['user_db_id'], query))
                    search_id = cursor.fetchone()['search_id']

                # Insert each article as its own row linked to this result_id
                for item in results:
                    url = item.get('url')
                    title = item.get('title')
                    content = item.get('content')
                    # Derive source_name from domain
                    source_name = None
                    try:
                        from urllib.parse import urlparse
                        parsed = urlparse(url) if url else None
                        source_name = parsed.netloc if parsed else None
                    except Exception:
                        source_name = None

                    if url and content:
                        insert_article_sql = (
                            """
                            INSERT INTO articles (article_title, content, article_url, source_name, publication_date, result_id)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (article_url) DO NOTHING
                            """
                        )
                        cursor.execute(
                            insert_article_sql,
                            (title or '', content, url, source_name or '', None, result_id)
                        )

                # Extract categories from user search text and store in categories table
                if search_id:  # Only extract categories if we have a search_id
                    search_categories = extract_categories_from_search(query)
                    for category in search_categories:
                        # Check if this category already exists for this search to prevent duplicates
                        check_sql = "SELECT category_id FROM categories WHERE search_id = %s AND LOWER(entity_text) = LOWER(%s)"
                        cursor.execute(check_sql, (search_id, category))
                        existing = cursor.fetchone()
                        
                        if not existing:
                            insert_category_sql = "INSERT INTO categories (search_id, entity_text, entity_label) VALUES (%s, %s, %s)"
                            cursor.execute(insert_category_sql, (search_id, category, 'SEARCH_KEYWORD'))
                
                # Note: We only store categories extracted from search query text, not from scraped content

                # Generate AI summary and store in usersummaries so /api/get-bot-response can retrieve it
                if 'user_db_id' in session:
                    try:
                        print("🤖 Generating AI summary (API scrape)...")
                        summary_data = generate_summary_from_text(query, serpapi_key)
                        summary_text = summary_data.get('summary', 'No summary available')
                        insert_summary_sql = (
                            """
                            INSERT INTO usersummaries (user_id, result_id, summary_text)
                            VALUES (%s, %s, %s)
                            """
                        )
                        cursor.execute(insert_summary_sql, (session['user_db_id'], result_id, summary_text))
                        print("✅ AI summary stored successfully (API scrape)")
                    except Exception as summary_error:
                        print(f"❌ AI Summary Error (API scrape): {summary_error}")
                        fallback_summary = f"Summary generation failed for query: {query}"
                        insert_summary_sql = (
                            """
                            INSERT INTO usersummaries (user_id, result_id, summary_text)
                            VALUES (%s, %s, %s)
                            """
                        )
                        cursor.execute(insert_summary_sql, (session['user_db_id'], result_id, fallback_summary))

                db.commit()

        return jsonify({'status': 'success', 'result_id': result_id, 'count': len(results)})
    except Exception as e:
        print("❌ /api/scrape error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to scrape and store results'}), 500

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

        with get_db_connection() as db:
            with db.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                # Fetch the user by username
                cursor.execute("SELECT user_id, uuid, username, hashed_password, role FROM users WHERE username = %s", (username,))
                user = cursor.fetchone()

                if not user:
                    return jsonify({'status': 'error', 'message': 'Invalid username or password'}), 401

                # Check password
                if not check_password_hash(user['hashed_password'], password):
                    return jsonify({'status': 'error', 'message': 'Invalid username or password'}), 401

                # Log the user in (save session)
                session['user_id'] = user['uuid']
                session['user_db_id'] = user['user_id']

        return jsonify({
            'status': 'success',
            'user': {
                'id': user['user_id'],
                'username': user['username'],
                'uuid': user['uuid'],
                'role': user['role']
            }
        })
    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({'status': 'error', 'message': 'Login failed'}), 500

@app.route('/home')
def home():
    # Render the home interface
    return render_template('VeriFact_interface/home.html')

@app.route('/api/user', methods=['GET'])
def get_current_user():
    """Get current user information"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        with get_db_connection() as db:
            with db.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                # Get user information
                cursor.execute("SELECT user_id, username, role, uuid FROM users WHERE user_id = %s", (session['user_db_id'],))
                user = cursor.fetchone()
                
                if not user:
                    return jsonify({'status': 'error', 'message': 'User not found'}), 404
                
                return jsonify({
                    'status': 'success',
                    'user': {
                        'id': user['user_id'],
                        'username': user['username'],
                        'role': user['role'],
                        'uuid': user['uuid']
                    }
                })
                
    except Exception as e:
        print("❌ Get user error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to get user information'}), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    session.pop('user_db_id', None)
    return jsonify({'status': 'success'})

# -------- AI Summary Endpoints --------
@app.route('/api/summaries', methods=['GET'])
def get_user_summaries():
    """Get all AI summaries for the current user"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Get summaries with related search info
                query = """
                    SELECT 
                        us.summary_id,
                        us.summary_text,
                        us.created_at,
                        sr.query,
                        sr.results
                    FROM usersummaries us
                    JOIN search_results sr ON us.result_id = sr.result_id
                    WHERE us.user_id = %s
                    ORDER BY us.created_at DESC
                """
                cursor.execute(query, (session['user_db_id'],))
                summaries = cursor.fetchall()
                
                # Convert to list of dicts for JSON response
                summaries_list = []
                for summary in summaries:
                    summaries_list.append({
                        'summary_id': summary['summary_id'],
                        'summary_text': summary['summary_text'],
                        'created_at': summary['created_at'].isoformat() if summary['created_at'] else None,
                        'query': summary['query'],
                        'results': summary['results']
                    })
                
                return jsonify({'status': 'success', 'summaries': summaries_list})
                
    except Exception as e:
        print("❌ Get summaries error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to retrieve summaries'}), 500

@app.route('/api/summaries/<int:summary_id>', methods=['GET'])
def get_specific_summary(summary_id):
    """Get a specific AI summary by ID"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Get specific summary with related search info
                query = """
                    SELECT 
                        us.summary_id,
                        us.summary_text,
                        us.created_at,
                        sr.query,
                        sr.results
                    FROM usersummaries us
                    JOIN search_results sr ON us.result_id = sr.result_id
                    WHERE us.summary_id = %s AND us.user_id = %s
                """
                cursor.execute(query, (summary_id, session['user_db_id']))
                summary = cursor.fetchone()
                
                if not summary:
                    return jsonify({'status': 'error', 'message': 'Summary not found'}), 404
                
                return jsonify({
                    'status': 'success', 
                    'summary': {
                        'summary_id': summary['summary_id'],
                        'summary_text': summary['summary_text'],
                        'created_at': summary['created_at'].isoformat() if summary['created_at'] else None,
                        'query': summary['query'],
                        'results': summary['results']
                    }
                })
                
    except Exception as e:
        print("❌ Get specific summary error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to retrieve summary'}), 500

# -------- Chat Endpoints --------
@app.route('/api/chat/send', methods=['POST'])
def send_chat_message():
    """Save a chat message to the database"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'status': 'error', 'message': 'Message is required'}), 400
        
        message = data['message'].strip()
        if not message:
            return jsonify({'status': 'error', 'message': 'Message cannot be empty'}), 400
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Check if there's a recent search for this user
                check_sql = """
                    SELECT search_id 
                    FROM searches 
                    WHERE account_id = %s 
                    AND timestamp > NOW() - INTERVAL '1 hour'
                    ORDER BY timestamp DESC 
                    LIMIT 1
                """
                cursor.execute(check_sql, (session['user_db_id'],))
                recent_search = cursor.fetchone()
                
                if recent_search:
                    # Follow-up message - save to conversationHistory (no search_id column in table)
                    insert_sql = """
                        INSERT INTO "conversationHistory" (user_id, query_text, response_text) 
                        VALUES (%s, %s, %s) 
                        RETURNING chat_id, timestamp
                    """
                    cursor.execute(insert_sql, (session['user_db_id'], message, ''))
                    result = cursor.fetchone()
                    # Extract categories from the user message and store in categories table
                    try:
                        chat_categories = extract_categories_from_search(message)
                        normalized_seen = set()
                        for category in chat_categories:
                            normalized = re.sub(r"\s+", " ", (category or "").strip().lower())
                            if not normalized or normalized in normalized_seen:
                                continue
                            normalized_seen.add(normalized)
                            # Skip if the category already exists for this user across ANY of their searches
                            check_sql = (
                                """
                                SELECT c.category_id
                                FROM categories c
                                JOIN searches s ON s.search_id = c.search_id
                                WHERE s.account_id = %s AND LOWER(TRIM(c.entity_text)) = %s
                                LIMIT 1
                                """
                            )
                            cursor.execute(check_sql, (session['user_db_id'], normalized))
                            existing = cursor.fetchone()
                            if not existing:
                                insert_category_sql = "INSERT INTO categories (search_id, entity_text, entity_label) VALUES (%s, %s, %s)"
                                cursor.execute(insert_category_sql, (recent_search['search_id'], normalized, 'SEARCH_KEYWORD'))
                    except Exception as cat_err:
                        print("⚠️ Chat category extract/insert error:", cat_err)
                    db.commit()
                    
                    return jsonify({
                        'status': 'success',
                        'chat_id': result['chat_id'],
                        'search_id': recent_search['search_id'],
                        'timestamp': result['timestamp'].isoformat() if result['timestamp'] else None,
                        'is_first_message': False
                    })
                else:
                    # First message - save to searches table
                    insert_sql = "INSERT INTO searches (account_id, query_text) VALUES (%s, %s) RETURNING search_id, timestamp"
                    cursor.execute(insert_sql, (session['user_db_id'], message))
                    result = cursor.fetchone()
                    # Extract categories from the user message and store in categories table
                    try:
                        chat_categories = extract_categories_from_search(message)
                        normalized_seen = set()
                        for category in chat_categories:
                            normalized = re.sub(r"\s+", " ", (category or "").strip().lower())
                            if not normalized or normalized in normalized_seen:
                                continue
                            normalized_seen.add(normalized)
                            # Skip if the category already exists for this user across ANY of their searches
                            check_sql = (
                                """
                                SELECT c.category_id
                                FROM categories c
                                JOIN searches s ON s.search_id = c.search_id
                                WHERE s.account_id = %s AND LOWER(TRIM(c.entity_text)) = %s
                                LIMIT 1
                                """
                            )
                            cursor.execute(check_sql, (session['user_db_id'], normalized))
                            existing = cursor.fetchone()
                            if not existing:
                                insert_category_sql = "INSERT INTO categories (search_id, entity_text, entity_label) VALUES (%s, %s, %s)"
                                cursor.execute(insert_category_sql, (result['search_id'], normalized, 'SEARCH_KEYWORD'))
                    except Exception as cat_err:
                        print("⚠️ First-message category extract/insert error:", cat_err)
                    db.commit()
                    
                    return jsonify({
                        'status': 'success',
                        'search_id': result['search_id'],
                        'timestamp': result['timestamp'].isoformat() if result['timestamp'] else None,
                        'is_first_message': True
                    })
                
    except Exception as e:
        print("❌ Send chat message error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to save message'}), 500
@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """Get chat history for the current user"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Get combined history from both searches and conversationHistory
                query = """
                    SELECT 
                        'search' as type,
                        search_id as id,
                        query_text,
                        '' as response_text,
                        timestamp,
                        NULL as search_id
                    FROM searches
                    WHERE account_id = %s
                    
                    UNION ALL
                    
                    SELECT 
                        'chat' as type,
                        chat_id as id,
                        query_text,
                        response_text,
                        timestamp,
                        NULL as search_id
                    FROM "conversationHistory"
                    WHERE user_id = %s
                    
                    ORDER BY timestamp ASC
                """
                cursor.execute(query, (session['user_db_id'], session['user_db_id']))
                messages = cursor.fetchall()
                
                # Convert to list of dicts for JSON response
                messages_list = []
                for msg in messages:
                    messages_list.append({
                        'type': msg['type'],
                        'id': msg['id'],
                        'query_text': msg['query_text'],
                        'response_text': msg['response_text'],
                        'timestamp': msg['timestamp'].isoformat() if msg['timestamp'] else None,
                        'search_id': msg['search_id']
                    })
                
                return jsonify({'status': 'success', 'messages': messages_list})
                
    except Exception as e:
        print("❌ Get chat history error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to retrieve chat history'}), 500

@app.route('/api/chat/update/<int:chat_id>', methods=['PUT'])
def update_chat_response(chat_id):
    """Update a chat message with bot response"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        data = request.get_json()
        if not data or 'response' not in data:
            return jsonify({'status': 'error', 'message': 'Response is required'}), 400
        
        response = data['response'].strip()
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Update the response for this chat
                update_sql = """
                    UPDATE "conversationHistory" 
                    SET response_text = %s 
                    WHERE chat_id = %s AND user_id = %s
                """
                cursor.execute(update_sql, (response, chat_id, session['user_db_id']))
                
                if cursor.rowcount == 0:
                    return jsonify({'status': 'error', 'message': 'Chat message not found'}), 404
                
                db.commit()
                return jsonify({'status': 'success'})
                
    except Exception as e:
        print("❌ Update chat response error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to update response'}), 500

@app.route('/api/chat/clear', methods=['DELETE'])
def clear_chat_history():
    """Clear all chat history for the current user"""
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Delete all chat history for this user
                delete_sql = "DELETE FROM \"conversationHistory\" WHERE user_id = %s"
                cursor.execute(delete_sql, (session['user_db_id'],))
                db.commit()
                
                return jsonify({'status': 'success', 'message': 'Chat history cleared'})
                
    except Exception as e:
        print("❌ Clear chat history error:", e)
        return jsonify({'status': 'error', 'message': 'Failed to clear chat history'}), 500
    
@app.route('/api/get-bot-response/<int:result_id>', methods=['GET'])
def get_bot_response(result_id):
    """
    Retrieve AI summary and scraped articles for a given result_id.
    This is called by the chat interface to display the bot's response.
    """
    try:
        if 'user_db_id' not in session:
            return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
        with get_db_connection() as db:
            with db.cursor() as cursor:
                # Get AI summary and search results
                cursor.execute("""
                    SELECT 
                        us.summary_text, 
                        sr.query, 
                        sr.results
                    FROM usersummaries us
                    JOIN search_results sr ON us.result_id = sr.result_id
                    WHERE us.result_id = %s AND us.user_id = %s
                """, (result_id, session['user_db_id']))
                
                data = cursor.fetchone()
                
                if not data:
                    return jsonify({'status': 'error', 'message': 'Response not found'}), 404
                
                # Parse results JSON (contains all 5 scraped articles)
                import json
                results = json.loads(data['results']) if isinstance(data['results'], str) else data['results']
                
                # Extract top 5 sources with URLs and titles
                sources = []
                for result in results[:5]:
                    url = result.get('url', '#')
                    # Check if source is trusted
                    is_trusted = any(domain in url for domain in [
                        'rappler.com', 'inquirer.net', 'verafiles.org', 
                        'philstar.com', 'abs-cbn.com', 'tsek.ph', 'wikipedia.org'
                    ])
                    
                    sources.append({
                        'title': result.get('title') or url.split('/')[2] if url != '#' else 'Unknown Source',
                        'url': url,
                        'is_trusted': is_trusted
                    })
                
                # Calculate accuracy based on trusted sources
                trusted_count = sum(1 for s in sources if s['is_trusted'])
                total_count = len(sources)
                
                if total_count == 0:
                    accuracy_percent = 0
                else:
                    accuracy_percent = int((trusted_count / total_count) * 100)
                
                # Adjust accuracy based on summary warnings
                summary_lower = data['summary_text'].lower()
                if '⚠️' in data['summary_text'] or 'unverified' in summary_lower:
                    accuracy_percent = max(30, accuracy_percent - 20)
                elif '❌' in data['summary_text'] or 'no results' in summary_lower:
                    accuracy_percent = 0
                elif 'could not extract' in summary_lower:
                    accuracy_percent = max(20, accuracy_percent - 30)
                
                return jsonify({
                    'status': 'success',
                    'query': data['query'],
                    'summary': data['summary_text'],
                    'sources': sources,
                    'accuracy': {
                        'true_percent': accuracy_percent,
                        'false_percent': 100 - accuracy_percent
                    },
                    'trusted_count': trusted_count,
                    'total_count': total_count
                })
                
    except Exception as e:
        print("❌ Get bot response error:", e)
        import traceback
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)