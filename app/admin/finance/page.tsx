"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/shared/data-table';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge, getStatusBadgeVariant } from '@/components/shared/badge';
import { mockTransactions, type Transaction } from '@/lib/mock-data';
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
import { DollarSign, Clock, RotateCcw, FileText } from 'lucide-react';

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [gateway, setGateway] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = transactions.filter(t => {
    if (gateway !== 'all' && t.gateway !== gateway) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  // Calculate stats
  const totalRevenue = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = transactions
    .filter(t => t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (t: Transaction) => (
        <span className="text-sm">{new Date(t.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'studentName',
      label: 'Student',
      render: (t: Transaction) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {t.studentName.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{t.studentName}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (t: Transaction) => (
        <span className="font-semibold">₹{t.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'gateway',
      label: 'Gateway',
      render: (t: Transaction) => (
        <StatusBadge variant="default">{t.gateway}</StatusBadge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (t: Transaction) => (
        <StatusBadge variant={getStatusBadgeVariant(t.status)}>
          {t.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Invoice',
      render: () => (
        <Button variant="ghost" size="sm">
          <FileText className="h-4 w-4 mr-1" />
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance</h1>
        <p className="text-muted-foreground mt-1">Track payments and transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
          change={18}
          changeLabel="vs last month"
          icon={<DollarSign className="h-6 w-6" />}
          iconColor="bg-emerald-100 text-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Pending Payments"
          value={`₹${(pendingAmount / 1000).toFixed(0)}K`}
          change={-5}
          changeLabel="vs last month"
          icon={<Clock className="h-6 w-6" />}
          iconColor="bg-amber-100 text-amber-600"
          loading={loading}
        />
        <StatCard
          title="Refunds"
          value={`₹${(refundedAmount / 1000).toFixed(0)}K`}
          change={2}
          changeLabel="vs last month"
          icon={<RotateCcw className="h-6 w-6" />}
          iconColor="bg-rose-100 text-rose-600"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="gateway">Payment Gateway</Label>
            <Select value={gateway} onValueChange={setGateway}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="Razorpay">Razorpay</SelectItem>
                <SelectItem value="Stripe">Stripe</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setGateway('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        data={filteredTransactions}
        columns={columns}
        searchPlaceholder="Search transactions..."
        loading={loading}
        selectable
      />
    </div>
  );
}
