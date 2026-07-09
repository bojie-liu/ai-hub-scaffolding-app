'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="px-4 py-6 max-w-6xl mx-auto">
          <TeacherDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
