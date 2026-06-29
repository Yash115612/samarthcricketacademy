# Samarth Cricket Academy - Supabase Migration Guide (Phase 2)

## Step‑by‑Step Instructions to Apply Migrations

### 1. Go to your Supabase project dashboard
Navigate to: https://supabase.com/dashboard/project/dvmokroadanbrtzvgrtf

### 2. Open SQL Editor
- In the left sidebar, click on the "SQL Editor" tab
- Click "New Query"

### 3. Apply Initial Schema Migration
- Copy the full content of `supabase/migrations/001_initial_schema.sql`
- Paste it into the SQL Editor query window
- Click "Run" to execute
- Verify you get a success message

### 4. Apply RLS Policies Migration
- Click "New Query" to create another query
- Copy and paste the full content of `supabase/migrations/002_rls_policies.sql`
- Click "Run" to execute
- Verify you get a success message

### 5. Create Storage Buckets
- In the left sidebar, click on the "Storage" tab
- Click "New bucket"
- Create the following 3 buckets:

#### Bucket 1: `gallery`
- Name: `gallery`
- Public bucket: Yes
- File size limit: `5 MB` (5,242,880 bytes)
- Allowed MIME types: `image/jpeg,image/png,image/webp`

#### Bucket 2: `shop_images`
- Name: `shop_images`
- Public bucket: Yes
- File size limit: `5 MB`
- Allowed MIME types: `image/jpeg,image/png,image/webp`

#### Bucket 3: `user_uploads`
- Name: `user_uploads`
- Public bucket: No
- File size limit: `10 MB`
- Allowed MIME types: `image/*,application/pdf`

---

## Verification Report

### List of Tables, PKs, FKs, Indexes, & RLS Status

| # | Table Name            | Primary Key | Foreign Keys                                                                 | Indexes                                                                                          | RLS Enabled |
|---|------------------------|-------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|-------------|
| 1 | `branches`             | `id`        | None                                                                        | PK index; `idx_branch_settings_branch_id` (from branch_settings)                                 | ✅ Yes      |
| 2 | `users`                | `id`        | `branch_id` → `branches.id`                                                 | PK index; `idx_users_branch_id`; `idx_users_email`; `idx_users_role`                              | ✅ Yes      |
| 3 | `coach_profiles`       | `id`        | `user_id` → `users.id` (unique)                                             | PK index; `idx_coach_profiles_user_id`; `idx_coach_profiles_is_active`                            | ✅ Yes      |
| 4 | `staff_attendances`    | `id`        | `coach_id` → `coach_profiles.id`                                            | PK index; `idx_staff_attendances_coach_id`; `idx_staff_attendances_date`                          | ✅ Yes      |
| 5 | `coaching_sessions`    | `id`        | `coach_id` → `coach_profiles.id`; `user_id` → `users.id`                    | PK index; `idx_coaching_sessions_coach_id`; `idx_coaching_sessions_user_id`; `idx_coaching_sessions_date` | ✅ Yes      |
| 6 | `memberships`          | `id`        | `user_id` → `users.id`                                                      | PK index; `idx_memberships_user_id`; `idx_memberships_status`                                      | ✅ Yes      |
| 7 | `plans`                | `id`        | None                                                                        | PK index                                                                                          | ✅ Yes      |
| 8 | `matches`              | `id`        | `branch_id` → `branches.id`                                                 | PK index; `idx_matches_branch_id`; `idx_matches_date`; `idx_matches_status`                        | ✅ Yes      |
| 9 | `match_participants`   | `id`        | `match_id` → `matches.id`; `user_id` → `users.id`                          | PK index; `idx_match_participants_match_id`; `idx_match_participants_user_id`                      | ✅ Yes      |
| 10 | `performances`         | `id`        | `user_id` → `users.id`; `match_id` → `matches.id`                          | PK index; `idx_performances_user_id`; `idx_performances_match_id`                                  | ✅ Yes      |
| 11 | `attendances`          | `id`        | `user_id` → `users.id`                                                      | PK index; `idx_attendances_user_id`; `idx_attendances_date`                                        | ✅ Yes      |
| 12 | `notices`              | `id`        | `branch_id` → `branches.id`                                                 | PK index; `idx_notices_branch_id`; `idx_notices_date`; `idx_notices_important`                     | ✅ Yes      |
| 13 | `payments`             | `id`        | `user_id` → `users.id`                                                      | PK index; `idx_payments_user_id`; `idx_payments_date`; `idx_payments_status`                        | ✅ Yes      |
| 14 | `enquiries`            | `id`        | `user_id` → `users.id` (SET NULL on delete)                                | PK index; `idx_enquiries_user_id`; `idx_enquiries_status`                                           | ✅ Yes      |
| 15 | `site_settings`        | `id`        | None                                                                        | PK index; `idx_site_settings_key` (unique)                                                          | ✅ Yes      |
| 16 | `shop_items`           | `id`        | None                                                                        | PK index; `idx_shop_items_is_active`                                                               | ✅ Yes      |
| 17 | `branch_settings`      | `id`        | `branch_id` → `branches.id` (unique)                                       | PK index; `idx_branch_settings_branch_id` (unique)                                                 | ✅ Yes      |

---

## Verification Checklist

After applying migrations, verify:
1. ✅ All 17 tables are present in the "Table Editor"
2. ✅ UUID extension is enabled (check "Database" → "Extensions")
3. ✅ `handle_updated_at` function exists (check "Database" → "Functions")
4. ✅ Triggers are created on: `branches`, `users`, `coach_profiles`, `site_settings`, `branch_settings`
5. ✅ Indexes listed above exist (check "Database" → "Indexes")
6. ✅ RLS is enabled on all tables (check "Table Editor" → each table's "Authentication" tab)
7. ✅ All 3 storage buckets are created (check "Storage")
