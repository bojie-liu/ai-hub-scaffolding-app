import { redirect } from 'next/navigation';

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  redirect('/discussion');
}
