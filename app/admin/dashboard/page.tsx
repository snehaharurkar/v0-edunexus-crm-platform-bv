"use client";

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/shared/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { mockLeads, mockStudents, mockTransactions, mockTrainers } from '@/lib/mock-data';
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Award,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const totalLeads = mockLeads.length;
  const activeStudents = mockStudents.filter(s => s.status === 'Active').length;
  const revenueThisMonth = mockTransactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const convertedLeads = mockLeads.filter(l => l.status === 'Converted').length;
  const conversionRate = Math.round((convertedLeads / totalLeads) * 100);
  const totalPlacements = 195; // Mock number
  const activeTrainers = mockTrainers.filter(t => t.status === 'Active').length;

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      change: 12,
      changeLabel: 'vs last month',
      icon: <Users className="h-6 w-6" />,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Students',
      value: activeStudents,
      change: 8,
      changeLabel: 'vs last month',
      icon: <GraduationCap className="h-6 w-6" />,
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Revenue This Month',
      value: `₹${(revenueThisMonth / 1000).toFixed(0)}K`,
      change: 23,
      changeLabel: 'vs last month',
      icon: <DollarSign className="h-6 w-6" />,
      iconColor: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: 5,
      changeLabel: 'vs last month',
      icon: <TrendingUp className="h-6 w-6" />,
      iconColor: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Total Placements',
      value: totalPlacements,
      change: 18,
      changeLabel: 'vs last year',
      icon: <Award className="h-6 w-6" />,
      iconColor: 'bg-rose-100 text-rose-600',
    },
    {
      title: 'Active Trainers',
      value: activeTrainers,
      change: 0,
      changeLabel: 'no change',
      icon: <UserCheck className="h-6 w-6" />,
      iconColor: 'bg-indigo-100 text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your institute today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeLabel={stat.changeLabel}
            icon={stat.icon}
            iconColor={stat.iconColor}
            loading={loading}
          />
        ))}
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Leads</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {mockLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.courseInterest}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.aiScore >= 71
                        ? 'bg-emerald-100 text-emerald-700'
                        : lead.aiScore >= 41
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {lead.aiScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {mockTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{transaction.studentName}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-card-foreground">
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs ${
                        transaction.status === 'Completed'
                          ? 'text-emerald-600'
                          : transaction.status === 'Pending'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
