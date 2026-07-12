
-- Add all missing columns to the enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS class_standard TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS board TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS playing_role TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS batting_style TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS bowling_style TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS previous_experience TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS previous_experience_details TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS preferred_batch_timing TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS how_hear_about_us TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS medical_conditions_details TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE;

