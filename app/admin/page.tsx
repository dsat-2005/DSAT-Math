"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, MessageSquare } from 'lucide-react';

export default function AdminPage() {
  const { student, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!student || !student.is_admin)) {
      router.push('/dashboard');
    }
  }, [student, loading, router]);

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

  if (!student.is_admin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Area</h2>
          <p className="text-gray-600 mt-1">Manage students, sessions, and progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/sessions')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Sessions</CardTitle>
                  <CardDescription>Create, edit, and delete sessions</CardDescription>
                </div>
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Go to Sessions</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/students')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Students</CardTitle>
                  <CardDescription>View and edit student information</CardDescription>
                </div>
                <Users className="h-10 w-10 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Go to Students</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/progress')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Progress</CardTitle>
                  <CardDescription>Update student progress data</CardDescription>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Go to Progress</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/messages')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>View Messages</CardTitle>
                  <CardDescription>Read messages from students</CardDescription>
                </div>
                <MessageSquare className="h-10 w-10 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Go to Messages</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
