"use client";

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/shared/stat-card';
import { mockLeads } from '@/lib/mock-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Phone, UserCheck, TrendingUp } from 'lucide-react';

export default function BDEReportsPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats for current BDE (mock: Rahul Sharma)
  const myLeads = mockLeads.filter(l => l.assignedBde === 'Rahul Sharma');
  const totalAssigned = myLeads.length;
  const contacted = myLeads.filter(l => l.status !== 'New Lead').length;
  const converted = myLeads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalAssigned > 0 ? Math.round((converted / totalAssigned) * 100) : 0;

  // Mock data for charts
  const leadsByStatus = [
    { status: 'New Lead', count: myLeads.filter(l => l.status === 'New Lead').length },
    { status: 'Contacted', count: myLeads.filter(l => l.status === 'Contacted').length },
    { status: 'Demo', count: myLeads.filter(l => l.status === 'Demo Scheduled').length },
    { status: 'Interested', count: myLeads.filter(l => l.status === 'Interested').length },
    { status: 'Follow-up', count: myLeads.filter(l => l.status === 'Follow-up').length },
    { status: 'Payment', count: myLeads.filter(l => l.status === 'Payment Pending').length },
    { status: 'Converted', count: myLeads.filter(l => l.status === 'Converted').length },
    { status: 'Lost', count: myLeads.filter(l => l.status === 'Lost').length },
  ];

  const weeklyActivity = [
    { day: 'Mon', calls: 12, emails: 8, demos: 2 },
    { day: 'Tue', calls: 15, emails: 10, demos: 3 },
    { day: 'Wed', calls: 10, emails: 12, demos: 1 },
    { day: 'Thu', calls: 18, emails: 15, demos: 4 },
    { day: 'Fri', calls: 14, emails: 9, demos: 2 },
    { day: 'Sat', calls: 8, emails: 5, demos: 1 },
    { day: 'Sun', calls: 3, emails: 2, demos: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Reports</h1>
          <p className="text-muted-foreground mt-1">Track your performance and activity</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Leads Assigned"
          value={totalAssigned}
          change={8}
          changeLabel="vs last period"
          icon={<Users className="h-6 w-6" />}
          iconColor="bg-blue-100 text-blue-600"
          loading={loading}
        />
        <StatCard
          title="Contacted"
          value={contacted}
          change={12}
          changeLabel="vs last period"
          icon={<Phone className="h-6 w-6" />}
          iconColor="bg-emerald-100 text-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Converted"
          value={converted}
          change={5}
          changeLabel="vs last period"
          icon={<UserCheck className="h-6 w-6" />}
          iconColor="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          change={3}
          changeLabel="vs last period"
          icon={<TrendingUp className="h-6 w-6" />}
          iconColor="bg-amber-100 text-amber-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Status */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">My Leads by Status</h3>
          {loading ? (
            <div className="h-64 skeleton rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Activity */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Weekly Activity</h3>
          {loading ? (
            <div className="h-64 skeleton rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="calls" stroke="hsl(var(--success))" strokeWidth={2} name="Calls" />
                <Line type="monotone" dataKey="emails" stroke="hsl(var(--primary))" strokeWidth={2} name="Emails" />
                <Line type="monotone" dataKey="demos" stroke="hsl(var(--warning))" strokeWidth={2} name="Demos" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
