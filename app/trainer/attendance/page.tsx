"use client";

import React, { useState, useEffect } from 'react';
import { mockStudents, mockClasses } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Download, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);

  const trainerClasses = mockClasses.filter(c => c.trainerId === '3');
  const classStudents = mockStudents.filter(s => s.courseId === '1').slice(0, 8);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      // Initialize attendance for all students
      const initialAttendance: Record<string, AttendanceStatus> = {};
      classStudents.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    }
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Attendance saved successfully');
    setIsSaving(false);
  };

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Email', 'Status'];
    const rows = classStudents.map((student, index) => [
      index + 1,
      student.name,
      student.email,
      attendance[student.id] || 'present',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedClass}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance exported to CSV');
  };

  // Calculate attendance stats
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;
  const totalStudents = classStudents.length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="h-12 w-64 skeleton rounded" />
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Mark and manage class attendance</p>
      </div>

      {/* Class Selector */}
      <div className="max-w-sm">
        <Label htmlFor="class">Select Class</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger id="class" className="mt-2">
            <SelectValue placeholder="Choose a class session" />
          </SelectTrigger>
          <SelectContent>
            {trainerClasses.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.title} - {cls.date} {cls.time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClass && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold mt-2">{totalStudents}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-emerald-600">{presentCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-600" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-rose-600">{absentCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Late</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-amber-600">{lateCount}</p>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Attendance Rate</span>
              <span className="text-sm font-bold text-primary">{attendanceRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Roll No</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Student Name</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Attendance %</th>
                  <th className="p-4 text-center text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-sm">{index + 1}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-card-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">{student.attendance}%</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {(['present', 'absent', 'late'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              attendance[student.id] === status
                                ? status === 'present'
                                  ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                                  : status === 'absent'
                                  ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500'
                                  : 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
