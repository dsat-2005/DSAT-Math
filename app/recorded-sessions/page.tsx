"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Session } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function RecordedSessionsPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && !student) {
      router.push('/login');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student) {
      fetchRecordedSessions();
    }
  }, [student]);

  const fetchRecordedSessions = async () => {
    if (!student) return;
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_published', true)
        .not('recorded_url', 'is', null)
        .eq('user_id', student.id)  // <-- هنا فلترة حسب المستخدم
        .order('date_time', { ascending: false });
  
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching recorded sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recorded Sessions</h2>
          <p className="text-gray-600 mt-1">Watch previous session recordings</p>
        </div>

        {loadingSessions ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                No recorded sessions available at this time.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>
                    {format(new Date(session.date_time), 'MMM dd, yyyy - hh:mm a')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {session.description}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => window.open(session.recorded_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
