import { getDiscussions } from '@/lib/actions/discussion';
import DiscussionPageClient from './DiscussionPageClient';

export default async function DiscussionPage() {
  const result = await getDiscussions();

  if (!result.success || !result.data) {
    return <DiscussionPageClient discussions={[]} />;
  }

  const discussions = result.data.map((d) => ({
    id: d.id,
    storageKey: d.storageKey,
    title: d.title,
    description: d.description,
    postCount: d.postCount,
    createdBy: d.createdBy,
  }));

  return <DiscussionPageClient discussions={discussions} />;
}
