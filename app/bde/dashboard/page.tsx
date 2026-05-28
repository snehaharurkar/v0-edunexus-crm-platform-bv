"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadsStore } from '@/store/leads-store';
import { type Lead } from '@/lib/mock-data';
import { StatusBadge, getSourceBadgeVariant, getAIScoreBadge } from '@/components/shared/badge';
import { cn } from '@/lib/utils';
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

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function LeadCard({ 
  lead, 
  onClick, 
  onDragStart 
}: { 
  lead: Lead; 
  onClick: () => void; 
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
}) {
  const daysSinceContact = getDaysSince(lead.lastContact);
  const aiScoreInfo = getAIScoreBadge(lead.aiScore);
  const needsFollowUp = daysSinceContact >= 3 && lead.status !== 'Converted' && lead.status !== 'Lost';
  const needsPaymentReminder = lead.status === 'Payment Pending';

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-primary/30"
    >
      {/* Name and Phone */}
      <div className="mb-2">
        <h4 className="font-medium text-card-foreground truncate">{lead.name}</h4>
        <p className="text-sm text-muted-foreground">{lead.phone}</p>
      </div>

      {/* Source and AI Score badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <StatusBadge variant={getSourceBadgeVariant(lead.source)}>
          {lead.source}
        </StatusBadge>
        <StatusBadge variant={aiScoreInfo.variant}>
          {lead.aiScore}% {aiScoreInfo.label}
        </StatusBadge>
      </div>

      {/* Days since contact */}
      <p className="text-xs text-muted-foreground mb-2">
        {daysSinceContact === 0 ? 'Today' : daysSinceContact === 1 ? 'Yesterday' : `${daysSinceContact} days ago`}
      </p>

      {/* Warning badges */}
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

      {/* Action buttons */}
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <a
          href={`tel:${lead.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
          title="Call"
        >
          <Phone className="h-4 w-4" />
        </a>
        <a
          href={`mailto:${lead.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
          title="Email"
        >
          <Mail className="h-4 w-4" />
        </a>
        <a
          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi ${lead.name}, this is regarding your interest in ${lead.courseInterest}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <button
          onClick={(e) => { e.stopPropagation(); }}
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
  const leads = useLeadsStore((state) => state.leads);
  const updateLead = useLeadsStore((state) => state.updateLead);
  const router = useRouter();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'New Lead': 'bg-blue-500',
      'Contacted': 'bg-indigo-500',
      'Demo Scheduled': 'bg-purple-500',
      'Interested': 'bg-emerald-500',
      'Follow-up': 'bg-amber-500',
      'Payment Pending': 'bg-orange-500',
      'Converted': 'bg-green-500',
      'Lost': 'bg-gray-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Lead['status']) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedLead && draggedLead.status !== newStatus) {
      updateLead(draggedLead.id, { 
        status: newStatus,
        lastContact: new Date().toISOString().split('T')[0],
      });
      toast.success(`Lead moved to ${newStatus}`, {
        description: `${draggedLead.name} has been updated.`,
      });
    }
    setDraggedLead(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lead Pipeline</h1>
        <p className="text-muted-foreground mt-1">Drag and drop leads to update their status</p>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => {
          const stageLeads = getLeadsByStatus(stage);
          const isDropTarget = dragOverStage === stage;
          
          return (
            <div 
              key={stage} 
              className="flex-shrink-0 w-72"
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              onDragEnd={handleDragEnd}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-3 h-3 rounded-full", getStageColor(stage))} />
                <h3 className="font-semibold text-foreground">{stage}</h3>
                <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Content */}
              <div 
                className={cn(
                  "bg-muted/30 rounded-lg p-2 min-h-[calc(100vh-280px)] space-y-3 transition-colors",
                  isDropTarget && "bg-primary/10 ring-2 ring-primary ring-dashed"
                )}
              >
                {stageLeads.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    {isDropTarget ? 'Drop here' : 'No leads'}
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => router.push(`/bde/lead/${lead.id}`)}
                      onDragStart={handleDragStart}
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
