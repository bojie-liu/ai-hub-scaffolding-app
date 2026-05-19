'use client';

import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <AuthGuard requiredRole="TEACHER">
          <TeacherDashboard />
        </AuthGuard>
      </main>
    </div>
  );
}
