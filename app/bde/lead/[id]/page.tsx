"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import emailjs from '@emailjs/browser';
import type { Lead } from '@/lib/mock-data';
import { useLeads, CURRENT_BDE } from '@/contexts/leads-context';
import type { LeadActivity } from '@/contexts/leads-context';
import { Modal } from '@/components/shared/modal';
import {
  StatusBadge,
  getSourceBadgeVariant,
  getAIScoreBadge,
} from '@/components/shared/badge';
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
  buildEmailBody,
  buildEmailSubject,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatPhoneForTel,
} from '@/lib/bde-lead-utils';
import { getEmailjsErrorMessage } from '@/lib/emailjs-send';
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
  Copy,
  Loader2,
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
] as const;

const PROBABILITY_INSIGHTS = [
  'High engagement rate',
  'Attended demo session',
  'Budget flexibility shown',
  'Timeline: Ready to join next batch',
];

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { getLeadById, updateLead, addNote, addActivity } = useLeads();
  const lead = getLeadById(id);

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiProbability, setAiProbability] = useState<{
    score: number;
    insights: string[];
  } | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [generatingProbability, setGeneratingProbability] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const handleStatusChange = (newStatus: string) => {
    if (!lead) return;
    updateLead(lead.id, { status: newStatus as Lead['status'] });
    toast.success(`Lead status updated to ${newStatus}`);
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;
    setAddingNote(true);
    await new Promise((r) => setTimeout(r, 300));
    addNote(lead.id, newNote.trim());
    toast.success('Note added!');
    setNewNote('');
    setAddingNote(false);
  };

  const handleCall = () => {
    if (!lead) return;
    addActivity(lead.id, {
      type: 'call',
      text: 'Outgoing call initiated',
      by: CURRENT_BDE,
    });
    window.location.href = formatPhoneForTel(lead.phone);
  };

  const handleWhatsApp = (message?: string) => {
    if (!lead) return;
    addActivity(lead.id, {
      type: 'whatsapp',
      text: 'WhatsApp message initiated',
      by: CURRENT_BDE,
    });
    const text = message ?? buildWhatsAppMessage(lead);
    window.open(buildWhatsAppUrl(lead.phone, text), '_blank', 'noopener,noreferrer');
  };

  const openEmailModal = (body?: string) => {
    if (!lead) return;
    setEmailSubject(buildEmailSubject(lead));
    setEmailBody(body ?? buildEmailBody(lead));
    setEmailModalOpen(true);
  };

  const sendEmail = async () => {
    if (!lead || !emailSubject.trim()) return;
    setEmailSending(true);
    try {
      await emailjs.send(
        'service_j25h72p',
        'template_hr7px5f',
        {
          to_email: lead.email,
          to_name: lead.name,
          subject: emailSubject,
          message: emailBody,
          from_name: 'Rahul Sharma - EduNexus',
          reply_to: 'harurkar.6719@gmail.com',
        },
        'nzQt9FRUpGzZXSVKp'
      );
      toast.success('Email sent to ' + lead.name + '!');
      addActivity(lead.id, {
        type: 'email',
        text: 'Email sent: ' + emailSubject,
        by: 'Rahul Sharma',
      });
      setEmailModalOpen(false);
    } catch (error) {
      toast.error(getEmailjsErrorMessage(error));
      console.error('EmailJS error:', error);
    }
    setEmailSending(false);
  };

  const handleGenerateMessage = async () => {
    if (!lead) return;
    setGeneratingMessage(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setAiMessage(
      `Hi ${lead.name},\n\nI hope you're doing well! I wanted to follow up on your interest in our ${lead.courseInterest} program (AI score: ${lead.aiScore}%).\n\n${lead.notes ? `Based on our notes: "${lead.notes}" — ` : ''}I believe this batch would be a great fit for your goals. We have flexible EMI options and strong placement support.\n\nWould you be available for a quick 15-minute call this week to discuss next steps?\n\nBest regards,\nRahul Sharma\nEduNexus`
    );
    setGeneratingMessage(false);
  };

  const handleGenerateProbability = async () => {
    if (!lead) return;
    setGeneratingProbability(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAiProbability({
      score: lead.aiScore,
      insights: PROBABILITY_INSIGHTS,
    });
    setGeneratingProbability(false);
  };

  const handleCopyMessage = async () => {
    if (!aiMessage) return;
    await navigator.clipboard.writeText(aiMessage);
    toast.success('Message copied!');
  };

  const getActivityIcon = (type: LeadActivity['type']) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="h-4 w-4 text-emerald-600" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'status':
        return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case 'note':
        return <FileText className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

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
  const sortedActivities = [...(lead.activities || [])].reverse();

  return (
    <div className="space-y-6">
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Contact Information
          </h2>

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
              <p className="text-sm">{lead.notes || '—'}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => openEmailModal()}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleWhatsApp()}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Activity Timeline
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              sortedActivities.map((activity, index) => (
                <div key={`${activity.date}-${index}`} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.date} — {activity.by}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Label htmlFor="note" className="text-sm font-medium">
              Add Note
            </Label>
            <Textarea
              id="note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              className="mt-2"
              rows={2}
            />
            <Button
              size="sm"
              className="mt-2"
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
            >
              {addingNote ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Add Note
            </Button>
          </div>

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

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">AI Assistant</h2>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGenerateMessage}
              disabled={generatingMessage}
              className="w-full"
            >
              {generatingMessage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {aiMessage}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsApp(aiMessage)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEmailModal(aiMessage)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyMessage}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Message
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              onClick={handleGenerateProbability}
              disabled={generatingProbability}
              className="w-full"
            >
              {generatingProbability ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              <div className="p-3 rounded-lg bg-muted space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {aiProbability.score}%
                  </span>
                  <StatusBadge variant={aiScoreInfo.variant}>
                    {aiScoreInfo.label}
                  </StatusBadge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
                  {aiProbability.insights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Send Email"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={lead.email} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEmailModalOpen(false)}
              disabled={emailSending}
            >
              Cancel
            </Button>
            <Button onClick={sendEmail} disabled={emailSending}>
              {emailSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
