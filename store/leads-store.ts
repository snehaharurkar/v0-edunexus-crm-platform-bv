import { create } from 'zustand'
import { mockLeads, type Lead } from '@/lib/mock-data'

interface LeadsStore {
  leads: Lead[]
  addLead: (newLead: Omit<Lead, 'id' | 'status' | 'createdAt' | 'lastContact' | 'aiScore'>) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  getLeadById: (id: string) => Lead | undefined
}

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  leads: [...mockLeads],
  
  addLead: (newLead) => set((state) => ({
    leads: [
      ...state.leads,
      {
        ...newLead,
        id: Date.now().toString(),
        status: 'New Lead' as const,
        createdAt: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        aiScore: Math.floor(Math.random() * 40) + 30,
      },
    ],
  })),
  
  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map((lead) =>
      lead.id === id ? { ...lead, ...updates } : lead
    ),
  })),
  
  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== id),
  })),
  
  getLeadById: (id) => {
    return get().leads.find((lead) => lead.id === id)
  },
}))
