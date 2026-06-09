'use client';

import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts';
import { useEffect, useState, useCallback } from 'react';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { getDiscussionByKey } from '@/lib/actions/discussion';
import { getConceptChecks, getUserConceptCheckResponse } from '@/lib/actions/concept-check';
import { getStudentProgress, markSectionComplete } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, LogIn, Video, HelpCircle, BookOpen } from 'lucide-react';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonContent from '@/components/lesson/content/LessonContent';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import QuizComponent from '@/components/lesson/interactive/Quiz';
import DiscussionComponent from '@/components/lesson/interactive/Discussion';
import ConceptCheckComponent from '@/components/lesson/interactive/ConceptCheck';
import Link from 'next/link';
import { toast } from 'sonner';

// --- Types ---

interface QuizData {
  quiz: { id: number; storageKey: string; title: string; description: string | null };
  questions: Array<{
    id: number;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'short_answer';
    explanation: string | null;
    answers: Array<{ id: number; answerText: string; isCorrect: boolean }>;
  }>;
}

interface DiscussionData {
  discussionId: number;
  title: string;
  description: string | null;
  posts: Array<{
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
  sectionKey: string | null;
  existingResponse: string | null;
}

// --- Section Definitions ---

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'segment1', label: 'Accounting Equation' },
  { id: 'segment2', label: 'Transaction Analysis' },
  { id: 'segment3', label: 'CapEx vs OpEx' },
  { id: 'segment4', label: 'Dual Effect' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'financial-impact', label: 'Financial Impact' },
  { id: 'resources', label: 'Resources' },
  { id: 'alignment', label: 'Alignment' },
];

// --- Main Component ---

export default function LessonPageClient() {
  const { user, isGuest } = useUser();
  const [preClassQuiz, setPreClassQuiz] = useState<QuizData | null>(null);
  const [summativeQuiz, setSummativeQuiz] = useState<QuizData | null>(null);
  const [discussions, setDiscussions] = useState<Map<string, DiscussionData>>(new Map());
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all quizzes
      const quizzesResult = await getAllQuizzes();
      const allQuizzes = quizzesResult.success ? quizzesResult.data ?? [] : [];

      // Find and fetch pre-class quiz
      const preClassQuizMeta = allQuizzes.find(q => q.storageKey === 'quiz:preclass');
      if (preClassQuizMeta) {
        const result = await getQuiz(preClassQuizMeta.id);
        if (result.success && result.data) {
          setPreClassQuiz(result.data as QuizData);
        }
      }

      // Find and fetch summative quiz
      const summativeQuizMeta = allQuizzes.find(q => q.storageKey === 'quiz:summative');
      if (summativeQuizMeta) {
        const result = await getQuiz(summativeQuizMeta.id);
        if (result.success && result.data) {
          setSummativeQuiz(result.data as QuizData);
        }
      }

      // Fetch discussions
      const discMap = new Map<string, DiscussionData>();
      const discussionKeys = ['discussion:cathay-vs-dumpling', 'discussion:guiding-question'];
      for (const key of discussionKeys) {
        const result = await getDiscussionByKey(key);
        if (result.success && result.data) {
          const { discussion, posts } = result.data;
          discMap.set(key, {
            discussionId: discussion.id,
            title: discussion.title,
            description: discussion.description,
            posts: posts.map(p => ({
              id: p.id,
              parentId: p.parentPostId,
              authorId: p.authorId,
              authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
              content: p.content,
              createdAt: p.createdAt?.toString() ?? new Date().toString(),
            })),
          });
        }
      }
      setDiscussions(discMap);

      // Fetch concept checks
      const ccResult = await getConceptChecks();
      const checks = ccResult.success ? ccResult.data ?? [] : [];

      // Fetch existing responses for each concept check
      const userId = user?.userId ?? -1;
      const checksWithResponses: ConceptCheckData[] = [];
      for (const check of checks) {
        let existingResponse: string | null = null;
        if (userId > 0) {
          existingResponse = await getUserConceptCheckResponse(check.id, userId);
        }
        checksWithResponses.push({
          id: check.id,
          storageKey: check.storageKey,
          title: check.title,
          prompt: check.prompt,
          checkType: check.checkType as 'thumbs' | 'scale' | 'text',
          sectionKey: check.sectionKey,
          existingResponse,
        });
      }
      setConceptChecks(checksWithResponses);

      // Fetch student progress
      if (userId > 0) {
        const progressResult = await getStudentProgress(userId);
        if (progressResult.success && progressResult.data) {
          const completedKeys = new Set(
            progressResult.data.filter(p => p.completed).map(p => p.sectionKey)
          );
          setProgress(completedKeys);
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setProgress(prev => new Set([...prev, sectionKey]));
      toast.success('Section marked as complete!');
    }
  }

  function getConceptChecksForSection(sectionKey: string): ConceptCheckData[] {
    return conceptChecks.filter(cc => cc.sectionKey === sectionKey);
  }

  function renderLoginPrompt() {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
        <LogIn className="h-4 w-4 shrink-0" />
        <span>Please <Link href="/login" className="underline font-medium">sign in</Link> to participate in interactive activities.</span>
      </div>
    );
  }

  function renderCompleteButton(sectionKey: string) {
    if (!user || user.userId <= 0) return null;
    const isComplete = progress.has(sectionKey);
    return (
      <div className="mt-4 flex items-center gap-3">
        <Button
          variant={isComplete ? 'ghost' : 'outline'}
          size="sm"
          disabled={isComplete}
          onClick={() => handleMarkComplete(sectionKey)}
          className="gap-2"
        >
          <CheckCircle className={`h-4 w-4 ${isComplete ? 'text-emerald-600' : ''}`} />
          {isComplete ? 'Completed' : 'Mark as Complete'}
        </Button>
        {isComplete && (
          <span className="text-xs text-emerald-600 font-medium">Section completed</span>
        )}
      </div>
    );
  }

  // --- Loading State ---

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // --- Main Render ---

  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';

  return (
    <ScrollRootProvider>
      <div className="flex max-w-7xl mx-auto px-4 py-6 gap-8">
        <LessonSideMenu sections={SECTIONS} />
        <main className="flex-1 min-w-0 space-y-8">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              <EditableContent storageKey="lesson:title" initialValue="The Accounting Equation: From Street Vendors to Skyscrapers" />
            </h1>
            <p className="text-muted-foreground mt-2">
              <EditableContent storageKey="lesson:subtitle" initialValue="Understanding how every Hong Kong business uses the same fundamental accounting principle." />
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary">Accounting</Badge>
              <Badge variant="outline">University Level</Badge>
              <Link href="/slides">
                <Button variant="outline" size="sm" className="gap-1.5 ml-2">
                  <BookOpen className="h-4 w-4" />
                  View Slides
                </Button>
              </Link>
            </div>
          </div>

          <Separator />

          {/* ILOs Section */}
          <LessonSection id="ilos" title="Intended Learning Outcomes" badge="ILOs">
            <LessonContent
              storageKey="ilos:content"
              initialValue={`By the end of this lesson, students will be able to:\n- ILO1: Define and explain the fundamental accounting equation (Assets = Liabilities + Owner's Equity)\n- ILO2: Classify business transactions into their correct elements (assets, liabilities, owner's equity)\n- ILO3: Analyze how different types of transactions affect the accounting equation across business scales\n- ILO4: Differentiate between capital expenditures and operating expenses in real-world Hong Kong contexts\n- ILO5: Apply the accounting equation to solve basic transaction analysis problems`}
              className="text-slate-700"
            />
            {renderCompleteButton('ilos')}
          </LessonSection>

          {/* Pre-Class Preparation */}
          <LessonSection id="preclass" title="Pre-Class Preparation" badge="Pre-Class">
            <div className="space-y-6">
              {/* Video */}
              <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <EditableContent storageKey="preclass:video-title" initialValue="Pre-Class Video" />
                </h3>
                <div className="bg-slate-100 rounded-lg p-6 text-center border border-slate-200">
                  <Video className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">
                    <EditableContent storageKey="preclass:video-name" initialValue='"Accounting in Action: From Street Vendors to Skyscrapers"' />
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    <EditableContent storageKey="preclass:video-desc" initialValue="7-minute animated documentary: Corporate (Cathay Pacific), Small Business (dumpling cart), Non-Profit (Tung Wah Group)" />
                  </p>
                </div>
              </div>

              {/* Pre-Test Quiz */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Pre-Test Quiz</h3>
                {userId > 0 && preClassQuiz ? (
                  <QuizComponent
                    quizId={preClassQuiz.quiz.id}
                    title={preClassQuiz.quiz.title}
                    questions={preClassQuiz.questions}
                    userId={userId}
                  />
                ) : userId <= 0 ? (
                  renderLoginPrompt()
                ) : (
                  <p className="text-sm text-muted-foreground">Quiz not available yet.</p>
                )}
              </div>

              {/* Guiding Question */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4" />
                  Guiding Question
                </h3>
                <p className="text-blue-800 text-sm">
                  <EditableContent
                    storageKey="preclass:guiding-question"
                    initialValue="If you open a Kowloon City bubble tea stall with personal savings vs. bank loan, how does each choice affect your accounting equation? Try simple calculations."
                    multiline
                  />
                </p>
              </div>
            </div>
            {renderCompleteButton('preclass')}
          </LessonSection>

          {/* Introduction / Hook Activity */}
          <LessonSection id="introduction" title="Introduction - Hook Activity" badge="Hook">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-semibold text-blue-900 mb-3">Think About This...</h3>
                <LessonContent
                  storageKey="introduction:hook"
                  initialValue={`In the documentary, Cathay paid HK$20M for new business class seats. How did this affect:\n- 1. Their assets?\n- 2. Their liabilities?\n- 3. Owner's equity?\n\nConsider: The seats are a long-term asset that will serve the airline for years. This is different from buying ingredients that are consumed immediately.`}
                  className="text-blue-800 text-sm"
                />
              </div>
              {isGuest && renderLoginPrompt()}
            </div>
            {renderCompleteButton('introduction')}
          </LessonSection>

          {/* Segment 1: The Accounting Equation */}
          <LessonSection id="segment1" title="The Accounting Equation Explained" badge="Segment 1">
            <div className="space-y-6">
              {/* Key Equation */}
              <div className="bg-slate-900 text-white rounded-xl p-6 text-center">
                <p className="text-sm text-slate-300 mb-2 uppercase tracking-wider font-medium">The Fundamental Equation</p>
                <p className="text-3xl sm:text-4xl font-bold tracking-wide">
                  Assets = Liabilities + Owner&apos;s Equity
                </p>
                <p className="text-slate-400 text-sm mt-3">This equation MUST always balance.</p>
              </div>

              {/* Interactive Lecture Comparison */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Cathay Pacific</h4>
                  <p className="text-sm text-blue-800">
                    <EditableContent storageKey="segment1:cathay" initialValue="$200M aircraft upgrades" multiline />
                  </p>
                  <Badge className="mt-2" variant="default">Capital Asset</Badge>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Tai Kok Tsui Dumpling Cart</h4>
                  <p className="text-sm text-orange-800">
                    <EditableContent storageKey="segment1:dumpling" initialValue="$1,200 wok replacement" multiline />
                  </p>
                  <Badge className="mt-2" variant="secondary">Operating Expense</Badge>
                </div>
              </div>

              {/* Key Concepts */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Key Concepts</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <p className="font-bold text-emerald-800 text-lg">Assets</p>
                    <p className="text-xs text-emerald-700 mt-1">What the business OWNS</p>
                    <p className="text-xs text-emerald-600 mt-1">Cash, equipment, property</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="font-bold text-red-800 text-lg">Liabilities</p>
                    <p className="text-xs text-red-700 mt-1">What the business OWES</p>
                    <p className="text-xs text-red-600 mt-1">Loans, payables</p>
                  </div>
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-center">
                    <p className="font-bold text-violet-800 text-lg">Owner&apos;s Equity</p>
                    <p className="text-xs text-violet-700 mt-1">What belongs to the OWNER</p>
                    <p className="text-xs text-violet-600 mt-1">Capital, retained earnings</p>
                  </div>
                </div>
              </div>

              {/* Concept Checks */}
              {getConceptChecksForSection('segment1').map(cc => (
                <ConceptCheckComponent
                  key={cc.id}
                  checkId={cc.id}
                  title={cc.title}
                  prompt={cc.prompt}
                  checkType={cc.checkType}
                  userId={userId}
                  userRole={userRole}
                  existingResponse={cc.existingResponse}
                />
              ))}
              {isGuest && getConceptChecksForSection('segment1').length === 0 && renderLoginPrompt()}
            </div>
            {renderCompleteButton('segment1')}
          </LessonSection>

          {/* Segment 2: Transaction Analysis */}
          <LessonSection id="segment2" title="Transaction Analysis in Practice" badge="Segment 2">
            <div className="space-y-6">
              {/* Bubble Tea Stall Example */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Kowloon City Bubble Tea Stall</h4>
                <LessonContent
                  storageKey="segment2:bubble-tea"
                  initialValue={`- Owner invests HK$50,000 personal savings\n- Takes bank loan of HK$30,000\n- Purchases equipment for HK$20,000\n- Buys ingredients for HK$5,000 (cash)\n- Earns HK$8,000 revenue (first week)`}
                  className="text-slate-700"
                />
              </div>

              {/* Worked Example Table */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Worked Example</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 border border-slate-200 font-semibold">Transaction</th>
                        <th className="text-left p-3 border border-slate-200 font-semibold">Assets</th>
                        <th className="text-left p-3 border border-slate-200 font-semibold">Liabilities</th>
                        <th className="text-left p-3 border border-slate-200 font-semibold">Owner&apos;s Equity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border border-slate-200">Owner invests HK$50K</td>
                        <td className="p-3 border border-slate-200 text-emerald-700">+HK$50K (Cash)</td>
                        <td className="p-3 border border-slate-200">No change</td>
                        <td className="p-3 border border-slate-200 text-violet-700">+HK$50K (Capital)</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200">Bank loan HK$30K</td>
                        <td className="p-3 border border-slate-200 text-emerald-700">+HK$30K (Cash)</td>
                        <td className="p-3 border border-slate-200 text-red-700">+HK$30K (Loan)</td>
                        <td className="p-3 border border-slate-200">No change</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200">Buy equipment HK$20K</td>
                        <td className="p-3 border border-slate-200 text-emerald-700">+HK$20K (Equip)<br/>-HK$20K (Cash)</td>
                        <td className="p-3 border border-slate-200">No change</td>
                        <td className="p-3 border border-slate-200">No change</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-slate-200">Buy ingredients HK$5K</td>
                        <td className="p-3 border border-slate-200 text-red-600">-HK$5K (Cash)</td>
                        <td className="p-3 border border-slate-200">No change</td>
                        <td className="p-3 border border-slate-200 text-red-600">-HK$5K (Expense)</td>
                      </tr>
                      <tr className="bg-emerald-50">
                        <td className="p-3 border border-slate-200">Revenue HK$8K</td>
                        <td className="p-3 border border-slate-200 text-emerald-700">+HK$8K (Cash)</td>
                        <td className="p-3 border border-slate-200">No change</td>
                        <td className="p-3 border border-slate-200 text-emerald-700">+HK$8K (Revenue)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cathay Pacific Example */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Cathay Pacific Transactions</h4>
                <LessonContent
                  storageKey="segment2:cathay"
                  initialValue={`- Leases aircraft for HK$500M (operating lease)\n- Purchases spare parts inventory for HK$10M\n- Pays employee salaries HK$200M\n- Receives prepayment for flights HK$50M`}
                  className="text-slate-700"
                />
              </div>

              {/* Tung Wah Group Example */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Tung Wah Group (Non-Profit)</h4>
                <LessonContent
                  storageKey="segment2:tungwah"
                  initialValue={`- Receives donation HK$1M\n- Purchases medical equipment HK$300K\n- Pays staff salaries HK$200K\n- Records restricted fund HK$500K`}
                  className="text-slate-700"
                />
              </div>

              {/* Concept Checks */}
              {getConceptChecksForSection('segment2').map(cc => (
                <ConceptCheckComponent
                  key={cc.id}
                  checkId={cc.id}
                  title={cc.title}
                  prompt={cc.prompt}
                  checkType={cc.checkType}
                  userId={userId}
                  userRole={userRole}
                  existingResponse={cc.existingResponse}
                />
              ))}
            </div>
            {renderCompleteButton('segment2')}
          </LessonSection>

          {/* Segment 3: CapEx vs OpEx */}
          <LessonSection id="segment3" title="Capital Expenditure vs Operating Expense" badge="Segment 3">
            <div className="space-y-6">
              <LessonContent
                storageKey="segment3:intro"
                initialValue={`Key Principle: Materiality and useful life determine classification.\n- If an item provides benefit beyond one year and exceeds a materiality threshold, it is capitalized\n- Otherwise, it is expensed immediately`}
                className="text-slate-700"
              />

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left p-3 border border-slate-200 font-semibold">Transaction</th>
                      <th className="text-left p-3 border border-slate-200 font-semibold">Dumpling Cart</th>
                      <th className="text-left p-3 border border-slate-200 font-semibold">Cathay Pacific</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-slate-200 font-medium">Buying kitchen equipment</td>
                      <td className="p-3 border border-slate-200 text-orange-700">Immediate expense (short term)</td>
                      <td className="p-3 border border-slate-200 text-blue-700">Capitalized as asset (long-term)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200 font-medium">Receiving prepayment</td>
                      <td className="p-3 border border-slate-200 text-red-700">Liability (needs delivery)</td>
                      <td className="p-3 border border-slate-200 text-red-700">Same classification path</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200 font-medium">Purchasing vehicle</td>
                      <td className="p-3 border border-slate-200 text-orange-700">Expense if small van</td>
                      <td className="p-3 border border-slate-200 text-blue-700">Capital asset if fleet vehicle</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200 font-medium">Staff salaries</td>
                      <td className="p-3 border border-slate-200">Operating expense</td>
                      <td className="p-3 border border-slate-200">Operating expense</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200 font-medium">Major renovation</td>
                      <td className="p-3 border border-slate-200 text-orange-700">Expense (low value)</td>
                      <td className="p-3 border border-slate-200 text-blue-700">Capitalized (adds value to property)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Guided Discussion */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Guided Discussion</h4>
                <p className="text-indigo-800 text-sm">
                  <EditableContent
                    storageKey="segment3:discussion-prompt"
                    initialValue="Why does Cathay record this as an asset while the street vendor treats similar purchases as expenses? Consider business scale and asset lifespan."
                    multiline
                  />
                </p>
              </div>

              {/* Discussion Component */}
              {userId > 0 && discussions.get('discussion:cathay-vs-dumpling') ? (
                <DiscussionComponent
                  discussionId={discussions.get('discussion:cathay-vs-dumpling')!.discussionId}
                  title={discussions.get('discussion:cathay-vs-dumpling')!.title}
                  description={discussions.get('discussion:cathay-vs-dumpling')!.description}
                  posts={discussions.get('discussion:cathay-vs-dumpling')!.posts}
                  userId={userId}
                  userRole={userRole}
                />
              ) : isGuest ? (
                renderLoginPrompt()
              ) : null}

              {/* Concept Checks */}
              {getConceptChecksForSection('segment3').map(cc => (
                <ConceptCheckComponent
                  key={cc.id}
                  checkId={cc.id}
                  title={cc.title}
                  prompt={cc.prompt}
                  checkType={cc.checkType}
                  userId={userId}
                  userRole={userRole}
                  existingResponse={cc.existingResponse}
                />
              ))}
            </div>
            {renderCompleteButton('segment3')}
          </LessonSection>

          {/* Segment 4: Dual Effect Principle */}
          <LessonSection id="segment4" title="The Dual Effect Principle" badge="Segment 4">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6">
                <p className="text-center text-lg font-semibold mb-4">Every Transaction Has a Dual Effect</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span>1. Investment</span>
                    <span className="text-emerald-400">Cash &uarr; AND Owner&apos;s Equity &uarr;</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span>2. Loan</span>
                    <span className="text-amber-400">Cash &uarr; AND Liabilities &uarr;</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span>3. Equipment purchase</span>
                    <span className="text-blue-400">Equipment &uarr; AND Cash &darr;</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span>4. Revenue</span>
                    <span className="text-emerald-400">Cash &uarr; AND Owner&apos;s Equity &uarr;</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>5. Expense</span>
                    <span className="text-red-400">Cash &darr; AND Owner&apos;s Equity &darr;</span>
                  </div>
                </div>
                <p className="text-center text-slate-400 text-xs mt-4">The equation ALWAYS stays in balance.</p>
              </div>

              {/* Discussion Component */}
              {userId > 0 && discussions.get('discussion:guiding-question') ? (
                <DiscussionComponent
                  discussionId={discussions.get('discussion:guiding-question')!.discussionId}
                  title={discussions.get('discussion:guiding-question')!.title}
                  description={discussions.get('discussion:guiding-question')!.description}
                  posts={discussions.get('discussion:guiding-question')!.posts}
                  userId={userId}
                  userRole={userRole}
                />
              ) : isGuest ? (
                renderLoginPrompt()
              ) : null}

              {/* Concept Checks */}
              {getConceptChecksForSection('segment4').map(cc => (
                <ConceptCheckComponent
                  key={cc.id}
                  checkId={cc.id}
                  title={cc.title}
                  prompt={cc.prompt}
                  checkType={cc.checkType}
                  userId={userId}
                  userRole={userRole}
                  existingResponse={cc.existingResponse}
                />
              ))}
            </div>
            {renderCompleteButton('segment4')}
          </LessonSection>

          {/* Assessment Section */}
          <LessonSection id="assessment" title="Assessment" badge="Assessment">
            <div className="space-y-6">
              {/* Summative Quiz */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Summative Assessment Quiz</h4>
                {userId > 0 && summativeQuiz ? (
                  <QuizComponent
                    quizId={summativeQuiz.quiz.id}
                    title={summativeQuiz.quiz.title}
                    questions={summativeQuiz.questions}
                    userId={userId}
                  />
                ) : userId <= 0 ? (
                  renderLoginPrompt()
                ) : (
                  <p className="text-sm text-muted-foreground">Quiz not available yet.</p>
                )}
              </div>

              {/* Case Study */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h4 className="font-semibold text-amber-900 mb-2">Case Study</h4>
                <LessonContent
                  storageKey="assessment:case-study"
                  initialValue={`Analyze Hong Kong Openrice.com's recent transactions:\n- Purchased servers for $500k (Capital Asset)\n- Paid $50k deposit to expand office space (Prepaid Expense)\n\nRubric note: +15% for explaining why identical transaction types (e.g., equipment purchases) might be treated differently by SMEs vs. corporations`}
                  className="text-amber-800 text-sm"
                />
              </div>

              {/* Concept Checks */}
              {getConceptChecksForSection('assessment').map(cc => (
                <ConceptCheckComponent
                  key={cc.id}
                  checkId={cc.id}
                  title={cc.title}
                  prompt={cc.prompt}
                  checkType={cc.checkType}
                  userId={userId}
                  userRole={userRole}
                  existingResponse={cc.existingResponse}
                />
              ))}
            </div>
            {renderCompleteButton('assessment')}
          </LessonSection>

          {/* Financial Statement Impact */}
          <LessonSection id="financial-impact" title="Financial Statement Impact" badge="Examples">
            <div className="space-y-6">
              {/* Dumpling Cart Balance Sheet */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Dumpling Cart Balance Sheet (After 1 month)</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="font-bold text-emerald-800 mb-2">Assets: HK$83,000</p>
                    <p className="text-xs text-emerald-700">Cash: HK$63,000</p>
                    <p className="text-xs text-emerald-700">Equipment: HK$20,000</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-bold text-red-800 mb-2">Liabilities: HK$30,000</p>
                    <p className="text-xs text-red-700">Bank Loan: HK$30,000</p>
                  </div>
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                    <p className="font-bold text-violet-800 mb-2">Owner&apos;s Equity: HK$53,000</p>
                    <p className="text-xs text-violet-700">Capital: HK$50,000</p>
                    <p className="text-xs text-violet-700">Revenue: HK$8,000</p>
                    <p className="text-xs text-violet-700">Expenses: -HK$5,000</p>
                  </div>
                </div>
                <div className="mt-3 bg-slate-900 text-white rounded-lg p-3 text-center text-sm font-mono">
                  HK$83,000 = HK$30,000 + HK$53,000 &#10003;
                </div>
              </div>

              <LessonContent
                storageKey="financial-impact:cathay"
                initialValue={`Cathay Pacific (Simplified Balance Sheet):\n- Assets: Cash + Aircraft + Inventory + Prepayments\n- Liabilities: Loans + Advance ticket sales + Salaries payable\n- Owner's Equity: Share capital + Retained earnings\n\nThe same fundamental equation applies regardless of business size!`}
                className="text-slate-700"
              />
            </div>
            {renderCompleteButton('financial-impact')}
          </LessonSection>

          {/* Differentiation & Resources */}
          <LessonSection id="resources" title="Differentiation & Resources" badge="Support">
            <div className="space-y-6">
              {/* Language Support */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Language Support (Putonghua)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  <div className="bg-slate-50 rounded p-2 border">
                    <span className="font-medium">Assets</span> = &#36164;&#20135; (z&#299;ch&#462;n)
                  </div>
                  <div className="bg-slate-50 rounded p-2 border">
                    <span className="font-medium">Liabilities</span> = &#36127;&#20538; (f&#249;zh&#224;i)
                  </div>
                  <div className="bg-slate-50 rounded p-2 border">
                    <span className="font-medium">Owner&apos;s Equity</span> = &#25152;&#26377;&#32773;&#26435;&#30410; (su&#462;y&#466;uzh&#283; qu&#225;ny&#236;)
                  </div>
                  <div className="bg-slate-50 rounded p-2 border">
                    <span className="font-medium">Revenue</span> = &#25910;&#20837; (sh&#333;ur&#249;)
                  </div>
                  <div className="bg-slate-50 rounded p-2 border">
                    <span className="font-medium">Expense</span> = &#36153;&#29992; (f&#232;iy&#242;ng)
                  </div>
                  <div className="bg-slate-50 rounded p-2 border">
                    <span className="font-medium">CapEx</span> = &#36164;&#26412;&#25903;&#20986; (z&#299;b&#283;n zh&#299;ch&#363;)
                  </div>
                </div>
              </div>

              {/* Advanced Extension */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Advanced Extension</h4>
                <LessonContent
                  storageKey="resources:advanced"
                  initialValue={`- Why might SMEs simplify accounting treatments compared to large corporations? Consider tax vs. GAAP requirements.\n- How does Hong Kong's GST-free environment affect SME accounting compared to countries with VAT/GST?`}
                  className="text-slate-700 text-sm"
                />
              </div>

              {/* Support for Struggling Students */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Support</h4>
                <LessonContent
                  storageKey="resources:support"
                  initialValue={`- Step-by-step worked examples with visual diagrams\n- Scaffolded practice problems with increasing complexity\n- Peer tutoring during group activities`}
                  className="text-slate-700 text-sm"
                />
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Resources</h4>
                <LessonContent
                  storageKey="resources:materials"
                  initialValue={`Required:\n- Pre-class video: "Accounting in Action: From Street Vendors to Skyscrapers"\n- Transaction analysis worksheets\n- Calculator (basic arithmetic only)\n\nSupplementary:\n- Hong Kong Accounting Standards (HKFRS) summary for SMEs\n- Cathay Pacific Annual Report (balance sheet examples)\n- Tung Wah Group annual report (non-profit accounting examples)`}
                  className="text-slate-700 text-sm"
                />
              </div>
            </div>
            {renderCompleteButton('resources')}
          </LessonSection>

          {/* Alignment */}
          <LessonSection id="alignment" title="ILO-Activity-Assessment Alignment" badge="Alignment">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-3 border border-slate-200 font-semibold">ILO</th>
                    <th className="text-left p-3 border border-slate-200 font-semibold">Teaching Activity</th>
                    <th className="text-left p-3 border border-slate-200 font-semibold">Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200">ILO1: Define accounting equation</td>
                    <td className="p-3 border border-slate-200">Interactive lecture (Segment 1)</td>
                    <td className="p-3 border border-slate-200">Quiz Q1-Q3</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200">ILO2: Classify transactions</td>
                    <td className="p-3 border border-slate-200">Transaction analysis (Segment 2)</td>
                    <td className="p-3 border border-slate-200">Quiz Q4-Q6, Pre-test</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200">ILO3: Analyze transaction effects</td>
                    <td className="p-3 border border-slate-200">Dual effect principle (Segment 4)</td>
                    <td className="p-3 border border-slate-200">Quiz Q7-Q8, Case study</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200">ILO4: Differentiate CapEx vs OpEx</td>
                    <td className="p-3 border border-slate-200">Comparison table (Segment 3)</td>
                    <td className="p-3 border border-slate-200">Case study, Quiz Q9-Q10</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200">ILO5: Apply to solve problems</td>
                    <td className="p-3 border border-slate-200">Student practice (Segment 4)</td>
                    <td className="p-3 border border-slate-200">Quiz Q11-Q12, Case study</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {renderCompleteButton('alignment')}
          </LessonSection>
        </main>
      </div>
    </ScrollRootProvider>
  );
}
