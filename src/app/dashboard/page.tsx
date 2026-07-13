import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AuthGuard requiredRole="TEACHER">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <TeacherDashboard />
        </div>
      </AuthGuard>
    </div>
  );
}
