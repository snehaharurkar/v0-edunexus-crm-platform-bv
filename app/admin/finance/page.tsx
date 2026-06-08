"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, TrendingUp, TrendingDown, DollarSign, Search, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  student_name: string;
  student_email?: string;
  student_phone?: string;
  course_id?: string;
  amount: number;
  gateway: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-600',
};

const gatewayColors: Record<string, string> = {
  UPI: 'bg-purple-100 text-purple-700',
  PhonePe: 'bg-indigo-100 text-indigo-700',
  Paytm: 'bg-blue-100 text-blue-700',
  PayPal: 'bg-sky-100 text-sky-700',
  Bitcoin: 'bg-orange-100 text-orange-700',
  Razorpay: 'bg-emerald-100 text-emerald-700',
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGateway, setFilterGateway] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) toast.error('Failed to load transactions');
    else setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTransactions)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = transactions.filter(t => {
    const matchSearch = !search ||
      t.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.student_phone?.includes(search);
    const matchGateway = !filterGateway || t.gateway === filterGateway;
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchFrom = !fromDate || t.date >= fromDate;
    const matchTo = !toDate || t.date <= toDate;
    return matchSearch && matchGateway && matchStatus && matchFrom && matchTo;
  });

  const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((s, t) => s + Number(t.amount), 0);
  const pending = transactions.filter(t => t.status === 'Pending').reduce((s, t) => s + Number(t.amount), 0);
  const refunds = transactions.filter(t => t.status === 'Refunded').reduce((s, t) => s + Number(t.amount), 0);
  const failed = transactions.filter(t => t.status === 'Failed').length;

  // Gateway breakdown
  const gateways = ['UPI', 'PhonePe', 'Paytm', 'PayPal', 'Razorpay', 'Bitcoin'];
  const gatewayBreakdown = gateways.map(g => ({
    name: g,
    count: transactions.filter(t => t.gateway === g).length,
    amount: transactions.filter(t => t.gateway === g && t.status === 'Completed').reduce((s, t) => s + Number(t.amount), 0),
  })).filter(g => g.count > 0);

  const downloadInvoice = (t: Transaction) => {
    const invoiceId = `INV-${t.id.slice(0, 8).toUpperCase()}`;
    const content = `
════════════════════════════════════════
           EDUNEXUS TRAINING INSTITUTE
              PAYMENT INVOICE
════════════════════════════════════════
Invoice ID    : ${invoiceId}
Date          : ${t.date}
Generated At  : ${new Date().toLocaleString()}
────────────────────────────────────────
STUDENT DETAILS
────────────────────────────────────────
Name          : ${t.student_name}
Email         : ${t.student_email || 'N/A'}
Phone         : ${t.student_phone || 'N/A'}
────────────────────────────────────────
PAYMENT DETAILS
────────────────────────────────────────
Amount        : ₹${Number(t.amount).toLocaleString()}
Payment Mode  : ${t.gateway}
Status        : ${t.status}
Transaction ID: ${t.id}
────────────────────────────────────────
Thank you for choosing EduNexus!
For support: support@edunexus.com
════════════════════════════════════════
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceId}-${t.student_name.replace(' ', '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded!');
  };

  const exportCSV = () => {
    const headers = 'Date,Student Name,Email,Phone,Amount,Gateway,Status,Transaction ID';
    const rows = filtered.map(t =>
      `${t.date},"${t.student_name}","${t.student_email || ''}","${t.student_phone || ''}",${t.amount},${t.gateway},${t.status},${t.id}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance</h1>
          <p className="text-muted-foreground">Track payments and transactions</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: <DollarSign className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-50', sub: `${transactions.filter(t => t.status === 'Completed').length} completed` },
          { label: 'Pending Payments', value: `₹${(pending / 1000).toFixed(0)}K`, icon: <TrendingDown className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50', sub: `${transactions.filter(t => t.status === 'Pending').length} pending` },
          { label: 'Refunds', value: `₹${(refunds / 1000).toFixed(0)}K`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-red-500', bg: 'bg-red-50', sub: `${transactions.filter(t => t.status === 'Refunded').length} refunded` },
          { label: 'Failed', value: failed.toString(), icon: <TrendingDown className="h-5 w-5" />, color: 'text-gray-600', bg: 'bg-gray-100', sub: 'failed transactions' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
            <div className={`${stat.bg} ${stat.color} p-3 rounded-full`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Gateway Breakdown */}
      {gatewayBreakdown.length > 0 && (
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Payment Gateway Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {gatewayBreakdown.map(g => (
              <div key={g.name} className="rounded-lg border p-3 text-center">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${gatewayColors[g.name] || 'bg-gray-100 text-gray-700'}`}>
                  {g.name}
                </span>
                <p className="text-lg font-bold mt-2">{g.count}</p>
                <p className="text-xs text-muted-foreground">transactions</p>
                <p className="text-sm font-medium text-green-600 mt-1">₹{(g.amount / 1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card rounded-xl border p-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" />
        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" />
        <select
          className="border rounded-lg px-3 py-2 bg-background text-sm"
          value={filterGateway}
          onChange={e => setFilterGateway(e.target.value)}
        >
          <option value="">All Gateways</option>
          {gateways.map(g => <option key={g}>{g}</option>)}
        </select>
        <select
          className="border rounded-lg px-3 py-2 bg-background text-sm"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          {['Completed', 'Pending', 'Failed', 'Refunded'].map(s => <option key={s}>{s}</option>)}
        </select>
        <Button variant="outline" onClick={() => { setFromDate(''); setToDate(''); setFilterGateway(''); setFilterStatus(''); setSearch(''); }}>
          Clear
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of <strong>{transactions.length}</strong> transactions
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Gateway</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.date}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{t.student_name}</p>
                  <p className="text-xs text-muted-foreground">{t.id.slice(0, 8).toUpperCase()}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs">{t.student_email || '—'}</p>
                  <p className="text-xs text-muted-foreground">{t.student_phone || '—'}</p>
                </td>
                <td className="px-4 py-3 font-semibold">₹{Number(t.amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${gatewayColors[t.gateway] || 'bg-gray-100 text-gray-600'}`}>
                    {t.gateway}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => downloadInvoice(t)}
                    className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}