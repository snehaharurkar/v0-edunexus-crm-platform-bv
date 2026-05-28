"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadsStore } from '@/store/leads-store';
import { mockLeadActivities, type Lead } from '@/lib/mock-data';
import { StatusBadge, getSourceBadgeVariant, getStatusBadgeVariant, getAIScoreBadge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
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
  Loader2,
  Clock,
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

interface ActivityLog {
  id: string;
  type: 'call' | 'email' | 'status' | 'note';
  message: string;
  timestamp: string;
  user: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const getLeadById = useLeadsStore((state) => state.getLeadById);
  const updateLead = useLeadsStore((state) => state.updateLead);
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([...mockLeadActivities]);
  const [newNote, setNewNote] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiProbability, setAiProbability] = useState<{ score: number; reasoning: string } | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [generatingProbability, setGeneratingProbability] = useState(false);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Log Call Modal State
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [callData, setCallData] = useState({
    duration: '',
    summary: '',
    outcome: 'Interested' as 'Interested' | 'Not Interested' | 'Call Back Later' | 'No Answer',
  });
  const [isLoggingCall, setIsLoggingCall] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundLead = getLeadById(id);
      setLead(foundLead || null);
      if (foundLead) {
        setEmailData({
          subject: `Following up on your interest in ${foundLead.courseInterest}`,
          body: `Hi ${foundLead.name},\n\nThank you for your interest in our ${foundLead.courseInterest} program. I wanted to follow up and see if you have any questions or would like to schedule a demo.\n\nPlease let me know a convenient time for a quick call.\n\nBest regards,\nRahul Sharma\nEduNexus CRM`,
        });
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id, getLeadById]);

  const handleStatusChange = (newStatus: string) => {
    if (lead) {
      updateLead(lead.id, { status: newStatus as Lead['status'] });
      setLead({ ...lead, status: newStatus as Lead['status'] });
      
      // Add to activities
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        type: 'status',
        message: `Status changed to "${newStatus}"`,
        timestamp: new Date().toLocaleString(),
        user: 'Rahul Sharma',
      };
      setActivities([newActivity, ...activities]);
      toast.success(`Lead status updated to ${newStatus}`);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        type: 'note',
        message: newNote,
        timestamp: new Date().toLocaleString(),
        user: 'Rahul Sharma',
      };
      setActivities([newActivity, ...activities]);
      toast.success('Note added successfully');
      setNewNote('');
    }
  };

  const handleSendEmail = async () => {
    if (!lead) return;
    setIsSendingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add to activities
    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      type: 'email',
      message: `Email sent: "${emailData.subject}"`,
      timestamp: new Date().toLocaleString(),
      user: 'Rahul Sharma',
    };
    setActivities([newActivity, ...activities]);
    
    setIsSendingEmail(false);
    setIsEmailModalOpen(false);
    toast.success('Email sent successfully!', {
      description: `Email sent to ${lead.email}`,
    });
  };

  const handleLogCall = async () => {
    if (!lead) return;
    setIsLoggingCall(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to activities
    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      type: 'call',
      message: `Call logged (${callData.duration} mins) - ${callData.outcome}: ${callData.summary}`,
      timestamp: new Date().toLocaleString(),
      user: 'Rahul Sharma',
    };
    setActivities([newActivity, ...activities]);

    // Update last contact date
    updateLead(lead.id, { lastContact: new Date().toISOString().split('T')[0] });
    setLead({ ...lead, lastContact: new Date().toISOString().split('T')[0] });
    
    setIsLoggingCall(false);
    setIsLogCallModalOpen(false);
    setCallData({ duration: '', summary: '', outcome: 'Interested' });
    toast.success('Call logged successfully!');
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
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border">
            <a href={`tel:${lead.phone}`}>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={() => setIsEmailModalOpen(true)}>
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <a 
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi ${lead.name}, this is regarding your interest in ${lead.courseInterest}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={() => setIsLogCallModalOpen(true)}>
              <Clock className="h-4 w-4 mr-1" />
              Log Call
            </Button>
          </div>
        </div>

        {/* Center: Activity Timeline */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Activity Timeline</h2>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activities.map((activity) => (
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
            <Button size="sm" className="mt-2" onClick={handleAddNote} disabled={!newNote.trim()}>
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

      {/* Email Modal */}
      <Modal
        open={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Send Email"
        description={`Send email to ${lead.email}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailTo">To</Label>
            <Input id="emailTo" value={lead.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailSubject">Subject</Label>
            <Input
              id="emailSubject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailBody">Message</Label>
            <Textarea
              id="emailBody"
              value={emailData.body}
              onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
              placeholder="Email message"
              rows={8}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Log Call Modal */}
      <Modal
        open={isLogCallModalOpen}
        onClose={() => setIsLogCallModalOpen(false)}
        title="Log Call"
        description="Record details of your call"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callDuration">Call Duration (minutes)</Label>
            <Input
              id="callDuration"
              type="number"
              value={callData.duration}
              onChange={(e) => setCallData({ ...callData, duration: e.target.value })}
              placeholder="e.g., 15"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callOutcome">Outcome</Label>
            <Select
              value={callData.outcome}
              onValueChange={(value) => setCallData({ ...callData, outcome: value as typeof callData.outcome })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Call Back Later">Call Back Later</SelectItem>
                <SelectItem value="No Answer">No Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="callSummary">Call Summary</Label>
            <Textarea
              id="callSummary"
              value={callData.summary}
              onChange={(e) => setCallData({ ...callData, summary: e.target.value })}
              placeholder="Brief summary of the call..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsLogCallModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCall} disabled={isLoggingCall || !callData.duration}>
              {isLoggingCall ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Save Call Log
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
