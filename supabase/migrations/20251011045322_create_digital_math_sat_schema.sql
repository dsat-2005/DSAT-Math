/*
  # Digital Math for SAT - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for the Digital Math for SAT application,
  including students, sessions, progress tracking, and messaging functionality.

  ## New Tables

  ### 1. students
  - `id` (uuid, primary key) - Unique identifier for each student
  - `student_code` (text, unique) - Unique code used for student login (replaces traditional password)
  - `full_name` (text) - Student's full name
  - `grade` (text) - Current grade level
  - `age` (integer) - Student's age
  - `email` (text, nullable) - Optional email address
  - `is_admin` (boolean, default false) - Admin privileges flag
  - `created_at` (timestamp) - Record creation timestamp

  ### 2. sessions
  - `id` (uuid, primary key) - Unique identifier for each session
  - `title` (text) - Session title
  - `date_time` (timestamp) - Scheduled date and time of the session
  - `description` (text) - Detailed description of the session
  - `recorded_url` (text, nullable) - URL to recorded session video
  - `materials_url` (text, nullable) - URL to downloadable materials
  - `is_published` (boolean, default false) - Publication status
  - `created_at` (timestamp) - Record creation timestamp

  ### 3. progress
  - `id` (uuid, primary key) - Unique identifier for each progress record
  - `student_id` (uuid, foreign key) - References students.id
  - `sessions_completed` (integer, default 0) - Number of completed sessions
  - `sessions_remaining` (integer, default 0) - Number of remaining sessions
  - `level` (text) - Current level (e.g., "Beginner", "Intermediate", "Advanced")
  - `exam_scores` (jsonb) - Array of exam score objects with dates and scores
  - `updated_at` (timestamp) - Last update timestamp

  ### 4. messages
  - `id` (uuid, primary key) - Unique identifier for each message
  - `name` (text) - Sender's name
  - `email` (text, nullable) - Optional sender email
  - `message` (text) - Message content
  - `timestamp` (timestamp, default now()) - When message was sent
  - `student_id` (uuid, nullable, foreign key) - Optional reference to student who sent message

  ## Security (Row Level Security)

  ### Students table
  - Students can read their own data using student_code
  - Only admins can modify any student data
  - Admins can read all student data

  ### Sessions table
  - Anyone can read published sessions (is_published = true)
  - Only admins can create, update, or delete sessions

  ### Progress table
  - Students can read their own progress data
  - Only admins can modify progress data

  ### Messages table
  - Anyone can insert messages (contact form)
  - Only admins can read messages

  ## Important Notes
  - All tables use UUID primary keys with automatic generation
  - RLS is enabled on all tables for security
  - Foreign key constraints ensure data integrity
  - Timestamps track record creation and updates
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  grade text NOT NULL,
  age integer NOT NULL,
  email text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date_time timestamptz NOT NULL,
  description text NOT NULL,
  recorded_url text,
  materials_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sessions_completed integer DEFAULT 0,
  sessions_remaining integer DEFAULT 0,
  level text NOT NULL,
  exam_scores jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  student_id uuid REFERENCES students(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_sessions_datetime ON sessions(date_time);
CREATE INDEX IF NOT EXISTS idx_sessions_published ON sessions(is_published);
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (id = (current_setting('app.current_student_id', true))::uuid);

CREATE POLICY "Admins can read all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete students"
  ON students
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

-- RLS Policies for sessions table
CREATE POLICY "Anyone can read published sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can read all sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete sessions"
  ON sessions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

-- RLS Policies for progress table
CREATE POLICY "Students can read own progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (student_id = (current_setting('app.current_student_id', true))::uuid);

CREATE POLICY "Admins can read all progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert progress"
  ON progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update progress"
  ON progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete progress"
  ON progress
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );

-- RLS Policies for messages table
CREATE POLICY "Anyone can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = (current_setting('app.current_student_id', true))::uuid
      AND is_admin = true
    )
  );