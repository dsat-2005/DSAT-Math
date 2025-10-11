"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Session } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSessionsPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date_time: '',
    description: '',
    recorded_url: '',
    materials_url: '',
    is_published: false,
  });

  useEffect(() => {
    if (!loading && (!student || !student.is_admin)) {
      router.push('/dashboard');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student?.is_admin) {
      fetchSessions();
    }
  }, [student]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date_time', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date_time || !formData.description) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(formData)
          .eq('id', editingSession.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Session updated successfully' });
      } else {
        const { error } = await supabase.from('sessions').insert(formData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Session created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save session',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const { error } = await supabase.from('sessions').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Session deleted successfully' });
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete session',
      });
    }
  };

  const openDialog = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        title: session.title,
        date_time: new Date(session.date_time).toISOString().slice(0, 16),
        description: session.description,
        recorded_url: session.recorded_url || '',
        materials_url: session.materials_url || '',
        is_published: session.is_published,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      date_time: '',
      description: '',
      recorded_url: '',
      materials_url: '',
      is_published: false,
    });
  };

  if (loading || !student?.is_admin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Sessions</h2>
            <p className="text-gray-600 mt-1">Create, edit, and delete sessions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSession ? 'Edit Session' : 'Add New Session'}</DialogTitle>
                <DialogDescription>
                  Fill in the session details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Session title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.date_time}
                    onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Session description"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recorded URL</label>
                  <Input
                    value={formData.recorded_url}
                    onChange={(e) => setFormData({ ...formData, recorded_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Materials URL</label>
                  <Input
                    value={formData.materials_url}
                    onChange={(e) => setFormData({ ...formData, materials_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <label className="text-sm font-medium">Published</label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSession ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>Manage all sessions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No sessions found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.title}</TableCell>
                        <TableCell>
                          {format(new Date(session.date_time), 'MMM dd, yyyy - hh:mm a')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              session.is_published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.is_published ? 'Yes' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openDialog(session)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(session.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
