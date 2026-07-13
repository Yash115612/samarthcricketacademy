
-- Migration 006: Add payment_verifications table and update memberships to match DbMembership
-- Also add missing tables/columns for the APIs we're migrating

-- 1. Update memberships table to match DbMembership
ALTER TABLE public.memberships
    ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS plan_name TEXT,
    ADD COLUMN IF NOT EXISTS coach_name TEXT;

-- Rename "plan" column to "plan_type" to match inMemoryDb (DbMembership.plan_type)
ALTER TABLE public.memberships
    RENAME COLUMN plan TO plan_type;

-- Create index for memberships.branch_id
CREATE INDEX IF NOT EXISTS idx_memberships_branch_id ON public.memberships(branch_id);

-- 2. Create payment_verifications table (DbPaymentVerification)
CREATE TABLE IF NOT EXISTS public.payment_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    plan_price INTEGER NOT NULL,
    plan_duration_days INTEGER NOT NULL,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    utr_number TEXT NOT NULL,
    screenshot_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_verifications_branch_id ON public.payment_verifications(branch_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_user_id ON public.payment_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_status ON public.payment_verifications(status);

-- 3. Create transactions table (DbTransaction)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    player TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_branch_id ON public.transactions(branch_id);
