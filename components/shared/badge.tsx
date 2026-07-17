"use client";

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'website'
  | 'google'
  | 'referral';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  destructive: 'bg-rose-100 text-rose-700',
  info: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-indigo-100 text-indigo-700',
  youtube: 'bg-red-100 text-red-700',
  website: 'bg-gray-100 text-gray-700',
  google: 'bg-amber-100 text-amber-700',
  referral: 'bg-emerald-100 text-emerald-700',
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Source badge helper
export function getSourceBadgeVariant(source: string): BadgeVariant {
  const sourceMap: Record<string, BadgeVariant> = {
    Instagram: 'instagram',
    Facebook: 'facebook',
    LinkedIn: 'linkedin',
    YouTube: 'youtube',
    Website: 'website',
    'Google Ads': 'google',
    Referral: 'referral',
  };
  return sourceMap[source] || 'default';
}

// AI Score badge helper
export function getAIScoreBadge(score: number): { variant: BadgeVariant; label: string } {
  if (score >= 71) return { variant: 'success', label: 'Hot' };
  if (score >= 41) return { variant: 'warning', label: 'Warm' };
  return { variant: 'destructive', label: 'Cold' };
}

// Status badge helper
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    Active: 'success',
    Completed: 'info',
    'On Hold': 'warning',
    Upcoming: 'info',
    Open: 'warning',
    'In Progress': 'info',
    Resolved: 'success',
    Closed: 'default',
    Pending: 'warning',
    Failed: 'destructive',
    Refunded: 'warning',
    'New Lead': 'info',
    Contacted: 'info',
    'Demo Scheduled': 'warning',
    Interested: 'success',
    'Follow-up': 'warning',
    'Payment Pending': 'warning',
    Converted: 'success',
    Lost: 'destructive',
  };
  return statusMap[status] || 'default';
}

// Priority badge helper
export function getPriorityBadgeVariant(priority: string): BadgeVariant {
  const priorityMap: Record<string, BadgeVariant> = {
    High: 'destructive',
    Medium: 'warning',
    Low: 'default',
    Hot: 'success',
    Warm: 'warning',
    Cold: 'destructive',
  };
  return priorityMap[priority] || 'default';
}

// Role badge helper
export function getRoleBadgeVariant(role: string): BadgeVariant {
  const roleMap: Record<string, BadgeVariant> = {
    admin: 'destructive',
    bde: 'info',
    trainer: 'success',
    executive: 'warning',
    student: 'default',
  };
  return roleMap[role] || 'default';
}
