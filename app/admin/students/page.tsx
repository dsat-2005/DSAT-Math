"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase, Student } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminStudentsPage() {
  const { student, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_code: '',
    full_name: '',
    grade: '',
    age: '',
    email: '',
    is_admin: false,
  });

  useEffect(() => {
    if (!loading && (!student || !student.is_admin)) {
      router.push('/dashboard');
    }
  }, [student, loading, router]);

  useEffect(() => {
    if (student?.is_admin) {
      fetchStudents();
    }
  }, [student]);

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
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_code || !formData.full_name || !formData.grade || !formData.age) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 100) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid age',
      });
      return;
    }

    try {
      const studentData = {
        student_code: formData.student_code,
        full_name: formData.full_name,
        grade: formData.grade,
        age,
        email: formData.email || null,
        is_admin: formData.is_admin,
      };

      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Student updated successfully' });
      } else {
        const { error } = await supabase.from('students').insert(studentData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Student created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save student',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This will also delete their progress data.')) return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Student deleted successfully' });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete student',
      });
    }
  };

  const openDialog = (studentData?: Student) => {
    if (studentData) {
      setEditingStudent(studentData);
      setFormData({
        student_code: studentData.student_code,
        full_name: studentData.full_name,
        grade: studentData.grade,
        age: studentData.age.toString(),
        email: studentData.email || '',
        is_admin: studentData.is_admin,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      student_code: '',
      full_name: '',
      grade: '',
      age: '',
      email: '',
      is_admin: false,
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
            <h2 className="text-3xl font-bold text-gray-900">Manage Students</h2>
            <p className="text-gray-600 mt-1">View and edit student information</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                <DialogDescription>Fill in the student details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student Code *</label>
                  <Input
                    value={formData.student_code}
                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                    placeholder="e.g., STU001"
                    disabled={!!editingStudent}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Student's full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade *</label>
                    <Input
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="e.g., 11th"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age *</label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g., 16"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (optional)</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_admin}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                  />
                  <label className="text-sm font-medium">Admin Privileges</label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingStudent ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>Manage all students in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No students found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((studentData) => (
                      <TableRow key={studentData.id}>
                        <TableCell className="font-mono">{studentData.student_code}</TableCell>
                        <TableCell className="font-medium">{studentData.full_name}</TableCell>
                        <TableCell>{studentData.grade}</TableCell>
                        <TableCell>{studentData.age}</TableCell>
                        <TableCell>
                          {studentData.is_admin && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              Yes
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDialog(studentData)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(studentData.id)}
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
