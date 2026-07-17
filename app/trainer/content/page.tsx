"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/badge';
import { Upload, Link2, FileText, Video, Code, Download, Trash2 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'pdf' | 'recording' | 'github';
  batch: string;
  uploadDate: string;
}

export default function TrainerContentPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('Batch A - Morning');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setContent([
        { id: '1', title: 'React Hooks Cheatsheet.pdf', type: 'pdf', batch: 'Batch A - Morning', uploadDate: '2024-03-25' },
        { id: '2', title: 'State Management Recording', type: 'recording', batch: 'Batch A - Morning', uploadDate: '2024-03-24' },
        { id: '3', title: 'Project Starter Code', type: 'github', batch: 'Batch A - Morning', uploadDate: '2024-03-23' },
        { id: '4', title: 'React Basics Notes.pdf', type: 'pdf', batch: 'Batch A - Evening', uploadDate: '2024-03-22' },
        { id: '5', title: 'JSX Deep Dive Recording', type: 'recording', batch: 'Batch B - Weekend', uploadDate: '2024-03-21' },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePdfUpload = () => {
    if (pdfFile) {
      const newContent: ContentItem = {
        id: String(content.length + 1),
        title: pdfFile.name,
        type: 'pdf',
        batch: selectedBatch,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setContent([newContent, ...content]);
      setPdfFile(null);
      toast.success('PDF uploaded successfully');
    }
  };

  const handleRecordingAdd = () => {
    if (recordingUrl) {
      const newContent: ContentItem = {
        id: String(content.length + 1),
        title: `Recording - ${new Date().toLocaleDateString()}`,
        type: 'recording',
        batch: selectedBatch,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setContent([newContent, ...content]);
      setRecordingUrl('');
      toast.success('Recording link added successfully');
    }
  };

  const handleGithubAdd = () => {
    if (githubUrl) {
      const newContent: ContentItem = {
        id: String(content.length + 1),
        title: `GitHub Repository`,
        type: 'github',
        batch: selectedBatch,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setContent([newContent, ...content]);
      setGithubUrl('');
      toast.success('GitHub link added successfully');
    }
  };

  const handleDelete = (id: string) => {
    setContent(content.filter(c => c.id !== id));
    toast.success('Content deleted');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-rose-500" />;
      case 'recording': return <Video className="h-5 w-5 text-blue-500" />;
      case 'github': return <Code className="h-5 w-5 text-gray-700" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'pdf': return <StatusBadge variant="destructive">PDF</StatusBadge>;
      case 'recording': return <StatusBadge variant="info">Recording</StatusBadge>;
      case 'github': return <StatusBadge variant="default">GitHub</StatusBadge>;
      default: return <StatusBadge variant="default">{type}</StatusBadge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-48 skeleton rounded-xl" />
          <div className="h-48 skeleton rounded-xl" />
          <div className="h-48 skeleton rounded-xl" />
        </div>
        <div className="h-64 skeleton rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Library</h1>
        <p className="text-muted-foreground mt-1">Upload and manage course materials</p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Upload */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold text-card-foreground">Upload PDF</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Batch A - Morning">Batch A - Morning</SelectItem>
                  <SelectItem value="Batch A - Evening">Batch A - Evening</SelectItem>
                  <SelectItem value="Batch B - Weekend">Batch B - Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf">PDF File</Label>
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handlePdfUpload} disabled={!pdfFile} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>
        </div>

        {/* Recording URL */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-card-foreground">Recording URL</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recording">Recording Link</Label>
              <Input
                id="recording"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                placeholder="https://zoom.us/rec/..."
              />
            </div>
            <Button onClick={handleRecordingAdd} disabled={!recordingUrl} className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              Add Recording
            </Button>
          </div>
        </div>

        {/* GitHub URL */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold text-card-foreground">GitHub Link</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github">Repository URL</Label>
              <Input
                id="github"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <Button onClick={handleGithubAdd} disabled={!githubUrl} className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              Add Repository
            </Button>
          </div>
        </div>
      </div>

      {/* Content Library Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">All Content</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Title</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Batch</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Uploaded</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map(item => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <span className="font-medium">{item.title}</span>
                  </div>
                </td>
                <td className="p-4">{getTypeBadge(item.type)}</td>
                <td className="p-4 text-sm">{item.batch}</td>
                <td className="p-4 text-sm">{new Date(item.uploadDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
