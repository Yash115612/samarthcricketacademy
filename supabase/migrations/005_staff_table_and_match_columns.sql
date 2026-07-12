-- Migration 005: Add a staff table (DbStaff parity, used by /api/admin/coaches) and
-- a missing live_link column on matches (DbMatch parity).

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Active',
    experience TEXT,
    bio TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON public.staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(role);

ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS live_link TEXT;
