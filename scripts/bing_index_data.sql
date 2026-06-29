-- ============================================================
-- bing_index_data 表 — Supabase SQL Editor 执行
-- ============================================================

CREATE TABLE IF NOT EXISTS bing_index_data (
    id              SERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    domain          VARCHAR(255) NOT NULL DEFAULT 'bornchart.app',
    pages_submitted INTEGER DEFAULT 0,
    pages_indexed   INTEGER DEFAULT 0,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_bing_index_date_domain'
    ) THEN
        ALTER TABLE bing_index_data
        ADD CONSTRAINT uq_bing_index_date_domain UNIQUE (date, domain);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bing_date ON bing_index_data (date DESC);
CREATE INDEX IF NOT EXISTS idx_bing_domain ON bing_index_data (domain);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bing_index_updated_at ON bing_index_data;
CREATE TRIGGER update_bing_index_updated_at
    BEFORE UPDATE ON bing_index_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
