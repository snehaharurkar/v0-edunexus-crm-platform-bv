// Mock data for EduNexus CRM

export type UserRole = 'admin' | 'bde' | 'trainer' | 'executive' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Website' | 'Google Ads' | 'Referral';
  courseInterest: string;
  status: 'New Lead' | 'Contacted' | 'Demo Scheduled' | 'Interested' | 'Follow-up' | 'Payment Pending' | 'Converted' | 'Lost';
  aiScore: number;
  priority: 'Hot' | 'Warm' | 'Cold';
  assignedBde: string;
  lastContact: string;
  notes: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  trainer: string;
  trainerId: string;
  price: number;
  duration: string;
  batches: number;
  status: 'Active' | 'Upcoming' | 'Completed';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  courseId: string;
  batch: string;
  attendance: number;
  progress: number;
  lastActive: string;
  status: 'Active' | 'Completed' | 'On Hold';
  points: number;
  joinedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  courses: string[];
  rating: number;
  status: 'Active' | 'On Leave';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  url: string;
  deadline: string;
  postedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  amount: number;
  gateway: 'Razorpay' | 'Stripe' | 'PayPal' | 'Bank Transfer';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
}

export interface Ticket {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  category: 'Technical' | 'Payment' | 'Course' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  description: string;
  createdAt: string;
  messages: { sender: string; message: string; timestamp: string }[];
}

export interface Certificate {
  id: string;
  studentId: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
}

export interface ClassSession {
  id: string;
  title: string;
  batch: string;
  courseId: string;
  trainerId: string;
  date: string;
  time: string;
  platform: 'Zoom' | 'Google Meet';
  meetingLink: string;
  description: string;
  studentCount: number;
}

export interface Notification {
  id: string;
  type: 'lead' | 'payment' | 'class' | 'ticket' | 'job';
  message: string;
  timestamp: string;
  read: boolean;
}

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@test.com', role: 'admin', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Rahul Sharma', email: 'bde@test.com', role: 'bde', status: 'active', createdAt: '2024-02-01' },
  { id: '3', name: 'Priya Verma', email: 'trainer@test.com', role: 'trainer', status: 'active', createdAt: '2024-01-20' },
  { id: '4', name: 'Amit Kumar', email: 'executive@test.com', role: 'executive', status: 'active', createdAt: '2024-03-01' },
  { id: '5', name: 'Sneha Patel', email: 'student@test.com', role: 'student', status: 'active', createdAt: '2024-03-15' },
  { id: '6', name: 'Vikram Singh', email: 'vikram@test.com', role: 'bde', status: 'active', createdAt: '2024-02-10' },
  { id: '7', name: 'Anjali Gupta', email: 'anjali@test.com', role: 'trainer', status: 'active', createdAt: '2024-02-15' },
  { id: '8', name: 'Ravi Patel', email: 'ravi@test.com', role: 'trainer', status: 'on leave', createdAt: '2024-01-25' },
  { id: '9', name: 'Neha Singh', email: 'neha@test.com', role: 'student', status: 'active', createdAt: '2024-03-20' },
  { id: '10', name: 'Arjun Reddy', email: 'arjun@test.com', role: 'student', status: 'active', createdAt: '2024-03-25' },
];

// Mock Trainers
export const mockTrainers: Trainer[] = [
  { id: '3', name: 'Priya Verma', email: 'trainer@test.com', expertise: ['React', 'JavaScript', 'Node.js'], courses: ['React Mastery', 'Full Stack Development'], rating: 4.8, status: 'Active' },
  { id: '7', name: 'Anjali Gupta', email: 'anjali@test.com', expertise: ['Python', 'Machine Learning', 'Data Science'], courses: ['Python Programming', 'Data Science Bootcamp'], rating: 4.9, status: 'Active' },
  { id: '8', name: 'Ravi Patel', email: 'ravi@test.com', expertise: ['Java', 'Spring Boot', 'Microservices'], courses: ['Java Enterprise'], rating: 4.7, status: 'On Leave' },
];

// Mock Courses
export const mockCourses: Course[] = [
  { id: '1', title: 'React Mastery', description: 'Complete React course from basics to advanced', trainer: 'Priya Verma', trainerId: '3', price: 15000, duration: '3 months', batches: 3, status: 'Active' },
  { id: '2', title: 'Python Programming', description: 'Learn Python from scratch', trainer: 'Anjali Gupta', trainerId: '7', price: 12000, duration: '2 months', batches: 2, status: 'Active' },
  { id: '3', title: 'Data Science Bootcamp', description: 'Comprehensive data science program', trainer: 'Anjali Gupta', trainerId: '7', price: 25000, duration: '6 months', batches: 1, status: 'Active' },
  { id: '4', title: 'Java Enterprise', description: 'Java development for enterprise applications', trainer: 'Ravi Patel', trainerId: '8', price: 18000, duration: '4 months', batches: 2, status: 'Upcoming' },
  { id: '5', title: 'Full Stack Development', description: 'Complete MERN stack development', trainer: 'Priya Verma', trainerId: '3', price: 30000, duration: '6 months', batches: 2, status: 'Active' },
];

// Mock Leads
export const mockLeads: Lead[] = [
  { id: '1', name: 'Aditya Kumar', email: 'aditya@gmail.com', phone: '+91 98765 43210', source: 'Instagram', courseInterest: 'React Mastery', status: 'New Lead', aiScore: 85, priority: 'Hot', assignedBde: 'Rahul Sharma', lastContact: '2024-03-28', notes: 'Very interested, asked about placement support', createdAt: '2024-03-27' },
  { id: '2', name: 'Meera Joshi', email: 'meera@gmail.com', phone: '+91 87654 32109', source: 'Facebook', courseInterest: 'Data Science Bootcamp', status: 'Contacted', aiScore: 72, priority: 'Warm', assignedBde: 'Rahul Sharma', lastContact: '2024-03-26', notes: 'Budget concerns, may need EMI option', createdAt: '2024-03-25' },
  { id: '3', name: 'Karthik R', email: 'karthik@gmail.com', phone: '+91 76543 21098', source: 'LinkedIn', courseInterest: 'Full Stack Development', status: 'Demo Scheduled', aiScore: 92, priority: 'Hot', assignedBde: 'Vikram Singh', lastContact: '2024-03-28', notes: 'Demo scheduled for tomorrow 3 PM', createdAt: '2024-03-24' },
  { id: '4', name: 'Divya Nair', email: 'divya@gmail.com', phone: '+91 65432 10987', source: 'Google Ads', courseInterest: 'Python Programming', status: 'Interested', aiScore: 68, priority: 'Warm', assignedBde: 'Rahul Sharma', lastContact: '2024-03-25', notes: 'Working professional, wants weekend batches', createdAt: '2024-03-23' },
  { id: '5', name: 'Rohan Mehta', email: 'rohan@gmail.com', phone: '+91 54321 09876', source: 'Referral', courseInterest: 'React Mastery', status: 'Payment Pending', aiScore: 95, priority: 'Hot', assignedBde: 'Vikram Singh', lastContact: '2024-03-27', notes: 'Referred by Sneha, payment expected by Friday', createdAt: '2024-03-20' },
  { id: '6', name: 'Ananya Iyer', email: 'ananya@gmail.com', phone: '+91 43210 98765', source: 'Website', courseInterest: 'Data Science Bootcamp', status: 'Follow-up', aiScore: 55, priority: 'Cold', assignedBde: 'Rahul Sharma', lastContact: '2024-03-22', notes: 'Need to follow up about course details', createdAt: '2024-03-18' },
  { id: '7', name: 'Sanjay Gupta', email: 'sanjay@gmail.com', phone: '+91 32109 87654', source: 'YouTube', courseInterest: 'Java Enterprise', status: 'Converted', aiScore: 88, priority: 'Hot', assignedBde: 'Vikram Singh', lastContact: '2024-03-28', notes: 'Enrolled successfully!', createdAt: '2024-03-15' },
  { id: '8', name: 'Pooja Sharma', email: 'pooja@gmail.com', phone: '+91 21098 76543', source: 'Instagram', courseInterest: 'Full Stack Development', status: 'Lost', aiScore: 35, priority: 'Cold', assignedBde: 'Rahul Sharma', lastContact: '2024-03-10', notes: 'Chose competitor institute', createdAt: '2024-03-05' },
  { id: '9', name: 'Varun Reddy', email: 'varun@gmail.com', phone: '+91 10987 65432', source: 'Facebook', courseInterest: 'React Mastery', status: 'New Lead', aiScore: 78, priority: 'Warm', assignedBde: 'Vikram Singh', lastContact: '2024-03-28', notes: 'Fresh graduate, looking for career switch', createdAt: '2024-03-28' },
  { id: '10', name: 'Nisha Agarwal', email: 'nisha@gmail.com', phone: '+91 09876 54321', source: 'LinkedIn', courseInterest: 'Python Programming', status: 'Contacted', aiScore: 65, priority: 'Warm', assignedBde: 'Rahul Sharma', lastContact: '2024-03-27', notes: 'Currently employed, exploring upskilling', createdAt: '2024-03-26' },
  { id: '11', name: 'Pranav Jain', email: 'pranav@gmail.com', phone: '+91 98123 45678', source: 'Google Ads', courseInterest: 'Data Science Bootcamp', status: 'Demo Scheduled', aiScore: 82, priority: 'Hot', assignedBde: 'Vikram Singh', lastContact: '2024-03-28', notes: 'Demo tomorrow 11 AM', createdAt: '2024-03-25' },
  { id: '12', name: 'Kavitha S', email: 'kavitha@gmail.com', phone: '+91 87123 45678', source: 'Referral', courseInterest: 'Full Stack Development', status: 'Interested', aiScore: 88, priority: 'Hot', assignedBde: 'Rahul Sharma', lastContact: '2024-03-28', notes: 'Strong interest, comparing with other institutes', createdAt: '2024-03-24' },
  { id: '13', name: 'Arjun Kapoor', email: 'arjunk@gmail.com', phone: '+91 76123 45678', source: 'Website', courseInterest: 'React Mastery', status: 'Follow-up', aiScore: 45, priority: 'Cold', assignedBde: 'Vikram Singh', lastContact: '2024-03-20', notes: 'Not responding to calls', createdAt: '2024-03-18' },
  { id: '14', name: 'Shruti Menon', email: 'shruti@gmail.com', phone: '+91 65123 45678', source: 'Instagram', courseInterest: 'Python Programming', status: 'Payment Pending', aiScore: 90, priority: 'Hot', assignedBde: 'Rahul Sharma', lastContact: '2024-03-28', notes: 'Payment link sent, waiting for confirmation', createdAt: '2024-03-22' },
  { id: '15', name: 'Deepak Verma', email: 'deepak@gmail.com', phone: '+91 54123 45678', source: 'YouTube', courseInterest: 'Java Enterprise', status: 'New Lead', aiScore: 70, priority: 'Warm', assignedBde: 'Vikram Singh', lastContact: '2024-03-28', notes: 'Came from YouTube tutorial series', createdAt: '2024-03-28' },
  { id: '16', name: 'Ritika Bose', email: 'ritika@gmail.com', phone: '+91 43123 45678', source: 'Facebook', courseInterest: 'Data Science Bootcamp', status: 'Contacted', aiScore: 60, priority: 'Warm', assignedBde: 'Rahul Sharma', lastContact: '2024-03-26', notes: 'Interested but needs time to decide', createdAt: '2024-03-24' },
  { id: '17', name: 'Manish Rao', email: 'manish@gmail.com', phone: '+91 32123 45678', source: 'LinkedIn', courseInterest: 'Full Stack Development', status: 'Converted', aiScore: 94, priority: 'Hot', assignedBde: 'Vikram Singh', lastContact: '2024-03-27', notes: 'Joined weekend batch', createdAt: '2024-03-15' },
  { id: '18', name: 'Swati Pillai', email: 'swati@gmail.com', phone: '+91 21123 45678', source: 'Google Ads', courseInterest: 'React Mastery', status: 'Lost', aiScore: 28, priority: 'Cold', assignedBde: 'Rahul Sharma', lastContact: '2024-03-15', notes: 'Found free resources online', createdAt: '2024-03-10' },
  { id: '19', name: 'Harsh Vardhan', email: 'harsh@gmail.com', phone: '+91 10123 45678', source: 'Referral', courseInterest: 'Python Programming', status: 'Interested', aiScore: 76, priority: 'Warm', assignedBde: 'Vikram Singh', lastContact: '2024-03-27', notes: 'Referred by colleague, good prospect', createdAt: '2024-03-25' },
  { id: '20', name: 'Lakshmi Narayan', email: 'lakshmi@gmail.com', phone: '+91 09123 45678', source: 'Website', courseInterest: 'Data Science Bootcamp', status: 'Demo Scheduled', aiScore: 80, priority: 'Hot', assignedBde: 'Rahul Sharma', lastContact: '2024-03-28', notes: 'Demo scheduled for weekend', createdAt: '2024-03-26' },
];

// Mock Students
export const mockStudents: Student[] = [
  { id: '5', name: 'Sneha Patel', email: 'student@test.com', phone: '+91 98765 11111', course: 'React Mastery', courseId: '1', batch: 'Batch A - Morning', attendance: 92, progress: 75, lastActive: '2024-03-28', status: 'Active', points: 2450, joinedAt: '2024-01-15' },
  { id: '9', name: 'Neha Singh', email: 'neha@test.com', phone: '+91 98765 22222', course: 'Data Science Bootcamp', courseId: '3', batch: 'Batch A - Evening', attendance: 88, progress: 60, lastActive: '2024-03-28', status: 'Active', points: 1890, joinedAt: '2024-02-01' },
  { id: '10', name: 'Arjun Reddy', email: 'arjun@test.com', phone: '+91 98765 33333', course: 'Full Stack Development', courseId: '5', batch: 'Batch B - Weekend', attendance: 95, progress: 45, lastActive: '2024-03-27', status: 'Active', points: 1560, joinedAt: '2024-02-15' },
  { id: '11', name: 'Priyanka Chopra', email: 'priyanka@test.com', phone: '+91 98765 44444', course: 'Python Programming', courseId: '2', batch: 'Batch A - Morning', attendance: 78, progress: 90, lastActive: '2024-03-26', status: 'Active', points: 3200, joinedAt: '2024-01-01' },
  { id: '12', name: 'Rahul Dravid', email: 'rahul.d@test.com', phone: '+91 98765 55555', course: 'React Mastery', courseId: '1', batch: 'Batch A - Morning', attendance: 85, progress: 80, lastActive: '2024-03-28', status: 'Active', points: 2780, joinedAt: '2024-01-15' },
  { id: '13', name: 'Virat Kohli', email: 'virat@test.com', phone: '+91 98765 66666', course: 'Full Stack Development', courseId: '5', batch: 'Batch A - Evening', attendance: 90, progress: 55, lastActive: '2024-03-27', status: 'Active', points: 1980, joinedAt: '2024-02-01' },
  { id: '14', name: 'Anushka Sharma', email: 'anushka@test.com', phone: '+91 98765 77777', course: 'Data Science Bootcamp', courseId: '3', batch: 'Batch A - Evening', attendance: 82, progress: 40, lastActive: '2024-03-25', status: 'Active', points: 1420, joinedAt: '2024-02-15' },
  { id: '15', name: 'MS Dhoni', email: 'msd@test.com', phone: '+91 98765 88888', course: 'Java Enterprise', courseId: '4', batch: 'Batch A - Weekend', attendance: 96, progress: 65, lastActive: '2024-03-28', status: 'Active', points: 2100, joinedAt: '2024-01-20' },
  { id: '16', name: 'Deepika Padukone', email: 'deepika@test.com', phone: '+91 98765 99999', course: 'React Mastery', courseId: '1', batch: 'Batch B - Evening', attendance: 88, progress: 70, lastActive: '2024-03-27', status: 'Active', points: 2340, joinedAt: '2024-01-25' },
  { id: '17', name: 'Ranveer Singh', email: 'ranveer@test.com', phone: '+91 98765 00000', course: 'Python Programming', courseId: '2', batch: 'Batch A - Morning', attendance: 75, progress: 85, lastActive: '2024-03-24', status: 'Active', points: 2980, joinedAt: '2024-01-01' },
  { id: '18', name: 'Alia Bhatt', email: 'alia@test.com', phone: '+91 98766 11111', course: 'Data Science Bootcamp', courseId: '3', batch: 'Batch A - Evening', attendance: 92, progress: 50, lastActive: '2024-03-28', status: 'Active', points: 1750, joinedAt: '2024-02-10' },
  { id: '19', name: 'Ranbir Kapoor', email: 'ranbir@test.com', phone: '+91 98766 22222', course: 'Full Stack Development', courseId: '5', batch: 'Batch B - Weekend', attendance: 80, progress: 35, lastActive: '2024-03-23', status: 'On Hold', points: 1100, joinedAt: '2024-03-01' },
  { id: '20', name: 'Katrina Kaif', email: 'katrina@test.com', phone: '+91 98766 33333', course: 'React Mastery', courseId: '1', batch: 'Batch A - Morning', attendance: 94, progress: 95, lastActive: '2024-03-28', status: 'Completed', points: 4200, joinedAt: '2023-10-01' },
  { id: '21', name: 'Shah Rukh Khan', email: 'srk@test.com', phone: '+91 98766 44444', course: 'Python Programming', courseId: '2', batch: 'Batch A - Morning', attendance: 89, progress: 100, lastActive: '2024-03-20', status: 'Completed', points: 5100, joinedAt: '2023-09-01' },
  { id: '22', name: 'Salman Khan', email: 'salman@test.com', phone: '+91 98766 55555', course: 'Java Enterprise', courseId: '4', batch: 'Batch A - Weekend', attendance: 72, progress: 30, lastActive: '2024-03-22', status: 'On Hold', points: 890, joinedAt: '2024-02-20' },
];

// Mock Jobs
export const mockJobs: Job[] = [
  { id: '1', title: 'Frontend Developer', company: 'TechCorp India', location: 'Bangalore', skills: ['React', 'JavaScript', 'CSS'], type: 'Full-time', url: 'https://example.com/job1', deadline: '2024-04-15', postedAt: '2024-03-25' },
  { id: '2', title: 'Python Developer', company: 'DataWise Analytics', location: 'Hyderabad', skills: ['Python', 'Django', 'PostgreSQL'], type: 'Full-time', url: 'https://example.com/job2', deadline: '2024-04-20', postedAt: '2024-03-26' },
  { id: '3', title: 'Data Scientist', company: 'AI Solutions Pvt Ltd', location: 'Mumbai', skills: ['Python', 'Machine Learning', 'TensorFlow'], type: 'Full-time', url: 'https://example.com/job3', deadline: '2024-04-18', postedAt: '2024-03-24' },
  { id: '4', title: 'Full Stack Intern', company: 'StartupHub', location: 'Remote', skills: ['React', 'Node.js', 'MongoDB'], type: 'Internship', url: 'https://example.com/job4', deadline: '2024-04-10', postedAt: '2024-03-27' },
  { id: '5', title: 'Java Developer', company: 'Enterprise Systems', location: 'Pune', skills: ['Java', 'Spring Boot', 'Microservices'], type: 'Full-time', url: 'https://example.com/job5', deadline: '2024-04-25', postedAt: '2024-03-23' },
  { id: '6', title: 'React Native Developer', company: 'MobileFirst Apps', location: 'Chennai', skills: ['React Native', 'JavaScript', 'Redux'], type: 'Contract', url: 'https://example.com/job6', deadline: '2024-04-12', postedAt: '2024-03-28' },
  { id: '7', title: 'ML Engineer', company: 'DeepTech Labs', location: 'Bangalore', skills: ['Python', 'PyTorch', 'Computer Vision'], type: 'Full-time', url: 'https://example.com/job7', deadline: '2024-04-22', postedAt: '2024-03-22' },
  { id: '8', title: 'Backend Developer', company: 'CloudScale Inc', location: 'Gurgaon', skills: ['Node.js', 'AWS', 'Docker'], type: 'Full-time', url: 'https://example.com/job8', deadline: '2024-04-30', postedAt: '2024-03-21' },
  { id: '9', title: 'Data Analyst Intern', company: 'InsightCo', location: 'Remote', skills: ['Python', 'SQL', 'Tableau'], type: 'Internship', url: 'https://example.com/job9', deadline: '2024-04-08', postedAt: '2024-03-28' },
  { id: '10', title: 'DevOps Engineer', company: 'InfraTech', location: 'Noida', skills: ['AWS', 'Kubernetes', 'CI/CD'], type: 'Full-time', url: 'https://example.com/job10', deadline: '2024-04-28', postedAt: '2024-03-20' },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-03-28', studentId: '5', studentName: 'Sneha Patel', amount: 15000, gateway: 'Razorpay', status: 'Completed' },
  { id: '2', date: '2024-03-27', studentId: '9', studentName: 'Neha Singh', amount: 25000, gateway: 'Stripe', status: 'Completed' },
  { id: '3', date: '2024-03-27', studentId: '10', studentName: 'Arjun Reddy', amount: 15000, gateway: 'Razorpay', status: 'Pending' },
  { id: '4', date: '2024-03-26', studentId: '11', studentName: 'Priyanka Chopra', amount: 12000, gateway: 'PayPal', status: 'Completed' },
  { id: '5', date: '2024-03-26', studentId: '12', studentName: 'Rahul Dravid', amount: 15000, gateway: 'Bank Transfer', status: 'Completed' },
  { id: '6', date: '2024-03-25', studentId: '13', studentName: 'Virat Kohli', amount: 30000, gateway: 'Razorpay', status: 'Completed' },
  { id: '7', date: '2024-03-25', studentId: '14', studentName: 'Anushka Sharma', amount: 12500, gateway: 'Stripe', status: 'Pending' },
  { id: '8', date: '2024-03-24', studentId: '15', studentName: 'MS Dhoni', amount: 18000, gateway: 'Razorpay', status: 'Completed' },
  { id: '9', date: '2024-03-24', studentId: '16', studentName: 'Deepika Padukone', amount: 15000, gateway: 'PayPal', status: 'Refunded' },
  { id: '10', date: '2024-03-23', studentId: '17', studentName: 'Ranveer Singh', amount: 12000, gateway: 'Bank Transfer', status: 'Completed' },
  { id: '11', date: '2024-03-23', studentId: '18', studentName: 'Alia Bhatt', amount: 25000, gateway: 'Razorpay', status: 'Completed' },
  { id: '12', date: '2024-03-22', studentId: '19', studentName: 'Ranbir Kapoor', amount: 15000, gateway: 'Stripe', status: 'Failed' },
  { id: '13', date: '2024-03-22', studentId: '20', studentName: 'Katrina Kaif', amount: 15000, gateway: 'Razorpay', status: 'Completed' },
  { id: '14', date: '2024-03-21', studentId: '21', studentName: 'Shah Rukh Khan', amount: 12000, gateway: 'Bank Transfer', status: 'Completed' },
  { id: '15', date: '2024-03-21', studentId: '22', studentName: 'Salman Khan', amount: 9000, gateway: 'Razorpay', status: 'Pending' },
  { id: '16', date: '2024-03-20', studentId: '5', studentName: 'Sneha Patel', amount: 5000, gateway: 'PayPal', status: 'Completed' },
  { id: '17', date: '2024-03-19', studentId: '9', studentName: 'Neha Singh', amount: 12500, gateway: 'Stripe', status: 'Completed' },
  { id: '18', date: '2024-03-18', studentId: '10', studentName: 'Arjun Reddy', amount: 15000, gateway: 'Razorpay', status: 'Completed' },
  { id: '19', date: '2024-03-17', studentId: '11', studentName: 'Priyanka Chopra', amount: 6000, gateway: 'Bank Transfer', status: 'Refunded' },
  { id: '20', date: '2024-03-16', studentId: '12', studentName: 'Rahul Dravid', amount: 7500, gateway: 'Razorpay', status: 'Completed' },
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  { id: 'TKT-001', studentId: '5', studentName: 'Sneha Patel', subject: 'Unable to access course recordings', category: 'Technical', priority: 'High', status: 'Open', description: 'I cannot view the React module 5 recordings. Getting a 404 error.', createdAt: '2024-03-28', messages: [{ sender: 'Sneha Patel', message: 'Please help, I have an assignment due tomorrow.', timestamp: '2024-03-28 10:30' }] },
  { id: 'TKT-002', studentId: '9', studentName: 'Neha Singh', subject: 'Payment not reflecting', category: 'Payment', priority: 'High', status: 'In Progress', description: 'Made payment 2 days ago but my access is still limited.', createdAt: '2024-03-27', messages: [{ sender: 'Neha Singh', message: 'Transaction ID: TXN123456789', timestamp: '2024-03-27 14:20' }, { sender: 'Support Team', message: 'We are checking with the finance team.', timestamp: '2024-03-27 15:00' }] },
  { id: 'TKT-003', studentId: '10', studentName: 'Arjun Reddy', subject: 'Request for batch change', category: 'Course', priority: 'Medium', status: 'Open', description: 'Due to work schedule change, I need to move to weekend batch.', createdAt: '2024-03-27', messages: [] },
  { id: 'TKT-004', studentId: '12', studentName: 'Rahul Dravid', subject: 'Certificate not generated', category: 'General', priority: 'Low', status: 'Resolved', description: 'Completed the course but certificate is not showing.', createdAt: '2024-03-25', messages: [{ sender: 'Support Team', message: 'Certificate has been generated. Please check now.', timestamp: '2024-03-26 09:00' }] },
  { id: 'TKT-005', studentId: '13', studentName: 'Virat Kohli', subject: 'Zoom link not working', category: 'Technical', priority: 'High', status: 'Open', description: 'The Zoom link for today class is showing meeting ended.', createdAt: '2024-03-28', messages: [] },
  { id: 'TKT-006', studentId: '14', studentName: 'Anushka Sharma', subject: 'Refund request', category: 'Payment', priority: 'Medium', status: 'In Progress', description: 'I need to discontinue due to personal reasons. Please process refund.', createdAt: '2024-03-26', messages: [{ sender: 'Support Team', message: 'Your request has been forwarded to the finance team.', timestamp: '2024-03-26 16:00' }] },
];

// Mock Certificates
export const mockCertificates: Certificate[] = [
  { id: '1', studentId: '5', courseName: 'React Fundamentals', issueDate: '2024-02-15', certificateId: 'CERT-2024-RF-001' },
  { id: '2', studentId: '5', courseName: 'JavaScript Advanced', issueDate: '2024-01-20', certificateId: 'CERT-2024-JA-002' },
  { id: '3', studentId: '5', courseName: 'Web Development Basics', issueDate: '2023-12-10', certificateId: 'CERT-2023-WD-015' },
  { id: '4', studentId: '20', courseName: 'React Mastery', issueDate: '2024-03-15', certificateId: 'CERT-2024-RM-008' },
  { id: '5', studentId: '21', courseName: 'Python Programming', issueDate: '2024-03-01', certificateId: 'CERT-2024-PP-012' },
];

// Mock Class Sessions
export const mockClasses: ClassSession[] = [
  { id: '1', title: 'React Hooks Deep Dive', batch: 'Batch A - Morning', courseId: '1', trainerId: '3', date: '2024-03-29', time: '10:00 AM', platform: 'Zoom', meetingLink: 'https://zoom.us/j/123456789', description: 'Understanding useEffect, useMemo, and useCallback', studentCount: 25 },
  { id: '2', title: 'State Management with Redux', batch: 'Batch A - Morning', courseId: '1', trainerId: '3', date: '2024-03-30', time: '10:00 AM', platform: 'Google Meet', meetingLink: 'https://meet.google.com/abc-defg-hij', description: 'Redux Toolkit and best practices', studentCount: 25 },
  { id: '3', title: 'Python Data Structures', batch: 'Batch A - Morning', courseId: '2', trainerId: '7', date: '2024-03-29', time: '2:00 PM', platform: 'Zoom', meetingLink: 'https://zoom.us/j/987654321', description: 'Lists, Dictionaries, and Sets', studentCount: 18 },
  { id: '4', title: 'Machine Learning Basics', batch: 'Batch A - Evening', courseId: '3', trainerId: '7', date: '2024-03-29', time: '6:00 PM', platform: 'Zoom', meetingLink: 'https://zoom.us/j/456789123', description: 'Introduction to supervised learning', studentCount: 15 },
  { id: '5', title: 'Node.js API Development', batch: 'Batch B - Weekend', courseId: '5', trainerId: '3', date: '2024-03-30', time: '11:00 AM', platform: 'Google Meet', meetingLink: 'https://meet.google.com/xyz-uvwx-yz', description: 'Building RESTful APIs with Express', studentCount: 20 },
  { id: '6', title: 'Spring Boot Fundamentals', batch: 'Batch A - Weekend', courseId: '4', trainerId: '8', date: '2024-03-30', time: '3:00 PM', platform: 'Zoom', meetingLink: 'https://zoom.us/j/111222333', description: 'Dependency injection and beans', studentCount: 12 },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  { id: '1', type: 'lead', message: 'New lead assigned: Aditya Kumar interested in React Mastery', timestamp: '2024-03-28T14:30:00', read: false },
  { id: '2', type: 'payment', message: 'Payment received: Rs. 15,000 from Sneha Patel', timestamp: '2024-03-28T12:15:00', read: false },
  { id: '3', type: 'class', message: 'Reminder: React Hooks class starts in 30 minutes', timestamp: '2024-03-28T09:30:00', read: false },
  { id: '4', type: 'ticket', message: 'New support ticket from Virat Kohli - Zoom link issue', timestamp: '2024-03-28T08:45:00', read: true },
  { id: '5', type: 'job', message: 'New job match: Frontend Developer at TechCorp India', timestamp: '2024-03-27T16:00:00', read: true },
  { id: '6', type: 'lead', message: 'Lead status changed: Rohan Mehta moved to Payment Pending', timestamp: '2024-03-27T14:20:00', read: true },
  { id: '7', type: 'payment', message: 'Payment failed: Transaction for Ranbir Kapoor', timestamp: '2024-03-27T11:30:00', read: true },
  { id: '8', type: 'class', message: 'Class recording uploaded: Python Data Structures', timestamp: '2024-03-26T18:00:00', read: true },
  { id: '9', type: 'ticket', message: 'Ticket resolved: Certificate issue for Rahul Dravid', timestamp: '2024-03-26T09:00:00', read: true },
  { id: '10', type: 'job', message: 'Application deadline approaching: Data Scientist at AI Solutions', timestamp: '2024-03-25T10:00:00', read: true },
];

// Analytics Data
export const analyticsData = {
  leadSources: [
    { name: 'Instagram', value: 25, color: '#E1306C' },
    { name: 'Facebook', value: 20, color: '#4267B2' },
    { name: 'LinkedIn', value: 18, color: '#0077B5' },
    { name: 'Website', value: 15, color: '#6B7280' },
    { name: 'Referral', value: 12, color: '#10B981' },
    { name: 'Google Ads', value: 10, color: '#F59E0B' },
  ],
  monthlyRevenue: [
    { month: 'Apr', revenue: 245000 },
    { month: 'May', revenue: 312000 },
    { month: 'Jun', revenue: 289000 },
    { month: 'Jul', revenue: 356000 },
    { month: 'Aug', revenue: 398000 },
    { month: 'Sep', revenue: 425000 },
    { month: 'Oct', revenue: 478000 },
    { month: 'Nov', revenue: 512000 },
    { month: 'Dec', revenue: 489000 },
    { month: 'Jan', revenue: 534000 },
    { month: 'Feb', revenue: 567000 },
    { month: 'Mar', revenue: 623000 },
  ],
  conversionFunnel: [
    { stage: 'Leads', value: 500 },
    { stage: 'Contacted', value: 380 },
    { stage: 'Demo', value: 220 },
    { stage: 'Interested', value: 150 },
    { stage: 'Converted', value: 85 },
  ],
  attendanceData: [
    { week: 'Week 1', attendance: 92 },
    { week: 'Week 2', attendance: 88 },
    { week: 'Week 3', attendance: 95 },
    { week: 'Week 4', attendance: 87 },
    { week: 'Week 5', attendance: 91 },
    { week: 'Week 6', attendance: 89 },
    { week: 'Week 7', attendance: 93 },
    { week: 'Week 8', attendance: 90 },
  ],
  placementStats: [
    { course: 'React', placed: 45, total: 50 },
    { course: 'Python', placed: 38, total: 42 },
    { course: 'Data Science', placed: 28, total: 35 },
    { course: 'Java', placed: 32, total: 38 },
    { course: 'Full Stack', placed: 52, total: 55 },
  ],
};

// Points History
export const mockPointsHistory = [
  { date: '2024-03-28', reason: 'Attendance Bonus', points: 50, balance: 2450 },
  { date: '2024-03-27', reason: 'Quiz Completed', points: 100, balance: 2400 },
  { date: '2024-03-26', reason: 'Assignment Submitted', points: 75, balance: 2300 },
  { date: '2024-03-25', reason: 'Attendance Bonus', points: 50, balance: 2225 },
  { date: '2024-03-24', reason: 'Referral Bonus', points: 200, balance: 2175 },
  { date: '2024-03-23', reason: 'Module Completed', points: 150, balance: 1975 },
  { date: '2024-03-22', reason: 'Attendance Bonus', points: 50, balance: 1825 },
  { date: '2024-03-21', reason: 'Quiz Completed', points: 100, balance: 1775 },
];

// Rewards
export const mockRewards = [
  { id: '1', title: '10% Course Discount', points: 500, description: 'Get 10% off on your next course enrollment' },
  { id: '2', title: 'Premium 1:1 Session', points: 1000, description: '30-minute mentorship with a senior trainer' },
  { id: '3', title: 'Resume Review', points: 300, description: 'Professional resume review by HR experts' },
  { id: '4', title: 'Mock Interview', points: 800, description: 'Practice interview with industry professionals' },
  { id: '5', title: 'Course Extension', points: 1500, description: 'Extend your course access by 1 month' },
];

// Activity Timeline for Leads
export const mockLeadActivities = [
  { id: '1', leadId: '1', type: 'call', message: 'Called and discussed course details', timestamp: '2024-03-28 14:30', user: 'Rahul Sharma' },
  { id: '2', leadId: '1', type: 'email', message: 'Sent course brochure via email', timestamp: '2024-03-28 10:15', user: 'Rahul Sharma' },
  { id: '3', leadId: '1', type: 'status', message: 'Status changed from Contacted to Interested', timestamp: '2024-03-27 16:00', user: 'System' },
  { id: '4', leadId: '1', type: 'note', message: 'Lead mentioned budget flexibility after discussing EMI options', timestamp: '2024-03-27 14:20', user: 'Rahul Sharma' },
  { id: '5', leadId: '1', type: 'call', message: 'Initial discovery call - very enthusiastic about React course', timestamp: '2024-03-27 11:00', user: 'Rahul Sharma' },
];
