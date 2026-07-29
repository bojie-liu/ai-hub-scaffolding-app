'use client';

import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Teacher Dashboard</h1>
        <p className="text-muted-foreground mb-6">Monitor student progress, quiz results, and concept check responses.</p>
        <TeacherDashboard />
      </div>
    </AuthGuard>
  );
}
