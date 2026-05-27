"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, getStatusBadgeVariant } from '@/components/shared/badge';
import { mockStudents, type Student } from '@/lib/mock-data';

export default function TrainerStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter students for trainer's courses (React Mastery = courseId 1)
      setStudents(mockStudents.filter(s => s.courseId === '1'));
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {student.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'course', label: 'Course' },
    { key: 'batch', label: 'Batch' },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (student: Student) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${
                student.attendance >= 80 ? 'bg-emerald-500' :
                student.attendance >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${student.attendance}%` }}
            />
          </div>
          <span className="text-sm font-medium">{student.attendance}%</span>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (student: Student) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${student.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{student.progress}%</span>
        </div>
      ),
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      render: (student: Student) => (
        <span className="text-sm">{new Date(student.lastActive).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (student: Student) => (
        <StatusBadge variant={getStatusBadgeVariant(student.status)}>
          {student.status}
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

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Search students..."
        loading={loading}
      />
    </div>
  );
}
