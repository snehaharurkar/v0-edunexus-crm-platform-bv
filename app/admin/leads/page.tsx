"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Download, Search, Phone, Mail } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  course_interest: string;
  status: string;
  ai_score: number;
  priority: string;
  assigned_bde: string;
  notes: string;
  created_at: string;
}

const statusOptions = ['New Lead', 'Contacted', 'Demo Scheduled', 'Interested', 'Follow-up', 'Payment Pending', 'Converted', 'Lost'];
const sourceOptions = ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Website', 'Google Ads', 'Referral'];
const priorityOptions = ['Hot', 'Warm', 'Cold'];

const statusColors: Record<string, string> = {
  'New Lead': 'bg-blue-100 text-blue-700',
  'Contacted': 'bg-purple-100 text-purple-700',
  'Demo Scheduled': 'bg-yellow-100 text-yellow-700',
  'Interested': 'bg-orange-100 text-orange-700',
  'Follow-up': 'bg-cyan-100 text-cyan-700',
  'Payment Pending': 'bg-red-100 text-red-700',
  'Converted': 'bg-green-100 text-green-700',
  'Lost': 'bg-gray-100 text-gray-600',
};

const priorityColors: Record<string, string> = {
  Hot: 'bg-red-100 text-red-700',
  Warm: 'bg-yellow-100 text-yellow-700',
  Cold: 'bg-blue-100 text-blue-700',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'Instagram',
    course_interest: '', status: 'New Lead', ai_score: 50,
    priority: 'Warm', assigned_bde: '', notes: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load leads');
    else setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required');
    if (editLead) {
      const { error } = await supabase.from('leads').update(form).eq('id', editLead.id);
      if (error) toast.error('Failed to update: ' + error.message);
      else { toast.success('Lead updated!'); setEditLead(null); setShowModal(false); fetchLeads(); }
    } else {
      const { error } = await supabase.from('leads').insert([form]);
      if (error) toast.error('Failed to add: ' + error.message);
      else { toast.success('Lead added!'); setShowModal(false); fetchLeads(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Lead deleted!'); fetchLeads(); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update status');
    else { toast.success('Status updated!'); fetchLeads(); }
  };

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '', source: 'Instagram', course_interest: '', status: 'New Lead', ai_score: 50, priority: 'Warm', assigned_bde: '', notes: '' });
    setEditLead(null);
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setForm({
      name: lead.name, email: lead.email, phone: lead.phone,
      source: lead.source, course_interest: lead.course_interest,
      status: lead.status, ai_score: lead.ai_score,
      priority: lead.priority, assigned_bde: lead.assigned_bde, notes: lead.notes,
    });
    setEditLead(lead);
    setShowModal(true);
  };

  const exportCSV = () => {
    const csv = ['Name,Email,Phone,Source,Course,Status,Priority,AI Score,BDE'].concat(
      filtered.map(l => `${l.name},${l.email},${l.phone},${l.source},${l.course_interest},${l.status},${l.priority},${l.ai_score},${l.assigned_bde}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search);
    const matchStatus = filterStatus ? l.status === filterStatus : true;
    const matchPriority = filterPriority ? l.priority === filterPriority : true;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage and track all your leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {priorityOptions.map(p => <option key={p}>{p}</option>)}
        </select>
        <Button variant="outline" onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); }}>
          Clear
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: leads.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Hot', count: leads.filter(l => l.priority === 'Hot').length, color: 'bg-red-50 text-red-700' },
          { label: 'Converted', count: leads.filter(l => l.status === 'Converted').length, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Payment', count: leads.filter(l => l.status === 'Payment Pending').length, color: 'bg-yellow-50 text-yellow-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Source</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Course</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">AI Score</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                No leads found. Click "Add Lead" to add your first lead!
              </td></tr>
            ) : filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                      {lead.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{lead.assigned_bde}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />{lead.email}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{lead.phone}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{lead.source}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{lead.course_interest}</td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={e => handleStatusChange(lead.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[lead.status] || 'bg-gray-100'}`}
                  >
                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[lead.priority] || 'bg-gray-100'}`}>
                    {lead.priority}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                      <div
                        className={`h-1.5 rounded-full ${lead.ai_score >= 80 ? 'bg-green-500' : lead.ai_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${lead.ai_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{lead.ai_score}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(lead.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                  {sourceOptions.map(s => <option key={s}>{s}</option>)}
                </select>
                <Input placeholder="Course Interest" value={form.course_interest} onChange={e => setForm({ ...form, course_interest: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {priorityOptions.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">AI Score: {form.ai_score}%</label>
                <input type="range" min="0" max="100" value={form.ai_score} onChange={e => setForm({ ...form, ai_score: Number(e.target.value) })} className="w-full" />
              </div>
              <Input placeholder="Assigned BDE" value={form.assigned_bde} onChange={e => setForm({ ...form, assigned_bde: e.target.value })} />
              <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm min-h-[80px] resize-none" />
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditLead(null); }}>Cancel</Button>
              <Button onClick={handleSave}>Save Lead</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}