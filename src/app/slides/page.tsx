import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import SlidesView from '@/components/lesson/presentation/SlidesView';

export default function SlidesPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <SlidesView />
      </main>
    </AuthGuard>
  );
}
