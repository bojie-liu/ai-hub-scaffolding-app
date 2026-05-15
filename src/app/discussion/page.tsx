import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import DiscussionList from '@/components/interactive/DiscussionPageClient';

export default function DiscussionPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Discussions</h1>
        <DiscussionList />
      </main>
    </AuthGuard>
  );
}
