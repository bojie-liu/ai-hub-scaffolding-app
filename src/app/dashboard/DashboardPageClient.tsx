'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPageClient() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            Teacher Dashboard
          </h1>
          <TeacherDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
