"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export default function ContactPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !student) {
      router.push('/login');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        name: student.full_name,
        email: student.email || '',
      }));
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('messages').insert({
        name: formData.name,
        email: formData.email || null,
        message: formData.message,
        student_id: student?.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your message has been sent successfully!',
      });

      setFormData(prev => ({
        ...prev,
        message: '',
      }));
    } catch (error) {
      console.error('Error submitting message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-gray-600 mt-1">
            Have a question or feedback? Send us a message!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>
              We will get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email (optional)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={6}
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
