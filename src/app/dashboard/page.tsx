'use client';

import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor student progress, quiz results, and concept check responses</p>
          </div>
          <TeacherDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
