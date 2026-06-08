"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/mock-data';
import { useLeads, CURRENT_BDE } from '@/contexts/leads-context';
import type { LeadWithActivities } from '@/contexts/leads-context';
import { DataTable } from '@/components/shared/data-table';
import { EmailComposeModal } from '@/components/bde/email-compose-modal';
import { Modal } from '@/components/shared/modal';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, Phone, Mail, MessageCircle, Pencil, Trash2, Send, Loader2, Share2, ChevronDown } from 'lucide-react';
import { sendLeadEmail } from '@/lib/emailjs-send';

export default function MyLeadsPage() {
  const { leads, addActivity, updateLead, deleteLead } = useLeads();
  const router = useRouter();

  const [selectedLeads, setSelectedLeads] = useState<LeadWithActivities[]>([]);
  const [socialMenuOpen, setSocialMenuOpen] = useState(false);

  // Single email
  const [emailLead, setEmailLead] = useState<LeadWithActivities | null>(null);

  // Bulk email
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkSending, setBulkSending] = useState(false);

  // Bulk WhatsApp
  const [bulkWAOpen, setBulkWAOpen] = useState(false);
  const [bulkWAMessage, setBulkWAMessage] = useState('');
  const [bulkWASending, setBulkWASending] = useState(false);

  // Bulk Telegram
  const [bulkTelegramOpen, setBulkTelegramOpen] = useState(false);
  const [bulkTelegramTitle, setBulkTelegramTitle] = useState('');
  const [bulkTelegramMessage, setBulkTelegramMessage] = useState('');
  const [bulkTelegramSending, setBulkTelegramSending] = useState(false);

  // Edit lead
  const [editLead, setEditLead] = useState<LeadWithActivities | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', courseInterest: '', source: '', priority: '', notes: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const myLeads = useMemo(
    () => leads.filter((l) => l.assignedBde === CURRENT_BDE),
    [leads]
  );

  const handleCall = (lead: LeadWithActivities) => {
    addActivity(lead.id, { type: 'call', text: 'Outgoing call initiated', by: CURRENT_BDE });
    window.location.href = formatPhoneForTel(lead.phone);
  };

  const handleWhatsApp = (lead: LeadWithActivities) => {
    addActivity(lead.id, { type: 'whatsapp', text: 'WhatsApp message initiated', by: CURRENT_BDE });
    window.open(buildWhatsAppUrl(lead.phone, buildWhatsAppMessage(lead)), '_blank');
  };

  const handleEmailSent = (subject: string) => {
    if (!emailLead) return;
    addActivity(emailLead.id, { type: 'email', text: 'Email sent: ' + subject, by: CURRENT_BDE });
  };

  const handleBulkEmail = async () => {
    if (!bulkSubject.trim() || !bulkBody.trim()) { toast.error('Please fill in subject and body'); return; }
    setBulkSending(true);
    const results = await Promise.allSettled(
      selectedLeads.map((lead) => sendLeadEmail({ to_email: lead.email, to_name: lead.name, subject: bulkSubject, message: bulkBody }))
    );
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed === 0) toast.success(`Email sent to ${succeeded} leads!`);
    else toast.success(`Sent to ${succeeded} leads`, { description: `${failed} failed` });
    selectedLeads.forEach(lead => addActivity(lead.id, { type: 'email', text: 'Bulk email sent: ' + bulkSubject, by: CURRENT_BDE }));
    setBulkSending(false);
    setBulkEmailOpen(false);
    setBulkSubject('');
    setBulkBody('');
  };

  const handleBulkWhatsApp = async () => {
    if (!bulkWAMessage.trim()) { toast.error('Please enter a message'); return; }
    setBulkWASending(true);
    const results = await Promise.allSettled(
      selectedLeads.map((lead) => fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: lead.phone, message: bulkWAMessage }),
      }))
    );
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed === 0) toast.success(`WhatsApp sent to ${succeeded} leads!`);
    else toast.success(`Sent to ${succeeded} leads`, { description: `${failed} failed` });
    selectedLeads.forEach(lead => addActivity(lead.id, { type: 'whatsapp', text: 'Bulk WhatsApp sent', by: CURRENT_BDE }));
    setBulkWASending(false);
    setBulkWAOpen(false);
    setBulkWAMessage('');
  };

  const handleBulkTelegram = async () => {
    if (!bulkTelegramTitle.trim() || !bulkTelegramMessage.trim()) { toast.error('Please fill in both fields'); return; }
    setBulkTelegramSending(true);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bulkTelegramTitle, message: bulkTelegramMessage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent to Telegram group!');
        setBulkTelegramOpen(false);
        setBulkTelegramTitle('');
        setBulkTelegramMessage('');
      } else {
        toast.error('Failed: ' + data.error);
      }
    } catch { toast.error('Failed to send'); }
    setBulkTelegramSending(false);
  };

  const openEdit = (lead: LeadWithActivities) => {
    setEditLead(lead);
    setEditForm({ name: lead.name, email: lead.email, phone: lead.phone, courseInterest: lead.courseInterest, source: lead.source, priority: lead.priority, notes: lead.notes || '' });
  };

  const handleSaveEdit = async () => {
    if (!editLead) return;
    setEditSaving(true);
    try {
      await updateLead(editLead.id, {
        name: editForm.name, email: editForm.email, phone: editForm.phone,
        courseInterest: editForm.courseInterest, source: editForm.source as Lead['source'],
        priority: editForm.priority as Lead['priority'], notes: editForm.notes,
      });
      toast.success('Lead updated!');
      setEditLead(null);
    } catch (err) {
      toast.error('Failed to update lead');
      console.error('Edit error:', err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id);
      toast.success('Lead deleted');
      setDeletingId(null);
    } catch (err) {
      toast.error('Failed to delete lead');
      console.error('Delete error:', err);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Lead',
      render: (lead: LeadWithActivities) => (
        <div>
          <p className="font-medium">{lead.name}</p>
          <p className="text-sm text-muted-foreground">{lead.phone}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'source', label: 'Source',
      render: (lead: LeadWithActivities) => (
        <StatusBadge variant={getSourceBadgeVariant(lead.source)}>{lead.source}</StatusBadge>
      ),
    },
    { key: 'courseInterest', label: 'Course Interest' },
    {
      key: 'status', label: 'Status',
      render: (lead: LeadWithActivities) => (
        <StatusBadge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</StatusBadge>
      ),
    },
    {
      key: 'aiScore', label: 'AI Score',
      render: (lead: LeadWithActivities) => {
        const scoreInfo = getAIScoreBadge(lead.aiScore);
        return <StatusBadge variant={scoreInfo.variant}>{lead.aiScore}%</StatusBadge>;
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: (lead: LeadWithActivities) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/bde/lead/${lead.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleCall(lead)}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setEmailLead(lead)}>
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleWhatsApp(lead)}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => openEdit(lead)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeletingId(lead.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Leads</h1>
          <p className="text-muted-foreground mt-1">All leads assigned to you</p>
        </div>

        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Social Media Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setSocialMenuOpen(!socialMenuOpen)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Social Media
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {socialMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setSocialMenuOpen(false);
                      setBulkSubject(`Hi, we'd love to connect with you!`);
                      setBulkBody(`Dear Lead,\n\nThank you for your interest. We wanted to reach out and share more about our courses.\n\nBest regards,\n${CURRENT_BDE}`);
                      setBulkEmailOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>Email {selectedLeads.length} Lead{selectedLeads.length > 1 ? 's' : ''}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSocialMenuOpen(false);
                      setBulkTelegramOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-t border-border"
                  >
                    <Send className="h-4 w-4 text-blue-500" />
                    <span>Telegram Group</span>
                  </button>
                  <button
                    onClick={() => {
                      setSocialMenuOpen(false);
                      setBulkWAMessage(`Hi, this is ${CURRENT_BDE} from EduNexus. We wanted to reach out about your interest in our courses!`);
                      setBulkWAOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-t border-border"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span>WhatsApp {selectedLeads.length} Lead{selectedLeads.length > 1 ? 's' : ''}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete stays separate */}
            <Button variant="destructive" onClick={() => setDeletingBulk(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedLeads.length} Lead{selectedLeads.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
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
          onSelectionChange={(selected) => setSelectedLeads(selected as LeadWithActivities[])}
        />
      )}

      {/* Single Email Modal */}
      <EmailComposeModal open={!!emailLead} onClose={() => setEmailLead(null)} lead={emailLead} onSent={handleEmailSent} />

      {/* Bulk Email Modal */}
      <Modal open={bulkEmailOpen} onClose={() => setBulkEmailOpen(false)} title={`Send Email to ${selectedLeads.length} Leads`} size="lg">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Sending to: <strong>{selectedLeads.map(l => l.name).join(', ')}</strong></p>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} placeholder="Email subject..." />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea value={bulkBody} onChange={e => setBulkBody(e.target.value)} rows={10} className="font-mono text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkEmailOpen(false)} disabled={bulkSending}>Cancel</Button>
            <Button onClick={handleBulkEmail} disabled={bulkSending}>
              {bulkSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send to {selectedLeads.length} Leads</>}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Telegram Modal */}
      <Modal open={bulkTelegramOpen} onClose={() => setBulkTelegramOpen(false)} title="Send Telegram Message">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">✈️</span>
            <p className="text-sm text-blue-700">Message will be sent to your Telegram group instantly</p>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={bulkTelegramTitle} onChange={e => setBulkTelegramTitle(e.target.value)} placeholder="e.g. New Batch Starting Soon" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={bulkTelegramMessage} onChange={e => setBulkTelegramMessage(e.target.value)} rows={6} placeholder="Type your message..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkTelegramOpen(false)} disabled={bulkTelegramSending}>Cancel</Button>
            <Button onClick={handleBulkTelegram} disabled={bulkTelegramSending} className="bg-blue-500 hover:bg-blue-600 text-white">
              {bulkTelegramSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send to Telegram</>}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk WhatsApp Modal */}
      <Modal open={bulkWAOpen} onClose={() => setBulkWAOpen(false)} title={`Send WhatsApp to ${selectedLeads.length} Leads`}>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Sending to: <strong>{selectedLeads.map(l => l.name).join(', ')}</strong></p>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={bulkWAMessage} onChange={e => setBulkWAMessage(e.target.value)} rows={6} placeholder="Type your WhatsApp message..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkWAOpen(false)} disabled={bulkWASending}>Cancel</Button>
            <Button onClick={handleBulkWhatsApp} disabled={bulkWASending} className="bg-green-600 hover:bg-green-700 text-white">
              {bulkWASending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><MessageCircle className="h-4 w-4 mr-2" />Send to {selectedLeads.length} Leads</>}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal open={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Course Interest</Label>
              <Input value={editForm.courseInterest} onChange={e => setEditForm({ ...editForm, courseInterest: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={editForm.source} onValueChange={v => setEditForm({ ...editForm, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Website', 'Google Ads', 'Referral'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={editForm.priority} onValueChange={v => setEditForm({ ...editForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Warm">Warm</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditLead(null)} disabled={editSaving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Single Modal */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Lead">
        <div className="space-y-4">
          <p className="text-muted-foreground">Are you sure you want to delete this lead? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingId && handleDelete(deletingId)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal open={deletingBulk} onClose={() => setDeletingBulk(false)} title="Delete Selected Leads">
        <div className="space-y-4">
          <p className="text-muted-foreground">Are you sure you want to delete <strong>{selectedLeads.length} leads</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingBulk(false)} disabled={deletingBulk}>Cancel</Button>
            <Button variant="destructive" disabled={deletingBulk} onClick={async () => {
              setDeletingBulk(true);
              try {
                await Promise.all(selectedLeads.map(lead => deleteLead(lead.id)));
                toast.success(`${selectedLeads.length} leads deleted`);
                setSelectedLeads([]);
                setDeletingBulk(false);
              } catch (err) {
                toast.error('Failed to delete some leads');
                console.error('Bulk delete error:', err);
                setDeletingBulk(false);
              }
            }}>
              {deletingBulk ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete All {selectedLeads.length}</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
