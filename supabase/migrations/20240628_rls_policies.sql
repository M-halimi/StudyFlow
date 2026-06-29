-- ============================================================================
-- RLS Policies for StudyFlow
-- Run this in the Supabase SQL Editor after pushing the Prisma schema.
--
-- IMPORTANT: Prisma bypasses RLS (it connects as the database user).
-- These policies protect against direct SQL / Supabase API / dashboard access.
-- Application-level auth (Auth.js) handles authorization in the app layer.
-- ============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- 2. Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid()::text);

-- 3. Subjects table policies
CREATE POLICY "Users can view own subjects"
  ON subjects FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own subjects"
  ON subjects FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subjects"
  ON subjects FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own subjects"
  ON subjects FOR DELETE
  USING (user_id = auth.uid()::text);

-- 4. Categories table policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (subject_id IN (SELECT id FROM subjects WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can create categories in own subjects"
  ON categories FOR INSERT
  WITH CHECK (subject_id IN (SELECT id FROM subjects WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (subject_id IN (SELECT id FROM subjects WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (subject_id IN (SELECT id FROM subjects WHERE user_id = auth.uid()::text));

-- 5. Topics table policies
CREATE POLICY "Users can view own topics"
  ON topics FOR SELECT
  USING (category_id IN (
    SELECT c.id FROM categories c JOIN subjects s ON c.subject_id = s.id WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create topics in own categories"
  ON topics FOR INSERT
  WITH CHECK (category_id IN (
    SELECT c.id FROM categories c JOIN subjects s ON c.subject_id = s.id WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  USING (category_id IN (
    SELECT c.id FROM categories c JOIN subjects s ON c.subject_id = s.id WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own topics"
  ON topics FOR DELETE
  USING (category_id IN (
    SELECT c.id FROM categories c JOIN subjects s ON c.subject_id = s.id WHERE s.user_id = auth.uid()::text
  ));

-- 6. Tasks table policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (user_id = auth.uid()::text);

-- 7. Study Sessions table policies
CREATE POLICY "Users can view own sessions"
  ON study_sessions FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own sessions"
  ON study_sessions FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own sessions"
  ON study_sessions FOR DELETE
  USING (user_id = auth.uid()::text);

-- 8. Resources table policies
CREATE POLICY "Users can view own resources"
  ON resources FOR SELECT
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create resources in own topics"
  ON resources FOR INSERT
  WITH CHECK (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own resources"
  ON resources FOR DELETE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

-- 9. Attachments table policies
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create attachments in own topics"
  ON attachments FOR INSERT
  WITH CHECK (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

-- 10. Notes table policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create notes in own topics"
  ON notes FOR INSERT
  WITH CHECK (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

-- 11. Revisions table policies
CREATE POLICY "Users can view own revisions"
  ON revisions FOR SELECT
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create revisions in own topics"
  ON revisions FOR INSERT
  WITH CHECK (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update own revisions"
  ON revisions FOR UPDATE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete own revisions"
  ON revisions FOR DELETE
  USING (topic_id IN (
    SELECT t.id FROM topics t
    JOIN categories c ON t.category_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.user_id = auth.uid()::text
  ));

-- 12. Goals table policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (user_id = auth.uid()::text);

-- 13. User Achievements table policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (user_id = auth.uid()::text);

-- 14. Templates table policies
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own templates"
  ON templates FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (user_id = auth.uid()::text);

-- 15. Template Tasks table policies
CREATE POLICY "Users can view own template tasks"
  ON template_tasks FOR SELECT
  USING (template_id IN (SELECT id FROM templates WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can create template tasks in own templates"
  ON template_tasks FOR INSERT
  WITH CHECK (template_id IN (SELECT id FROM templates WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update own template tasks"
  ON template_tasks FOR UPDATE
  USING (template_id IN (SELECT id FROM templates WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete own template tasks"
  ON template_tasks FOR DELETE
  USING (template_id IN (SELECT id FROM templates WHERE user_id = auth.uid()::text));

-- 16. Journals table policies
CREATE POLICY "Users can view own journals"
  ON journals FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own journals"
  ON journals FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own journals"
  ON journals FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own journals"
  ON journals FOR DELETE
  USING (user_id = auth.uid()::text);

-- 17. Accounts / Sessions / Verification tokens (manage by Auth.js)
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (user_id = auth.uid()::text);

-- 18. User Settings table policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- ============================================================================
-- Storage bucket RLS policies
-- Run after creating the "attachments" bucket via the Dashboard or
-- after the app's server action calls ensureBucketExists().
-- ============================================================================

CREATE POLICY "Give users access to own folder in attachments bucket"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Give users access to upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Give users access to delete from own folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- NOTE: The storage helper (supabase-storage.ts) uses the ADMIN (service role)
-- client for operations, so RLS on storage.objects is bypassed.
-- These policies protect against direct anon-key access via the Supabase client.
-- ============================================================================
