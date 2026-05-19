import { getDiscussions } from '@/lib/actions/discussion';
import DiscussionsClient from './DiscussionsClient';

export const dynamic = 'force-dynamic';

export default async function DiscussionPage() {
  const result = await getDiscussions();
  const discussions = result.success && result.data ? result.data : [];

  return <DiscussionsClient discussions={discussions} />;
}
