CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS artist_embedding (
    artist_id BIGINT PRIMARY KEY REFERENCES artist (artist_id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL,
    embedding_model TEXT NOT NULL,
    source_text_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_embedding_ivfflat
    ON artist_embedding USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
