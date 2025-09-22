import pymysql
# --- Database connection helper ---
def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        db="websearch_demo",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )