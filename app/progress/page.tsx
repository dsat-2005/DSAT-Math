"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Progress } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Calendar } from 'lucide-react';

export default function ProgressPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    if (!loading && !student) {
      router.push('/login');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student) {
      fetchProgress();
    }
  }, [student]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('student_id', student!.id)
        .maybeSingle();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const calculateAverageScore = () => {
    if (!progress || !progress.exam_scores || progress.exam_scores.length === 0) {
      return 0;
    }
    const scores = progress.exam_scores as Array<{ date: string; score: number }>;
    const sum = scores.reduce((acc, exam) => acc + exam.score, 0);
    return Math.round(sum / scores.length);
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loadingProgress) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!progress) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              No progress data available yet.
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const examScores = (progress.exam_scores || []) as Array<{ date: string; score: number }>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Progress</h2>
          <p className="text-gray-600 mt-1">Track your learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress.sessions_completed}</div>
              <p className="text-xs text-gray-500 mt-1">
                {progress.sessions_remaining} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress.level}</div>
              <p className="text-xs text-gray-500 mt-1">Keep up the great work!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{calculateAverageScore()}</div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {examScores.length} exam{examScores.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {examScores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exam Scores Over Time</CardTitle>
              <CardDescription>Your performance trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={examScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 800]} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${value}`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {examScores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Individual Exam Scores</CardTitle>
              <CardDescription>Detailed breakdown of your exam performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={examScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 800]} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${value}`, 'Score']}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
