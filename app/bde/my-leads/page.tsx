"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, getSourceBadgeVariant, getStatusBadgeVariant, getAIScoreBadge } from '@/components/shared/badge';
import { mockLeads, type Lead } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Eye, Phone, Mail, MessageCircle } from 'lucide-react';

export default function MyLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter leads assigned to current BDE (mock: Rahul Sharma)
      setLeads(mockLeads.filter(l => l.assignedBde === 'Rahul Sharma'));
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Lead',
      render: (lead: Lead) => (
        <div>
          <p className="font-medium">{lead.name}</p>
          <p className="text-sm text-muted-foreground">{lead.phone}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'source',
      label: 'Source',
      render: (lead: Lead) => (
        <StatusBadge variant={getSourceBadgeVariant(lead.source)}>
          {lead.source}
        </StatusBadge>
      ),
    },
    { key: 'courseInterest', label: 'Course Interest' },
    {
      key: 'status',
      label: 'Status',
      render: (lead: Lead) => (
        <StatusBadge variant={getStatusBadgeVariant(lead.status)}>
          {lead.status}
        </StatusBadge>
      ),
    },
    {
      key: 'aiScore',
      label: 'AI Score',
      render: (lead: Lead) => {
        const scoreInfo = getAIScoreBadge(lead.aiScore);
        return (
          <StatusBadge variant={scoreInfo.variant}>
            {lead.aiScore}%
          </StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lead: Lead) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/bde/lead/${lead.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Leads</h1>
        <p className="text-muted-foreground mt-1">All leads assigned to you</p>
      </div>

      <DataTable
        data={leads}
        columns={columns}
        searchPlaceholder="Search leads..."
        loading={loading}
        selectable
      />
    </div>
  );
}
