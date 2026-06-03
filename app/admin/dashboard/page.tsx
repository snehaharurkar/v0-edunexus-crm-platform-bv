"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/shared/stat-card';
import { ExcelImport } from '@/components/shared/excel-import'
import Link from 'next/link';
import {
  Users, GraduationCap, DollarSign, TrendingUp,
  Award, UserCheck, AlertCircle, BookOpen, Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeStudents: 0,
    revenueThisMonth: 0,
    conversionRate: 0,
    totalCourses: 0,
    activeTrainers: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [newLeadsToday, setNewLeadsToday] = useState(0);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        { data: leads },
        { data: students },
        { data: transactions },
        { data: trainers },
        { data: courses },
      ] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('users').select('*').eq('role', 'trainer'),
        supabase.from('courses').select('*'),
      ]);

      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(l => l.status === 'Converted').length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
      const activeStudents = students?.filter(s => s.status === 'Active').length || 0;
      const activeTrainers = trainers?.filter(t => t.status === 'active').length || 0;
      const totalCourses = courses?.length || 0;
      const pending = transactions?.filter(t => t.status === 'Pending').length || 0;
      const todayLeads = leads?.filter(l => l.created_at?.startsWith(today)).length || 0;

      const revenueThisMonth = transactions
        ?.filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({ totalLeads, activeStudents, revenueThisMonth, conversionRate, totalCourses, activeTrainers });
      setRecentLeads(leads?.slice(0, 5) || []);
      setRecentTransactions(transactions?.slice(0, 5) || []);
      setPendingPayments(pending);
      setNewLeadsToday(todayLeads);

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: <Users className="h-6 w-6" />, iconColor: 'bg-blue-100 text-blue-600', href: '/admin/leads' },
    { title: 'Active Students', value: stats.activeStudents, icon: <GraduationCap className="h-6 w-6" />, iconColor: 'bg-emerald-100 text-emerald-600', href: '/admin/students' },
    { title: 'Revenue', value: `₹${(stats.revenueThisMonth / 1000).toFixed(0)}K`, icon: <DollarSign className="h-6 w-6" />, iconColor: 'bg-amber-100 text-amber-600', href: '/admin/finance' },
    { title: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: <TrendingUp className="h-6 w-6" />, iconColor: 'bg-purple-100 text-purple-600', href: '/admin/leads' },
    { title: 'Total Courses', value: stats.totalCourses, icon: <BookOpen className="h-6 w-6" />, iconColor: 'bg-rose-100 text-rose-600', href: '/admin/courses' },
    { title: 'Active Trainers', value: stats.activeTrainers, icon: <UserCheck className="h-6 w-6" />, iconColor: 'bg-indigo-100 text-indigo-600', href: '/admin/users' },
  ];

  const priorityColor = (priority: string) => {
    if (priority === 'Hot') return 'bg-red-100 text-red-700'
    if (priority === 'Warm') return 'bg-yellow-100 text-yellow-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          Refresh
        </button>
      </div>

      {/* Alert Banners */}
      {!loading && (pendingPayments > 0 || newLeadsToday > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingPayments > 0 && (
            <Link href="/admin/finance" className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 hover:bg-yellow-100 transition-colors">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span><strong>{pendingPayments}</strong> pending payment{pendingPayments > 1 ? 's' : ''} need attention</span>
            </Link>
          )}
          {newLeadsToday > 0 && (
            <Link href="/admin/leads" className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 hover:bg-blue-100 transition-colors">
              <Users className="h-4 w-4 text-blue-600" />
              <span><strong>{newLeadsToday}</strong> new lead{newLeadsToday > 1 ? 's' : ''} today</span>
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={0}
              changeLabel=""
              icon={stat.icon}
              iconColor={stat.iconColor}
              loading={loading}
            />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leads yet</p>
              <Link href="/admin/leads" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add first lead
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                      {lead.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.course_interest}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{lead.ai_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">Add New Lead</h1>
  <ExcelImport />
</div>

        {/* Recent Transactions */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link href="/admin/finance" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-10">
              <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-semibold">
                      {t.student_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.student_name}</p>
                      <p className="text-xs text-muted-foreground">{t.date} · {t.gateway}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{(t.amount || 0).toLocaleString()}</p>
                    <span className={`text-xs font-medium ${
                      t.status === 'Completed' ? 'text-emerald-600' :
                      t.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {t.status}
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