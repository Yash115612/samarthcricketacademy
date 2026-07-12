-- Migration 004: Use slug strings ("samarth" / "aims") as branch IDs instead of UUIDs,
-- and add password-auth columns to users, to match the existing app's inMemoryDb model.

-- 1. Drop FK constraints that reference branches.id
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_branch_id_fkey;
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_branch_id_fkey;
ALTER TABLE public.notices DROP CONSTRAINT IF EXISTS notices_branch_id_fkey;
ALTER TABLE public.branch_settings DROP CONSTRAINT IF EXISTS branch_settings_branch_id_fkey;

-- 2. Convert branches.id and referencing columns from UUID to TEXT slugs
ALTER TABLE public.branches ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.branches ALTER COLUMN id TYPE TEXT USING id::text;

ALTER TABLE public.users ALTER COLUMN branch_id TYPE TEXT USING branch_id::text;
ALTER TABLE public.matches ALTER COLUMN branch_id TYPE TEXT USING branch_id::text;
ALTER TABLE public.notices ALTER COLUMN branch_id TYPE TEXT USING branch_id::text;
ALTER TABLE public.branch_settings ALTER COLUMN branch_id TYPE TEXT USING branch_id::text;

-- 3. Re-add FK constraints
ALTER TABLE public.users ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.matches ADD CONSTRAINT matches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.notices ADD CONSTRAINT notices_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.branch_settings ADD CONSTRAINT branch_settings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;

-- 4. Seed the two branch slugs the app hard-codes elsewhere (BranchId = "samarth" | "aims")
INSERT INTO public.branches (id, name, location)
VALUES ('samarth', 'Samarth Cricket Academy', NULL),
       ('aims', 'AIMS Cricket Academy', NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. Add columns needed for the existing bcrypt + lockout login flow (inMemoryDb parity)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ;

-- 6. Add branch profile columns used by the admin branches UI (DbBranch parity)
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS google_maps_link TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS head_coach TEXT DEFAULT '';
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS established TEXT DEFAULT '';

-- 7. Add plan_type column memberships needs to distinguish monthly vs personal-training plans
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS plan_type TEXT;
