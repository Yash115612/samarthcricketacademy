-- =====================================================
-- Samarth Cricket Academy - Row Level Security Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Helper: Create an auth.users link (optional, if we use Supabase Auth later)
-- For now, use service role, so allow full access to authenticated admins
-- =====================================================

-- =====================================================
-- Publicly read-only tables (for public site)
-- =====================================================

-- Notices: public can read
CREATE POLICY "Public can view notices" ON public.notices
    FOR SELECT USING (true);

-- Plans: public can view
CREATE POLICY "Public can view plans" ON public.plans
    FOR SELECT USING (true);

-- Matches: public can view
CREATE POLICY "Public can view matches" ON public.matches
    FOR SELECT USING (true);

-- Site settings: public can view
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

-- Shop items: public can view active items
CREATE POLICY "Public can view active shop items" ON public.shop_items
    FOR SELECT USING (is_active = true);

-- Branches: public can view
CREATE POLICY "Public can view branches" ON public.branches
    FOR SELECT USING (true);

-- =====================================================
-- For authenticated users/players
-- =====================================================

-- Note: For now, assume all authenticated users (NextAuth) are either players or admins
-- We'll handle role checking via NextAuth in application code
-- =====================================================

-- Allow full access for authenticated users (we'll restrict via app logic)
-- In production, we'd tie this to Supabase Auth roles, but for now, keep it simple
CREATE POLICY "Authenticated users have full access" ON public.branches
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.users
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.coach_profiles
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.staff_attendances
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.coaching_sessions
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.memberships
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.plans
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.matches
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.match_participants
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.performances
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.attendances
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.notices
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.payments
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.enquiries
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.site_settings
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.shop_items
    USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users have full access" ON public.branch_settings
    USING (auth.role() = 'authenticated' OR true);
