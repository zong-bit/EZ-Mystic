-- FateWise Referral System — DDL
-- Migration 001: Create referral tables

-- Referral codes: one per user, maps code → user
CREATE TABLE IF NOT EXISTS referral_codes (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral events: tracks who referred whom
CREATE TABLE IF NOT EXISTS referral_events (
  id              BIGSERIAL PRIMARY KEY,
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,           -- 'signup', 'purchase', etc.
  referral_code   TEXT NOT NULL,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referee_id, event_type)          -- each user can only claim once per event_type
);

-- Referral rewards: grants given to users
CREATE TABLE IF NOT EXISTS referral_rewards (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type     TEXT NOT NULL,           -- 'trial', 'pro_extension'
  duration_days   INT,
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code   TEXT,
  order_id        TEXT UNIQUE,             -- Gumroad sale_id, null for trial rewards
  status          TEXT NOT NULL DEFAULT 'active',  -- 'active', 'cancelled', 'expired'
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gumroad sales tracker
CREATE TABLE IF NOT EXISTS gumroad_sales (
  id              BIGSERIAL PRIMARY KEY,
  sale_id         TEXT NOT NULL UNIQUE,
  email           TEXT,
  product_name    TEXT,
  plan            TEXT,
  token           TEXT,
  price           NUMERIC(10, 2),
  paid_at         TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  refunded        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referral_events_referee ON referral_events(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_ip ON referral_events(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_order ON referral_rewards(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_gumroad_sales_user ON gumroad_sales(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gumroad_sales_refunded ON gumroad_sales(refunded) WHERE refunded = true;
