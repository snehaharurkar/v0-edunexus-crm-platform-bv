"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Play, Users, Clock, IndianRupee, Search } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  trainer: string;
  price: number;
  duration: string;
  batches: number;
  status: string;
  video_url: string;
  thumbnail_url: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript basics for web development',
    trainer: 'John Doe',
    price: 5000,
    duration: '3 months',
    batches: 2,
    status: 'Active',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: ''
  },
  {
    id: '2',
    title: 'Advanced React',
    description: 'Master React hooks, context API, and state management',
    trainer: 'Jane Smith',
    price: 7500,
    duration: '2 months',
    batches: 1,
    status: 'Upcoming',
    video_url: '',
    thumbnail_url: ''
  },
  {
    id: '3',
    title: 'Full Stack Development',
    description: 'Build complete applications with Node.js and MongoDB',
    trainer: 'Mike Johnson',
    price: 10000,
    duration: '4 months',
    batches: 3,
    status: 'Active',
    video_url: '',
    thumbnail_url: ''
  }
];

const getYoutubeThumbnail = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-gray-100 text-gray-600',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', trainer: '', price: '',
    duration: '', batches: '1', status: 'Active', video_url: '', thumbnail_url: ''
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Use mock data for now - Supabase will be integrated when configured
      setCourses(mockCourses);
    } catch (error) {
      toast.error('Failed to load courses');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.trainer) return toast.error('Title and trainer are required');
    const payload = { ...form, price: Number(form.price), batches: Number(form.batches) };
    if (editCourse) {
      // Update in mock data
      setCourses(courses.map(c => c.id === editCourse.id ? { ...c, ...payload, id: c.id } : c));
      toast.success('Course updated!');
      setEditCourse(null);
      setShowModal(false);
    } else {
      // Add to mock data
      const newCourse: Course = { ...payload, id: String(Date.now()), batches: Number(form.batches), price: Number(form.price) };
      setCourses([newCourse, ...courses]);
      toast.success('Course added!');
      setShowModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    // Delete from mock data
    setCourses(courses.filter(c => c.id !== id));
    toast.success('Deleted!');
  };

  const openAdd = () => {
    setForm({ title: '', description: '', trainer: '', price: '', duration: '', batches: '1', status: 'Active', video_url: '', thumbnail_url: '' });
    setEditCourse(null);
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setForm({ title: c.title, description: c.description, trainer: c.trainer, price: String(c.price), duration: c.duration, batches: String(c.batches), status: c.status, video_url: c.video_url || '', thumbnail_url: c.thumbnail_url || '' });
    setEditCourse(c);
    setShowModal(true);
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.trainer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses and batches</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => {
            const thumb = getYoutubeThumbnail(course.video_url) || course.thumbnail_url;
            return (
              <div key={course.id} className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Play className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  {course.video_url && (
                    <a href={course.video_url} target="_blank" rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Play className="h-6 w-6 text-primary fill-primary" />
                      </div>
                    </a>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[course.status] || 'bg-gray-100'}`}>
                    {course.status}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">👤 {course.trainer}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.batches} batches</span>
                    <span className="flex items-center gap-1 text-primary font-semibold"><IndianRupee className="h-3 w-3" />{course.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(course)}>
                      <Pencil className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editCourse ? 'Edit Course' : 'Add New Course'}</h2>
            <div className="space-y-3">
              <Input placeholder="Course Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm min-h-[80px] resize-none" />
              <Input placeholder="Trainer Name" value={form.trainer} onChange={e => setForm({ ...form, trainer: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <Input placeholder="Duration (e.g. 3 months)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Batches" type="number" value={form.batches} onChange={e => setForm({ ...form, batches: e.target.value })} />
                <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Upcoming</option>
                  <option>Completed</option>
                </select>
              </div>
              <Input placeholder="YouTube Video URL (optional)" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} />
              <Input placeholder="Thumbnail URL (optional)" value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditCourse(null); }}>Cancel</Button>
              <Button onClick={handleSave}>Save Course</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
