import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import Navbar from '@/components/common/Navbar';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AuthGuard requiredRole="TEACHER">
          <TeacherDashboard />
        </AuthGuard>
      </main>
    </div>
  );
}
