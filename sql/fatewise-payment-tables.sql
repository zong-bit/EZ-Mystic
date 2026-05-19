-- ============================================
-- FateWise (BornChart) — Payment tables for Supabase
-- Run this in Supabase SQL Editor:
-- https://xgaxejeaxfhlupguqteu.supabase.co/dashboard/sql/new
-- ============================================

-- 1. Add source column to gumroad_sales (shared with paper-summarizer)
--    Allows distinguishing FateWise purchases from Paper Summarizer purchases.
ALTER TABLE IF EXISTS gumroad_sales
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'paper-summarizer';

-- 2. Create FateWise-specific payments tracking table
--    Optional: dedicated table for FateWise orders if you prefer isolation.
CREATE TABLE IF NOT EXISTS fatewise_sales (
  id BIGSERIAL PRIMARY KEY,
  sale_id TEXT NOT NULL UNIQUE,
  email TEXT,
  product_name TEXT,
  plan TEXT,
  token TEXT,
  price NUMERIC,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  refunded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_fatewise_sales_sale_id ON fatewise_sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_gumroad_sales_source ON gumroad_sales(source);

-- ============================================
-- Existing tables (should already exist from paper-summarizer):
-- gumroad_sales, tokens, subscriptions
-- If any are missing, create them below:
-- ============================================

-- Tokens table (if not exists)
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  max_requests INTEGER NOT NULL DEFAULT 500,
  used_requests INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (if not exists)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  gumroad_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT DEFAULT 'paper-summarizer',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_source ON subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
