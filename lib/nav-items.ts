import {
    LayoutDashboard,
    BookOpen,
    ClipboardCheck,
    Briefcase,
    Award,
    MessageSquare,
    User,
    FileText,
    Gift,
  } from 'lucide-react'
  import React from 'react'
  
  export const studentNavItems = [
    {
      label: 'Dashboard',
      href: '/student/dashboard',
      icon: React.createElement(LayoutDashboard, { className: 'h-5 w-5' }),
    },
    {
      label: 'Courses',
      href: '/student/courses',
      icon: React.createElement(BookOpen, { className: 'h-5 w-5' }),
    },
    {
      label: 'Attendance',
      href: '/student/attendance',
      icon: React.createElement(ClipboardCheck, { className: 'h-5 w-5' }),
    },
    {
      label: 'Jobs',
      href: '/student/jobs',
      icon: React.createElement(Briefcase, { className: 'h-5 w-5' }),
    },
    {
      label: 'Certificates',
      href: '/student/certificates',
      icon: React.createElement(Award, { className: 'h-5 w-5' }),
    },
    {
      label: 'AI Mentor',
      href: '/student/ai-mentor',
      icon: React.createElement(MessageSquare, { className: 'h-5 w-5' }),
    },
    {
      label: 'Resume Builder',
      href: '/student/resume-builder',
      icon: React.createElement(FileText, { className: 'h-5 w-5' }),
    },
    {
      label: 'Rewards',
      href: '/student/rewards',
      icon: React.createElement(Gift, { className: 'h-5 w-5' }),
    },
    {
      label: 'Support',
      href: '/student/support',
      icon: React.createElement(MessageSquare, { className: 'h-5 w-5' }),
    },
    {
      label: 'Profile',
      href: '/student/profile',
      icon: React.createElement(User, { className: 'h-5 w-5' }),
    },
  ]