'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions } from '@/lib/actions/discussion';
import { markSectionComplete } from '@/lib/actions/progress';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import Quiz from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, Users, GraduationCap, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface QuizQuestionData {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
  questions: QuizQuestionData[];
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
  sectionKey: string | null;
}

interface DiscussionData {
  id: number;
  title: string;
  description: string | null;
  postCount: number;
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
  { id: 'inclusion', label: 'Inclusivity' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'supplemental', label: 'Supplements' },
];

export default function LessonView() {
  const { user } = useUser();
  const [preQuiz, setPreQuiz] = useState<QuizData | null>(null);
  const [postQuiz, setPostQuiz] = useState<QuizData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [preResult, postResult, ccResult, discResult] = await Promise.all([
        getQuiz(1).catch(() => null),
        getQuiz(2).catch(() => null),
        getConceptChecks(),
        getDiscussions(),
      ]);

      if (preResult?.success && preResult.data) setPreQuiz(preResult.data as QuizData);
      if (postResult?.success && postResult.data) setPostQuiz(postResult.data as QuizData);
      if (ccResult.success && ccResult.data) setConceptChecks(ccResult.data as ConceptCheckData[]);
      if (discResult.success && discResult.data) {
        setDiscussions(
          discResult.data.map((d: { id: number; title: string; description: string | null; postCount: number }) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            postCount: d.postCount,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || user.role === 'GUEST') return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections((prev) => new Set(prev).add(sectionKey));
    }
  }

  function getConceptCheckForSection(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  }

  function getDiscussionLink(keyword: string): DiscussionData | undefined {
    return discussions.find((d) => d.title.toLowerCase().includes(keyword));
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex max-w-7xl mx-auto">
      <LessonSideMenu sections={SECTIONS} />
      <div className="flex-1 min-w-0 px-4 py-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <EditableContent storageKey="lesson:title" initialValue="The Modern Software Developer" as="span" />
          </h1>
          <p className="text-blue-100 text-lg mb-4">
            <EditableContent storageKey="lesson:subtitle" initialValue="Impact of AI on Software Development Workflows" as="span" />
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <Clock className="h-4 w-4" />
              <EditableContent storageKey="lesson:duration" initialValue="90 minutes" as="span" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <GraduationCap className="h-4 w-4" />
              <EditableContent storageKey="lesson:level" initialValue="First-year undergraduates" as="span" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <Users className="h-4 w-4" />
              <EditableContent storageKey="lesson:classSize" initialValue="30 students" as="span" />
            </div>
          </div>
        </div>

        {/* 1. ILOs */}
        <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="ILOs">
          <p className="text-sm text-muted-foreground mb-4">By the end of this lesson, students will be able to:</p>
          <div className="space-y-3">
            {['ilo:1', 'ilo:2', 'ilo:3', 'ilo:4'].map((key, i) => {
              const defaults = [
                'Analyze the impact of AI tools on traditional software development workflows using case studies.',
                'Evaluate the effectiveness of AI-powered code generation tools compared to manual coding approaches.',
                'Apply iterative AI-assisted development workflows (plan → generate → modify → repeat) to solve mini coding challenges.',
                'Compare ethical considerations and productivity gains in AI-enhanced vs legacy development models.',
              ];
              const verbs = ['Analyze', 'Evaluate', 'Apply', 'Compare'];
              return (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Badge className="mt-0.5 shrink-0 bg-blue-600">{verbs[i]}</Badge>
                  <EditableContent storageKey={key} initialValue={defaults[i]} as="p" className="text-sm" />
                </div>
              );
            })}
          </div>
          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('ilos') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('ilos')}
              disabled={completedSections.has('ilos')}
            >
              {completedSections.has('ilos') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 2. Pre-Class Preparation */}
        <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Flipped Learning">
          <h3 className="font-semibold text-slate-800 mb-3">Flipped Learning Resources</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors">
              <div className="p-2 bg-red-50 rounded-lg"><ExternalLink className="h-4 w-4 text-red-600" /></div>
              <div>
                <p className="font-medium text-sm">Video</p>
                <EditableContent storageKey="preclass:video" initialValue='TED Talk: "How AI is Revolutionizing Coding" (10 mins)' as="p" className="text-sm text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors">
              <div className="p-2 bg-amber-50 rounded-lg"><ExternalLink className="h-4 w-4 text-amber-600" /></div>
              <div>
                <p className="font-medium text-sm">Reading</p>
                <EditableContent storageKey="preclass:reading" initialValue="Excerpt from AI-Driven Software Development: A New Era (Chap 3, 8 mins)" as="p" className="text-sm text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors">
              <div className="p-2 bg-green-50 rounded-lg"><ExternalLink className="h-4 w-4 text-green-600" /></div>
              <div>
                <p className="font-medium text-sm">Pre-Test</p>
                <EditableContent storageKey="preclass:quiz" initialValue="Kahoot Quiz: 5 questions on AI basics in coding" as="p" className="text-sm text-muted-foreground" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="font-semibold text-slate-800 mb-3">Guiding Questions</h3>
          <div className="space-y-2">
            {['guiding:1', 'guiding:2'].map((key) => {
              const defaults = [
                'How might AI tools lower barriers to entry in software development?',
                'What risks arise with over-reliance on AI-generated code?',
              ];
              return (
                <div key={key} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-blue-600 font-bold mt-0.5">?</span>
                  <EditableContent storageKey={key} initialValue={defaults[key === 'guiding:1' ? 0 : 1]} as="p" className="italic" />
                </div>
              );
            })}
          </div>

          {preQuiz && user && user.role !== 'GUEST' && (
            <div className="mt-6">
              <Quiz
                quizId={preQuiz.quiz.id}
                title={preQuiz.quiz.title}
                questions={preQuiz.questions}
                userId={user.userId}
              />
            </div>
          )}

          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('preclass') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('preclass')}
              disabled={completedSections.has('preclass')}
            >
              {completedSections.has('preclass') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 3. Introduction */}
        <LessonSection id="introduction" title="3. Introduction" badge="12 min">
          <div className="space-y-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-blue-800 mb-1">Hook (5 min)</p>
                <EditableContent storageKey="intro:hook" initialValue='Poll: "Do you think AI tools will eliminate developers? Agree/Neutral/No."' as="p" className="text-sm text-slate-700" multiline />
                {getConceptCheckForSection('introduction') && user && user.role !== 'GUEST' && (
                  <div className="mt-3">
                    <ConceptCheck
                      checkId={getConceptCheckForSection('introduction')!.id}
                      title={getConceptCheckForSection('introduction')!.title}
                      prompt={getConceptCheckForSection('introduction')!.prompt}
                      checkType={getConceptCheckForSection('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-amber-800 mb-1">Pre-Test Review (5 min)</p>
                <EditableContent storageKey="intro:pretest" initialValue='Highlight 2 common misconceptions from pre-test data (e.g., "AI replaces creativity entirely").' as="p" className="text-sm text-slate-700" multiline />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-emerald-800 mb-1">Real-World Link (2 min)</p>
                <EditableContent storageKey="intro:realworld" initialValue="GitHub Copilot usage statistics (20% faster code production) and Microsoft's low-code/no-code platforms." as="p" className="text-sm text-slate-700" multiline />
              </CardContent>
            </Card>
          </div>

          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('introduction') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('introduction')}
              disabled={completedSections.has('introduction')}
            >
              {completedSections.has('introduction') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 4. Development Activities */}
        <LessonSection id="development" title="4. Teaching & Learning Activities" badge="66 min">
          <div className="space-y-6">
            {/* Activity 1 */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Activity 1: AI Workflow Demo</h3>
                  <Badge variant="secondary">15 min</Badge>
                </div>
                <p className="font-medium text-sm text-blue-700">Interactive Lecture</p>
                <EditableContent storageKey="activity1:desc" initialValue="Live demonstration of GitHub Copilot for generating a Python function with inputs/outputs." as="p" className="text-sm text-slate-700" multiline />
                <Separator />
                <p className="font-medium text-sm text-amber-700">Think-Pair-Share</p>
                <EditableContent storageKey="activity1:tps" initialValue="What are 2 advantages of this iterative workflow for beginners vs experts?" as="p" className="text-sm text-slate-700" multiline />
                {getDiscussionLink('workflow') && (
                  <Link href={`/discussion/${getDiscussionLink('workflow')!.id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <MessageSquare className="h-4 w-4" /> Join Discussion
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Activity 2 */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Activity 2: Group Case Study Analysis</h3>
                  <Badge variant="secondary">20 min</Badge>
                </div>
                <EditableContent storageKey="activity2:desc" initialValue="Small Groups (4 per group): Analyze AI Adoption in a 50-person startup." as="p" className="text-sm text-slate-700" multiline />
                <p className="font-medium text-sm text-indigo-700">Structured Prompts:</p>
                <div className="space-y-2 pl-4 border-l-2 border-indigo-200">
                  <EditableContent storageKey="activity2:prompt1" initialValue="Identify productivity gains in requirements → code transitions." as="p" className="text-sm text-slate-700" />
                  <EditableContent storageKey="activity2:prompt2" initialValue="Highlight a scenario where AI output requires debugging." as="p" className="text-sm text-slate-700" />
                </div>
                {getConceptCheckForSection('development') && user && user.role !== 'GUEST' && (
                  <div className="mt-2">
                    <ConceptCheck
                      checkId={getConceptCheckForSection('development')!.id}
                      title={getConceptCheckForSection('development')!.title}
                      prompt={getConceptCheckForSection('development')!.prompt}
                      checkType={getConceptCheckForSection('development')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity 3 */}
            <Card className="border-l-4 border-l-violet-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Activity 3: Hands-On Practice</h3>
                  <Badge variant="secondary">25 min</Badge>
                </div>
                <EditableContent storageKey="activity3:desc" initialValue="Use Replit + Copilot to generate a Flask API endpoint (pre-configured template)." as="p" className="text-sm text-slate-700" multiline />
                <p className="font-medium text-sm text-violet-700">Scaffolding:</p>
                <div className="space-y-2 pl-4 border-l-2 border-violet-200">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0 mt-0.5">Step 1</Badge>
                    <EditableContent storageKey="activity3:scaffold1" initialValue="Instructors provide step-by-step plan (graphic organizer)." as="p" className="text-sm text-slate-700" />
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0 mt-0.5">Step 2</Badge>
                    <EditableContent storageKey="activity3:scaffold2" initialValue="Students modify generated CRUD operations (color-coded error highlighting)." as="p" className="text-sm text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity 4 */}
            <Card className="border-l-4 border-l-rose-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Activity 4: Ethics Debate</h3>
                  <Badge variant="secondary">6 min</Badge>
                </div>
                <EditableContent storageKey="activity4:desc" initialValue="Post 1 risk and 1 benefit of democratized coding in healthcare software contexts." as="p" className="text-sm text-slate-700" multiline />
                {getDiscussionLink('ethics') && (
                  <Link href={`/discussion/${getDiscussionLink('ethics')!.id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <MessageSquare className="h-4 w-4" /> Join Ethics Discussion
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('development') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('development')}
              disabled={completedSections.has('development')}
            >
              {completedSections.has('development') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 5. Synthesis & Closure */}
        <LessonSection id="synthesis" title="5. Synthesis & Closure" badge="12 min">
          <div className="space-y-4">
            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-teal-800 mb-1">Post-Test Comparison (5 min)</p>
                <EditableContent storageKey="synthesis:posttest" initialValue="Repeat 3 key pre-test questions to measure knowledge gains." as="p" className="text-sm text-slate-700" />
              </CardContent>
            </Card>

            {postQuiz && user && user.role !== 'GUEST' && (
              <Quiz
                quizId={postQuiz.quiz.id}
                title={postQuiz.quiz.title}
                questions={postQuiz.questions}
                userId={user.userId}
              />
            )}

            <Card className="border-l-4 border-l-cyan-500">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-cyan-800 mb-1">Reflective Discussion (5 min)</p>
                <EditableContent storageKey="synthesis:reflection" initialValue="In 1 sentence, how would you explain AI's role in software accessibility to a non-techie friend?" as="p" className="text-sm text-slate-700" multiline />
                {getDiscussionLink('reflection') && (
                  <Link href={`/discussion/${getDiscussionLink('reflection')!.id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-2">
                    <MessageSquare className="h-4 w-4" /> Join Reflection Discussion
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-slate-400">
              <CardContent className="pt-4">
                <p className="font-semibold text-sm text-slate-700 mb-1">Next Session Preview (2 min)</p>
                <EditableContent storageKey="synthesis:preview" initialValue="Introduce version control integration with AI tools." as="p" className="text-sm text-slate-600" />
              </CardContent>
            </Card>

            {getConceptCheckForSection('synthesis') && user && user.role !== 'GUEST' && (
              <ConceptCheck
                checkId={getConceptCheckForSection('synthesis')!.id}
                title={getConceptCheckForSection('synthesis')!.title}
                prompt={getConceptCheckForSection('synthesis')!.prompt}
                checkType={getConceptCheckForSection('synthesis')!.checkType as 'thumbs' | 'scale' | 'text'}
                userId={user.userId}
                userRole={user.role}
              />
            )}
          </div>

          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('synthesis') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('synthesis')}
              disabled={completedSections.has('synthesis')}
            >
              {completedSections.has('synthesis') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 6. Assessment Methods */}
        <LessonSection id="assessment" title="6. Assessment Methods" badge="Formative & Summative">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Formative Assessment</h3>
              <div className="space-y-2">
                {['assessment:formative:1', 'assessment:formative:2', 'assessment:formative:3'].map((key) => {
                  const defaults = [
                    'Pre-/Post-test comparison (3 repeated questions on productivity metrics).',
                    'Padlet ethic debate contributions (evaluated for critical thinking).',
                    'Live Copilot code submission logs (tracked for workflow application).',
                  ];
                  const idx = key.endsWith('1') ? 0 : key.endsWith('2') ? 1 : 2;
                  return (
                    <div key={key} className="flex items-start gap-2 p-2 rounded bg-slate-50">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <EditableContent storageKey={key} initialValue={defaults[idx]} as="p" className="text-sm" />
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Summative Assessment</h3>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4 space-y-2">
                  <p className="font-semibold text-sm text-amber-900">Take-Home Case Study Analysis (Due Next Week)</p>
                  <EditableContent storageKey="assessment:summative" initialValue="Analyze an AI tool's impact on a specific industry (500 words + rubric)." as="p" className="text-sm text-slate-700" multiline />
                  <p className="font-medium text-sm text-amber-800 mt-2">Rubric Criteria:</p>
                  <div className="space-y-1 pl-4 border-l-2 border-amber-300">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">25%</Badge>
                      <EditableContent storageKey="rubric:1" initialValue="Depth of technical evaluation (25%)" as="span" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">20%</Badge>
                      <EditableContent storageKey="rubric:2" initialValue="Ethical implications addressed (20%)" as="span" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">15%</Badge>
                      <EditableContent storageKey="rubric:3" initialValue="Workflow diagram clarity (15%)" as="span" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('assessment') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('assessment')}
              disabled={completedSections.has('assessment')}
            >
              {completedSections.has('assessment') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 7. Constructive Alignment Matrix */}
        <LessonSection id="alignment" title="7. Constructive Alignment Matrix">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 font-semibold border-b">Learning Outcome</th>
                  <th className="text-left p-3 font-semibold border-b">Teaching Activity</th>
                  <th className="text-left p-3 font-semibold border-b">Assessment Method</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Analyze impact', 'Workflow Demo + Case Study', 'Case Study Analysis'],
                  ['Evaluate tools', 'Hands-On Practice', 'Copilot code submission'],
                  ['Apply workflows', 'Guided practice with debugging', 'In-class coding task'],
                  ['Compare ethics', 'Ethics Debate', 'Padlet contributions + Case Study'],
                ].map(([outcome, activity, assessment], i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-blue-700">{outcome}</td>
                    <td className="p-3 text-slate-700">{activity}</td>
                    <td className="p-3 text-slate-700">{assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('alignment') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('alignment')}
              disabled={completedSections.has('alignment')}
            >
              {completedSections.has('alignment') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 8. Required Resources & Technology */}
        <LessonSection id="resources" title="8. Required Resources & Technology">
          <div className="space-y-3">
            {[
              { key: 'resources:lms', label: 'LMS', icon: '📚', default: 'Canvas for distributing pre-class materials.' },
              { key: 'resources:tools', label: 'Interactive Tools', icon: '🛠️', default: 'Mentimeter (polls), Kahoot (pre-test), Padlet (debate), GitHub Copilot/Replit.' },
              { key: 'resources:physical', label: 'Physical Materials', icon: '📄', default: 'Printed case study handouts (for accessibility).' },
            ].map((r) => (
              <div key={r.key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <EditableContent storageKey={r.key} initialValue={r.default} as="p" className="text-sm text-muted-foreground" multiline />
                </div>
              </div>
            ))}
          </div>
          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('resources') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('resources')}
              disabled={completedSections.has('resources')}
            >
              {completedSections.has('resources') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 9. Differentiation & Inclusivity */}
        <LessonSection id="inclusion" title="9. Differentiation & Inclusivity">
          <div className="space-y-3">
            {[
              { key: 'inclusion:support', label: 'Support', color: 'blue', default: 'Pair non-native English speakers with visual learners for case studies.' },
              { key: 'inclusion:extensions', label: 'Extensions', color: 'violet', default: 'Advanced students research prompt engineering for optimized code generation.' },
              { key: 'inclusion:accommodations', label: 'Accommodations', color: 'amber', default: 'Provide keyboard-free Copilot alternatives for motor-challenged students.' },
            ].map((item) => (
              <div key={item.key} className={`p-3 rounded-lg border border-${item.color}-200 bg-${item.color}-50`}>
                <p className={`font-semibold text-sm text-${item.color}-800 mb-1`}>{item.label}</p>
                <EditableContent storageKey={item.key} initialValue={item.default} as="p" className="text-sm text-slate-700" multiline />
              </div>
            ))}
          </div>
          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('inclusion') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('inclusion')}
              disabled={completedSections.has('inclusion')}
            >
              {completedSections.has('inclusion') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 10. Reflection & Improvement */}
        <LessonSection id="reflection" title="10. Reflection & Improvement">
          <div className="space-y-3">
            {[
              { key: 'reflection:indicators', label: 'Success Indicators', icon: '🎯', default: 'Post-test score improvement >40%, 85% Copilot task completion.' },
              { key: 'reflection:feedback', label: 'Feedback Mechanism', icon: '💬', default: 'Exit ticket: "What surprised you most about AI\'s capabilities?"' },
              { key: 'reflection:tweaks', label: 'Future Tweaks', icon: '🔧', default: 'If students struggle with tool access, pre-load cloud IDE templates.' },
            ].map((r) => (
              <div key={r.key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <EditableContent storageKey={r.key} initialValue={r.default} as="p" className="text-sm text-muted-foreground" multiline />
                </div>
              </div>
            ))}
          </div>
          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('reflection') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('reflection')}
              disabled={completedSections.has('reflection')}
            >
              {completedSections.has('reflection') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>

        {/* 11. Supplemental Materials */}
        <LessonSection id="supplemental" title="11. Supplemental Materials">
          <div className="space-y-3">
            {[
              { key: 'supplemental:flashcards', label: 'Flashcard Deck', icon: '🃏', default: 'Flashcard Deck: AI Tool Terminology (via Quizlet) for pre-class vocabulary.' },
              { key: 'supplemental:animation', label: 'Animation', icon: '🎬', default: 'Animation: Iterative AI Workflow (3-minute explainer video) used during development activities.' },
            ].map((r) => (
              <div key={r.key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <EditableContent storageKey={r.key} initialValue={r.default} as="p" className="text-sm text-muted-foreground" multiline />
                </div>
              </div>
            ))}
          </div>
          {user && user.role !== 'GUEST' && (
            <Button
              variant={completedSections.has('supplemental') ? 'ghost' : 'outline'}
              size="sm"
              className="mt-4"
              onClick={() => handleMarkComplete('supplemental')}
              disabled={completedSections.has('supplemental')}
            >
              {completedSections.has('supplemental') ? <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Completed</> : 'Mark Complete'}
            </Button>
          )}
        </LessonSection>
      </div>
    </div>
  );
}
