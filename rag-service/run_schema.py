import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def main():
    if not DATABASE_URL:
        print("DATABASE_URL not found in .env file.")
        return

    if not os.path.exists(SCHEMA_PATH):
        print(f"schema.sql not found at {SCHEMA_PATH}")
        return

    print("Connecting to Render PostgreSQL database...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("Reading schema.sql...")
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()

        print("Executing schema migrations...")
        cur.execute(schema_sql)
        conn.commit()
        
        print("Schema migrations executed successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error executing schema migrations: {e}")

if __name__ == "__main__":
    main()
