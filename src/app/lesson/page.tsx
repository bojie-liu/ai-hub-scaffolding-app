'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import QuizComponent from '@/components/lesson/interactive/Quiz';
import ConceptCheckComponent from '@/components/lesson/interactive/ConceptCheck';
import DiscussionComponent from '@/components/lesson/interactive/Discussion';
import { ScrollRootProvider } from '@/contexts';
import { useUser } from '@/contexts/UserContext';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions, getDiscussion } from '@/lib/actions/discussion';
import { getStudentProgress, markSectionComplete } from '@/lib/actions/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  BookOpen,
  Presentation,
  Activity,
  ClipboardCheck,
  BarChart3,
  Wrench,
  Users,
  Lightbulb,
  Download,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// --- Types ---

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
}

interface DiscussionPost {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface DiscussionData {
  id: number;
  title: string;
  description: string | null;
  posts: DiscussionPost[];
}

interface ProgressData {
  id: number;
  userId: number;
  sectionKey: string;
  completed: boolean;
  completedAt: Date | null;
}

// --- Section definitions ---

const SECTIONS = [
  { id: 'objectives', label: '學習目標', icon: Target },
  { id: 'preclass', label: '課前預備', icon: BookOpen },
  { id: 'introduction', label: '引言', icon: Presentation },
  { id: 'development', label: '發展活動', icon: Activity },
  { id: 'summary', label: '總結與延伸', icon: Lightbulb },
  { id: 'assessment', label: '評估方式', icon: ClipboardCheck },
  { id: 'alignment', label: '建構一致矩陣', icon: BarChart3 },
  { id: 'resources', label: '教學資源需求', icon: Wrench },
  { id: 'differentiation', label: '差異化設計', icon: Users },
  { id: 'reflection', label: '教學反思機制', icon: Lightbulb },
];

// --- Main component ---

export default function LessonPage() {
  const { user } = useUser();
  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';
  const isTeacher = userRole === 'TEACHER';

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [pretestQuiz, setPretestQuiz] = useState<{
    id: number;
    title: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);

  // --- Data fetching ---

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [quizzesResult, checksResult, discsResult, progressResult] = await Promise.all([
        getAllQuizzes(),
        getConceptChecks(),
        getDiscussions(),
        userId > 0 ? getStudentProgress(userId) : Promise.resolve({ success: false, data: [] }),
      ]);

      // Find pretest quiz
      if (quizzesResult.success && quizzesResult.data) {
        const pretest = quizzesResult.data.find(
          (q) => q.storageKey === 'quiz:knowledge-management-pretest'
        );
        if (pretest) {
          const quizDetail = await getQuiz(pretest.id);
          if (quizDetail.success && quizDetail.data) {
            setPretestQuiz({
              id: quizDetail.data.quiz.id,
              title: quizDetail.data.quiz.title,
              questions: quizDetail.data.questions as QuizQuestion[],
            });
          }
        }
      }

      // Concept checks
      if (checksResult.success && checksResult.data) {
        setConceptChecks(checksResult.data as ConceptCheckData[]);
      }

      // Discussions - fetch details for lesson-specific discussions
      if (discsResult.success && discsResult.data) {
        const lessonKeys = [
          'discussion:knowledge-transfer-experience',
          'discussion:digital-tools-knowledge-sharing',
        ];
        const lessonDiscs = discsResult.data.filter((d) =>
          lessonKeys.includes(d.storageKey)
        );
        const discDetails = await Promise.all(
          lessonDiscs.map(async (d) => {
            const detail = await getDiscussion(d.id);
            if (detail.success && detail.data) {
              const { discussion, posts: rawPosts } = detail.data;
              const mappedPosts: DiscussionPost[] = rawPosts.map((p) => ({
                id: p.id,
                parentId: p.parentPostId,
                authorId: p.authorId,
                authorName: p.authorDisplayName ?? p.authorUsername ?? '未知',
                content: p.content,
                createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
              }));
              return {
                id: discussion.id,
                title: discussion.title,
                description: discussion.description,
                posts: mappedPosts,
              } as DiscussionData;
            }
            return null;
          })
        );
        setDiscussions(discDetails.filter((d): d is DiscussionData => d !== null));
      }

      // Progress
      if (progressResult.success && progressResult.data) {
        setProgress(progressResult.data as ProgressData[]);
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Progress helpers ---

  function isSectionComplete(sectionKey: string): boolean {
    return progress.some((p) => p.sectionKey === sectionKey && p.completed);
  }

  async function handleMarkComplete(sectionKey: string) {
    if (userId <= 0) return;
    const result = await markSectionComplete(userId, sectionKey);
    if (result.success) {
      setProgress((prev) => {
        const existing = prev.find((p) => p.sectionKey === sectionKey);
        if (existing) {
          return prev.map((p) =>
            p.sectionKey === sectionKey ? { ...p, completed: true, completedAt: new Date() } : p
          );
        }
        return [...prev, { id: -1, userId, sectionKey, completed: true, completedAt: new Date() }];
      });
      toast.success('已標記完成');
    }
  }

  // --- Concept check helper ---

  function getConceptCheck(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  }

  // --- Discussion helper ---

  function getDiscussionByIndex(idx: number): DiscussionData | undefined {
    return discussions[idx];
  }

  // --- Loading state ---

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </main>
        </div>
      </AuthGuard>
    );
  }

  // --- Render ---

  return (
    <AuthGuard>
      <ScrollRootProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
            <LessonSideMenu sections={SECTIONS} />
            <main className="flex-1 min-w-0 space-y-6 pb-12">
              {/* Page Header */}
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900">學校知識管理</h1>
                <p className="text-slate-600 mt-1">大學課程教案設計 — 資訊科技與互聯網發展對學校知識管理的挑戰與機遇</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline">翻轉學習</Badge>
                  <Badge variant="outline">協作教學</Badge>
                  <Badge variant="outline">180分鐘</Badge>
                </div>
              </div>

              {/* ====== Section 1: 學習目標 ====== */}
              <LessonSection id="objectives" title="學習目標" badge="核心能力">
                <EditableContent
                  storageKey="editable:objectives-intro"
                  initialValue="本課程旨在培養學員對學校知識管理的全面認識，從理論到實踐，幫助學員掌握知識審計、機制設計與評估等核心能力。"
                  as="p"
                  className="text-slate-600 mb-4"
                />
                <div className="space-y-3">
                  {[
                    { level: '分析', text: '能分析資訊科技與互聯網發展對學校知識管理的挑戰與機遇' },
                    { level: '應用', text: '能應用知識審計工具評估學校知識資產現況' },
                    { level: '創造', text: '能設計符合學校特色的知識共享機制框架' },
                    { level: '評價', text: '能評估知識管理策略對學校持續發展的影響' },
                    { level: '合作', text: '能通過協作解決知識傳承系統的實際問題' },
                  ].map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <Badge
                        className={
                          obj.level === '分析' ? 'bg-blue-100 text-blue-800 shrink-0' :
                          obj.level === '應用' ? 'bg-green-100 text-green-800 shrink-0' :
                          obj.level === '創造' ? 'bg-purple-100 text-purple-800 shrink-0' :
                          obj.level === '評價' ? 'bg-amber-100 text-amber-800 shrink-0' :
                          'bg-rose-100 text-rose-800 shrink-0'
                        }
                      >
                        {obj.level}
                      </Badge>
                      <EditableContent
                        storageKey={`editable:objective-${i + 1}`}
                        initialValue={obj.text}
                        as="span"
                        className="text-slate-700 text-sm"
                      />
                    </div>
                  ))}
                </div>
                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('objectives') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('objectives')}
                      disabled={isSectionComplete('objectives')}
                    >
                      {isSectionComplete('objectives') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 2: 課前預備 ====== */}
              <LessonSection id="preclass" title="課前預備（翻轉學習）" badge="預習">
                {/* 預習材料 */}
                <h3 className="text-lg font-semibold text-slate-800 mb-3">預習材料</h3>
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  <CardSection className="hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <EditableContent
                          storageKey="editable:preclass-video-title"
                          initialValue="影片：知識管理基礎理論概論（15分鐘）"
                          as="p"
                          className="font-medium text-slate-800 text-sm"
                        />
                        <EditableContent
                          storageKey="editable:preclass-video-desc"
                          initialValue="本影片介紹知識管理的基礎理論，包括Nonaka的知識創造螺旋模型、知識的分類（顯性知識與隱性知識），以及知識管理在學校組織中的應用。"
                          as="p"
                          className="text-slate-600 text-sm mt-1"
                          multiline
                        />
                        <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline">
                          觀看影片 <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection className="hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                        <ClipboardCheck className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <EditableContent
                          storageKey="editable:preclass-case-title"
                          initialValue="案例分析：某中學知識遺失事件"
                          as="p"
                          className="font-medium text-slate-800 text-sm"
                        />
                        <EditableContent
                          storageKey="editable:preclass-case-desc"
                          initialValue="閱讀此案例，思考知識流失對學校運作的影響，以及可能的預防措施。"
                          as="p"
                          className="text-slate-600 text-sm mt-1"
                          multiline
                        />
                        <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline">
                          閱讀案例 <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardSection>
                </div>

                {/* 預測驗 */}
                <h3 className="text-lg font-semibold text-slate-800 mb-3">預測驗</h3>
                <p className="text-slate-600 text-sm mb-3">請完成以下測驗，考核您對知識類型辨識與學校知識流失現象的先備認識。</p>
                {pretestQuiz && userId > 0 && (
                  <QuizComponent
                    quizId={pretestQuiz.id}
                    title={pretestQuiz.title}
                    questions={pretestQuiz.questions}
                    userId={userId}
                  />
                )}
                {(!pretestQuiz || userId <= 0) && (
                  <Card className="bg-slate-50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-slate-500 text-sm">
                        {userId <= 0 ? '請登入後參加測驗' : '測驗資料載入中...'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 引導問題 - 討論 */}
                <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">引導問題</h3>
                <div className="space-y-4">
                  {getDiscussionByIndex(0) && userId > 0 && (
                    <DiscussionComponent
                      discussionId={getDiscussionByIndex(0)!.id}
                      title={getDiscussionByIndex(0)!.title}
                      description={getDiscussionByIndex(0)!.description}
                      posts={getDiscussionByIndex(0)!.posts}
                      userId={userId}
                      userRole={userRole}
                    />
                  )}
                  {getDiscussionByIndex(1) && userId > 0 && (
                    <DiscussionComponent
                      discussionId={getDiscussionByIndex(1)!.id}
                      title={getDiscussionByIndex(1)!.title}
                      description={getDiscussionByIndex(1)!.description}
                      posts={getDiscussionByIndex(1)!.posts}
                      userId={userId}
                      userRole={userRole}
                    />
                  )}
                  {userId <= 0 && (
                    <Card className="bg-slate-50">
                      <CardContent className="pt-4 text-center">
                        <p className="text-slate-500 text-sm">請登入後參與討論</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('preclass') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('preclass')}
                      disabled={isSectionComplete('preclass')}
                    >
                      {isSectionComplete('preclass') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 3: 引言 ====== */}
              <LessonSection id="introduction" title="引言" badge="25分鐘">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <Presentation className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">情境影片</p>
                      <EditableContent
                        storageKey="editable:intro-video"
                        initialValue="展示數位時代知識增長曲線，呈現資訊爆炸時代學校面臨的知識管理挑戰。"
                        as="p"
                        className="text-blue-700 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                    <BarChart3 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">概念圖投射</p>
                      <EditableContent
                        storageKey="editable:intro-concept-map"
                        initialValue="知識創造螺旋模型 (Nonaka)：社會化（隱性→隱性）→ 外化化（隱性→顯性）→ 組合化（顯性→顯性）→ 內化化（顯性→隱性）"
                        as="p"
                        className="text-purple-700 text-sm mt-1"
                        multiline
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                    <ClipboardCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">快速問答</p>
                      <EditableContent
                        storageKey="editable:intro-quick-quiz"
                        initialValue="即時統計預測驗答對率，澄清迷思概念"
                        as="p"
                        className="text-green-700 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Concept check for introduction */}
                  {getConceptCheck('introduction') && userId > 0 && (
                    <div className="mt-4">
                      <ConceptCheckComponent
                        checkId={getConceptCheck('introduction')!.id}
                        title={getConceptCheck('introduction')!.title}
                        prompt={getConceptCheck('introduction')!.prompt}
                        checkType={getConceptCheck('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        userRole={userRole}
                      />
                    </div>
                  )}
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('introduction') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('introduction')}
                      disabled={isSectionComplete('introduction')}
                    >
                      {isSectionComplete('introduction') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 4: 發展活動 ====== */}
              <LessonSection id="development" title="發展活動" badge="130分鐘">
                <div className="space-y-6">
                  {/* 模組一 */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-100 text-blue-800">模組一</Badge>
                        <h3 className="text-lg font-semibold text-slate-800">知識審計實作</h3>
                        <Badge variant="outline">40分鐘</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                          <EditableContent
                            storageKey="editable:module1-discussion"
                            initialValue="分組討論：使用SWOT分析知識資產現況（附工作表）"
                            as="p"
                            className="text-slate-700 text-sm"
                          />
                        </div>
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                          <EditableContent
                            storageKey="editable:module1-lecture"
                            initialValue="互動講授：知識地圖繪製技巧"
                            as="p"
                            className="text-slate-700 text-sm"
                          />
                        </div>
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                          <div>
                            <EditableContent
                              storageKey="editable:module1-tool"
                              initialValue="工具下載：校務知識流經視覺化模板（Padlet即時協作）"
                              as="p"
                              className="text-slate-700 text-sm"
                            />
                            <a href="https://padlet.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 text-sm mt-1 hover:underline">
                              前往 Padlet <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        {/* SWOT work card */}
                        <CardSection className="mt-3 bg-blue-50/50">
                          <EditableContent
                            storageKey="editable:module1-swatch-title"
                            initialValue="SWOT分析工作表"
                            as="h4"
                            className="font-semibold text-slate-800"
                          />
                          <EditableContent
                            storageKey="editable:module1-swatch-desc"
                            initialValue="請使用此工作表，以SWOT分析法評估您所屬學校的知識資產現況。分別從優勢(Strengths)、劣勢(Weaknesses)、機會(Opportunities)和威脅(Threats)四個面向進行分析。"
                            as="p"
                            className="text-slate-600 text-sm mt-2"
                            multiline
                          />
                        </CardSection>

                        {/* Concept check */}
                        {getConceptCheck('module1') && userId > 0 && (
                          <div className="mt-3">
                            <ConceptCheckComponent
                              checkId={getConceptCheck('module1')!.id}
                              title={getConceptCheck('module1')!.title}
                              prompt={getConceptCheck('module1')!.prompt}
                              checkType={getConceptCheck('module1')!.checkType as 'thumbs' | 'scale' | 'text'}
                              userId={userId}
                              userRole={userRole}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 模組二 */}
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-amber-100 text-amber-800">模組二</Badge>
                        <h3 className="text-lg font-semibold text-slate-800">案例解構</h3>
                        <Badge variant="outline">30分鐘</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                          <EditableContent
                            storageKey="editable:module2-video"
                            initialValue="影片案例：某校智慧資產管理失敗案例"
                            as="p"
                            className="text-slate-700 text-sm"
                          />
                        </div>
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                          <EditableContent
                            storageKey="editable:module2-task"
                            initialValue="小組任務：標註10處關鍵決策錯誤"
                            as="p"
                            className="text-slate-700 text-sm"
                          />
                        </div>
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                          <EditableContent
                            storageKey="editable:module2-vote"
                            initialValue="投票選出前三重要警示（Kahoot競賽）"
                            as="p"
                            className="text-slate-700 text-sm"
                          />
                        </div>

                        {/* Case description card */}
                        <CardSection className="mt-3 bg-amber-50/50">
                          <EditableContent
                            storageKey="editable:module2-case-title"
                            initialValue="案例說明"
                            as="h4"
                            className="font-semibold text-slate-800"
                          />
                          <EditableContent
                            storageKey="editable:module2-case-desc"
                            initialValue="某中學在推動數位轉型過程中，由於缺乏系統性的知識管理策略，導致大量教學經驗與行政知識流失。本案例將深入分析其中的10處關鍵決策錯誤。"
                            as="p"
                            className="text-slate-600 text-sm mt-2"
                            multiline
                          />
                        </CardSection>

                        {/* Concept check */}
                        {getConceptCheck('module2') && userId > 0 && (
                          <div className="mt-3">
                            <ConceptCheckComponent
                              checkId={getConceptCheck('module2')!.id}
                              title={getConceptCheck('module2')!.title}
                              prompt={getConceptCheck('module2')!.prompt}
                              checkType={getConceptCheck('module2')!.checkType as 'thumbs' | 'scale' | 'text'}
                              userId={userId}
                              userRole={userRole}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 模組三 */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-100 text-purple-800">模組三</Badge>
                        <h3 className="text-lg font-semibold text-slate-800">機制設計工作坊</h3>
                        <Badge variant="outline">50分鐘</Badge>
                      </div>

                      <h4 className="font-semibold text-slate-800 text-sm mb-2">設計挑戰</h4>
                      <div className="space-y-2 mb-4">
                        {[
                          { key: 'editable:module3-challenge1', label: '1. 後疫情時代教師經驗傳承', defaultText: '後疫情時代，許多學校面臨教師經驗傳承的斷層問題。線上教學期間積累的寶貴經驗如何系統化保存？如何建立有效的教師經驗分享機制？' },
                          { key: 'editable:module3-challenge2', label: '2. 新移民學生文化知識整合', defaultText: '新移民學生帶來豐富的文化知識，但學校如何有效整合這些多元文化資源？如何建立包容性的知識共享平台？' },
                          { key: 'editable:module3-challenge3', label: '3. 數位教學資源庫維護', defaultText: '數位教學資源庫的維護面臨諸多挑戰：資源過時、分類不當、使用率低等。如何建立可持續的資源庫管理機制？' },
                        ].map((challenge) => (
                          <CardSection key={challenge.key} className="bg-purple-50/50">
                            <EditableContent
                              storageKey={`${challenge.key}-title`}
                              initialValue={challenge.label}
                              as="p"
                              className="font-medium text-slate-800 text-sm"
                            />
                            <EditableContent
                              storageKey={challenge.key}
                              initialValue={challenge.defaultText}
                              as="p"
                              className="text-slate-600 text-sm mt-1"
                              multiline
                            />
                          </CardSection>
                        ))}
                      </div>

                      <h4 className="font-semibold text-slate-800 text-sm mb-2">輸出成果</h4>
                      <div className="grid gap-2 sm:grid-cols-3 mb-3">
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-sm text-slate-700">
                          <BarChart3 className="h-4 w-4 text-purple-500" />
                          流程圖
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-sm text-slate-700">
                          <Lightbulb className="h-4 w-4 text-purple-500" />
                          動機維持策略
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-sm text-slate-700">
                          <ClipboardCheck className="h-4 w-4 text-purple-500" />
                          風險管理矩陣
                        </div>
                      </div>

                      {/* Concept check */}
                      {getConceptCheck('module3') && userId > 0 && (
                        <div className="mt-3">
                          <ConceptCheckComponent
                            checkId={getConceptCheck('module3')!.id}
                            title={getConceptCheck('module3')!.title}
                            prompt={getConceptCheck('module3')!.prompt}
                            checkType={getConceptCheck('module3')!.checkType as 'thumbs' | 'scale' | 'text'}
                            userId={userId}
                            userRole={userRole}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 中場休息 */}
                  <Card className="border-dashed border-2 bg-slate-50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-slate-500 font-medium">
                        ☕ 中場休息（10分鐘）— 知識管理術語速配（數位抽卡）
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('development') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('development')}
                      disabled={isSectionComplete('development')}
                    >
                      {isSectionComplete('development') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 5: 總結與延伸 ====== */}
              <LessonSection id="summary" title="總結與延伸" badge="25分鐘">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <Activity className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-800">知識拍賣會</p>
                      <EditableContent
                        storageKey="editable:summary-auction"
                        initialValue="各組競標其他組的設計方案，透過競爭機制深化對知識共享機制的理解"
                        as="p"
                        className="text-emerald-700 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <BarChart3 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">即時反饋</p>
                      <EditableContent
                        storageKey="editable:summary-feedback"
                        initialValue="使用WordArt進行關鍵詞雲投射，視覺化呈現課程核心概念"
                        as="p"
                        className="text-blue-700 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <BookOpen className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">課後預告</p>
                      <EditableContent
                        storageKey="editable:summary-preview"
                        initialValue="引導至校務資料開放政策議題，為下節課做準備"
                        as="p"
                        className="text-amber-700 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Concept check */}
                  {getConceptCheck('summary') && userId > 0 && (
                    <div className="mt-4">
                      <ConceptCheckComponent
                        checkId={getConceptCheck('summary')!.id}
                        title={getConceptCheck('summary')!.title}
                        prompt={getConceptCheck('summary')!.prompt}
                        checkType={getConceptCheck('summary')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        userRole={userRole}
                      />
                    </div>
                  )}
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('summary') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('summary')}
                      disabled={isSectionComplete('summary')}
                    >
                      {isSectionComplete('summary') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 6: 評估方式 ====== */}
              <LessonSection id="assessment" title="評估方式" badge="評量">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">形成性評估</h3>
                  <CardSection>
                    <EditableContent
                      storageKey="editable:assessment-formative-desc"
                      initialValue="形成性評估旨在即時了解學生學習狀況，透過即時答題和案例分析評分，幫助教師調整教學策略。"
                      as="p"
                      className="text-slate-700 text-sm"
                      multiline
                    />
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        即時答題反應正確率（Mentimeter即時回饋）
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        案例分析小組評分表（提供評分項目：完整性/創新性/可行性）
                      </div>
                    </div>
                  </CardSection>

                  <h3 className="text-lg font-semibold text-slate-800">總結性評估</h3>
                  <CardSection>
                    <EditableContent
                      storageKey="editable:assessment-summary-desc"
                      initialValue="期末專案要求學生撰寫2,000字的學校知識管理診斷報告，評分標準包括：理論應用準確度（30%）、解決方案可執行性（40%）、資料佐證豐富度（30%）。"
                      as="p"
                      className="text-slate-700 text-sm"
                      multiline
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="text-center p-3 rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-700">30%</p>
                        <p className="text-sm text-blue-600">理論應用準確度</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-emerald-50">
                        <p className="text-2xl font-bold text-emerald-700">40%</p>
                        <p className="text-sm text-emerald-600">解決方案可執行性</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-50">
                        <p className="text-2xl font-bold text-amber-700">30%</p>
                        <p className="text-sm text-amber-600">資料佐證豐富度</p>
                      </div>
                    </div>
                  </CardSection>
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('assessment') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('assessment')}
                      disabled={isSectionComplete('assessment')}
                    >
                      {isSectionComplete('assessment') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 7: 建構一致矩陣 ====== */}
              <LessonSection id="alignment" title="建構一致矩陣" badge="對照">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200 rounded-lg">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 font-semibold text-slate-800 border-b border-slate-200">學習目標</th>
                        <th className="text-left p-3 font-semibold text-slate-800 border-b border-slate-200">教學活動</th>
                        <th className="text-left p-3 font-semibold text-slate-800 border-b border-slate-200">評估方法</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">
                          <Badge className="bg-blue-100 text-blue-800 mr-1">分析</Badge>
                          分析挑戰與機遇
                        </td>
                        <td className="p-3 text-slate-700">知識增長影片 + 數位問答</td>
                        <td className="p-3 text-slate-700">專案報告理論應用分析</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800 mr-1">應用</Badge>
                          知識審計應用
                        </td>
                        <td className="p-3 text-slate-700">編製SWOT矩陣實作</td>
                        <td className="p-3 text-slate-700">案例分析評分</td>
                      </tr>
                      <tr>
                        <td className="p-3">
                          <Badge className="bg-purple-100 text-purple-800 mr-1">創造</Badge>
                          機制設計創新
                        </td>
                        <td className="p-3 text-slate-700">分組設計 + 競標活動</td>
                        <td className="p-3 text-slate-700">流程圖評量 + 創意指標</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('alignment') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('alignment')}
                      disabled={isSectionComplete('alignment')}
                    >
                      {isSectionComplete('alignment') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 8: 教學資源需求 ====== */}
              <LessonSection id="resources" title="教學資源需求" badge="工具">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Padlet 即時協作牆', url: 'https://padlet.com', icon: '📋' },
                    { name: 'Mentimeter 互動投影片', url: 'https://mentimeter.com', icon: '📊' },
                    { name: 'Visio 知識地圖模板', url: '#', icon: '🗺️' },
                    { name: '學校知識審計白皮書', url: '#', icon: '📄' },
                    { name: '數位徽章系統開發教學影片', url: '#', icon: '🎬' },
                  ].map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all"
                    >
                      <span className="text-xl">{resource.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{resource.name}</p>
                        <p className="text-slate-500 text-xs truncate">{resource.url}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('resources') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('resources')}
                      disabled={isSectionComplete('resources')}
                    >
                      {isSectionComplete('resources') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 9: 差異化設計 ====== */}
              <LessonSection id="differentiation" title="差異化設計" badge="適性">
                <div className="space-y-3">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-green-100 text-green-800 shrink-0">補救教學</Badge>
                      <EditableContent
                        storageKey="editable:remedial-desc"
                        initialValue="提供知識類型圖解對照表（PDF），幫助學生理解顯性知識與隱性知識的區別及其在學校組織中的應用。"
                        as="p"
                        className="text-slate-700 text-sm"
                        multiline
                      />
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-100 text-purple-800 shrink-0">進階任務</Badge>
                      <EditableContent
                        storageKey="editable:advanced-desc"
                        initialValue="額外挑戰設計：探討AI導入知識管理的倫理問題，包括數據隱私、算法偏見、知識壟斷等議題。"
                        as="p"
                        className="text-slate-700 text-sm"
                        multiline
                      />
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-800 shrink-0">多語輔助</Badge>
                      <EditableContent
                        storageKey="editable:multilingual-desc"
                        initialValue="提供簡介英文關鍵術語對照表，幫助學生理解知識管理領域的重要英文術語。"
                        as="p"
                        className="text-slate-700 text-sm"
                        multiline
                      />
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-amber-100 text-amber-800 shrink-0">無障礙設計</Badge>
                      <EditableContent
                        storageKey="editable:accessibility-desc"
                        initialValue="所有數位工具提供文字語音轉換功能，確保不同需求的學生都能順利參與課程。"
                        as="p"
                        className="text-slate-700 text-sm"
                        multiline
                      />
                    </div>
                  </CardSection>
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('differentiation') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('differentiation')}
                      disabled={isSectionComplete('differentiation')}
                    >
                      {isSectionComplete('differentiation') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== Section 10: 教學反思機制 ====== */}
              <LessonSection id="reflection" title="教學反思機制" badge="反思">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">課後問卷追蹤</h3>
                  <CardSection>
                    <EditableContent
                      storageKey="editable:reflection-tool-desc"
                      initialValue="課後問卷追蹤：技術工具易用度評估、小組互動有效性指標、理論實務連結清晰度。"
                      as="p"
                      className="text-slate-700 text-sm"
                      multiline
                    />
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        技術工具易用度評估
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        小組互動有效性指標
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        理論實務連結清晰度
                      </div>
                    </div>
                  </CardSection>

                  <h3 className="text-lg font-semibold text-slate-800">成效指標</h3>
                  <CardSection>
                    <EditableContent
                      storageKey="editable:reflection-indicator-desc"
                      initialValue="成效指標：案例分析深度、專案報告創新提案數、教授介入次數統計。"
                      as="p"
                      className="text-slate-700 text-sm"
                      multiline
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="text-center p-3 rounded-lg bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">案例分析深度</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">專案報告創新提案數</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">教授介入次數統計</p>
                      </div>
                    </div>
                  </CardSection>
                </div>

                {!isTeacher && userId > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={isSectionComplete('reflection') ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleMarkComplete('reflection')}
                      disabled={isSectionComplete('reflection')}
                    >
                      {isSectionComplete('reflection') ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> 已完成</>
                      ) : (
                        '標記完成'
                      )}
                    </Button>
                  </div>
                )}
              </LessonSection>

              {/* ====== 附件下載 ====== */}
              <LessonSection id="attachments" title="附件下載" badge="資源">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: '知識審計工作表模板', format: 'Word', color: 'bg-blue-500' },
                    { name: '風險管理矩陣指南', format: 'Excel', color: 'bg-green-500' },
                    { name: '校務知識地圖範本', format: 'Visio', color: 'bg-purple-500' },
                    { name: '進階讀物：數位永續知識管理策略', format: 'PDF', color: 'bg-red-500' },
                  ].map((attachment, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg ${attachment.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {attachment.format}
                      </div>
                      <div className="flex-1 min-w-0">
                        <EditableContent
                          storageKey={`editable:attachment-${i + 1}`}
                          initialValue={attachment.name}
                          as="p"
                          className="font-medium text-slate-800 text-sm"
                        />
                      </div>
                      <Download className="h-4 w-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </LessonSection>

              {/* Quick link to slides */}
              <div className="text-center py-6">
                <Link href="/slides">
                  <Button size="lg" className="gap-2">
                    <Presentation className="h-5 w-5" />
                    查看課堂投影片
                  </Button>
                </Link>
              </div>
            </main>
          </div>
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
