# Verification Report - Supabase Database Setup

## Overview
This document lists the expected state of the Supabase database after applying Phase 2 migrations.

---

## 1. UUID Extension
- Name: `uuid-ossp`
- Status: Should be **Enabled** (under Database → Extensions)

---

## 2. Tables (17 total)

### 2.1 `branches`
- PK: `id` (UUID, auto-gen via `uuid_generate_v4()`)
- Columns: `id`, `name`, `location`, `settings`, `created_at`, `updated_at`
- Indexes: PK index
- Triggers: `handle_branches_updated_at`
- RLS: Enabled

### 2.2 `users`
- PK: `id`
- FK: `branch_id` → `branches.id` (CASCADE delete)
- Unique constraint: `email`
- Columns: `id`, `name`, `email`, `phone`, `branch_id`, `role`, `experience`, `is_profile_complete`, `membership_status`, `created_at`, `updated_at`
- Indexes: `idx_users_branch_id`, `idx_users_email`, `idx_users_role`, PK
- Triggers: `handle_users_updated_at`
- RLS: Enabled

### 2.3 `coach_profiles`
- PK: `id`
- FK: `user_id` → `users.id` (CASCADE delete, UNIQUE)
- Columns: `id`, `user_id`, `is_active`, `created_at`, `updated_at`
- Indexes: `idx_coach_profiles_user_id`, `idx_coach_profiles_is_active`, PK
- Triggers: `handle_coach_profiles_updated_at`
- RLS: Enabled

### 2.4 `staff_attendances`
- PK: `id`
- FK: `coach_id` → `coach_profiles.id` (CASCADE delete)
- Columns: `id`, `coach_id`, `date`, `status`, `created_at`
- Indexes: `idx_staff_attendances_coach_id`, `idx_staff_attendances_date`, PK
- RLS: Enabled

### 2.5 `coaching_sessions`
- PK: `id`
- FKs: `coach_id` → `coach_profiles.id` (CASCADE), `user_id` → `users.id` (CASCADE)
- Columns: `id`, `coach_id`, `user_id`, `date`, `notes`, `created_at`
- Indexes: `idx_coaching_sessions_coach_id`, `idx_coaching_sessions_user_id`, `idx_coaching_sessions_date`, PK
- RLS: Enabled

### 2.6 `memberships`
- PK: `id`
- FK: `user_id` → `users.id` (CASCADE)
- Columns: `id`, `user_id`, `plan`, `start_date`, `expiry_date`, `status`, `created_at`
- Indexes: `idx_memberships_user_id`, `idx_memberships_status`, PK
- RLS: Enabled

### 2.7 `plans`
- PK: `id`
- Columns: `id`, `name`, `price`, `duration_days`, `description`, `is_active`, `created_at`
- Indexes: PK
- RLS: Enabled

### 2.8 `matches`
- PK: `id`
- FK: `branch_id` → `branches.id` (CASCADE)
- Columns: `id`, `branch_id`, `teams`, `date`, `time`, `venue`, `fee`, `status`, `result`, `scoring_session`, `created_at`
- Indexes: `idx_matches_branch_id`, `idx_matches_date`, `idx_matches_status`, PK
- RLS: Enabled

### 2.9 `match_participants`
- PK: `id`
- FKs: `match_id` → `matches.id` (CASCADE), `user_id` → `users.id` (CASCADE)
- Columns: `id`, `match_id`, `user_id`, `status`
- Indexes: `idx_match_participants_match_id`, `idx_match_participants_user_id`, PK
- RLS: Enabled

### 2.10 `performances`
- PK: `id`
- FKs: `user_id` → `users.id` (CASCADE), `match_id` → `matches.id` (CASCADE)
- Columns: `id`, `user_id`, `match_id`, `runs`, `wickets`
- Indexes: `idx_performances_user_id`, `idx_performances_match_id`, PK
- RLS: Enabled

### 2.11 `attendances`
- PK: `id`
- FK: `user_id` → `users.id` (CASCADE)
- Columns: `id`, `user_id`, `date`, `status`
- Indexes: `idx_attendances_user_id`, `idx_attendances_date`, PK
- RLS: Enabled

### 2.12 `notices`
- PK: `id`
- FK: `branch_id` → `branches.id` (CASCADE)
- Columns: `id`, `branch_id`, `title`, `message`, `date`, `important`, `created_at`
- Indexes: `idx_notices_branch_id`, `idx_notices_date`, `idx_notices_important`, PK
- RLS: Enabled

### 2.13 `payments`
- PK: `id`
- FK: `user_id` → `users.id` (CASCADE)
- Columns: `id`, `user_id`, `amount`, `method`, `status`, `date`, `remarks`, `created_at`
- Indexes: `idx_payments_user_id`, `idx_payments_date`, `idx_payments_status`, PK
- RLS: Enabled

### 2.14 `enquiries`
- PK: `id`
- FK: `user_id` → `users.id` (SET NULL on delete)
- Columns: `id`, `name`, `email`, `phone`, `message`, `status`, `user_id`, `created_at`
- Indexes: `idx_enquiries_user_id`, `idx_enquiries_status`, PK
- RLS: Enabled

### 2.15 `site_settings`
- PK: `id`
- Unique constraint: `key`
- Columns: `id`, `key`, `value`, `updated_at`
- Indexes: `idx_site_settings_key`, PK
- Triggers: `handle_site_settings_updated_at`
- RLS: Enabled

### 2.16 `shop_items`
- PK: `id`
- Columns: `id`, `name`, `price`, `description`, `image_url`, `stock`, `is_active`, `created_at`
- Indexes: `idx_shop_items_is_active`, PK
- RLS: Enabled

### 2.17 `branch_settings`
- PK: `id`
- FK: `branch_id` → `branches.id` (CASCADE, UNIQUE)
- Columns: `id`, `branch_id`, `settings`, `updated_at`
- Indexes: `idx_branch_settings_branch_id`, PK
- Triggers: `handle_branch_settings_updated_at`
- RLS: Enabled

---

## 3. Function
- Name: `handle_updated_at()`
- Language: `plpgsql`
- Purpose: Automatically updates `updated_at` column on row change

---

## 4. Storage Buckets (3)
1. `gallery` (public, 5 MB limit, image types)
2. `shop_images` (public, 5 MB limit, image types)
3. `user_uploads` (private, 10 MB limit, image/pdf types)

---

## 5. RLS Policies
- Enabled on all 17 tables
- Public read access on: `branches`, `notices`, `plans`, `matches`, `site_settings`, active `shop_items`
- Full access (FOR ALL) on all tables (for service role usage)
