"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Message } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Mail } from 'lucide-react';

interface MessageWithStudent extends Message {
  student_name?: string;
}

export default function AdminMessagesPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageWithStudent[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (!loading && (!student || !student.is_admin)) {
      router.push('/dashboard');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student?.is_admin) {
      fetchMessages();
    }
  }, [student]);

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (messagesError) throw messagesError;

      const studentIds = messagesData
        .map(m => m.student_id)
        .filter((id): id is string => id !== null);

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      const studentsMap = new Map(studentsData.map(s => [s.id, s.full_name]));

      const enrichedMessages = (messagesData || []).map(m => ({
        ...m,
        student_name: m.student_id ? studentsMap.get(m.student_id) : undefined,
      }));

      setMessages(enrichedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (loading || !student?.is_admin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600 mt-1">View messages from students</p>
        </div>

        {loadingMessages ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">No messages yet</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {message.student_name || message.name}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(message.timestamp), 'MMM dd, yyyy - hh:mm a')}
                          {message.email && ` • ${message.email}`}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
