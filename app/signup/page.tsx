"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import type { UserRole } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Loader2, 
  User, 
  Briefcase, 
  Settings,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole | null;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

const roleCards: { value: UserRole; icon: React.ReactNode; title: string; description: string }[] = [
  { 
    value: 'student', 
    icon: <GraduationCap className="h-8 w-8" />, 
    title: 'Student', 
    description: 'I want to learn and grow' 
  },
  { 
    value: 'trainer', 
    icon: <User className="h-8 w-8" />, 
    title: 'Trainer', 
    description: 'I want to teach and mentor' 
  },
  { 
    value: 'bde', 
    icon: <Briefcase className="h-8 w-8" />, 
    title: 'BDE', 
    description: 'I manage leads and sales' 
  },
  { 
    value: 'admin', 
    icon: <Settings className="h-8 w-8" />, 
    title: 'Admin', 
    description: 'I manage the platform' 
  },
];

const roleDashboardPaths: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  bde: '/bde/dashboard',
  trainer: '/trainer/dashboard',
  student: '/student/dashboard',
};

function getPasswordStrength(password: string): { label: string; color: string; value: number } {
  if (!password) return { label: '', color: '', value: 0 };
  
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;

  if (strength <= 25) return { label: 'Weak', color: 'bg-red-500', value: strength };
  if (strength <= 50) return { label: 'Medium', color: 'bg-yellow-500', value: strength };
  if (strength <= 75) return { label: 'Good', color: 'bg-blue-500', value: strength };
  return { label: 'Strong', color: 'bg-green-500', value: strength };
}

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const passwordStrength = getPasswordStrength(formData.password);

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter exactly 10 digits';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if email already exists (simulate)
      const existingEmails = ['admin@test.com', 'bde@test.com', 'trainer@test.com', 'student@test.com'];
      if (existingEmails.includes(formData.email.toLowerCase())) {
        toast.error('Email already exists', {
          description: 'Please use a different email or sign in.',
        });
        setIsLoading(false);
        return;
      }

      // Success
      setIsSuccess(true);

      // Auto login and redirect after 2 seconds
      setTimeout(async () => {
        if (formData.role) {
          await login(formData.email, formData.password, formData.role);
          router.push(roleDashboardPaths[formData.role]);
        }
      }, 2000);

    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-muted-foreground mb-4">
              Welcome to EduNexus CRM, {formData.fullName.split(' ')[0]}!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard...
            </p>
            <div className="mt-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">EduNexus CRM</h1>
          <p className="text-muted-foreground mt-1">
            AI-Powered Training Institute Management
          </p>
        </div>

        {/* Sign up card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  1
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  step >= 1 ? "text-foreground" : "text-muted-foreground"
                )}>
                  Personal Info
                </span>
              </div>
              <div className="flex-1 h-0.5 mx-3 bg-muted">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: step >= 2 ? '100%' : '0%' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  2
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  step >= 2 ? "text-foreground" : "text-muted-foreground"
                )}>
                  Choose Role
                </span>
              </div>
            </div>
            <Progress value={step === 1 ? 50 : 100} className="h-1" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 ? 'Enter your personal information' : 'Select your role in the platform'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10 digit number"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange('phone', value);
                      }}
                      className={cn(
                        "rounded-l-none",
                        errors.phone ? 'border-red-500' : ''
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={cn("pr-10", errors.password ? 'border-red-500' : '')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all", passwordStrength.color)}
                            style={{ width: `${passwordStrength.value}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          passwordStrength.value <= 25 ? "text-red-500" :
                          passwordStrength.value <= 50 ? "text-yellow-500" :
                          passwordStrength.value <= 75 ? "text-blue-500" : "text-green-500"
                        )}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={cn("pr-10", errors.confirmPassword ? 'border-red-500' : '')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Next button */}
                <Button
                  type="button"
                  className="w-full mt-2"
                  size="lg"
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {roleCards.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, role: role.value }));
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:border-primary/50",
                        formData.role === role.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-card"
                      )}
                    >
                      <div className={cn(
                        "mb-2",
                        formData.role === role.value ? "text-primary" : "text-muted-foreground"
                      )}>
                        {role.icon}
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        formData.role === role.value ? "text-primary" : "text-foreground"
                      )}>
                        {role.title}
                      </span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {role.description}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-xs text-red-500 text-center">{errors.role}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our{' '}
          <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
