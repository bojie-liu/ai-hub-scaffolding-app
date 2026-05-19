import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export const metadata = {
  title: 'Dashboard - Knowledge Management & School Development',
};

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor student progress, quiz results, and concept check responses.
          </p>
        </div>
        <TeacherDashboard />
      </div>
    </AuthGuard>
  );
}
