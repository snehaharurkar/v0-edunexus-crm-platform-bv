import {
  Home,
  Users,
  BookOpen,
  BarChart2,
  Zap,
  DollarSign,
  Settings,
  LayoutDashboard,
  UserPlus,
  List,
  FileText,
  Calendar,
  CheckSquare,
  Upload,
  Sparkles,
  Briefcase,
  Award,
  Gift,
  HelpCircle,
  Mail,
  MessageSquare,
} from "lucide-react"

export const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { label: "Courses", href: "/admin/courses", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <BarChart2 className="h-5 w-5" /> },
  { label: "AI Settings", href: "/admin/ai-settings", icon: <Zap className="h-5 w-5" /> },
  { label: "Finance", href: "/admin/finance", icon: <DollarSign className="h-5 w-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
]

export const bdeNavItems = [
  { label: "Pipeline", href: "/bde/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Add Lead", href: "/bde/add-lead", icon: <UserPlus className="h-5 w-5" /> },
  { label: "My Leads", href: "/bde/my-leads", icon: <List className="h-5 w-5" /> },
  { label: "Emails", href: "/bde/emails", icon: <Mail className="h-5 w-5" /> },
  { label: "Student Queries", href: "/bde/queries", icon: <MessageSquare className="h-5 w-5" /> },
  { label: "Reports", href: "/bde/reports", icon: <FileText className="h-5 w-5" /> },
  { label: "Follow-ups", href: "/bde/follow-ups", icon: <Calendar className="h-5 w-5" /> },
]

export const trainerNavItems = [
  { label: "My Classes", href: "/trainer/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Attendance", href: "/trainer/attendance", icon: <CheckSquare className="h-5 w-5" /> },
  { label: "Students", href: "/trainer/students", icon: <Users className="h-5 w-5" /> },
  { label: "Student Queries", href: "/trainer/queries", icon: <MessageSquare className="h-5 w-5" /> },
  { label: "Content", href: "/trainer/content", icon: <Upload className="h-5 w-5" /> },
  { label: "AI Tools", href: "/trainer/ai-tools", icon: <Sparkles className="h-5 w-5" /> },
]

export const studentNavItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: <Home className="h-5 w-5" /> },
  { label: "My Courses", href: "/student/courses", icon: <BookOpen className="h-5 w-5" /> },
  { label: "AI Mentor", href: "/student/ai-mentor", icon: <Sparkles className="h-5 w-5" /> },
  { label: "Jobs", href: "/student/jobs", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Resume Builder", href: "/student/resume-builder", icon: <FileText className="h-5 w-5" /> },
  { label: "Certificates", href: "/student/certificates", icon: <Award className="h-5 w-5" /> },
  { label: "Rewards", href: "/student/rewards", icon: <Gift className="h-5 w-5" /> },
  { label: "Support", href: "/student/support", icon: <HelpCircle className="h-5 w-5" /> },
]
