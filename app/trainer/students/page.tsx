"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, getStatusBadgeVariant } from '@/components/shared/badge';
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  batch: string;
  attendance: number;
  progress: number;
  lastActive: string;
  last_active: string;
  status: string;
}

export default function TrainerStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching students:', error);
        // fallback to users table with role student
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .order('name', { ascending: true });
        setStudents(userData || []);
      } else {
        setStudents(data || []);
      }

      setLoading(false);
    };

    fetchStudents();

    // Real-time updates
    const channel = supabase
      .channel('trainer-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {student.name?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (student: Student) => (
        <span className="text-sm">{student.course || 'Not assigned'}</span>
      ),
    },
    {
      key: 'batch',
      label: 'Batch',
      render: (student: Student) => (
        <span className="text-sm">{student.batch || '—'}</span>
      ),
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (student: Student) => {
        const val = student.attendance || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${val >= 80 ? 'bg-emerald-500' : val >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${val}%` }}
              />
            </div>
            <span className="text-sm font-medium">{val}%</span>
          </div>
        );
      },
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (student: Student) => {
        const val = student.progress || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${val}%` }} />
            </div>
            <span className="text-sm font-medium">{val}%</span>
          </div>
        );
      },
    },
    {
      key: 'last_active',
      label: 'Last Active',
      render: (student: Student) => {
        const date = student.last_active || student.lastActive;
        return (
          <span className="text-sm">
            {date ? new Date(date).toLocaleDateString() : '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (student: Student) => (
        <StatusBadge variant={getStatusBadgeVariant(student.status)}>
          {student.status || 'Active'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Students</h1>
        <p className="text-muted-foreground mt-1">Students enrolled in your courses</p>
      </div>

      {students.length === 0 && !loading && (
        <div className="text-center py-12 border rounded-xl bg-card">
          <p className="text-muted-foreground">No students found</p>
          <p className="text-xs text-muted-foreground mt-1">Students will appear here once they enroll in your courses</p>
        </div>
      )}

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Search students..."
        loading={loading}
      />
    </div>
  );
}