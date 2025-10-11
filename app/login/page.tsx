"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [studentCode, setStudentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, student } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      router.push('/dashboard');
    }
  }, [student, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = studentCode.trim();

    if (!trimmedCode) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your student code',
      });
      return;
    }

    console.log('Login form submitted with code:', trimmedCode);
    setIsLoading(true);

    const success = await login(trimmedCode);

    if (success) {
      toast({
        title: 'Success',
        description: 'Login successful!',
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The student code you entered is not valid. Please try again.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Digital Math for SAT"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Digital Math for SAT
          </CardTitle>
          <CardDescription className="text-base">
            Enter your student code to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="studentCode" className="text-sm font-medium text-gray-700">
                Student Code
              </label>
              <Input
                id="studentCode"
                type="text"
                placeholder="Enter your student code"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                disabled={isLoading}
                className="h-12 text-lg"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
