'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPageClient() {
  return (
    <ScrollRootProvider>
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <AuthGuard requiredRole="TEACHER">
          <TeacherDashboard />
        </AuthGuard>
      </main>
    </ScrollRootProvider>
  );
}
