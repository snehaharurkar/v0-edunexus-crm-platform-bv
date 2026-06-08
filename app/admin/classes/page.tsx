"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, Video, Users, Search, ExternalLink, Clock } from 'lucide-react';

interface ClassSession {
  id: string;
  title: string;
  batch: string;
  course_id: string;
  trainer_id: string;
  date: string;
  time: string;
  platform: string;
  meeting_link: string;
  description: string;
  student_count: number;
  created_at: string;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('date', { ascending: true });
    if (error) toast.error('Failed to load classes');
    else setClasses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('classes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
        fetchClasses();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const batches = [...new Set(classes.map(c => c.batch).filter(Boolean))];

  const filtered = classes.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.batch?.toLowerCase().includes(search.toLowerCase()) ||
      c.trainer_id?.toLowerCase().includes(search.toLowerCase());
    const matchBatch = filterBatch ? c.batch === filterBatch : true;
    return matchSearch && matchBatch;
  });

  const upcomingClasses = filtered.filter(c => new Date(c.date) >= new Date());
  const pastClasses = filtered.filter(c => new Date(c.date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classes Scheduled</h1>
          <p className="text-muted-foreground">View all classes scheduled by trainers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, batch, trainer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 bg-background text-sm"
          value={filterBatch}
          onChange={e => setFilterBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map(b => <option key={b}>{b}</option>)}
        </select>
        <Button variant="outline" onClick={() => { setSearch(''); setFilterBatch(''); }}>
          Clear
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Classes</p>
            <p className="text-2xl font-bold mt-1">{classes.length}</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full"><Calendar className="h-5 w-5" /></div>
        </div>
        <div className="bg-card rounded-xl border p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold mt-1 text-orange-600">{upcomingClasses.length}</p>
          </div>
          <div className="bg-orange-50 text-orange-600 p-3 rounded-full"><Clock className="h-5 w-5" /></div>
        </div>
        <div className="bg-card rounded-xl border p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Past Classes</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{pastClasses.length}</p>
          </div>
          <div className="bg-green-50 text-green-600 p-3 rounded-full"><Video className="h-5 w-5" /></div>
        </div>
      </div>

      {/* Upcoming Classes */}
      {upcomingClasses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming Classes</h2>
          <div className="grid gap-3">
            {upcomingClasses.map(cls => (
              <div key={cls.id} className="bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{cls.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2 text-sm text-muted-foreground">
                      <div>
                        <span className="text-xs font-medium text-foreground block">Batch</span>
                        {cls.batch}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">Date & Time</span>
                        {new Date(cls.date).toLocaleDateString()} at {cls.time}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">Platform</span>
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" /> {cls.platform}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">Trainer ID</span>
                        {cls.trainer_id}
                      </div>
                    </div>
                    {cls.description && (
                      <p className="text-xs text-muted-foreground mt-2">{cls.description}</p>
                    )}
                  </div>
                  {cls.meeting_link && (
                    <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-1" /> Join
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Classes */}
      {pastClasses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Past Classes</h2>
          <div className="grid gap-3">
            {pastClasses.map(cls => (
              <div key={cls.id} className="bg-card rounded-xl border p-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{cls.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2 text-sm text-muted-foreground">
                      <div>
                        <span className="text-xs font-medium text-foreground block">Batch</span>
                        {cls.batch}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">Date & Time</span>
                        {new Date(cls.date).toLocaleDateString()} at {cls.time}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">Platform</span>
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" /> {cls.platform}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-foreground block">Trainer ID</span>
                        {cls.trainer_id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border text-muted-foreground">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto opacity-50 mb-2" />
            <p className="font-medium">No classes found</p>
            <p className="text-sm">Classes scheduled by trainers will appear here</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Loading classes...
        </div>
      )}
    </div>
  );
}
