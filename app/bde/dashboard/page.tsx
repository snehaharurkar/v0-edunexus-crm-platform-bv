"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/mock-data';
import { useLeads } from '@/contexts/leads-context';
import type { LeadWithActivities } from '@/contexts/leads-context';
import { StatusBadge, getSourceBadgeVariant, getAIScoreBadge } from '@/components/shared/badge';
import { cn } from '@/lib/utils';
import { getDaysInactive } from '@/lib/bde-lead-utils';
import { toast } from 'sonner';
import { Phone, Mail, MessageCircle, Calendar } from 'lucide-react';

const pipelineStages = [
  'New Lead',
  'Contacted',
  'Demo Scheduled',
  'Interested',
  'Follow-up',
  'Payment Pending',
  'Converted',
  'Lost',
] as const;

function LeadCard({
  lead,
  onClick,
  onDragStart,
}: {
  lead: LeadWithActivities;
  onClick: () => void;
  onDragStart: () => void;
}) {
  const daysSinceContact = getDaysInactive(lead.lastContact);
  const aiScoreInfo = getAIScoreBadge(lead.aiScore);
  const needsFollowUp =
    daysSinceContact >= 3 && lead.status !== 'Converted' && lead.status !== 'Lost';
  const needsPaymentReminder = lead.status === 'Payment Pending';

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', lead.id);
        onDragStart();
      }}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-primary/30"
    >
      <div className="mb-2">
        <h4 className="font-medium text-card-foreground truncate">{lead.name}</h4>
        <p className="text-sm text-muted-foreground">{lead.phone}</p>
      </div>

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <StatusBadge variant={getSourceBadgeVariant(lead.source)}>
          {lead.source}
        </StatusBadge>
        <StatusBadge variant={aiScoreInfo.variant}>
          {lead.aiScore}% {aiScoreInfo.label}
        </StatusBadge>
      </div>

      <p className="text-xs text-muted-foreground mb-2">
        {daysSinceContact === 0
          ? 'Today'
          : daysSinceContact === 1
          ? 'Yesterday'
          : `${daysSinceContact} days ago`}
      </p>

      {(needsFollowUp || needsPaymentReminder) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {needsFollowUp && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
              Follow-up Due
            </span>
          )}
          {needsPaymentReminder && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-medium">
              Payment Reminder
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
          title="Call"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
          title="Email"
        >
          <Mail className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-purple-100 text-purple-600 transition-colors"
          title="Schedule"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function BDEPipeline() {
  const { leads, updateLead } = useLeads();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const router = useRouter();

  const getLeadsByStatus = (status: Lead['status']) =>
    leads.filter((lead) => lead.status === status);

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'New Lead': 'bg-blue-500',
      Contacted: 'bg-indigo-500',
      'Demo Scheduled': 'bg-purple-500',
      Interested: 'bg-emerald-500',
      'Follow-up': 'bg-amber-500',
      'Payment Pending': 'bg-orange-500',
      Converted: 'bg-green-500',
      Lost: 'bg-gray-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  const handleDrop = (stage: Lead['status']) => {
    if (!draggingId) return;
    const lead = leads.find((l) => l.id === draggingId);
    if (!lead || lead.status === stage) {
      setDraggingId(null);
      return;
    }
    updateLead(draggingId, { status: stage });
    toast.success(`Lead moved to ${stage}`);
    setDraggingId(null);
  };

  if (leads.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Manage your leads through the sales pipeline
          </p>
        </div>
        <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border text-muted-foreground">
          No leads found. Add your first lead!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lead Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Manage your leads through the sales pipeline
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => {
          const stageLeads = getLeadsByStatus(stage);
          return (
            <div
              key={stage}
              className="flex-shrink-0 w-72"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-3 h-3 rounded-full', getStageColor(stage))} />
                <h3 className="font-semibold text-foreground">{stage}</h3>
                <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              <div
                className={cn(
                  'bg-muted/30 rounded-lg p-2 min-h-[calc(100vh-280px)] space-y-3 transition-colors',
                  draggingId && 'ring-2 ring-primary/20'
                )}
              >
                {stageLeads.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    No leads
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onDragStart={() => setDraggingId(lead.id)}
                      onClick={() => router.push(`/bde/lead/${lead.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
