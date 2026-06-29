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
-- Note: Using service role, so RLS effectively bypassed, but policies are defined for future use

-- Branches
CREATE POLICY "Enable full access for service role" ON public.branches
    FOR ALL USING (true) WITH CHECK (true);
-- Users
CREATE POLICY "Enable full access for service role" ON public.users
    FOR ALL USING (true) WITH CHECK (true);
-- Coach Profiles
CREATE POLICY "Enable full access for service role" ON public.coach_profiles
    FOR ALL USING (true) WITH CHECK (true);
-- Staff Attendances
CREATE POLICY "Enable full access for service role" ON public.staff_attendances
    FOR ALL USING (true) WITH CHECK (true);
-- Coaching Sessions
CREATE POLICY "Enable full access for service role" ON public.coaching_sessions
    FOR ALL USING (true) WITH CHECK (true);
-- Memberships
CREATE POLICY "Enable full access for service role" ON public.memberships
    FOR ALL USING (true) WITH CHECK (true);
-- Plans
CREATE POLICY "Enable full access for service role" ON public.plans
    FOR ALL USING (true) WITH CHECK (true);
-- Matches
CREATE POLICY "Enable full access for service role" ON public.matches
    FOR ALL USING (true) WITH CHECK (true);
-- Match Participants
CREATE POLICY "Enable full access for service role" ON public.match_participants
    FOR ALL USING (true) WITH CHECK (true);
-- Performances
CREATE POLICY "Enable full access for service role" ON public.performances
    FOR ALL USING (true) WITH CHECK (true);
-- Attendances
CREATE POLICY "Enable full access for service role" ON public.attendances
    FOR ALL USING (true) WITH CHECK (true);
-- Notices
CREATE POLICY "Enable full access for service role" ON public.notices
    FOR ALL USING (true) WITH CHECK (true);
-- Payments
CREATE POLICY "Enable full access for service role" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);
-- Enquiries
CREATE POLICY "Enable full access for service role" ON public.enquiries
    FOR ALL USING (true) WITH CHECK (true);
-- Site Settings
CREATE POLICY "Enable full access for service role" ON public.site_settings
    FOR ALL USING (true) WITH CHECK (true);
-- Shop Items
CREATE POLICY "Enable full access for service role" ON public.shop_items
    FOR ALL USING (true) WITH CHECK (true);
-- Branch Settings
CREATE POLICY "Enable full access for service role" ON public.branch_settings
    FOR ALL USING (true) WITH CHECK (true);
