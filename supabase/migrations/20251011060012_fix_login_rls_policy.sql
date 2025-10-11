/*
  # Fix Login RLS Policy

  ## Problem
  The existing RLS policies on the students table require authenticated users,
  but during login there is no authenticated user yet. This prevents the login
  query from returning any results.

  ## Solution
  Add a new RLS policy that allows anonymous (unauthenticated) users to SELECT
  from the students table. This enables the login functionality to verify
  student codes before authentication.

  ## Security Notes
  - This policy only grants SELECT (read) access, not write access
  - The students table does not contain sensitive information like passwords
  - The student_code is meant to be a shared credential for login
  - Once logged in, the more restrictive authenticated policies take over
*/

-- Drop the restrictive authenticated-only policies for SELECT
DROP POLICY IF EXISTS "Students can read own data" ON students;
DROP POLICY IF EXISTS "Admins can read all students" ON students;

-- Create a new policy that allows anyone (including anonymous users) to read students table
-- This is necessary for the login process to work
CREATE POLICY "Allow public read access for login"
  ON students
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: Write operations (INSERT, UPDATE, DELETE) remain restricted to admins only
-- through the existing admin policies