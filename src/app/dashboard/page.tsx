import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="TEACHER">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TeacherDashboard />
      </div>
    </AuthGuard>
  );
}
