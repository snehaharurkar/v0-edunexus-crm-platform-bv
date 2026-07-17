"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { mockLeads, mockLeadActivities, type Lead } from '@/lib/mock-data';
import { StatusBadge, getSourceBadgeVariant, getStatusBadgeVariant, getAIScoreBadge } from '@/components/shared/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Sparkles,
  Send,
  PhoneCall,
  FileText,
  RefreshCw,
} from 'lucide-react';

const pipelineStages = [
  'New Lead',
  'Contacted',
  'Demo Scheduled',
  'Interested',
  'Follow-up',
  'Payment Pending',
  'Converted',
  'Lost',
];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiProbability, setAiProbability] = useState<{ score: number; reasoning: string } | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [generatingProbability, setGeneratingProbability] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundLead = mockLeads.find(l => l.id === id);
      setLead(foundLead || null);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    if (lead) {
      setLead({ ...lead, status: newStatus as Lead['status'] });
      toast.success(`Lead status updated to ${newStatus}`);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast.success('Note added successfully');
      setNewNote('');
    }
  };

  const handleGenerateMessage = async () => {
    setGeneratingMessage(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAiMessage(
      `Hi ${lead?.name},\n\nI hope this message finds you well! I wanted to follow up on our conversation about the ${lead?.courseInterest} program.\n\nBased on your interest in career advancement and the goals you shared, I think this program would be an excellent fit. We have a new batch starting next week with a special early-bird discount.\n\nWould you be available for a quick 15-minute call tomorrow to discuss the next steps?\n\nBest regards,\nRahul Sharma\nEduNexus CRM`
    );
    setGeneratingMessage(false);
  };

  const handleGenerateProbability = async () => {
    setGeneratingProbability(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiProbability({
      score: lead?.aiScore || 75,
      reasoning: `Based on engagement patterns, ${lead?.name} shows high interest with ${lead?.aiScore}% conversion probability. Key factors: Active response to communications, attended demo session, showed budget flexibility, and has a clear timeline for decision.`,
    });
    setGeneratingProbability(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="h-4 w-4 text-emerald-600" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'status': return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case 'note': return <FileText className="h-4 w-4 text-amber-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 skeleton rounded-xl" />
          <div className="h-96 skeleton rounded-xl" />
          <div className="h-96 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Lead not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const aiScoreInfo = getAIScoreBadge(lead.aiScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
          <p className="text-muted-foreground">{lead.courseInterest}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{lead.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{lead.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Source</p>
              <StatusBadge variant={getSourceBadgeVariant(lead.source)}>
                {lead.source}
              </StatusBadge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Score</p>
              <StatusBadge variant={aiScoreInfo.variant}>
                {lead.aiScore}% - {aiScoreInfo.label}
              </StatusBadge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned BDE</p>
              <p className="font-medium">{lead.assignedBde}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Contact</p>
              <p className="font-medium">{lead.lastContact}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{lead.notes}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={`tel:${lead.phone.replace(/[^+\\d]/g, '')}`}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={`mailto:${lead.email}`}>
                <Mail className="h-4 w-4 mr-1" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={`https://wa.me/${lead.phone.replace(/[^\\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Center: Activity Timeline */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Activity Timeline</h2>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {mockLeadActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp} - {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Note */}
          <div className="mt-6 pt-4 border-t border-border">
            <Label htmlFor="note" className="text-sm font-medium">Add Note</Label>
            <Textarea
              id="note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              className="mt-2"
              rows={2}
            />
            <Button size="sm" className="mt-2" onClick={handleAddNote}>
              <Send className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>

          {/* Change Status */}
          <div className="mt-4">
            <Label className="text-sm font-medium">Change Status</Label>
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pipelineStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: AI Panel */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">AI Assistant</h2>
          </div>

          {/* Generate Follow-up Message */}
          <div className="space-y-3">
            <Button
              onClick={handleGenerateMessage}
              disabled={generatingMessage}
              className="w-full"
            >
              {generatingMessage ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Follow-up Message
                </>
              )}
            </Button>

            {aiMessage && (
              <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                {aiMessage}
              </div>
            )}
          </div>

          {/* Conversion Probability */}
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              onClick={handleGenerateProbability}
              disabled={generatingProbability}
              className="w-full"
            >
              {generatingProbability ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Conversion Probability
                </>
              )}
            </Button>

            {aiProbability && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary">{aiProbability.score}%</span>
                  <StatusBadge variant={aiScoreInfo.variant}>
                    {aiScoreInfo.label}
                  </StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">{aiProbability.reasoning}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
