"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, getSourceBadgeVariant, getStatusBadgeVariant, getAIScoreBadge } from '@/components/shared/badge';
import { type Lead } from '@/lib/mock-data';
import { useLeads } from '@/contexts/lead-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Eye, Mail, MessageCircle, Send, Trash2, Upload } from 'lucide-react';

export default function MyLeadsPage() {
  const { leads, ready, importLeads, deleteLeads } = useLeads();
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const myLeads = leads.filter((lead) => lead.assignedBde === 'Rahul Sharma');

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const count = await importLeads(file, 'Rahul Sharma');
      toast.success(`${count} lead${count === 1 ? '' : 's'} imported successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not import that file.');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = (ids: string[]) => {
    if (!ids.length || !window.confirm(`Delete ${ids.length} lead${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    deleteLeads(ids);
    setSelectedLeads([]);
    toast.success(`${ids.length} lead${ids.length === 1 ? '' : 's'} deleted.`);
  };

  const columns = [
    { key: 'name', label: 'Lead', render: (lead: Lead) => <div><p className="font-medium">{lead.name}</p><p className="text-sm text-muted-foreground">{lead.phone}</p></div> },
    { key: 'email', label: 'Email' },
    { key: 'source', label: 'Source', render: (lead: Lead) => <StatusBadge variant={getSourceBadgeVariant(lead.source)}>{lead.source}</StatusBadge> },
    { key: 'courseInterest', label: 'Course Interest' },
    { key: 'status', label: 'Status', render: (lead: Lead) => <StatusBadge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</StatusBadge> },
    { key: 'aiScore', label: 'AI Score', render: (lead: Lead) => <StatusBadge variant={getAIScoreBadge(lead.aiScore).variant}>{lead.aiScore}%</StatusBadge> },
    {
      key: 'actions', label: 'Actions', render: (lead: Lead) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View lead" onClick={() => router.push(`/bde/lead/${lead.id}`)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Email" asChild><a href={`mailto:${lead.email}`}><Mail className="h-4 w-4" /></a></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" title="WhatsApp" asChild><a href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /></a></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600" title="Telegram" asChild><a href={`https://t.me/share/url?url=${encodeURIComponent(location.origin)}&text=${encodeURIComponent(`Hello ${lead.name}, this is EduNexus.`)}`} target="_blank" rel="noopener noreferrer"><Send className="h-4 w-4" /></a></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete lead" onClick={() => handleDelete([lead.id])}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">My Leads</h1><p className="text-muted-foreground mt-1">All leads assigned to you</p></div>
        <Button onClick={() => inputRef.current?.click()} disabled={importing}><Upload className="mr-2 h-4 w-4" />{importing ? 'Importing…' : 'Import Excel/CSV'}</Button>
      </div>
      <DataTable
        data={myLeads}
        columns={columns}
        searchPlaceholder="Search leads..."
        loading={!ready}
        selectable
        onSelectionChange={setSelectedLeads}
        actions={selectedLeads.length ? <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedLeads.map((lead) => lead.id))}><Trash2 className="mr-2 h-4 w-4" />Delete selected ({selectedLeads.length})</Button> : undefined}
      />
      <p className="text-xs text-muted-foreground">Import columns: name, email, phone; optional: course, source, priority, notes, assigned BDE.</p>
    </div>
  );
}
