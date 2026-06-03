"use client";

import React from 'react';
import { DashboardLayout } from '@/components/shared/dashboard-layout';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Sparkles,
  DollarSign,
  Settings,
  Target,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

const adminNavItems = [
  { label: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Leads', href: '/admin/leads', icon: <Target className="h-5 w-5" /> },
  { label: 'Students', href: '/admin/students', icon: <GraduationCap className="h-5 w-5" /> },
  { label: 'Trainers', href: '/admin/trainers', icon: <UserCheck className="h-5 w-5" /> },
  { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'AI Settings', href: '/admin/ai-settings', icon: <Sparkles className="h-5 w-5" /> },
  { label: 'Finance', href: '/admin/finance', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={adminNavItems} roleLabel="Admin">
      {children}
    </DashboardLayout>
  );
}