-- ============================================================
-- GSC 每日数据采集 — Supabase 表结构
-- ============================================================
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行
-- 或: psql -h xgaxejeaxfhlupguqteu.supabase.co -U postgres -d postgres -f gsc_table.sql

-- 1. 创建表
CREATE TABLE IF NOT EXISTS gsc_data (
    id            SERIAL PRIMARY KEY,
    date          DATE NOT NULL,
    domain        VARCHAR(255) NOT NULL DEFAULT 'bornchart.app',
    clicks        INTEGER DEFAULT 0,
    impressions   INTEGER DEFAULT 0,
    ctr           DECIMAL(10,6),
    avg_position  DECIMAL(10,2),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- 2. 唯一约束（日期 + 域名为唯一键，用于 UPSERT）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_gsc_date_domain'
    ) THEN
        ALTER TABLE gsc_data
        ADD CONSTRAINT uq_gsc_date_domain UNIQUE (date, domain);
    END IF;
END $$;

-- 3. 索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_gsc_date ON gsc_data (date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_domain ON gsc_data (domain);

-- 4. 更新触发器（自动更新 updated_at）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gsc_data_updated_at ON gsc_data;
CREATE TRIGGER update_gsc_data_updated_at
    BEFORE UPDATE ON gsc_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 查询示例
-- ============================================================

-- 最近 7 天趋势
-- SELECT date, domain, clicks, impressions, ctr, avg_position
-- FROM gsc_data
-- WHERE domain = 'bornchart.app'
-- ORDER BY date DESC
-- LIMIT 7;

-- 月度汇总
-- SELECT
--     date_trunc('month', date)::date AS month,
--     SUM(clicks) AS total_clicks,
--     SUM(impressions) AS total_impressions,
--     AVG(ctr) AS avg_ctr,
--     AVG(avg_position) AS avg_position
-- FROM gsc_data
-- WHERE domain = 'bornchart.app'
-- GROUP BY month
-- ORDER BY month DESC;
