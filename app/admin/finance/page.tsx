"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
// import PaymentButton from '@/components/shared/PaymentButton';

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
}

const statusColors: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-600',
};

// Mock transaction data
const mockTransactions: Transaction[] = [
  { id: '1', date: '2026-05-28', student_name: 'John Doe', amount: 5000, gateway: 'UPI', status: 'Completed' },
  { id: '2', date: '2026-05-27', student_name: 'Jane Smith', amount: 7500, gateway: 'PhonePe', status: 'Completed' },
  { id: '3', date: '2026-05-26', student_name: 'Rajesh Kumar', amount: 3000, gateway: 'Paytm', status: 'Pending' },
  { id: '4', date: '2026-05-25', student_name: 'Priya Singh', amount: 10000, gateway: 'UPI', status: 'Completed' },
  { id: '5', date: '2026-05-24', student_name: 'Amit Patel', amount: 5000, gateway: 'PayPal', status: 'Failed' },
  { id: '6', date: '2026-05-23', student_name: 'Sneha Roy', amount: 6000, gateway: 'Bitcoin', status: 'Refunded' },
];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGateway, setFilterGateway] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Use mock data for now until Supabase is configured
      setTransactions(mockTransactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const filtered = transactions.filter(t => {
    const matchSearch = t.student_name?.toLowerCase().includes(search.toLowerCase());
    const matchGateway = filterGateway ? t.gateway === filterGateway : true;
    const matchFrom = fromDate ? t.date >= fromDate : true;
    const matchTo = toDate ? t.date <= toDate : true;
    return matchSearch && matchGateway && matchFrom && matchTo;
  });

  const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'Pending').reduce((s, t) => s + t.amount, 0);
  const refunds = transactions.filter(t => t.status === 'Refunded').reduce((s, t) => s + t.amount, 0);

  const downloadInvoice = (t: Transaction) => {
    const content = `
EDUNEXUS - PAYMENT INVOICE
===========================
Invoice ID  : INV-${t.id.slice(0, 8).toUpperCase()}
Date        : ${t.date}
Student     : ${t.student_name}
Amount      : ₹${t.amount.toLocaleString()}
Gateway     : ${t.gateway}
Status      : ${t.status}
===========================
Thank you for your payment!
EduNexus Training Institute
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${t.student_name.replace(' ', '_')}-${t.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded!');
  };

  const exportCSV = () => {
    const csv = ['Date,Student,Amount,Gateway,Status'].concat(
      filtered.map(t => `${t.date},${t.student_name},${t.amount},${t.gateway},${t.status}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-muted-foreground">Track payments and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: totalRevenue, icon: <DollarSign className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-50', trend: '+18%' },
          { label: 'Pending Payments', value: pending, icon: <TrendingDown className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: '-5%' },
          { label: 'Refunds', value: refunds, icon: <TrendingUp className="h-5 w-5" />, color: 'text-red-500', bg: 'bg-red-50', trend: '+2%' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">₹{(stat.value / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend} vs last month</p>
            </div>
            <div className={`${stat.bg} ${stat.color} p-3 rounded-full`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" />
        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" />
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={filterGateway} onChange={e => setFilterGateway(e.target.value)}>
          <option value="">All Gateways</option>
          {['UPI', 'PhonePe', 'Paytm', 'PayPal', 'Bitcoin'].map(g => <option key={g}>{g}</option>)}
        </select>
        <Button variant="outline" onClick={() => { setFromDate(''); setToDate(''); setFilterGateway(''); }}>Clear Filters</Button>
        <Button variant="outline" onClick={exportCSV} className="ml-auto"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Gateway</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Invoice</th>
              <th className="text-left px-4 py-3 font-medium">Collect Payment</th>  {/* ← NEW */}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-3 font-medium">{t.student_name}</td>
                <td className="px-4 py-3 font-semibold">₹{t.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.gateway}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => downloadInvoice(t)}
                    className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </td>
                {/* ← NEW: Only show Pay button for Pending transactions */}
                <td className="px-4 py-3">
                {t.status === 'Pending' ? (
  <span className="text-xs text-indigo-600 font-medium">Pay ₹{t.amount}</span>
) : (
  <span className="text-xs text-muted-foreground">—</span>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
