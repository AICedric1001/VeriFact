import pymysql

conn = pymysql.connect(
    host="localhost",
    user="root",
    password="",
    db="websearch_demo",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM your_table")
    result = cursor.fetchall()
    print(result)
