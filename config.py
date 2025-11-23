import psycopg2
import psycopg2.extras

conn = psycopg2.connect(
    host="localhost",
    user="postgres",
    password="lenroy3221",  # Change this to your own password
    database="websearch_demo",
    cursor_factory=psycopg2.extras.RealDictCursor
)

with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM users LIMIT 5")
    result = cursor.fetchall()
    print(result)
