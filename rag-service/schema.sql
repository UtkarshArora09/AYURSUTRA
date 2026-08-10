-- AyurSutra RAG Chatbot — PostgreSQL schema and migrations
-- Run this against your database to enable vector searching, conversational memory, and patient Dosha fields.

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Table to hold chunked knowledge-base content + embeddings (384 dimensions for all-MiniLM-L6-v2)
CREATE TABLE IF NOT EXISTS kb_chunks (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    source      TEXT,                 -- e.g. 'therapies.md', 'faq.md'
    metadata    JSONB DEFAULT '{}',   -- optional metadata
    embedding   VECTOR(384) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. HNSW or IVFFlat index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS kb_chunks_embedding_idx
    ON kb_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- 4. Table to hold session-based chat history for conversational memory
CREATE TABLE IF NOT EXISTS kb_chat_history (
    id          BIGSERIAL PRIMARY KEY,
    session_id  VARCHAR(255) NOT NULL,
    role        VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index on session_id to retrieve history quickly
CREATE INDEX IF NOT EXISTS kb_chat_history_session_idx ON kb_chat_history (session_id);

-- 5. Table to log chatbot interactions for analytics & debugging
CREATE TABLE IF NOT EXISTS kb_chat_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_query      TEXT NOT NULL,
    retrieved_ids   BIGINT[],         -- IDs of kb_chunks retrieved
    answer          TEXT,
    confidence      FLOAT,            -- Cosine similarity score of top chunk
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Migration: Add dosha column to patients table to persist assessment results
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dosha VARCHAR(50);
