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
import { mockLeadActivities, mockLeads, type Lead } from '@/lib/mock-data';
import { needsFollowUp } from '@/lib/bde-lead-utils';

const STORAGE_KEY = 'edunexus_leads';

export interface LeadActivity {
  type: 'call' | 'email' | 'whatsapp' | 'note' | 'status';
  text: string;
  date: string;
  by: string;
}

export interface LeadWithActivities extends Lead {
  activities: LeadActivity[];
}

export type NewLeadInput = Omit<
  LeadWithActivities,
  'id' | 'status' | 'aiScore' | 'lastContact' | 'createdAt' | 'activities'
> & {
  status?: Lead['status'];
  aiScore?: number;
};

interface LeadsContextValue {
  leads: LeadWithActivities[];
  loaded: boolean;
  addLead: (newLead: NewLeadInput) => LeadWithActivities;
  updateLead: (id: string, updates: Partial<LeadWithActivities>) => void;
  addActivity: (
    leadId: string,
    activity: Omit<LeadActivity, 'date'> & { date?: string }
  ) => void;
  addNote: (leadId: string, noteText: string) => void;
  markAsContacted: (leadId: string) => void;
  deleteLead: (id: string) => void;
  getLeadById: (id: string) => LeadWithActivities | undefined;
  followUpCount: number;
  newLeadCount: number;
}

const CURRENT_BDE = 'Rahul Sharma';

function buildInitialLeads(): LeadWithActivities[] {
  return mockLeads.map((lead) => {
    const activities: LeadActivity[] = mockLeadActivities
      .filter((a) => a.leadId === lead.id)
      .map((a) => ({
        type: a.type as LeadActivity['type'],
        text: a.message,
        date: a.timestamp,
        by: a.user,
      }));

    if (activities.length === 0 && lead.notes) {
      activities.push({
        type: 'note',
        text: lead.notes,
        date: lead.createdAt,
        by: lead.assignedBde,
      });
    }

    return { ...lead, activities };
  });
}

function parseStoredLeads(stored: string): LeadWithActivities[] | null {
  try {
    const parsed = JSON.parse(stored) as LeadWithActivities[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<LeadWithActivities[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseStoredLeads(stored);
        if (parsed && parsed.length > 0) {
          setLeads(parsed);
        } else {
          const initial = buildInitialLeads();
          setLeads(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } else {
        const initial = buildInitialLeads();
        setLeads(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      const initial = buildInitialLeads();
      setLeads(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, loaded]);

  const addActivity = useCallback(
    (leadId: string, activity: Omit<LeadActivity, 'date'> & { date?: string }) => {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                activities: [
                  ...(l.activities || []),
                  {
                    ...activity,
                    date: activity.date ?? new Date().toLocaleString(),
                  },
                ],
                lastContact: new Date().toISOString().split('T')[0],
              }
            : l
        )
      );
    },
    []
  );

  const addLead = useCallback((newLead: NewLeadInput): LeadWithActivities => {
    const lead: LeadWithActivities = {
      ...newLead,
      id: Date.now().toString(),
      status: newLead.status ?? 'New Lead',
      aiScore: newLead.aiScore ?? Math.floor(Math.random() * 40) + 30,
      lastContact: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      activities: [
        {
          type: 'note',
          text: 'Lead created',
          date: new Date().toLocaleString(),
          by: CURRENT_BDE,
        },
      ],
    };
    setLeads((prev) => [lead, ...prev]);
    return lead;
  }, []);

  const updateLead = useCallback(
    (id: string, updates: Partial<LeadWithActivities>) => {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const updated = { ...l, ...updates };
          if (updates.status && updates.status !== l.status) {
            updated.activities = [
              ...updated.activities,
              {
                type: 'status',
                text: `Status changed to ${updates.status}`,
                date: new Date().toLocaleString(),
                by: CURRENT_BDE,
              },
            ];
          }
          return updated;
        })
      );
    },
    []
  );

  const addNote = useCallback(
    (leadId: string, noteText: string) => {
      addActivity(leadId, {
        type: 'note',
        text: noteText,
        by: CURRENT_BDE,
      });
    },
    [addActivity]
  );

  const markAsContacted = useCallback((leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              lastContact: new Date().toISOString().split('T')[0],
            }
          : l
      )
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getLeadById = useCallback(
    (id: string) => leads.find((l) => l.id === id),
    [leads]
  );

  const followUpCount = useMemo(
    () => leads.filter(needsFollowUp).length,
    [leads]
  );

  const newLeadCount = useMemo(
    () => leads.filter((l) => l.status === 'New Lead').length,
    [leads]
  );

  const value = useMemo(
    () => ({
      leads,
      loaded,
      addLead,
      updateLead,
      addActivity,
      addNote,
      markAsContacted,
      deleteLead,
      getLeadById,
      followUpCount,
      newLeadCount,
    }),
    [
      leads,
      loaded,
      addLead,
      updateLead,
      addActivity,
      addNote,
      markAsContacted,
      deleteLead,
      getLeadById,
      followUpCount,
      newLeadCount,
    ]
  );

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) {
    throw new Error('useLeads must be used within LeadsProvider');
  }
  return ctx;
}

export { CURRENT_BDE };
