"""
ingest.py — Chunk knowledge base content and load it into pgvector.

USAGE:
    1. Put your source content as .txt or .md files inside knowledge/
       (e.g. knowledge/therapies.md, knowledge/faq.md)
    2. Run: python ingest.py
    3. Re-run any time your knowledge base content changes (it clears and re-inserts).
"""

import os
import glob
import psycopg
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

# We can accept DATABASE_URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")
KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "knowledge")

# Same model must be used at query time in main.py — do not change independently.
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"

CHUNK_SIZE = 500
CHUNK_OVERLAP = 80


def load_documents():
    """Read every .txt/.md file in knowledge/ and return (source_name, text) pairs."""
    docs = []
    for path in glob.glob(os.path.join(KNOWLEDGE_DIR, "*.*")):
        if path.endswith((".txt", ".md")):
            with open(path, "r", encoding="utf-8") as f:
                docs.append((os.path.basename(path), f.read()))
    return docs


def chunk_documents(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = []  # list of (source, chunk_text)
    for source, text in docs:
        for piece in splitter.split_text(text):
            piece = piece.strip()
            if piece:
                chunks.append((source, piece))
    return chunks


def main():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not set in environment.")
        return

    docs = load_documents()
    if not docs:
        print(f"No .txt/.md files found in {KNOWLEDGE_DIR}. Add content there first.")
        return

    print(f"Loaded {len(docs)} source file(s).")
    chunks = chunk_documents(docs)
    print(f"Split into {len(chunks)} chunk(s). Embedding...")

    model = SentenceTransformer(EMBED_MODEL_NAME)
    texts = [c[1] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)

    print("Connecting to database...")
    conn = psycopg.connect(DATABASE_URL)
    cur = conn.cursor()

    # Wipe old chunks so re-running ingest.py doesn't duplicate content.
    cur.execute("TRUNCATE TABLE kb_chunks RESTART IDENTITY;")

    insert_sql = """
        INSERT INTO kb_chunks (content, source, embedding)
        VALUES (%s, %s, %s)
    """
    for (source, text), emb in zip(chunks, embeddings):
        cur.execute(insert_sql, (text, source, emb.tolist()))

    conn.commit()
    cur.close()
    conn.close()
    print(f"Successfully inserted {len(chunks)} chunks into kb_chunks. Done.")


if __name__ == "__main__":
    main()
