"use client";

import React from 'react';
import { DashboardLayout } from '@/components/shared/dashboard-layout';
import { LeadsProvider, useLeads } from '@/contexts/leads-context';
import {
  Columns3,
  UserPlus,
  Users,
  BarChart3,
  Clock,
  Share2,
} from 'lucide-react';


function BDELayoutContent({ children }: { children: React.ReactNode }) {
  const { followUpCount, newLeadCount, leads } = useLeads();

  const bdeNavItems = [
    {
      label: 'Pipeline',
      href: '/bde/dashboard',
      icon: <Columns3 className="h-5 w-5" />,
      badge: newLeadCount,
    },
    { label: 'Add Lead', href: '/bde/add-lead', icon: <UserPlus className="h-5 w-5" /> },
    {
      label: 'My Leads',
      href: '/bde/my-leads',
      icon: <Users className="h-5 w-5" />,
      badge: leads.filter((l) => l.assignedBde === 'Rahul Sharma').length,
    },
    { label: 'Reports', href: '/bde/reports', icon: <BarChart3 className="h-5 w-5" /> },
    {
      label: 'Follow-ups',
      href: '/bde/follow-ups',
      icon: <Clock className="h-5 w-5" />,
      badge: followUpCount,
    },
    {
      label: 'Social Media',
      href: '/bde/social-media',
      icon: <Share2 className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout navItems={bdeNavItems} roleLabel="BDE">
      {children}
    </DashboardLayout>
  );
}

export default function BDELayout({ children }: { children: React.ReactNode }) {
  return (
    <LeadsProvider>
      <BDELayoutContent>{children}</BDELayoutContent>
    </LeadsProvider>
  );
}
