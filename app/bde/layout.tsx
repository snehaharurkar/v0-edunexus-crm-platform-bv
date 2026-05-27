"use client";

import React from 'react';
import { DashboardLayout } from '@/components/shared/dashboard-layout';
import {
  Columns3,
  UserPlus,
  Users,
  BarChart3,
  Clock,
} from 'lucide-react';

const bdeNavItems = [
  { label: 'Pipeline', href: '/bde/dashboard', icon: <Columns3 className="h-5 w-5" /> },
  { label: 'Add Lead', href: '/bde/add-lead', icon: <UserPlus className="h-5 w-5" /> },
  { label: 'My Leads', href: '/bde/my-leads', icon: <Users className="h-5 w-5" /> },
  { label: 'Reports', href: '/bde/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Follow-ups', href: '/bde/follow-ups', icon: <Clock className="h-5 w-5" /> },
];

export default function BDELayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={bdeNavItems} roleLabel="BDE">
      {children}
    </DashboardLayout>
  );
}
