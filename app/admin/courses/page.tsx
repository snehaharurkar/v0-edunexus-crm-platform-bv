"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import { StatusBadge, getStatusBadgeVariant } from '@/components/shared/badge';
import { mockCourses, mockTrainers, type Course } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    trainerId: '',
    status: 'Active' as Course['status'],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        duration: course.duration,
        price: String(course.price),
        trainerId: course.trainerId,
        status: course.status,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        duration: '',
        price: '',
        trainerId: '',
        status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const trainer = mockTrainers.find(t => t.id === formData.trainerId);

    if (editingCourse) {
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? {
              ...c,
              title: formData.title,
              description: formData.description,
              duration: formData.duration,
              price: Number(formData.price),
              trainerId: formData.trainerId,
              trainer: trainer?.name || '',
              status: formData.status,
            }
          : c
      ));
      toast.success('Course updated successfully');
    } else {
      const newCourse: Course = {
        id: String(courses.length + 1),
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        price: Number(formData.price),
        trainerId: formData.trainerId,
        trainer: trainer?.name || '',
        batches: 1,
        status: formData.status,
      };
      setCourses([...courses, newCourse]);
      toast.success('Course created successfully');
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = (course: Course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      setCourses(courses.filter(c => c.id !== course.id));
      toast.success('Course deleted successfully');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Course Title',
      render: (course: Course) => (
        <div>
          <p className="font-medium">{course.title}</p>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {course.description}
          </p>
        </div>
      ),
    },
    { key: 'trainer', label: 'Trainer' },
    {
      key: 'price',
      label: 'Price',
      render: (course: Course) => (
        <span className="font-medium">₹{course.price.toLocaleString()}</span>
      ),
    },
    { key: 'duration', label: 'Duration' },
    {
      key: 'batches',
      label: 'Batches',
      render: (course: Course) => (
        <span className="font-medium">{course.batches}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (course: Course) => (
        <StatusBadge variant={getStatusBadgeVariant(course.status)}>
          {course.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleOpenModal(course)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDelete(course)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage all courses and batches</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <DataTable
        data={courses}
        columns={columns}
        searchPlaceholder="Search courses..."
        loading={loading}
        selectable
      />

      {/* Add/Edit Course Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        description={editingCourse ? 'Update course information' : 'Create a new course'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter course description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 3 months"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trainer">Assign Trainer</Label>
              <Select
                value={formData.trainerId}
                onValueChange={(value) => setFormData({ ...formData, trainerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trainer" />
                </SelectTrigger>
                <SelectContent>
                  {mockTrainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Course['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
