"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Session } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, FileText, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
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
      fetchUpcomingSessions();
    }
  }, [student]);

  const fetchUpcomingSessions = async () => {
    if (!student) return;
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_published', true)
        .gte('date_time', now)
        .eq('user_id', student.id) // <-- هنا
        .order('date_time', { ascending: true });
  
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const openUrl = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
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
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {student.full_name}!</h2>
          <p className="text-gray-600 mt-1">Here are your upcoming sessions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>
              Sessions scheduled for the future that are available to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming sessions available at this time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.title}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(session.date_time), 'MMM dd, yyyy - hh:mm a')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            {session.recorded_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openUrl(session.recorded_url)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open Session
                              </Button>
                            )}
                            {session.materials_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openUrl(session.materials_url)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Materials
                              </Button>
                            )}
                            {student.is_admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/admin/sessions/${session.id}`)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
