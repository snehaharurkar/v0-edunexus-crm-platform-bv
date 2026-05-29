"use client";

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/shared/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import type { Lead } from '@/lib/mock-data';
import { buildEmailBody, buildEmailSubject } from '@/lib/bde-lead-utils';
import { getEmailjsErrorMessage, sendLeadEmail } from '@/lib/emailjs-send';
import { toast } from 'sonner';

interface EmailComposeModalProps {
  open: boolean;
  onClose: () => void;
  lead: Pick<Lead, 'name' | 'email' | 'courseInterest'> | null;
  initialBody?: string;
  /** Called after EmailJS successfully sends (e.g. log activity). */
  onSent?: (subject: string, body: string) => void;
}

export function EmailComposeModal({
  open,
  onClose,
  lead,
  initialBody,
  onSent,
}: EmailComposeModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (lead && open) {
      setSubject(buildEmailSubject(lead));
      setBody(initialBody ?? buildEmailBody(lead));
    }
  }, [lead, open, initialBody]);

  const sendEmail = async () => {
    if (!lead || !subject.trim()) return;

    setEmailSending(true);
    try {
      await sendLeadEmail({
        to_email: lead.email,
        to_name: lead.name,
        subject,
        message: body,
      });
      toast.success('Email sent to ' + lead.name + '!');
      onSent?.(subject, body);
      onClose();
    } catch (error) {
      toast.error(getEmailjsErrorMessage(error));
      console.error('EmailJS error:', error);
    }
    setEmailSending(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Email" size="lg">
      {lead && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={lead.email} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={emailSending}>
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
      )}
    </Modal>
  );
}
