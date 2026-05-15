import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import DiscussionDetail from '@/components/interactive/DiscussionDetailClient';

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <DiscussionDetail discussionId={parseInt(id)} />
      </main>
    </AuthGuard>
  );
}
