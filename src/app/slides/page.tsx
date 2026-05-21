import { getSlides } from '@/lib/actions/slides';
import Slides from '@/components/lesson/presentation/Slides';
import Navbar from '@/components/common/Navbar';

export default async function SlidesPage() {
  const result = await getSlides();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                無法載入投影片
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Slides slides={result.data} />
      </main>
    </div>
  );
}
