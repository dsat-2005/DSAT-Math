"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Student } from '@/lib/supabase';

interface AuthContextType {
  student: Student | null;
  login: (studentCode: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
    setLoading(false);
  }, []);

  const login = async (studentCode: string): Promise<boolean> => {
    try {
      console.log('Attempting login with student code:', studentCode);

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_code', studentCode)
        .maybeSingle();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        return false;
      }

      if (!data) {
        console.log('No student found with code:', studentCode);
        return false;
      }

      console.log('Login successful for student:', data.full_name);
      setStudent(data);
      localStorage.setItem('student', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('student');
  };

  return (
    <AuthContext.Provider value={{ student, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
