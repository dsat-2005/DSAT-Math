import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  grade: string;
  age: number;
  email?: string;
  is_admin: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  date_time: string;
  description: string;
  recorded_url?: string;
  materials_url?: string;
  is_published: boolean;
  created_at: string;
}

export interface Progress {
  id: string;
  student_id: string;
  sessions_completed: number;
  sessions_remaining: number;
  level: string;
  exam_scores: Array<{ date: string; score: number }>;
  updated_at: string;
}

export interface Message {
  id: string;
  name: string;
  email?: string;
  message: string;
  timestamp: string;
  student_id?: string;
}
