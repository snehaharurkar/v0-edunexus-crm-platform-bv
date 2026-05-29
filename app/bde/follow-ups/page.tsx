"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/mock-data';
import { useLeads } from '@/contexts/leads-context';
import type { LeadWithActivities } from '@/contexts/leads-context';
import { DataTable } from '@/components/shared/data-table';
import { EmailComposeModal } from '@/components/bde/email-compose-modal';
import { StatusBadge, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/components/shared/badge';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatPhoneForTel,
  getDaysInactive,
  needsFollowUp,
} from '@/lib/bde-lead-utils';
import { CURRENT_BDE } from '@/contexts/leads-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Phone, Mail, MessageCircle, Check, Loader2 } from 'lucide-react';

export default function FollowUpsPage() {
  const { leads, addActivity, markAsContacted } = useLeads();
  const router = useRouter();
  const [emailLead, setEmailLead] = useState<LeadWithActivities | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const followUpLeads = useMemo(() => {
    return leads
      .filter(needsFollowUp)
      .map((lead) => ({ ...lead, daysInactive: getDaysInactive(lead.lastContact) }))
      .sort((a, b) => b.daysInactive - a.daysInactive);
  }, [leads]);

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
    const url = buildWhatsAppUrl(lead.phone, buildWhatsAppMessage(lead));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSent = (subject: string) => {
    if (!emailLead) return;
    addActivity(emailLead.id, {
      type: 'email',
      text: 'Email sent: ' + subject,
      by: CURRENT_BDE,
    });
  };

  const handleMarkContacted = async (lead: LeadWithActivities) => {
    setMarkingId(lead.id);
    await new Promise((r) => setTimeout(r, 400));
    markAsContacted(lead.id);
    addActivity(lead.id, {
      type: 'note',
      text: 'Marked as contacted from follow-ups',
      by: CURRENT_BDE,
    });
    toast.success(`${lead.name} marked as contacted!`);
    setMarkingId(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Lead',
      render: (lead: Lead & { daysInactive: number }) => (
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
      render: (lead: Lead & { daysInactive: number }) => (
        <span
          className={`font-medium ${
            lead.daysInactive >= 7
              ? 'text-destructive'
              : lead.daysInactive >= 5
              ? 'text-amber-600'
              : 'text-muted-foreground'
          }`}
        >
          {lead.daysInactive} days
        </span>
      ),
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
      render: (lead: LeadWithActivities & { daysInactive: number }) => (
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="View lead"
            onClick={() => router.push(`/bde/lead/${lead.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-emerald-600"
            title="Call"
            onClick={() => handleCall(lead)}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600"
            title="Email"
            onClick={() => setEmailLead(lead)}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600"
            title="WhatsApp"
            onClick={() => handleWhatsApp(lead)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={markingId === lead.id}
            onClick={() => handleMarkContacted(lead)}
          >
            {markingId === lead.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Mark Contacted
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
          <p className="text-muted-foreground mt-1">
            Leads requiring immediate attention (3+ days since last contact)
          </p>
        </div>
        {followUpLeads.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {followUpLeads.length} pending
          </span>
        )}
      </div>

      {followUpLeads.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{followUpLeads.length} leads</span> need your
            attention. Follow up with them to maintain engagement.
          </p>
        </div>
      )}

      {followUpLeads.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border text-muted-foreground text-center px-4">
          No follow-ups needed right now! 🎉
        </div>
      ) : (
        <DataTable
          data={followUpLeads}
          columns={columns}
          searchPlaceholder="Search leads..."
          loading={false}
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
