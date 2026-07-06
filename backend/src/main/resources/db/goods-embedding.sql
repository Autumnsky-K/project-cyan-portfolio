CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS goods_embedding (
    goods_id BIGINT PRIMARY KEY REFERENCES goods (goods_id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL,
    embedding_model TEXT NOT NULL,
    source_text_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goods_embedding_ivfflat
    ON goods_embedding USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
