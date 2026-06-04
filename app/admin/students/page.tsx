"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Download, Search, Phone, Mail, TrendingUp } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  attendance: number;
  progress: number;
  status: string;
  points: number;
  joined_at: string;
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', course: '',
    batch: '', attendance: 0, progress: 0,
    status: 'Active', points: 0,
  });

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('joined_at', { ascending: false });
    if (error) toast.error('Failed to load students');
    else setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('students-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required');
    if (editStudent) {
      const { error } = await supabase.from('students').update(form).eq('id', editStudent.id);
      if (error) toast.error('Failed to update: ' + error.message);
      else { toast.success('Student updated!'); setEditStudent(null); setShowModal(false); fetchStudents(); }
    } else {
      const { error } = await supabase.from('students').insert([form]);
      if (error) toast.error('Failed to add: ' + error.message);
      else { toast.success('Student added!'); setShowModal(false); fetchStudents(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Student deleted!'); fetchStudents(); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('students').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update status');
    else { toast.success('Status updated!'); fetchStudents(); }
  };

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '', course: '', batch: '', attendance: 0, progress: 0, status: 'Active', points: 0 });
    setEditStudent(null);
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setForm({ name: s.name, email: s.email, phone: s.phone, course: s.course, batch: s.batch, attendance: s.attendance, progress: s.progress, status: s.status, points: s.points });
    setEditStudent(s);
    setShowModal(true);
  };

  const exportCSV = () => {
    const csv = ['Name,Email,Phone,Course,Batch,Attendance,Progress,Status,Points'].concat(
      filtered.map(s => `${s.name},${s.email},${s.phone},${s.course},${s.batch},${s.attendance}%,${s.progress}%,${s.status},${s.points}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click();
  };

  const courses = [...new Set(students.map(s => s.course).filter(Boolean))];

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    const matchCourse = filterCourse ? s.course === filterCourse : true;
    return matchSearch && matchStatus && matchCourse;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage all enrolled students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, course..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Active</option>
          <option>Completed</option>
          <option>On Hold</option>
        </select>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c}>{c}</option>)}
        </select>
        <Button variant="outline" onClick={() => { setSearch(''); setFilterStatus(''); setFilterCourse(''); }}>
          Clear
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: students.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active', count: students.filter(s => s.status === 'Active').length, color: 'bg-green-50 text-green-700' },
          { label: 'Completed', count: students.filter(s => s.status === 'Completed').length, color: 'bg-purple-50 text-purple-700' },
          { label: 'On Hold', count: students.filter(s => s.status === 'On Hold').length, color: 'bg-yellow-50 text-yellow-700' },
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
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Course / Batch</th>
              <th className="text-left px-4 py-3 font-medium">Progress</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Attendance</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Points</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                No students found. Click "Add Student" to enroll your first student!
              </td></tr>
            ) : filtered.map(student => (
              <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                      {student.name?.[0]}
                    </div>
                    <p className="font-medium">{student.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />{student.email}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{student.phone}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="font-medium text-sm">{student.course}</p>
                  <p className="text-xs text-muted-foreground">{student.batch}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                      <div
                        className={`h-1.5 rounded-full ${student.progress >= 80 ? 'bg-green-500' : student.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{student.attendance}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={student.status}
                    onChange={e => handleStatusChange(student.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[student.status] || 'bg-gray-100'}`}
                  >
                    <option>Active</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                  </select>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm font-medium text-primary">{student.points?.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
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
            <h2 className="text-lg font-semibold mb-4">{editStudent ? 'Edit Student' : 'Add New Student'}</h2>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Course Name" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
              <Input placeholder="Batch (e.g. Batch A - Morning)" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Attendance: {form.attendance}%</label>
                  <input type="range" min="0" max="100" value={form.attendance} onChange={e => setForm({ ...form, attendance: Number(e.target.value) })} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Progress: {form.progress}%</label>
                  <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
                <Input placeholder="Points" type="number" value={form.points} onChange={e => setForm({ ...form, points: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditStudent(null); }}>Cancel</Button>
              <Button onClick={handleSave}>Save Student</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}