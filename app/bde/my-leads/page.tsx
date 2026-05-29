"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/mock-data';
import { useLeads, CURRENT_BDE } from '@/contexts/leads-context';
import type { LeadWithActivities } from '@/contexts/leads-context';
import { DataTable } from '@/components/shared/data-table';
import { EmailComposeModal } from '@/components/bde/email-compose-modal';
import {
  StatusBadge,
  getSourceBadgeVariant,
  getStatusBadgeVariant,
  getAIScoreBadge,
} from '@/components/shared/badge';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatPhoneForTel,
} from '@/lib/bde-lead-utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Phone, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function MyLeadsPage() {
  const { leads, addActivity } = useLeads();
  const router = useRouter();
  const [emailLead, setEmailLead] = useState<LeadWithActivities | null>(null);

  const myLeads = useMemo(
    () => leads.filter((l) => l.assignedBde === CURRENT_BDE),
    [leads]
  );

  const handleCall = (lead: LeadWithActivities) => {
    addActivity(lead.id, {
      type: 'call',
      text: 'Outgoing call initiated',
      by: CURRENT_BDE,
    });
    window.location.href = formatPhoneForTel(lead.phone);
  };

  const handleWhatsApp = (lead: LeadWithActivities) => {
    addActivity(lead.id, {
      type: 'whatsapp',
      text: 'WhatsApp message initiated',
      by: CURRENT_BDE,
    });
    window.open(buildWhatsAppUrl(lead.phone, buildWhatsAppMessage(lead)), '_blank');
  };

  const handleEmailSent = (subject: string) => {
    if (!emailLead) return;
    addActivity(emailLead.id, {
      type: 'email',
      text: 'Email sent: ' + subject,
      by: CURRENT_BDE,
    });
  };

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
          <StatusBadge variant={scoreInfo.variant}>{lead.aiScore}%</StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lead: LeadWithActivities) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/bde/lead/${lead.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-emerald-600"
            onClick={() => handleCall(lead)}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600"
            onClick={() => setEmailLead(lead)}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600"
            onClick={() => handleWhatsApp(lead)}
          >
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

      {myLeads.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border text-muted-foreground">
          No leads found. Add your first lead!
        </div>
      ) : (
        <DataTable
          data={myLeads}
          columns={columns}
          searchPlaceholder="Search leads..."
          loading={false}
          selectable
        />
      )}

      <EmailComposeModal
        open={!!emailLead}
        onClose={() => setEmailLead(null)}
        lead={emailLead}
        onSent={handleEmailSent}
      />
    </div>
  );
}
