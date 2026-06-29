-- =====================================================
-- Samarth Cricket Academy - Initial Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Branches Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'player',
    experience TEXT,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    membership_status VARCHAR(50) DEFAULT 'none',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. Coach Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coach_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. Staff Attendance
-- =====================================================
CREATE TABLE IF NOT EXISTS public.staff_attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. Coaching Sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. Memberships
-- =====================================================
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. Plans
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. Matches
-- =====================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    teams TEXT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50),
    venue TEXT,
    fee INTEGER,
    status VARCHAR(50) NOT NULL,
    result TEXT,
    scoring_session JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. Match Participants
-- =====================================================
CREATE TABLE IF NOT EXISTS public.match_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending'
);

-- =====================================================
-- 10. Performances
-- =====================================================
CREATE TABLE IF NOT EXISTS public.performances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0
);

-- =====================================================
-- 11. Attendances (Player)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- =====================================================
-- 12. Notices
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. Payments
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    method VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. Enquiries
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    message TEXT,
    status VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. Site Settings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. Shop Items
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. Branch Settings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.branch_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    branch_id UUID UNIQUE REFERENCES public.branches(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Create updated_at triggers
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
            'branches', 'users', 'coach_profiles', 'site_settings', 'branch_settings'
        )
    LOOP
        EXECUTE format('
            CREATE TRIGGER handle_%s_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        ', t, t);
    END LOOP;
END $$;

-- =====================================================
-- Create indexes for common queries
-- =====================================================

-- Users table
CREATE INDEX idx_users_branch_id ON public.users(branch_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Coach profiles
CREATE INDEX idx_coach_profiles_user_id ON public.coach_profiles(user_id);
CREATE INDEX idx_coach_profiles_is_active ON public.coach_profiles(is_active);

-- Staff Attendances
CREATE INDEX idx_staff_attendances_coach_id ON public.staff_attendances(coach_id);
CREATE INDEX idx_staff_attendances_date ON public.staff_attendances(date);

-- Coaching Sessions
CREATE INDEX idx_coaching_sessions_coach_id ON public.coaching_sessions(coach_id);
CREATE INDEX idx_coaching_sessions_user_id ON public.coaching_sessions(user_id);
CREATE INDEX idx_coaching_sessions_date ON public.coaching_sessions(date);

-- Memberships
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);

-- Matches
CREATE INDEX idx_matches_branch_id ON public.matches(branch_id);
CREATE INDEX idx_matches_date ON public.matches(date);
CREATE INDEX idx_matches_status ON public.matches(status);

-- Match Participants
CREATE INDEX idx_match_participants_match_id ON public.match_participants(match_id);
CREATE INDEX idx_match_participants_user_id ON public.match_participants(user_id);

-- Performances
CREATE INDEX idx_performances_user_id ON public.performances(user_id);
CREATE INDEX idx_performances_match_id ON public.performances(match_id);

-- Attendances (players)
CREATE INDEX idx_attendances_user_id ON public.attendances(user_id);
CREATE INDEX idx_attendances_date ON public.attendances(date);

-- Notices
CREATE INDEX idx_notices_branch_id ON public.notices(branch_id);
CREATE INDEX idx_notices_date ON public.notices(date);
CREATE INDEX idx_notices_important ON public.notices(important);

-- Payments
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_date ON public.payments(date);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Enquiries
CREATE INDEX idx_enquiries_user_id ON public.enquiries(user_id);
CREATE INDEX idx_enquiries_status ON public.enquiries(status);

-- Site Settings
CREATE INDEX idx_site_settings_key ON public.site_settings(key);

-- Shop Items
CREATE INDEX idx_shop_items_is_active ON public.shop_items(is_active);

-- Branch Settings
CREATE INDEX idx_branch_settings_branch_id ON public.branch_settings(branch_id);
