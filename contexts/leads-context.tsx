"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { needsFollowUp } from '@/lib/bde-lead-utils';

export interface LeadActivity {
  type: 'call' | 'email' | 'whatsapp' | 'note' | 'status';
  text: string;
  date: string;
  by: string;
}

export interface LeadWithActivities {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  courseInterest: string;
  status: string;
  aiScore: number;
  priority: string;
  assignedBde: string;
  lastContact: string;
  notes: string;
  createdAt: string;
  activities: LeadActivity[];
}

export interface NewLeadInput {
  name: string;
  email: string;
  phone: string;
  source: string;
  courseInterest: string;
  priority: string;
  assignedBde: string;
  notes: string;
  status?: string;
  aiScore?: number;
}

interface LeadsContextValue {
  leads: LeadWithActivities[];
  loaded: boolean;
  addLead: (newLead: NewLeadInput) => Promise<LeadWithActivities>;
  updateLead: (id: string, updates: Partial<LeadWithActivities>) => Promise<void>;
  addActivity: (leadId: string, activity: Omit<LeadActivity, 'date'> & { date?: string }) => Promise<void>;
  addNote: (leadId: string, noteText: string) => Promise<void>;
  markAsContacted: (leadId: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  getLeadById: (id: string) => LeadWithActivities | undefined;
  followUpCount: number;
  newLeadCount: number;
  refetch: () => Promise<void>;
}

const CURRENT_BDE = 'Rahul Sharma';

function mapRow(row: any): LeadWithActivities {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    source: row.source || 'Website',
    courseInterest: row.course_interest || '',
    status: row.status || 'New Lead',
    aiScore: row.ai_score || 50,
    priority: row.priority || 'Warm',
    assignedBde: row.assigned_bde || CURRENT_BDE,
    lastContact: row.last_contact || row.created_at?.split('T')[0] || '',
    notes: row.notes || '',
    createdAt: row.created_at?.split('T')[0] || '',
    activities: Array.isArray(row.activities) ? row.activities : [],
  };
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<LeadWithActivities[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.error('Error fetching leads:', error); return; }
      setLeads((data || []).map(mapRow));
    } catch (err) {
      console.error('fetchLeads error:', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => { fetchLeads(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLeads]);

  const addLead = useCallback(async (newLead: NewLeadInput): Promise<LeadWithActivities> => {
    const activity: LeadActivity = { type: 'note', text: 'Lead created', date: new Date().toLocaleString(), by: CURRENT_BDE };
    const payload = {
      name: newLead.name, email: newLead.email, phone: newLead.phone,
      source: newLead.source, course_interest: newLead.courseInterest,
      status: newLead.status ?? 'New Lead',
      ai_score: newLead.aiScore ?? Math.floor(Math.random() * 40) + 30,
      priority: newLead.priority, assigned_bde: newLead.assignedBde || CURRENT_BDE,
      notes: newLead.notes || '', last_contact: new Date().toISOString().split('T')[0],
      activities: [activity],
    };
    const { data, error } = await supabase.from('leads').insert([payload]).select().single();
    if (error) {
      console.error('addLead error:', error);
      return { ...newLead, id: Date.now().toString(), status: newLead.status ?? 'New Lead', aiScore: newLead.aiScore ?? 50, lastContact: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString().split('T')[0], activities: [activity] };
    }
    const mapped = mapRow(data);
    setLeads((prev) => [mapped, ...prev]);
    return mapped;
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<LeadWithActivities>) => {
    const currentLead = leads.find((l) => l.id === id);
    let activities = currentLead?.activities || [];
    if (updates.status && updates.status !== currentLead?.status) {
      activities = [...activities, { type: 'status' as const, text: `Status changed to ${updates.status}`, date: new Date().toLocaleString(), by: CURRENT_BDE }];
    }
    const payload: Record<string, any> = { activities };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.source !== undefined) payload.source = updates.source;
    if (updates.courseInterest !== undefined) payload.course_interest = updates.courseInterest;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.aiScore !== undefined) payload.ai_score = updates.aiScore;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.assignedBde !== undefined) payload.assigned_bde = updates.assignedBde;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.lastContact !== undefined) payload.last_contact = updates.lastContact;
    const { error } = await supabase.from('leads').update(payload).eq('id', id);
    if (error) { console.error('updateLead error:', error); return; }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates, activities } : l)));
  }, [leads]);

  const addActivity = useCallback(async (leadId: string, activity: Omit<LeadActivity, 'date'> & { date?: string }) => {
    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead) return;
    const newActivity: LeadActivity = { ...activity, date: activity.date ?? new Date().toLocaleString() };
    const updatedActivities = [...(currentLead.activities || []), newActivity];
    const lastContact = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('leads').update({ activities: updatedActivities, last_contact: lastContact }).eq('id', leadId);
    if (error) { console.error('addActivity error:', error); return; }
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, activities: updatedActivities, lastContact } : l));
  }, [leads]);

  const addNote = useCallback(async (leadId: string, noteText: string) => {
    await addActivity(leadId, { type: 'note', text: noteText, by: CURRENT_BDE });
  }, [addActivity]);

  const markAsContacted = useCallback(async (leadId: string) => {
    const lastContact = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('leads').update({ last_contact: lastContact }).eq('id', leadId);
    if (!error) setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, lastContact } : l)));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getLeadById = useCallback((id: string) => leads.find((l) => l.id === id), [leads]);
  const followUpCount = useMemo(() => leads.filter(needsFollowUp).length, [leads]);
  const newLeadCount = useMemo(() => leads.filter((l) => l.status === 'New Lead').length, [leads]);

  const value = useMemo(() => ({
    leads, loaded, addLead, updateLead, addActivity, addNote,
    markAsContacted, deleteLead, getLeadById, followUpCount, newLeadCount, refetch: fetchLeads,
  }), [leads, loaded, addLead, updateLead, addActivity, addNote, markAsContacted, deleteLead, getLeadById, followUpCount, newLeadCount, fetchLeads]);

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}

export { CURRENT_BDE };