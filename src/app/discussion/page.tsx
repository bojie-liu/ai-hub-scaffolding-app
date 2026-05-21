import Link from 'next/link';
import { getDiscussions } from '@/lib/actions/discussion';
import Navbar from '@/components/common/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin } from 'lucide-react';

export default async function DiscussionListPage() {
  const result = await getDiscussions();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                無法載入討論區
              </h2>
              <p className="text-muted-foreground">
                請稍後再試，或聯絡系統管理員。
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">課堂討論</h1>
        <div className="space-y-4">
          {result.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                目前沒有討論主題。
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                討論主題將在課程進行中發布。
              </p>
            </div>
          ) : (
            result.data.map((discussion) => (
              <Link key={discussion.id} href={`/discussion/${discussion.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {discussion.isPinned && (
                        <Pin className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                      <CardTitle className="text-lg">{discussion.title}</CardTitle>
                    </div>
                    {discussion.description && (
                      <CardDescription className="mt-1">
                        {discussion.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {discussion.creatorName ?? discussion.creatorUsername ?? '未知使用者'}
                      </span>
                      <span>
                        {discussion.createdAt ? new Date(discussion.createdAt).toLocaleDateString('zh-TW') : ''}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        <MessageSquare className="h-4 w-4" />
                        <Badge variant="secondary" className="text-xs">
                          {discussion.postCount} 則回覆
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
