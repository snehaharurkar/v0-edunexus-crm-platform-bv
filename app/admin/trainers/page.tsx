"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Download, Search, Mail, Star } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', status: 'active' });

  const fetchTrainers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'trainer')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load trainers');
    else setTrainers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTrainers(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('trainers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchTrainers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    if (editTrainer) {
      const { error } = await supabase.from('users').update(form).eq('id', editTrainer.id);
      if (error) toast.error('Failed to update: ' + error.message);
      else { toast.success('Trainer updated!'); setEditTrainer(null); setShowModal(false); fetchTrainers(); }
    } else {
      const { error } = await supabase.from('users').insert([{ ...form, role: 'trainer' }]);
      if (error) toast.error('Failed to add: ' + error.message);
      else { toast.success('Trainer added!'); setShowModal(false); fetchTrainers(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trainer?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Trainer deleted!'); fetchTrainers(); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('users').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update status');
    else { toast.success('Status updated!'); fetchTrainers(); }
  };

  const openAdd = () => {
    setForm({ name: '', email: '', status: 'active' });
    setEditTrainer(null);
    setShowModal(true);
  };

  const openEdit = (t: Trainer) => {
    setForm({ name: t.name, email: t.email, status: t.status });
    setEditTrainer(t);
    setShowModal(true);
  };

  const exportCSV = () => {
    const csv = ['Name,Email,Status,Created'].concat(
      filtered.map(t => `${t.name},${t.email},${t.status},${t.created_at}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'trainers.csv'; a.click();
  };

  const filtered = trainers.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trainers</h1>
          <p className="text-muted-foreground">Manage all trainers in your institute</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Trainer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="outline" onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Trainers', count: trainers.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active', count: trainers.filter(t => t.status === 'active').length, color: 'bg-green-50 text-green-700' },
          { label: 'Inactive', count: trainers.filter(t => t.status === 'inactive').length, color: 'bg-red-50 text-red-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="border rounded-xl p-5 animate-pulse bg-card">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No trainers found</p>
          <Button onClick={openAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />Add First Trainer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(trainer => (
            <div key={trainer.id} className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {trainer.name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{trainer.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Mail className="h-3 w-3" />{trainer.email}
                    </p>
                  </div>
                </div>
                <select
                  value={trainer.status}
                  onChange={e => handleStatusChange(trainer.id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${trainer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                Joined: {new Date(trainer.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(trainer)}>
                  <Pencil className="h-3 w-3 mr-1" />Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(trainer.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditTrainer(null); }}>Cancel</Button>
              <Button onClick={handleSave}>Save Trainer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}