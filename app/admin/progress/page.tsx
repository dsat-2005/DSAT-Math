"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Progress, Student } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ProgressWithStudent extends Progress {
  student_name?: string;
}

export default function AdminProgressPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<ProgressWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    sessions_completed: '',
    sessions_remaining: '',
    level: '',
    exam_scores: '',
  });

  useEffect(() => {
    if (!loading && (!student || !student.is_admin)) {
      router.push('/dashboard');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student?.is_admin) {
      fetchProgress();
      fetchStudents();
    }
  }, [student]);

  const fetchProgress = async () => {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .order('updated_at', { ascending: false });

      if (progressError) throw progressError;

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name');

      if (studentsError) throw studentsError;

      const studentsMap = new Map(studentsData.map(s => [s.id, s.full_name]));

      const enrichedProgress = (progressData || []).map(p => ({
        ...p,
        student_name: studentsMap.get(p.student_id) || 'Unknown',
      }));

      setProgressData(enrichedProgress);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.level) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    const sessions_completed = parseInt(formData.sessions_completed) || 0;
    const sessions_remaining = parseInt(formData.sessions_remaining) || 0;

    let examScores = [];
    if (formData.exam_scores.trim()) {
      try {
        examScores = JSON.parse(formData.exam_scores);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid JSON format for exam scores',
        });
        return;
      }
    }

    try {
      const progressPayload = {
        student_id: formData.student_id,
        sessions_completed,
        sessions_remaining,
        level: formData.level,
        exam_scores: examScores,
      };

      if (editingProgress) {
        const { error } = await supabase
          .from('progress')
          .update(progressPayload)
          .eq('id', editingProgress.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Progress updated successfully' });
      } else {
        const { error } = await supabase.from('progress').insert(progressPayload);

        if (error) throw error;
        toast({ title: 'Success', description: 'Progress created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchProgress();
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save progress',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this progress record?')) return;

    try {
      const { error } = await supabase.from('progress').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Progress deleted successfully' });
      fetchProgress();
    } catch (error) {
      console.error('Error deleting progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete progress',
      });
    }
  };

  const openDialog = (progress?: Progress) => {
    if (progress) {
      setEditingProgress(progress);
      setFormData({
        student_id: progress.student_id,
        sessions_completed: progress.sessions_completed.toString(),
        sessions_remaining: progress.sessions_remaining.toString(),
        level: progress.level,
        exam_scores: JSON.stringify(progress.exam_scores, null, 2),
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProgress(null);
    setFormData({
      student_id: '',
      sessions_completed: '0',
      sessions_remaining: '0',
      level: '',
      exam_scores: '[]',
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
            <h2 className="text-3xl font-bold text-gray-900">Manage Progress</h2>
            <p className="text-gray-600 mt-1">Update student progress data</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProgress ? 'Edit Progress' : 'Add New Progress'}</DialogTitle>
                <DialogDescription>Fill in the progress details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student *</label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                    disabled={!!editingProgress}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name} ({s.student_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sessions Completed</label>
                    <Input
                      type="number"
                      value={formData.sessions_completed}
                      onChange={(e) => setFormData({ ...formData, sessions_completed: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sessions Remaining</label>
                    <Input
                      type="number"
                      value={formData.sessions_remaining}
                      onChange={(e) => setFormData({ ...formData, sessions_remaining: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level *</label>
                  <Input
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g., Beginner, Intermediate, Advanced"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Exam Scores (JSON format)
                  </label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 border rounded-md font-mono text-sm"
                    value={formData.exam_scores}
                    onChange={(e) => setFormData({ ...formData, exam_scores: e.target.value })}
                    placeholder='[{"date": "2024-01-15", "score": 85}]'
                  />
                  <p className="text-xs text-gray-500">
                    Example: {`[{"date": "2024-01-15", "score": 85}, {"date": "2024-02-20", "score": 90}]`}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingProgress ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Progress Records</CardTitle>
            <CardDescription>Manage student progress in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProgress ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : progressData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No progress records found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Exams</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressData.map((progress) => (
                      <TableRow key={progress.id}>
                        <TableCell className="font-medium">{progress.student_name}</TableCell>
                        <TableCell>{progress.sessions_completed}</TableCell>
                        <TableCell>{progress.sessions_remaining}</TableCell>
                        <TableCell>{progress.level}</TableCell>
                        <TableCell>
                          {Array.isArray(progress.exam_scores) ? progress.exam_scores.length : 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDialog(progress)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(progress.id)}
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
