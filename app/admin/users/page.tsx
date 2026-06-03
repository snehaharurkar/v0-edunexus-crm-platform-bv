"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Download } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', status: 'active' });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load users');
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    if (editUser) {
      const { error } = await supabase.from('users').update(form).eq('id', editUser.id);
      if (error) toast.error('Failed to update: ' + error.message);
      else { toast.success('User updated!'); setEditUser(null); setShowModal(false); fetchUsers(); }
    } else {
      const { error } = await supabase.from('users').insert([form]);
      if (error) toast.error('Failed to add: ' + error.message);
      else { toast.success('User added!'); setShowModal(false); fetchUsers(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('User deleted!'); fetchUsers(); }
  };

  const openAdd = () => {
    setForm({ name: '', email: '', role: 'student', status: 'active' });
    setEditUser(null);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setEditUser(u);
    setShowModal(true);
  };

  const exportCSV = () => {
    const csv = ['Name,Email,Role,Status,Created'].concat(
      users.map(u => `${u.name},${u.email},${u.role},${u.status},${u.created_at}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      bde: 'bg-blue-100 text-blue-700',
      trainer: 'bg-purple-100 text-purple-700',
      student: 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[role] || 'bg-gray-100'}`}>{role}</span>;
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all users in your platform</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      {user.name[0]}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">{roleBadge(user.role)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
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
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editUser ? 'Edit User' : 'Add New User'}</h2>
            <div className="space-y-3">
              <Input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="bde">BDE</option>
                <option value="trainer">Trainer</option>
                <option value="student">Student</option>
              </select>
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditUser(null); }}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}