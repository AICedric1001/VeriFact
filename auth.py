from flask import Blueprint, render_template, request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection  

auth_bp = Blueprint("auth", __name__)


# --- Registration Route ---

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()

        if not username or not password:
            return "Username and password are required."

        hashed_pw = generate_password_hash(password)

        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    # Check if username exists
                    cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
                    if cursor.fetchone():
                        return "Username already exists."

                    # Insert new user
                    cursor.execute(
                        "INSERT INTO users (username, password) VALUES (%s, %s)",
                        (username, hashed_pw)
                    )
                db.commit()

                # Optional: Merge anonymous posts into new account
                if 'user_id' in session:
                    cursor.execute(
                        "UPDATE posts SET user_id = %s WHERE user_id = %s",
                        (cursor.lastrowid, session['user_id'])
                    )
                    db.commit()

            return redirect('/login')
        except Exception as e:
            print("❌ Registration error:", e)
            return "Registration failed."

    return render_template('register.html')



# --- Login Route ---

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()

        if not username or not password:
            return "Username and password are required."

        try:
            with get_db_connection() as db:
                with db.cursor() as cursor:
                    cursor.execute(
                        "SELECT id, password FROM users WHERE username = %s",
                        (username,)
                    )
                    user = cursor.fetchone()

            if user and check_password_hash(user['password'], password):
                # Set session
                session['user_db_id'] = user['id']
                session['username'] = username

                # Optional: merge anonymous UUID activity
                if 'user_id' in session:
                    with get_db_connection() as db:
                        with db.cursor() as cursor:
                            cursor.execute(
                                "UPDATE posts SET user_id = %s WHERE user_id = %s",
                                (user['id'], session['user_id'])
                            )
                        db.commit()

                return redirect('/')
            else:
                return "Invalid username or password."
        except Exception as e:
            print("❌ Login error:", e)
            return "Login failed."

    return render_template('login.html')


# --- Logout Route ---

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect('/')
