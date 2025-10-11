"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Home, Video, FileText, TrendingUp, MessageSquare, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const { student, logout } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Video, label: 'Recorded Sessions', path: '/recorded-sessions' },
    { icon: FileText, label: 'Sessions Materials', path: '/materials' },
    { icon: TrendingUp, label: 'Student Progress', path: '/progress' },
    { icon: MessageSquare, label: 'Contact Us', path: '/contact' },
  ];

  if (student?.is_admin) {
    menuItems.push({ icon: Settings, label: 'Admin Area', path: '/admin' });
  }

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-blue-600">
            Menu
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-lg h-12"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-lg h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
