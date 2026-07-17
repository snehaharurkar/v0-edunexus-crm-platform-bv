"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { mockLeads, type Lead } from '@/lib/mock-data';

type NewLead = Omit<Lead, 'id' | 'status' | 'aiScore' | 'lastContact' | 'createdAt'>;

interface LeadContextValue {
  leads: Lead[];
  ready: boolean;
  addLead: (lead: NewLead) => Lead;
  importLeads: (file: File, assignedBde: string) => Promise<number>;
  deleteLeads: (ids: string[]) => void;
}

const LeadContext = createContext<LeadContextValue | undefined>(undefined);
const STORAGE_KEY = 'edunexus-bde-leads';
const sources = new Set<Lead['source']>(['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Website', 'Google Ads', 'Referral']);
const priorities = new Set<Lead['priority']>(['Hot', 'Warm', 'Cold']);

function asText(value: unknown) {
  return String(value ?? '').trim();
}

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLeads(JSON.parse(stored) as Lead[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  const persist = useCallback((next: Lead[]) => {
    setLeads(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addLead = useCallback((input: NewLead) => {
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      status: 'New Lead',
      aiScore: 50,
      lastContact: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setLeads((current) => {
      const next = [lead, ...current];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return lead;
  }, []);

  const importLeads = useCallback(async (file: File, assignedBde: string) => {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) throw new Error('The selected file does not contain a worksheet.');
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
    const imported = rows.flatMap((row) => {
      const name = asText(row.name ?? row.Name ?? row['Full Name'] ?? row.fullName);
      const email = asText(row.email ?? row.Email ?? row['Email Address']);
      const phone = asText(row.phone ?? row.Phone ?? row.Mobile ?? row['Phone Number']);
      if (!name || !email || !phone) return [];
      const source = asText(row.source ?? row.Source);
      const priority = asText(row.priority ?? row.Priority);
      return [{
        id: crypto.randomUUID(), name, email, phone,
        courseInterest: asText(row.courseInterest ?? row.Course ?? row['Course Interest']) || 'Not specified',
        source: sources.has(source as Lead['source']) ? source as Lead['source'] : 'Website',
        priority: priorities.has(priority as Lead['priority']) ? priority as Lead['priority'] : 'Warm',
        assignedBde: asText(row.assignedBde ?? row['Assigned BDE']) || assignedBde,
        notes: asText(row.notes ?? row.Notes), status: 'New Lead' as const, aiScore: 50,
        lastContact: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString().slice(0, 10),
      }];
    });
    if (!imported.length) throw new Error('No valid rows found. Include name, email, and phone columns.');
    setLeads((current) => {
      const existingEmails = new Set(current.map((lead) => lead.email.toLowerCase()));
      const unique = imported.filter((lead) => !existingEmails.has(lead.email.toLowerCase()));
      const next = [...unique, ...current];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return imported.length;
  }, []);

  const deleteLeads = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setLeads((current) => {
      const next = current.filter((lead) => !idSet.has(lead.id));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return <LeadContext.Provider value={{ leads, ready, addLead, importLeads, deleteLeads }}>{children}</LeadContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) throw new Error('useLeads must be used within a LeadProvider');
  return context;
}
