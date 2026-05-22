'use client';

import { Suspense } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500">Loading dashboard...</div>
        </div>
      }>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Teacher Dashboard</h1>
            <TeacherDashboard />
          </div>
        </div>
      </Suspense>
    </AuthGuard>
  );
}
