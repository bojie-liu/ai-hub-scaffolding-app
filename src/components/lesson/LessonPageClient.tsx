'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getQuiz } from '@/lib/actions/quiz';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Quiz from '@/components/lesson/interactive/Quiz';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  MessageSquare,
  Presentation,
  Target,
  Users,
} from 'lucide-react';

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
  createdAt: Date | null;
}

interface QuizData {
  quiz: { id: number; title: string; description: string | null; quizType: string };
  questions: {
    id: number;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'short_answer';
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

interface ProgressRecord {
  sectionKey: string;
  completed: boolean;
}

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'development', label: 'Activities' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Inclusivity' },
  { id: 'reflection', label: 'Reflection' },
];

export default function LessonPageClient() {
  const { user, isGuest } = useUser();

  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [preTestQuiz, setPreTestQuiz] = useState<QuizData | null>(null);
  const [postTestQuiz, setPostTestQuiz] = useState<QuizData | null>(null);
  const [flashcardQuiz, setFlashcardQuiz] = useState<QuizData | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [ccResult, preResult, postResult, flashResult, progressResult] = await Promise.all([
        getConceptChecks(),
        getQuiz(1).catch(() => null),
        getQuiz(2).catch(() => null),
        getQuiz(3).catch(() => null),
        user && !isGuest && user.userId > 0 ? getStudentProgress(user.userId) : null,
      ]);

      if (ccResult.success && ccResult.data) {
        setConceptChecks(ccResult.data as ConceptCheckData[]);
      }

      if (preResult && preResult.success && preResult.data) {
        setPreTestQuiz(preResult.data as QuizData);
      }
      if (postResult && postResult.success && postResult.data) {
        setPostTestQuiz(postResult.data as QuizData);
      }
      if (flashResult && flashResult.success && flashResult.data) {
        setFlashcardQuiz(flashResult.data as QuizData);
      }

      if (progressResult && progressResult.success && progressResult.data) {
        const completed = new Set(
          (progressResult.data as ProgressRecord[])
            .filter((p) => p.completed)
            .map((p) => p.sectionKey)
        );
        setProgress(completed);
      }
    } catch (err) {
      console.error('Failed to load lesson data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || isGuest || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setProgress((prev) => new Set([...prev, sectionKey]));
    }
  }

  function getConceptCheck(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  }

  function renderQuizInline(quizData: QuizData | null, key: string, label: string) {
    if (!quizData || !user || user.userId <= 0) return null;
    const isOpen = expandedQuiz === key;

    return (
      <div className="mt-4">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setExpandedQuiz(isOpen ? null : key)}
        >
          <BookOpen className="h-4 w-4" />
          {isOpen ? `Close ${label}` : `Open ${label}`}
        </Button>
        {isOpen && (
          <div className="mt-4">
            <Quiz
              quizId={quizData.quiz.id}
              title={quizData.quiz.title}
              questions={quizData.questions}
              userId={user.userId}
            />
          </div>
        )}
      </div>
    );
  }

  function SectionCompleteButton({ sectionKey }: { sectionKey: string }) {
    if (!user || isGuest || user.userId <= 0) return null;
    const isComplete = progress.has(sectionKey);
    return (
      <div className="mt-4 flex items-center gap-2">
        <Button
          variant={isComplete ? 'ghost' : 'outline'}
          size="sm"
          onClick={() => !isComplete && handleMarkComplete(sectionKey)}
          disabled={isComplete}
          className="gap-2"
        >
          <CheckCircle2 className={`h-4 w-4 ${isComplete ? 'text-emerald-600' : ''}`} />
          {isComplete ? 'Completed' : 'Mark as Complete'}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <ScrollRootProvider>
      <Navbar />
      <div className="flex max-w-7xl mx-auto px-4 py-6 gap-6">
        <LessonSideMenu sections={SECTIONS} />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              <EditableContent storageKey="lesson:title" initialValue="The Modern Software Developer" as="span" />
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              <EditableContent storageKey="lesson:subtitle" initialValue="How AI-Powered Tools Are Transforming Software Engineering" as="span" />
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> 90 minutes</Badge>
              <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" /> University Level</Badge>
              <Link href="/slides">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                  <Presentation className="h-3 w-3" /> View Slides
                </Badge>
              </Link>
            </div>
          </div>

          {/* Section 1: ILOs */}
          <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="ILOs">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <EditableContent
                    storageKey={`lesson:ilo:${n}`}
                    initialValue={[
                      'Analyze how AI-powered tools are transforming traditional software engineering practices',
                      'Evaluate the ethical and technical challenges of AI integration in development workflows',
                      'Design a basic AI-enhanced development workflow demonstrating problem decomposition',
                      'Collaborate effectively to identify appropriate AI tool application scenarios',
                    ][n - 1]}
                    as="p"
                    className="text-slate-700 text-sm"
                  />
                </div>
              ))}
            </div>
            <SectionCompleteButton sectionKey="ilos" />
          </LessonSection>

          {/* Section 2: Pre-Class Preparation */}
          <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Pre-Work">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" /> Pre-Reading
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <EditableContent
                      storageKey="lesson:prereading:1"
                      initialValue='Video: "The AI Coding Revolution" (12 mins) covering GitHub Copilot and Amazon CodeWhisperer'
                      as="span"
                      className="text-sm text-slate-700"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <EditableContent
                      storageKey="lesson:prereading:2"
                      initialValue='Selected chapter from "AI for Software Engineering" textbook (pp. 23-41)'
                      as="span"
                      className="text-sm text-slate-700"
                    />
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-600" /> Pre-Test Quiz
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  <EditableContent
                    storageKey="lesson:pretest:description"
                    initialValue="Complete this 8-question quiz to assess your current understanding of AI in software development."
                    as="span"
                  />
                </p>
                <Link href="/quizzes">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" /> Take Pre-Test Quiz
                  </Button>
                </Link>
                {renderQuizInline(preTestQuiz, 'pretest', 'Pre-Test Quiz')}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" /> Guiding Questions
                </h3>
                <div className="space-y-2">
                  {[
                    'How does AI shift the developer role from "coder" to "architect"?',
                    'What limitations might you expect with current AI code generation tools?',
                    'Identify one ethical concern with AI-generated code reuse',
                  ].map((q, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-amber-50/50">
                      <span className="text-amber-600 font-bold text-sm">{i + 1}.</span>
                      <EditableContent
                        storageKey={`lesson:guiding:${i + 1}`}
                        initialValue={q}
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Link href="/discussion/1">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" /> Discuss in Forum
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <SectionCompleteButton sectionKey="preclass" />
          </LessonSection>

          {/* Section 3: Introduction */}
          <LessonSection id="introduction" title="3. Introduction" badge="10 mins">
            <div className="space-y-4">
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Hook</h3>
                <EditableContent
                  storageKey="lesson:hook"
                  initialValue="Live demo of GitHub Copilot generating complete functions from comments"
                  as="p"
                  className="text-sm text-slate-700"
                />
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Poll</h3>
                <EditableContent
                  storageKey="lesson:poll"
                  initialValue='Anonymous poll: "How familiar are you with AI coding tools?" using Mentimeter'
                  as="p"
                  className="text-sm text-slate-700"
                />
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Pre-Test Discussion</h3>
                <EditableContent
                  storageKey="lesson:pretest-discussion"
                  initialValue="Address top misconceptions, particularly around AI code originality"
                  as="p"
                  className="text-sm text-slate-700"
                />
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Real-world Connection</h3>
                <EditableContent
                  storageKey="lesson:realworld"
                  initialValue="Case of Microsoft's AI-powered Azure DevOps tools improving team productivity"
                  as="p"
                  className="text-sm text-slate-700"
                />
              </CardSection>

              {getConceptCheck('introduction') && user && user.userId > 0 && (
                <ConceptCheck
                  checkId={getConceptCheck('introduction')!.id}
                  title={getConceptCheck('introduction')!.title}
                  prompt={getConceptCheck('introduction')!.prompt}
                  checkType={getConceptCheck('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={user.userId}
                  userRole={user.role}
                />
              )}
            </div>
            <SectionCompleteButton sectionKey="introduction" />
          </LessonSection>

          {/* Section 4: Development */}
          <LessonSection id="development" title="3. Teaching & Learning Activities" badge="65 mins">
            <div className="space-y-6">
              {/* Segment 1 */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> 20 mins</Badge>
                    <h3 className="font-bold text-slate-900">Segment 1: AI Tool Landscape</h3>
                  </div>

                  <div className="space-y-2 ml-2">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg1:lecture"
                        initialValue="Interactive Lecture: Evolution of development workflows with timeline visualization"
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg1:thinkpair"
                        initialValue="Think-Pair-Share: Compare traditional vs AI-enhanced debugging approaches"
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg1:animation"
                        initialValue="Animated Illustration: Code Generation Workflow showing prompt → generation → modification cycles"
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg1:conceptmap"
                        initialValue="Concept Map Template distributed for planning AI integration stages"
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {['development'].filter(s => getConceptCheck(s)).map((s) => {
                      const cc = getConceptCheck(s)!;
                      return user && user.userId > 0 ? (
                        <ConceptCheck
                          key={cc.id}
                          checkId={cc.id}
                          title={cc.title}
                          prompt={cc.prompt}
                          checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={user.userId}
                          userRole={user.role}
                        />
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Segment 2 */}
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> 30 mins</Badge>
                    <h3 className="font-bold text-slate-900">Segment 2: Hands-on Case Study</h3>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-slate-800">Group Work (6 groups of 5)</h4>
                    <EditableContent
                      storageKey="lesson:seg2:scenario"
                      initialValue="Analyze real startup's migration to AI tools — Scaling from 5 to 50 developers while maintaining code quality"
                      as="p"
                      className="text-sm text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-800">Structured Prompts:</h4>
                    {[
                      'Identify integration points in planning phase',
                      'Evaluate testing workflow modifications',
                      'Propose code review process adaptations',
                    ].map((prompt, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-emerald-50/50">
                        <span className="text-emerald-600 font-bold text-sm">{i + 1}.</span>
                        <EditableContent
                          storageKey={`lesson:seg2:prompt:${i + 1}`}
                          initialValue={prompt}
                          as="span"
                          className="text-sm text-slate-700"
                        />
                      </div>
                    ))}
                  </div>

                  <Link href="/discussion/2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" /> Case Study Discussion
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Segment 3 */}
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> 15 mins</Badge>
                    <h3 className="font-bold text-slate-900">Segment 3: Ethical Analysis</h3>
                  </div>

                  <div className="space-y-2 ml-2">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg3:debate"
                        initialValue='Debate: "AI tools democratize vs devalue software skills" - randomized role assignments'
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg3:polling"
                        initialValue="Before-after voting to measure perspective shifts"
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                      <EditableContent
                        storageKey="lesson:seg3:flashcards"
                        initialValue="Digital Flashcards: Key terms quiz (e.g., synthetic datasets, code plagiarism)"
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href="/discussion/3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Ethics Debate Forum
                      </Button>
                    </Link>
                    <Link href="/quizzes">
                      <Button variant="outline" size="sm" className="gap-2">
                        <BookOpen className="h-4 w-4" /> Key Terms Quiz
                      </Button>
                    </Link>
                  </div>

                  {renderQuizInline(flashcardQuiz, 'flashcards', 'Key Terms Quiz')}
                </CardContent>
              </Card>
            </div>
            <SectionCompleteButton sectionKey="development" />
          </LessonSection>

          {/* Section 5: Synthesis */}
          <LessonSection id="synthesis" title="4. Synthesis & Closure" badge="15 mins">
            <div className="space-y-4">
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Post-Test Assessment</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  <EditableContent
                    storageKey="lesson:posttest:description"
                    initialValue="Complete this 6-question assessment to measure your learning gains."
                    as="span"
                  />
                </p>
                <Link href="/quizzes">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" /> Take Post-Test
                  </Button>
                </Link>
                {renderQuizInline(postTestQuiz, 'posttest', 'Post-Test Assessment')}
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">One-Minute Paper</h3>
                <EditableContent
                  storageKey="lesson:oneminute"
                  initialValue={"What's one traditional practice all teams should keep despite AI adoption?"}
                  as="p"
                  className="text-sm text-slate-700 mb-2"
                />
                <Link href="/discussion/4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" /> Share Your Answer
                  </Button>
                </Link>
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Next Session Preview</h3>
                <EditableContent
                  storageKey="lesson:next-preview"
                  initialValue="AI in QA testing and preview of continuous integration tools"
                  as="p"
                  className="text-sm text-slate-700"
                />
              </CardSection>

              {getConceptCheck('synthesis') && user && user.userId > 0 && (
                <ConceptCheck
                  checkId={getConceptCheck('synthesis')!.id}
                  title={getConceptCheck('synthesis')!.title}
                  prompt={getConceptCheck('synthesis')!.prompt}
                  checkType={getConceptCheck('synthesis')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={user.userId}
                  userRole={user.role}
                />
              )}
            </div>
            <SectionCompleteButton sectionKey="synthesis" />
          </LessonSection>

          {/* Section 6: Assessment Methods */}
          <LessonSection id="assessment" title="5. Assessment Methods" badge="Assessment">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Formative Assessment</h3>
                <ul className="space-y-2 ml-4">
                  {[
                    'Pre/post-test comparison (knowledge gain tracking)',
                    'Group work observation rubric (collaboration, technical reasoning)',
                    'Polling responses across demographic clusters',
                    'Exit tickets analyzing key insights',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:formative:${i + 1}`}
                        initialValue={item}
                        as="span"
                        className="text-sm text-slate-700"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Summative Assessment</h3>
                <Card className="bg-slate-50">
                  <CardContent className="pt-4 space-y-3">
                    <h4 className="font-bold text-slate-900">
                      <EditableContent
                        storageKey="lesson:summative:title"
                        initialValue="AI Integration Strategy Proposal"
                        as="span"
                      />
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <EditableContent
                        storageKey="lesson:summative:due"
                        initialValue="Due next week"
                        as="span"
                      />
                    </p>
                    <div>
                      <h5 className="font-semibold text-sm text-slate-700 mb-2">Requirements:</h5>
                      <ul className="space-y-1 ml-4">
                        {[
                          "1500-word analysis of hypothetical company's AI adoption",
                          'Minimum 3 tool comparisons with technical justification',
                          'Ethical considerations section',
                        ].map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <ChevronRight className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                            <EditableContent
                              storageKey={`lesson:summative:req:${i + 1}`}
                              initialValue={req}
                              as="span"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-slate-700 mb-2">Rubric:</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: 'Technical Accuracy', pct: '30%' },
                          { label: 'Innovation Potential', pct: '25%' },
                          { label: 'Ethical Analysis', pct: '25%' },
                          { label: 'Presentation', pct: '20%' },
                        ].map((r, i) => (
                          <div key={i} className="text-center p-2 rounded bg-white border">
                            <p className="text-xs text-muted-foreground">{r.label}</p>
                            <p className="font-bold text-sm">{r.pct}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <SectionCompleteButton sectionKey="assessment" />
          </LessonSection>

          {/* Section 7: Constructive Alignment Matrix */}
          <LessonSection id="alignment" title="6. Constructive Alignment Matrix" badge="Alignment">
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
                  {[
                    { outcome: 'Analyze AI impact', activity: 'Interactive lecture & case study', assessment: 'Summative assignment' },
                    { outcome: 'Evaluate challenges', activity: 'Debate & polling', assessment: 'Exit tickets' },
                    { outcome: 'Design workflow', activity: 'Concept map & group work', assessment: 'Post-test questions' },
                    { outcome: 'Collaborate', activity: 'Group case study work', assessment: 'Observation rubric' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <EditableContent
                          storageKey={`lesson:alignment:outcome:${i + 1}`}
                          initialValue={row.outcome}
                          as="span"
                          className="text-sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <EditableContent
                          storageKey={`lesson:alignment:activity:${i + 1}`}
                          initialValue={row.activity}
                          as="span"
                          className="text-sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <EditableContent
                          storageKey={`lesson:alignment:assessment:${i + 1}`}
                          initialValue={row.assessment}
                          as="span"
                          className="text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SectionCompleteButton sectionKey="alignment" />
          </LessonSection>

          {/* Section 8: Required Resources */}
          <LessonSection id="resources" title="7. Required Resources" badge="Resources">
            <ul className="space-y-2 ml-4">
              {[
                'LMS tools (LTI integration for GitHub classroom)',
                'Animated Workflow Tool with export capability',
                'Mentimeter for polling',
                'Concept map templates (digital & print)',
                'Case study documents (password-protected real-world examples)',
                'GitHub organization for collaboration practice',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <EditableContent
                    storageKey={`lesson:resource:${i + 1}`}
                    initialValue={item}
                    as="span"
                    className="text-sm text-slate-700"
                  />
                </li>
              ))}
            </ul>
            <SectionCompleteButton sectionKey="resources" />
          </LessonSection>

          {/* Section 9: Differentiation & Inclusivity */}
          <LessonSection id="differentiation" title="8. Differentiation & Inclusivity" badge="Inclusivity">
            <ul className="space-y-2 ml-4">
              {[
                'Tiered case studies (basic/intermediate/advanced difficulty options)',
                'Visual aids for neurodiverse learners (color-coded workflow diagrams)',
                'Language support materials (glossary in 6 languages)',
                'Extended time options for timed assessments',
                'Audio descriptions for visual content',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <EditableContent
                    storageKey={`lesson:inclusivity:${i + 1}`}
                    initialValue={item}
                    as="span"
                    className="text-sm text-slate-700"
                  />
                </li>
              ))}
            </ul>
            <SectionCompleteButton sectionKey="differentiation" />
          </LessonSection>

          {/* Section 10: Reflection & Improvement */}
          <LessonSection id="reflection" title="9. Reflection & Improvement" badge="Meta">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Success Indicators</h3>
                <ul className="space-y-1 ml-4">
                  {[
                    '70% average on post-test vs 40% pre-test',
                    '80% attendance in group work phases',
                    'Assignment performance above 65% threshold',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:success:${i + 1}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Feedback Methods</h3>
                <ul className="space-y-1 ml-4">
                  {[
                    'Mid-course anonymous survey',
                    'Debrief interview with TA observations',
                    'Post-lesson focus groups with student representatives',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:feedback:${i + 1}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Modification Plans</h3>
                <ul className="space-y-1 ml-4">
                  {[
                    'Adjust case study complexity based on demographic patterns',
                    'Create supplemental AI ethics module if ethical dilemma responses insufficient',
                    'Develop more scaffolded coding challenges for novice developers',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:modification:${i + 1}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-slate-500 italic">
                  <EditableContent
                    storageKey="lesson:pedagogy-note"
                    initialValue="This lesson plan implements a cognitive apprenticeship model, modeling expert reasoning about AI tool selection while gradually transferring responsibility to students through structured practice. The formative assessments build scaffolding for the summative assignment, with the concept map specifically connecting Bloom's Understand and Apply levels to the Create-level requirements of the proposal."
                    as="span"
                    multiline
                  />
                </p>
              </div>
            </div>
            <SectionCompleteButton sectionKey="reflection" />
          </LessonSection>

          {/* Progress Summary */}
          {user && !isGuest && user.userId > 0 && (
            <Card className="bg-slate-50">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-slate-800 mb-3">Your Progress</h3>
                <div className="flex flex-wrap gap-2">
                  {SECTIONS.map((s) => (
                    <Badge
                      key={s.id}
                      variant={progress.has(s.id) ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {progress.has(s.id) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {s.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress.size} of {SECTIONS.length} sections completed
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ScrollRootProvider>
  );
}
