-- ============================================================
-- Bing Index Data 表 — Supabase SQL
-- ============================================================
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行

-- 1. 创建表
CREATE TABLE IF NOT EXISTS bing_index_data (
    id              SERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    domain          VARCHAR(255) NOT NULL DEFAULT 'bornchart.app',
    pages_submitted INTEGER DEFAULT 0,
    pages_indexed   INTEGER DEFAULT 0,
    indexed_rate    DECIMAL(5,4),
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes           TEXT,
    data_source     VARCHAR(50) DEFAULT 'cdp'  -- 'api' | 'cdp' | 'manual'
);

-- 2. 唯一约束（日期 + 域名为唯一键，用于 UPSERT）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_bing_index_date_domain'
    ) THEN
        ALTER TABLE bing_index_data
        ADD CONSTRAINT uq_bing_index_date_domain UNIQUE (date, domain);
    END IF;
END $$;

-- 3. 索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_bing_date ON bing_index_data (date DESC);
CREATE INDEX IF NOT EXISTS idx_bing_domain ON bing_index_data (domain);
CREATE INDEX IF NOT EXISTS idx_bing_date_domain ON bing_index_data (date DESC, domain);

-- 4. 更新触发器（自动更新 updated_at）
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

-- ============================================================
-- 查询示例
-- ============================================================

-- 最近 7 天索引趋势
-- SELECT date, domain, pages_submitted, pages_indexed, indexed_rate, data_source
-- FROM bing_index_data
-- WHERE domain = 'bornchart.app'
-- ORDER BY date DESC
-- LIMIT 7;

-- 索引率趋势
-- SELECT date, pages_submitted, pages_indexed,
--        ROUND(indexed_rate::numeric, 4) AS indexed_rate_pct
-- FROM bing_index_data
-- WHERE domain = 'bornchart.app'
-- ORDER BY date DESC;
