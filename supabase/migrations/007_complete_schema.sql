
-- Migration 007: Complete the schema for all remaining tables/columns

-- 1. Update attendances (player) table
ALTER TABLE public.attendances
  ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE;

-- 2. Update staff_attendances (we'll use users with role 'staff' for staff)
ALTER TABLE public.staff_attendances
  RENAME TO staff_attendance;

ALTER TABLE public.staff_attendance
  ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS staff_id TEXT REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Update enquiries table to match DbEnquiry
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS parent_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS class_standard TEXT,
  ADD COLUMN IF NOT EXISTS board TEXT,
  ADD COLUMN IF NOT EXISTS playing_role TEXT,
  ADD COLUMN IF NOT EXISTS batting_style TEXT,
  ADD COLUMN IF NOT EXISTS bowling_style TEXT,
  ADD COLUMN IF NOT EXISTS previous_experience TEXT,
  ADD COLUMN IF NOT EXISTS previous_experience_details TEXT,
  ADD COLUMN IF NOT EXISTS preferred_batch_timing TEXT,
  ADD COLUMN IF NOT EXISTS how_hear_about_us TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions_details TEXT,
  ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'admission',
  ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Update branch_settings table
ALTER TABLE public.branch_settings
  ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS total_pt_slots INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS used_pt_slots INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_qr_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_upi_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_instructions TEXT[];

-- 5. Update site_settings table (we'll store as a single row with all fields)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS players_trained TEXT DEFAULT '0+',
  ADD COLUMN IF NOT EXISTS tournament_wins TEXT DEFAULT '0+',
  ADD COLUMN IF NOT EXISTS certified_coaches TEXT DEFAULT '0+',
  ADD COLUMN IF NOT EXISTS matches_played TEXT DEFAULT '0+',
  ADD COLUMN IF NOT EXISTS academy_name TEXT,
  ADD COLUMN IF NOT EXISTS academy_description TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_link TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS hero_slides JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS homepage_videos JSONB DEFAULT '[]'::jsonb;

-- 6. Create scoring_sessions table
CREATE TABLE IF NOT EXISTS public.scoring_sessions (
  id TEXT PRIMARY KEY,
  match_id TEXT,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  innings INTEGER DEFAULT 1,
  batting_team TEXT,
  bowling_team TEXT,
  total_overs INTEGER DEFAULT 20,
  target INTEGER,
  batting_lineup TEXT[] DEFAULT '{}'::text[],
  striker TEXT,
  non_striker TEXT,
  current_bowler TEXT,
  previous_bowler TEXT,
  awaiting_new_bowler BOOLEAN DEFAULT false,
  awaiting_new_batsman BOOLEAN DEFAULT false,
  over_completed_on_wicket BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoring_sessions_match_id ON public.scoring_sessions(match_id);

-- 7. Create balls table
CREATE TABLE IF NOT EXISTS public.balls (
  id TEXT PRIMARY KEY,
  match_id TEXT,
  innings INTEGER DEFAULT 1,
  over INTEGER DEFAULT 0,
  batsman TEXT,
  non_striker TEXT,
  bowler TEXT,
  runs INTEGER DEFAULT 0,
  wide BOOLEAN DEFAULT false,
  no_ball BOOLEAN DEFAULT false,
  bye INTEGER DEFAULT 0,
  leg_bye INTEGER DEFAULT 0,
  wicket JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_balls_match_id ON public.balls(match_id);
CREATE INDEX IF NOT EXISTS idx_balls_innings ON public.balls(innings);

-- 8. Update products table (shop)
ALTER TABLE public.shop_items
  RENAME TO products;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS image TEXT;

-- 9. Update matches table
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS live_link TEXT;
