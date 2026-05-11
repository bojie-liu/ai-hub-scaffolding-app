import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export const metadata = { title: 'Teacher Dashboard — Constructivism Lesson Plan' };

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor student progress, quiz results, and concept checks</p>
          </div>
          <TeacherDashboard />
        </div>
      </div>
    </AuthGuard>
  );
}
