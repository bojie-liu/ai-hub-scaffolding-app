'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import Quiz from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Discussion from '@/components/lesson/interactive/Discussion';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { useUser } from '@/contexts/UserContext';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions, getDiscussion } from '@/lib/actions/discussion';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ExternalLink, FileText, CheckCircle, Clock, Users, BarChart3, Target, Lightbulb, Scale, ArrowRight } from 'lucide-react';

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'development-conceptual', label: 'Conceptual Framing' },
  { id: 'development-comparative', label: 'Comparative Analysis' },
  { id: 'development-ethical', label: 'Ethical Applications' },
  { id: 'closure', label: 'Closure' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment Matrix' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
];

interface QuizData {
  id: number;
  title: string;
  questions: {
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
}

interface DiscussionData {
  id: number;
  title: string;
  description: string | null;
  posts: {
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
}

export default function LessonPage() {
  const { user } = useUser();
  const [preTestQuiz, setPreTestQuiz] = useState<QuizData | null>(null);
  const [ethicsQuiz, setEthicsQuiz] = useState<QuizData | null>(null);
  const [postTestQuiz, setPostTestQuiz] = useState<QuizData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const userId = user?.userId && user.userId > 0 ? user.userId : 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [preTestResult, ethicsResult, postTestResult, ccResult, discResult, progressResult] = await Promise.all([
        getQuiz(1).catch(() => null),
        getQuiz(2).catch(() => null),
        getQuiz(3).catch(() => null),
        getConceptChecks(),
        getDiscussions(),
        userId > 0 ? getStudentProgress(userId) : Promise.resolve({ success: false, data: [] }),
      ]);

      if (preTestResult?.success && preTestResult.data) {
        const d = preTestResult.data;
        setPreTestQuiz({ id: d.quiz.id, title: d.quiz.title, questions: d.questions });
      }
      if (ethicsResult?.success && ethicsResult.data) {
        const d = ethicsResult.data;
        setEthicsQuiz({ id: d.quiz.id, title: d.quiz.title, questions: d.questions });
      }
      if (postTestResult?.success && postTestResult.data) {
        const d = postTestResult.data;
        setPostTestQuiz({ id: d.quiz.id, title: d.quiz.title, questions: d.questions });
      }
      if (ccResult.success && ccResult.data) {
        setConceptChecks(ccResult.data as ConceptCheckData[]);
      }
      if (discResult.success && discResult.data) {
        // Load detailed discussions
        const detailedDiscussions = await Promise.all(
          discResult.data.slice(0, 5).map(async (d) => {
            const detail = await getDiscussion(d.id);
            if (detail.success && detail.data) {
              return {
                id: detail.data.discussion.id,
                title: detail.data.discussion.title,
                description: detail.data.discussion.description,
                posts: detail.data.posts.map((p: { id: number; parentPostId: number | null; authorId: number; authorUsername: string | null; authorDisplayName: string | null; authorRole: string | null; content: string; createdAt: Date | null }) => ({
                  id: p.id,
                  parentId: p.parentPostId,
                  authorId: p.authorId,
                  authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                  content: p.content,
                  createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
                })),
              } as DiscussionData;
            }
            return null;
          })
        );
        setDiscussions(detailedDiscussions.filter((d): d is DiscussionData => d !== null));
      }

      if (progressResult.success && progressResult.data) {
        const completed = new Set(
          progressResult.data
            .filter((p: { completed: boolean; sectionKey: string }) => p.completed)
            .map((p: { sectionKey: string }) => p.sectionKey)
        );
        setCompletedSections(completed);
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleMarkComplete(sectionKey: string) {
    if (userId <= 0) return;
    await markSectionComplete(userId, sectionKey);
    setCompletedSections((prev) => new Set(prev).add(sectionKey));
  }

  function getConceptCheck(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  }

  function getDiscussionByStorageKey(storageKey: string): DiscussionData | undefined {
    return discussions.find((d) => {
      // Match by discussion title content
      return true; // We'll match by index instead
    });
  }

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <ScrollRootProvider>
        <div className="flex max-w-7xl mx-auto">
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 pb-20">
            {/* Header */}
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                <EditableContent storageKey="lesson:title" initialValue="University Lesson Plan: Teacher Professionalism" as="span" />
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                A Comparative & Ethical Analysis of Professional Conduct in Hong Kong Education
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> 90 minutes</Badge>
                <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" /> University Level</Badge>
                <Badge variant="outline" className="gap-1"><Target className="h-3 w-3" /> 3 ILOs</Badge>
              </div>
            </div>

            <Separator />

            {/* Section 1: ILOs */}
            <LessonSection id="ilos" title="1. Intended Learning Outcomes (ILOs)" badge="Outcomes">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium text-slate-800">
                      <EditableContent storageKey="ilo:1" initialValue="Synthesize the concept of teacher professionalism through comparative analysis of global and local definitions" as="span" />
                    </p>
                    <Badge variant="secondary" className="mt-1">Compare - Bloom&apos;s Taxonomy</Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-slate-800">
                      <EditableContent storageKey="ilo:2" initialValue="Evaluate real-world Hong Kong teaching scenarios using ethical guidelines from EDB documentation" as="span" />
                    </p>
                    <Badge variant="secondary" className="mt-1">Apply - Bloom&apos;s Taxonomy</Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-lg border border-violet-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium text-slate-800">
                      <EditableContent storageKey="ilo:3" initialValue="Critically analyze the evolving nature of teacher professionalism in response to societal changes" as="span" />
                    </p>
                    <Badge variant="secondary" className="mt-1">Analyze - Bloom&apos;s Taxonomy</Badge>
                  </div>
                </div>
              </div>
              {userId > 0 && !completedSections.has('ilos') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('ilos')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('ilos') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 2: Pre-Class Preparation */}
            <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Preparation">
              <div className="space-y-4">
                <CardSection>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Reading Material</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        <EditableContent storageKey="preclass:reading" initialValue="EDB Hong Kong Guidelines on Professional Conduct (Section 1 and 2 only)" as="span" />
                      </p>
                      <a
                        href="https://www.edb.gov.hk/attachment/en/teacher/guidelines_tpc/guidelines_en.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open EDB Guidelines PDF
                      </a>
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">Pre-Test Quiz</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Test your initial understanding before the lesson begins.
                      </p>
                      {preTestQuiz && userId > 0 ? (
                        <Quiz
                          quizId={preTestQuiz.id}
                          title={preTestQuiz.title}
                          questions={preTestQuiz.questions.map(q => ({
                            ...q,
                            questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                          }))}
                          userId={userId}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Sign in to take the pre-test quiz.</p>
                      )}
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Guiding Questions</h4>
                      <ol className="mt-2 space-y-2 text-sm text-slate-700 list-decimal list-inside">
                        <li>
                          <EditableContent storageKey="preclass:gq1" initialValue="What societal factors shape teacher expectations in Hong Kong vs. Finland?" as="span" />
                        </li>
                        <li>
                          <EditableContent storageKey="preclass:gq2" initialValue="How might the EDB guidelines help address cyberbullying cases like the 2022 Tuen Mun School incident?" as="span" />
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardSection>
              </div>
              {userId > 0 && !completedSections.has('preclass') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('preclass')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('preclass') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 3: Introduction */}
            <LessonSection id="introduction" title="3. Introduction (10 min)" badge="Hook">
              <div className="space-y-4">
                <CardSection className="border-l-4 border-l-red-400">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="text-red-500 font-bold">HOOK</span> News Headline
                    </h4>
                    <div className="bg-slate-900 text-white p-4 rounded-lg">
                      <p className="text-lg font-medium italic">
                        &ldquo;Teacher Suspended for Social Media Conflicts - Professional Boundary Violation?&rdquo;
                      </p>
                      <p className="text-slate-400 text-sm mt-1">— 2022 Hong Kong News</p>
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <h4 className="font-semibold text-slate-800">Pre-Test Review: Word Cloud</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Mentimeter word cloud of &ldquo;professional teacher traits&rdquo; — top responses discussed orally.
                  </p>
                </CardSection>

                <CardSection>
                  <h4 className="font-semibold text-slate-800">Real-World Connection</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Short video clip of Hong Kong teacher award ceremony highlights.
                  </p>
                </CardSection>

                {/* Concept check for introduction */}
                {getConceptCheck('introduction') && userId > 0 && (
                  <ConceptCheck
                    checkId={getConceptCheck('introduction')!.id}
                    title={getConceptCheck('introduction')!.title}
                    prompt={getConceptCheck('introduction')!.prompt}
                    checkType={getConceptCheck('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={userId}
                    userRole={user?.role ?? 'STUDENT'}
                  />
                )}
              </div>
              {userId > 0 && !completedSections.has('introduction') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('introduction')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('introduction') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 4: Conceptual Framing */}
            <LessonSection id="development-conceptual" title="4. Conceptual Framing (15 min)" badge="Development">
              <div className="space-y-4">
                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2">Interactive Lecture</h4>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="font-medium text-slate-800">Timeline of Professionalism Evolution</p>
                      <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
                        <li>Medieval guilds: Craft-based expertise & apprenticeship</li>
                        <li>19th century: Formal teacher training institutions</li>
                        <li>20th century: Professional codes & certification bodies</li>
                        <li>21st century: Digital conduct, social media, global standards</li>
                        <li>HK Context: EDB Guidelines codify professional expectations</li>
                      </ul>
                    </div>
                  </div>
                </CardSection>

                <CardSection className="border-l-4 border-l-blue-400">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" /> Think-Pair-Share
                  </h4>
                  <p className="text-sm text-slate-700 font-medium">
                    <EditableContent storageKey="conceptual:debate" initialValue="Debate: Should teacher professionalism include personal conduct outside school hours?" as="span" />
                  </p>
                </CardSection>

                {/* Discussion for Think-Pair-Share */}
                {discussions[0] && userId > 0 && (
                  <Discussion
                    discussionId={discussions[0].id}
                    title={discussions[0].title}
                    description={discussions[0].description}
                    posts={discussions[0].posts}
                    userId={userId}
                    userRole={user?.role ?? 'STUDENT'}
                  />
                )}

                {/* Concept checks */}
                {getConceptCheck('development-conceptual') && userId > 0 && (
                  <div className="space-y-3">
                    {conceptChecks
                      .filter((cc) => cc.sectionKey === 'development-conceptual')
                      .map((cc) => (
                        <ConceptCheck
                          key={cc.id}
                          checkId={cc.id}
                          title={cc.title}
                          prompt={cc.prompt}
                          checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={userId}
                          userRole={user?.role ?? 'STUDENT'}
                        />
                      ))}
                  </div>
                )}
              </div>
              {userId > 0 && !completedSections.has('development-conceptual') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('development-conceptual')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('development-conceptual') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 5: Comparative Analysis */}
            <LessonSection id="development-comparative" title="5. Comparative Analysis (20 min)" badge="Jigsaw Activity">
              <div className="space-y-4">
                <CardSection className="border-l-4 border-l-indigo-400">
                  <h4 className="font-semibold text-slate-800 mb-2">Jigsaw Activity</h4>
                  <p className="text-sm text-slate-600">
                    Groups compare HK EDB guidelines with one other system:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="font-medium text-blue-800 text-sm">Hong Kong</p>
                      <p className="text-xs text-blue-600 mt-1">Codified EDB guidelines, mandatory reporting</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                      <p className="font-medium text-emerald-800 text-sm">Finland</p>
                      <p className="text-xs text-emerald-600 mt-1">Self-driven model, professional autonomy</p>
                    </div>
                    <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                      <p className="font-medium text-violet-800 text-sm">Ontario (OCT)</p>
                      <p className="text-xs text-violet-600 mt-1">Standards of practice, ethical framework</p>
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2">Guiding Questions</h4>
                  <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside">
                    <li>
                      <EditableContent storageKey="comparative:gq1" initialValue="How do collective cultural values in HK shape the mandatory reporting requirements in Section 3.4?" as="span" />
                    </li>
                    <li>
                      <EditableContent storageKey="comparative:gq2" initialValue="What conflicts might arise for HK teachers in social media spaces outlined in Guideline 2.7?" as="span" />
                    </li>
                  </ol>
                </CardSection>

                {/* Discussion for Comparative Analysis */}
                {discussions[1] && userId > 0 && (
                  <Discussion
                    discussionId={discussions[1].id}
                    title={discussions[1].title}
                    description={discussions[1].description}
                    posts={discussions[1].posts}
                    userId={userId}
                    userRole={user?.role ?? 'STUDENT'}
                  />
                )}

                {/* Concept check */}
                {getConceptCheck('development-comparative') && userId > 0 && (
                  <div className="space-y-3">
                    {conceptChecks
                      .filter((cc) => cc.sectionKey === 'development-comparative')
                      .map((cc) => (
                        <ConceptCheck
                          key={cc.id}
                          checkId={cc.id}
                          title={cc.title}
                          prompt={cc.prompt}
                          checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={userId}
                          userRole={user?.role ?? 'STUDENT'}
                        />
                      ))}
                  </div>
                )}
              </div>
              {userId > 0 && !completedSections.has('development-comparative') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('development-comparative')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('development-comparative') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 6: Ethical Applications */}
            <LessonSection id="development-ethical" title="6. Ethical Applications (25 min)" badge="Case Studies">
              <div className="space-y-4">
                {/* Case 1 */}
                <CardSection className="border-l-4 border-l-amber-400">
                  <h4 className="font-semibold text-slate-800 mb-1">Case 1: 2018 Yuen Long School Leak</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Student exam paper photos appeared online — was the teacher&apos;s disciplinary action justified per Guideline 2.2?
                  </p>
                  <div className="bg-amber-50 rounded-md p-3 text-sm text-amber-800 border border-amber-100">
                    <strong>Relevant Guideline 2.2:</strong> Duty of care and confidentiality — teachers must protect student assessment materials and privacy.
                  </div>
                </CardSection>

                {/* Discussion for Case 1 */}
                {discussions[2] && userId > 0 && (
                  <Discussion
                    discussionId={discussions[2].id}
                    title={discussions[2].title}
                    description={discussions[2].description}
                    posts={discussions[2].posts}
                    userId={userId}
                    userRole={user?.role ?? 'STUDENT'}
                  />
                )}

                {/* Case 2 */}
                <CardSection className="border-l-4 border-l-red-400">
                  <h4 className="font-semibold text-slate-800 mb-1">Case 2: Cyberbullying Scenario</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Parent complaint about a teacher&apos;s critical social media post toward a student&apos;s dress code violation.
                  </p>
                  <div className="bg-red-50 rounded-md p-3 text-sm text-red-800 border border-red-100">
                    <strong>Relevant Guideline 2.7:</strong> Professional conduct in social media spaces — teachers must maintain professional boundaries in digital environments.
                  </div>
                </CardSection>

                {/* Discussion for Case 2 */}
                {discussions[3] && userId > 0 && (
                  <Discussion
                    discussionId={discussions[3].id}
                    title={discussions[3].title}
                    description={discussions[3].description}
                    posts={discussions[3].posts}
                    userId={userId}
                    userRole={user?.role ?? 'STUDENT'}
                  />
                )}

                {/* Role-Play */}
                <CardSection className="border-l-4 border-l-purple-400">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-purple-600" /> Role-Play Activity
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Designate group roles to practice guideline-based resolutions:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Principal', 'Affected Teacher', 'Parent Rep', 'EDB Investigator'].map((role) => (
                      <div key={role} className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-center">
                        <p className="font-medium text-purple-800 text-sm">{role}</p>
                      </div>
                    ))}
                  </div>
                </CardSection>

                {/* Role-play debrief discussion */}
                {discussions[4] && userId > 0 && (
                  <Discussion
                    discussionId={discussions[4].id}
                    title={discussions[4].title}
                    description={discussions[4].description}
                    posts={discussions[4].posts}
                    userId={userId}
                    userRole={user?.role ?? 'STUDENT'}
                  />
                )}

                {/* Ethics Quiz */}
                {ethicsQuiz && userId > 0 && (
                  <Quiz
                    quizId={ethicsQuiz.id}
                    title={ethicsQuiz.title}
                    questions={ethicsQuiz.questions.map(q => ({
                      ...q,
                      questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                    }))}
                    userId={userId}
                  />
                )}

                {/* Mentimeter Live Poll concept check */}
                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" /> Live Poll
                  </h4>
                  <p className="text-sm text-slate-600">
                    <EditableContent storageKey="ethical:poll" initialValue="Should teachers lose credentials for personal social media posts?" as="span" />
                  </p>
                </CardSection>

                {/* Concept check */}
                {getConceptCheck('development-ethical') && userId > 0 && (
                  <div className="space-y-3">
                    {conceptChecks
                      .filter((cc) => cc.sectionKey === 'development-ethical')
                      .map((cc) => (
                        <ConceptCheck
                          key={cc.id}
                          checkId={cc.id}
                          title={cc.title}
                          prompt={cc.prompt}
                          checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={userId}
                          userRole={user?.role ?? 'STUDENT'}
                        />
                      ))}
                  </div>
                )}
              </div>
              {userId > 0 && !completedSections.has('development-ethical') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('development-ethical')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('development-ethical') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 7: Closure */}
            <LessonSection id="closure" title="7. Closure (5 min)" badge="Wrap-Up">
              <div className="space-y-4">
                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2">Post-Test Comparison</h4>
                  <p className="text-sm text-slate-600">
                    Compare your pre-test and post-test results to measure knowledge growth.
                  </p>
                </CardSection>

                {/* Post-test quiz */}
                {postTestQuiz && userId > 0 && (
                  <Quiz
                    quizId={postTestQuiz.id}
                    title={postTestQuiz.title}
                    questions={postTestQuiz.questions.map(q => ({
                      ...q,
                      questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                    }))}
                    userId={userId}
                  />
                )}

                <CardSection className="border-l-4 border-l-emerald-400">
                  <h4 className="font-semibold text-slate-800 mb-2">Exit Ticket</h4>
                  <p className="text-sm text-slate-700 italic">
                    &ldquo;How might the EDB guidelines need updating for emerging tech challenges?&rdquo;
                  </p>
                </CardSection>

                {/* Exit ticket concept check */}
                {getConceptCheck('closure') && userId > 0 && (
                  <div className="space-y-3">
                    {conceptChecks
                      .filter((cc) => cc.sectionKey === 'closure')
                      .map((cc) => (
                        <ConceptCheck
                          key={cc.id}
                          checkId={cc.id}
                          title={cc.title}
                          prompt={cc.prompt}
                          checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={userId}
                          userRole={user?.role ?? 'STUDENT'}
                        />
                      ))}
                  </div>
                )}

                <CardSection className="bg-blue-50 border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" /> Next Lesson Preview
                  </h4>
                  <p className="text-sm text-blue-700">
                    <EditableContent storageKey="closure:next-lesson" initialValue="Evaluating teacher unions' roles in professionalism standards evolution" as="span" />
                  </p>
                </CardSection>
              </div>
              {userId > 0 && !completedSections.has('closure') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('closure')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('closure') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 8: Assessment Methods */}
            <LessonSection id="assessment" title="8. Assessment Methods" badge="Assessment">
              <div className="space-y-4">
                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-3">Formative Assessment</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <span>Pre/post test score comparison (multiple choice knowledge growth)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <span>Padlet participation in case study discussions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <span>Observation checklist for group dynamics</span>
                    </li>
                  </ul>
                </CardSection>

                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-3">Summative Assessment</h4>
                  <p className="text-sm text-slate-700 mb-3">
                    <strong>Individual Written Analysis</strong> (due next week): Analyze <em>two</em> recent Hong Kong education headlines using EDB guidelines.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-800 text-sm mb-2">Rubric</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">Contextual awareness (ILO 1)</span>
                        <Badge variant="outline">30%</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">Ethical application (ILO 2)</span>
                        <Badge variant="outline">40%</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">Policy critique (ILO 3)</span>
                        <Badge variant="outline">30%</Badge>
                      </div>
                    </div>
                  </div>
                </CardSection>
              </div>
              {userId > 0 && !completedSections.has('assessment') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('assessment')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('assessment') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 9: Alignment Matrix */}
            <LessonSection id="alignment" title="9. Constructive Alignment Matrix" badge="Alignment">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-3 font-semibold text-slate-800">Learning Outcome</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800">Teaching Activity</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800">Assessment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                          <span>Synthesize concept</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">Comparative jigsaw, interactive lecture</td>
                      <td className="py-3 px-3 text-slate-600">Summative written analysis (contextual awareness)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">2</span>
                          <span>Evaluate scenarios</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">Case study role-play, live polls</td>
                      <td className="py-3 px-3 text-slate-600">Padlet contributions, final paper ethical application</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">3</span>
                          <span>Analyze evolution</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">Current case studies, exit ticket</td>
                      <td className="py-3 px-3 text-slate-600">Final paper policy critique</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {userId > 0 && !completedSections.has('alignment') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('alignment')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('alignment') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 10: Required Resources */}
            <LessonSection id="resources" title="10. Required Resources" badge="Resources">
              <div className="space-y-2">
                {[
                  { icon: FileText, text: 'EDB Guidelines PDF printouts' },
                  { icon: BarChart3, text: 'Mentimeter for polls/quizzes' },
                  { icon: Users, text: 'Role-play scenario cards (print)' },
                  { icon: BookOpen, text: 'Padlet board for digital collaboration' },
                  { icon: Lightbulb, text: 'Projected timeline infographic' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="text-sm text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
              {userId > 0 && !completedSections.has('resources') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('resources')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('resources') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 11: Differentiation & Inclusivity */}
            <LessonSection id="differentiation" title="11. Differentiation & Inclusivity" badge="Inclusivity">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-bold text-sm shrink-0">Advanced Support</span>
                  <p className="text-sm text-blue-800">Additional reading on Macau teaching standards</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-600 font-bold text-sm shrink-0">Visual Learners</span>
                  <p className="text-sm text-emerald-800">Infographic comparing 4 education systems</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-sm shrink-0">Language Access</span>
                  <p className="text-sm text-amber-800">Bilingual glossary of key terms</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg">
                  <span className="text-violet-600 font-bold text-sm shrink-0">Physical Accessibility</span>
                  <p className="text-sm text-violet-800">Digital copies for screen readers</p>
                </div>
              </div>
              {userId > 0 && !completedSections.has('differentiation') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('differentiation')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('differentiation') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Section 12: Reflection & Improvement */}
            <LessonSection id="reflection" title="12. Reflection & Improvement" badge="Meta">
              <div className="space-y-4">
                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" /> Success Indicators
                  </h4>
                  <p className="text-sm text-slate-600">
                    <EditableContent storageKey="reflection:success" initialValue="80% pre/post test score improvement on ethics questions" as="span" />
                  </p>
                </CardSection>

                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2">Feedback Mechanism</h4>
                  <p className="text-sm text-slate-600">
                    Google Form 3-2-1 reflection: <strong>3</strong> takeaways, <strong>2</strong> questions, <strong>1</strong> suggestion
                  </p>
                </CardSection>

                <CardSection>
                  <h4 className="font-semibold text-slate-800 mb-2">Future Modifications</h4>
                  <p className="text-sm text-slate-600">
                    <EditableContent storageKey="reflection:future" initialValue="Partner with HKU/EDB panelists for live Q&A if engagement remains high with real case studies" as="span" />
                  </p>
                </CardSection>
              </div>
              {userId > 0 && !completedSections.has('reflection') && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleMarkComplete('reflection')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              )}
              {completedSections.has('reflection') && (
                <Badge variant="default" className="mt-4 bg-emerald-600">Completed</Badge>
              )}
            </LessonSection>

            {/* Hong Kong Context Integration */}
            <LessonSection id="hk-context" title="Hong Kong Context Integration" badge="Context">
              <div className="space-y-3">
                <p className="text-sm text-slate-700 italic">
                  Throughout the lesson, specific emphasis is placed on Hong Kong&apos;s unique landscape:
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">&#8226;</span>
                    <span>Cultural juxtaposition of traditional teacher authority vs. globalization demands</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">&#8226;</span>
                    <span>Legal framework in Education Ordinance referenced in all scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">&#8226;</span>
                    <span>Real-world EDB enforcement examples to ground theoretical knowledge</span>
                  </li>
                </ul>
              </div>
            </LessonSection>
          </div>

          {/* Side menu */}
          <LessonSideMenu sections={SECTIONS} />
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
