"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockLeads, type Lead } from '@/lib/mock-data';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/components/shared/badge';
import { Button } from '@/components/ui/button';
import { Eye, Phone, Mail, MessageCircle } from 'lucide-react';

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function FollowUpsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter leads that need follow-up (3+ days inactive, not converted/lost)
      const followUpLeads = mockLeads.filter(lead => {
        const daysSince = getDaysSince(lead.lastContact);
        return daysSince >= 3 && lead.status !== 'Converted' && lead.status !== 'Lost';
      });
      setLeads(followUpLeads);
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
    {
      key: 'lastContact',
      label: 'Last Contact',
      render: (lead: Lead) => (
        <span>{new Date(lead.lastContact).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'daysInactive',
      label: 'Days Inactive',
      render: (lead: Lead) => {
        const days = getDaysSince(lead.lastContact);
        return (
          <span className={`font-medium ${days >= 7 ? 'text-destructive' : days >= 5 ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {days} days
          </span>
        );
      },
    },
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
      key: 'priority',
      label: 'Priority',
      render: (lead: Lead) => (
        <StatusBadge variant={getPriorityBadgeVariant(lead.priority)}>
          {lead.priority}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Quick Actions',
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
        <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
        <p className="text-muted-foreground mt-1">Leads requiring immediate attention (3+ days since last contact)</p>
      </div>

      {/* Alert banner */}
      {leads.length > 0 && !loading && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{leads.length} leads</span> need your attention. Follow up with them to maintain engagement.
          </p>
        </div>
      )}

      <DataTable
        data={leads}
        columns={columns}
        searchPlaceholder="Search leads..."
        loading={loading}
      />
    </div>
  );
}
