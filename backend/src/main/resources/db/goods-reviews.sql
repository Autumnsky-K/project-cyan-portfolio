CREATE TABLE IF NOT EXISTS goods_review (
    review_id BIGINT PRIMARY KEY,
    goods_id BIGINT NOT NULL REFERENCES goods (goods_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    author_name VARCHAR(100) NOT NULL,
    option_label VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goods_review_goods_created
    ON goods_review (goods_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goods_review_goods_rating
    ON goods_review (goods_id, rating DESC);
