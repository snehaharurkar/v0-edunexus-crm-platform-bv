"use client";

import React from 'react';
import { DashboardLayout } from '@/components/shared/dashboard-layout';
import {
  Calendar,
  ClipboardCheck,
  Users,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

const trainerNavItems = [
  { label: 'Classes', href: '/trainer/dashboard', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Attendance', href: '/trainer/attendance', icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: 'Students', href: '/trainer/students', icon: <Users className="h-5 w-5" /> },
  { label: 'Content', href: '/trainer/content', icon: <FolderOpen className="h-5 w-5" /> },
  { label: 'AI Tools', href: '/trainer/ai-tools', icon: <Sparkles className="h-5 w-5" /> },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={trainerNavItems} roleLabel="Trainer">
      {children}
    </DashboardLayout>
  );
}
