'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { getQuiz } from '@/lib/actions/quiz';
import { getDiscussions } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import Link from 'next/link';
import {
  BookOpen,
  Target,
  ClipboardList,
  Activity,
  CheckSquare,
  Layout,
  Package,
  Users,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

interface QuizData {
  quiz: { id: number; title: string; description: string | null; quizType: string };
  questions: {
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

interface DiscussionData {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  creatorName: string | null;
  creatorUsername: string | null;
  isPinned: boolean;
  postCount: number;
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
  createdAt: Date | null;
}

interface ProgressData {
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
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'evaluation', label: 'Evaluation' },
  { id: 'supplementary', label: 'Supplementary' },
];

export default function LessonPage() {
  const { user, isGuest } = useUser();
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());
  const [pretestData, setPretestData] = useState<QuizData | null>(null);
  const [formativeData, setFormativeData] = useState<QuizData | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessonData = useCallback(async () => {
    setLoading(true);
    try {
      const [progressResult, pretestResult, formativeResult, discussionsResult, conceptChecksResult] =
        await Promise.all([
          user && !isGuest ? getStudentProgress(user.userId) : Promise.resolve({ success: false, data: [] }),
          getQuiz(1),
          getQuiz(2),
          getDiscussions(),
          getConceptChecks(),
        ]);

      if (progressResult.success && progressResult.data) {
        const map = new Map<string, boolean>();
        for (const p of progressResult.data as ProgressData[]) {
          map.set(p.sectionKey, p.completed);
        }
        setProgressMap(map);
      }

      if (pretestResult.success && pretestResult.data) {
        setPretestData(pretestResult.data as QuizData);
      }

      if (formativeResult.success && formativeResult.data) {
        setFormativeData(formativeResult.data as QuizData);
      }

      if (discussionsResult.success && discussionsResult.data) {
        setDiscussions(discussionsResult.data as DiscussionData[]);
      }

      if (conceptChecksResult.success && conceptChecksResult.data) {
        setConceptChecks(conceptChecksResult.data as ConceptCheckData[]);
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || isGuest) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setProgressMap((prev) => new Map(prev).set(sectionKey, true));
    }
  }

  const getConceptCheckForSection = (sectionKey: string) =>
    conceptChecks.find((c) => c.sectionKey === sectionKey);

  function renderConceptCheck(sectionKey: string) {
    const cc = getConceptCheckForSection(sectionKey);
    if (!cc || !user || isGuest) return null;
    return (
      <div className="mt-4">
        <ConceptCheck
          checkId={cc.id}
          title={cc.title}
          prompt={cc.prompt}
          checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
          userId={user.userId}
          userRole={user.role}
        />
      </div>
    );
  }

  const getDiscussionByStorageKey = (storageKey: string) =>
    discussions.find((d) => d.storageKey === storageKey);

  const isSectionComplete = (key: string) => progressMap.get(key) === true;

  return (
    <AuthGuard>
      <div className="flex max-w-7xl mx-auto px-4 py-6 gap-6">
        <LessonSideMenu sections={SECTIONS} />

        <main className="flex-1 min-w-0 space-y-8">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-3">University Level</Badge>
            <EditableContent
              storageKey="lesson:title"
              initialValue="Modern Software Developer Lesson Plan"
              as="h1"
              className="text-3xl sm:text-4xl font-bold mb-2"
            />
            <EditableContent
              storageKey="lesson:subtitle"
              initialValue="AI-Enhanced Software Development Workflows"
              as="p"
              className="text-blue-100 text-lg"
            />
            <div className="flex items-center gap-4 mt-4 text-blue-200 text-sm">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> 90 minutes</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Interactive Session</span>
              <span className="flex items-center gap-1"><Target className="h-4 w-4" /> 4 Learning Outcomes</span>
            </div>
          </div>

          {/* Section 1: ILOs */}
          <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="ILOs">
            <EditableContent
              storageKey="lesson:ilos:intro"
              initialValue="By the end of this session, students will be able to:"
              as="p"
              className="text-muted-foreground mb-4"
            />
            <div className="space-y-3">
              {[
                { key: 'ilo1', text: 'Analyze the evolution of software development workflows from traditional to AI-enhanced models using established software engineering frameworks', icon: '1' },
                { key: 'ilo2', text: 'Apply at least two AI-assisted coding tools (GitHub Copilot, Cursor) to specific development stages (ideation, coding, debugging)', icon: '2' },
                { key: 'ilo3', text: 'Evaluate the effectiveness of AI tools in addressing traditional software engineering challenges (code complexity, technical debt)', icon: '3' },
                { key: 'ilo4', text: 'Synthesize a personalized workflow integrating human expertise with AI-powered development tools', icon: '4' },
              ].map((ilo) => (
                <div key={ilo.key} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold shrink-0">
                    {ilo.icon}
                  </span>
                  <EditableContent
                    storageKey={`lesson:ilos:${ilo.key}`}
                    initialValue={ilo.text}
                    as="p"
                    className="text-slate-700 text-sm"
                  />
                </div>
              ))}
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('ilos') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('ilos')}
                disabled={isSectionComplete('ilos')}
              >
                {isSectionComplete('ilos') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
            {renderConceptCheck('ilos')}
          </LessonSection>

          {/* Section 2: Pre-Class Preparation */}
          <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Before Class">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" /> Pre-reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableContent
                      storageKey="lesson:preclass:reading"
                      initialValue={"\"The State of AI in Software Development\" (2023 Microsoft Research Paper) + GitHub Copilot case study"}
                      as="p"
                      className="text-sm text-slate-600"
                    />
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-600" /> Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableContent
                      storageKey="lesson:preclass:video"
                      initialValue={"\"AI Pair Programming with Cursor AI\" (10-min demo)"}
                      as="p"
                      className="text-sm text-slate-600"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-amber-600" /> Pre-test (Kahoot)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">5-question quiz covering core concepts</p>
                  {pretestData && user && !isGuest ? (
                    <Quiz
                      quizId={pretestData.quiz.id}
                      title={pretestData.quiz.title}
                      questions={pretestData.questions.map((q) => ({
                        id: q.id,
                        questionText: q.questionText,
                        questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                        explanation: q.explanation,
                        answers: q.answers,
                      }))}
                      userId={user.userId}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sign in to take the pre-test quiz</p>
                  )}
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">Guiding Questions</h3>
                <ul className="space-y-2">
                  {[
                    'How might AI change the traditional developer role?',
                    'What ethical concerns should we consider with AI-generated code?',
                    'How could these tools impact software development accessibility?',
                  ].map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:preclass:question:${i}`}
                        initialValue={q}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('preclass') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('preclass')}
                disabled={isSectionComplete('preclass')}
              >
                {isSectionComplete('preclass') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 3: Introduction (12 min) */}
          <LessonSection id="introduction" title="3. Introduction" badge="12 minutes">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4" /> Hook Activity
                </h3>
                <EditableContent
                  storageKey="lesson:intro:hook"
                  initialValue={"\"Will AI take over developers' jobs?\" — Live poll with Mentimeter"}
                  as="p"
                  className="text-sm text-amber-700"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-slate-800">Key Discussion Points</h3>
                <ul className="space-y-2">
                  {[
                    'Pre-test discussion: Highlight key misconceptions (70% correct on technical debt questions)',
                    'Real-world connection: Demo Microsoft\'s AI-driven DevOps pipeline for Azure',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent
                        storageKey={`lesson:intro:point:${i}`}
                        initialValue={point}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('introduction') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('introduction')}
                disabled={isSectionComplete('introduction')}
              >
                {isSectionComplete('introduction') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
            {renderConceptCheck('introduction')}
          </LessonSection>

          {/* Section 4: Development Activities (63 min) */}
          <LessonSection id="development" title="4. Teaching & Learning Activities" badge="63 minutes">
            <div className="space-y-6">
              {/* Segment 1: Framework Evolution */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Segment 1: Framework Evolution
                    </CardTitle>
                    <Badge variant="outline">15 min</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {[
                      'Interactive lecture: Traditional → CI/CD → AI-enhanced workflow diagram',
                      'Animated illustration: "The AI-Enhanced Coding Loop"',
                      'Think-pair-share: Compare waterfall vs AI-assisted development models',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-blue-600 mt-1">&#8226;</span>
                        <EditableContent
                          storageKey={`lesson:dev:seg1:item:${i}`}
                          initialValue={item}
                          as="span"
                        />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Segment 2: Tool Demonstration */}
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-600" />
                      Segment 2: Tool Demonstration
                    </CardTitle>
                    <Badge variant="outline">20 min</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h4 className="font-medium text-sm text-slate-800">Live Demo:</h4>
                  <ol className="space-y-2 list-decimal list-inside">
                    {[
                      'Planning with ChatGPT-4 for a Python web scraper',
                      'Code generation with GitHub Copilot',
                      'Debugging with Cursor AI',
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 pl-2">
                        <EditableContent
                          storageKey={`lesson:dev:seg2:demo:${i}`}
                          initialValue={item}
                          as="span"
                        />
                      </li>
                    ))}
                  </ol>
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                    <p className="text-sm text-indigo-700 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Digital flashcards: AI Developer Toolset - 10 key commands
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Segment 3: Case Study Analysis */}
              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      Segment 3: Case Study Analysis
                    </CardTitle>
                    <Badge variant="outline">25 min</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <p className="font-medium text-sm text-emerald-800">Group Challenge:</p>
                    <EditableContent
                      storageKey="lesson:dev:seg3:challenge"
                      initialValue={"\"Build an e-commerce checkout system using AI tools within 30 minutes\""}
                      as="p"
                      className="text-sm text-emerald-700 mt-1"
                    />
                    <p className="text-xs text-emerald-600 mt-2">Constraints: Accessibility requirements, cross-browser compatibility</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Peer teaching with critique using the AI-Enhanced Solution Evaluation checklist:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {['Code quality metrics', 'Tool utilization effectiveness', 'Innovation in problem solving', 'Ethical risk mitigation'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded p-2">
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Segment 4: Formative Assessment */}
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                      Segment 4: Formative Assessment
                    </CardTitle>
                    <Badge variant="outline">3 min</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">Real-time quiz: AI Tool Workflow Analysis - 5 questions</p>
                  {formativeData && user && !isGuest ? (
                    <Quiz
                      quizId={formativeData.quiz.id}
                      title={formativeData.quiz.title}
                      questions={formativeData.questions.map((q) => ({
                        id: q.id,
                        questionText: q.questionText,
                        questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                        explanation: q.explanation,
                        answers: q.answers,
                      }))}
                      userId={user.userId}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sign in to take the formative assessment</p>
                  )}
                </CardContent>
              </Card>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('development') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('development')}
                disabled={isSectionComplete('development')}
              >
                {isSectionComplete('development') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 5: Synthesis & Closure (15 min) */}
          <LessonSection id="synthesis" title="5. Synthesis & Closure" badge="15 minutes">
            <div className="space-y-3">
              <ul className="space-y-2">
                {[
                  'Post-test vs pre-test comparison',
                  'Gallery walk: Group workflow diagrams on sticky notes',
                  'Reflective discussion: "How has your understanding of developer roles changed?"',
                  'Preview next session: "Ethical implications of AI-generated code in enterprise environments"',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-600 mt-1">&#8226;</span>
                    <EditableContent
                      storageKey={`lesson:synthesis:item:${i}`}
                      initialValue={item}
                      as="span"
                    />
                  </li>
                ))}
              </ul>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('synthesis') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('synthesis')}
                disabled={isSectionComplete('synthesis')}
              >
                {isSectionComplete('synthesis') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
            {renderConceptCheck('synthesis')}
          </LessonSection>

          {/* Section 6: Assessment Methods */}
          <LessonSection id="assessment" title="6. Assessment Methods" badge="Assessment">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">Formative Assessment</h3>
                <ul className="space-y-2">
                  {[
                    'Pre/post test score comparison (Knowledge gain target: +30% average)',
                    'Exit ticket: "Explain one way AI tools can address technical debt in 50 words"',
                    'Live code review: Instant feedback during tool practice',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 mt-1">&#8226;</span>
                      <EditableContent
                        storageKey={`lesson:assessment:formative:${i}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">Summative Assessment</h3>
                <Card className="bg-slate-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Individual Assignment: &ldquo;AI-Enhanced Development Workflow Blueprint&rdquo;</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Requirements:</p>
                      <ul className="space-y-1">
                        {[
                          '2000-word analysis of traditional vs AI workflow',
                          'Implementation plan for mid-sized development team',
                          'Ethical considerations section',
                        ].map((item, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-slate-400 mt-1">&#8226;</span>
                            <EditableContent
                              storageKey={`lesson:assessment:summative:req:${i}`}
                              initialValue={item}
                              as="span"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Rubric:</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[
                          { label: 'Accuracy of workflow comparison', weight: '40%' },
                          { label: 'Practicality of implementation plan', weight: '30%' },
                          { label: 'Ethical analysis depth', weight: '20%' },
                          { label: 'Innovation in tool integration', weight: '10%' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-white rounded p-2 border text-sm">
                            <span className="text-slate-700">{item.label}</span>
                            <Badge variant="secondary">{item.weight}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('assessment') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('assessment')}
                disabled={isSectionComplete('assessment')}
              >
                {isSectionComplete('assessment') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 7: Constructive Alignment Matrix */}
          <LessonSection id="alignment" title="7. Constructive Alignment Matrix" badge="Alignment">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 border font-medium text-slate-700">Learning Outcome</th>
                    <th className="text-left p-3 border font-medium text-slate-700">Teaching Activity</th>
                    <th className="text-left p-3 border font-medium text-slate-700">Assessment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { outcome: 'Analyze evolution', activity: 'Interactive lecture with framework comparison', assessment: 'Assignment: Workflow analysis' },
                    { outcome: 'Apply tools', activity: 'Tool demonstrations and case study practice', assessment: 'Hands-on sandbox exercises' },
                    { outcome: 'Evaluate effectiveness', activity: 'Group debate on tool limitations', assessment: 'Exit ticket critical reflection' },
                    { outcome: 'Synthesize workflow', activity: 'Gallery walk with peer critique', assessment: 'Assignment: Implementation plan' },
                  ].map((row, i) => (
                    <tr key={i} className="border hover:bg-slate-50/50">
                      <td className="p-3 border">
                        <EditableContent
                          storageKey={`lesson:alignment:outcome:${i}`}
                          initialValue={row.outcome}
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="p-3 border">
                        <EditableContent
                          storageKey={`lesson:alignment:activity:${i}`}
                          initialValue={row.activity}
                          as="span"
                          className="text-slate-600"
                        />
                      </td>
                      <td className="p-3 border">
                        <EditableContent
                          storageKey={`lesson:alignment:assessment:${i}`}
                          initialValue={row.assessment}
                          as="span"
                          className="text-slate-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('alignment') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('alignment')}
                disabled={isSectionComplete('alignment')}
              >
                {isSectionComplete('alignment') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 8: Required Resources */}
          <LessonSection id="resources" title="8. Required Resources" badge="Resources">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                'GitHub Copilot trial licenses',
                'Cursor AI access',
                'Cloud IDE platform (Gitpod)',
                'Mentimeter for live polling',
                'Padlet wall for idea sharing',
                'Animated loop visualization prototype (SVG-based workflow simulator)',
                'Code snippets repository: GitHub Classroom assignment',
              ].map((resource, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 rounded p-2">
                  <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <EditableContent
                    storageKey={`lesson:resources:item:${i}`}
                    initialValue={resource}
                    as="span"
                  />
                </div>
              ))}
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('resources') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('resources')}
                disabled={isSectionComplete('resources')}
              >
                {isSectionComplete('resources') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 9: Differentiation */}
          <LessonSection id="differentiation" title="9. Differentiation" badge="Differentiation">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Beginners', desc: 'Step-by-step tool guides with screenshot annotations', color: 'bg-green-50 border-green-200' },
                { label: 'Advanced learners', desc: 'Additional challenge: Reverse-engineer production GitHub repositories', color: 'bg-purple-50 border-purple-200' },
                { label: 'Visual learners', desc: 'Color-coded workflow diagrams with accessibility overlays', color: 'bg-blue-50 border-blue-200' },
                { label: 'Language support', desc: 'Subtitled videos + multilingual concept maps', color: 'bg-amber-50 border-amber-200' },
              ].map((item, i) => (
                <Card key={i} className={item.color}>
                  <CardContent className="pt-4">
                    <p className="font-medium text-sm text-slate-800 mb-1">{item.label}</p>
                    <EditableContent
                      storageKey={`lesson:differentiation:${i}`}
                      initialValue={item.desc}
                      as="p"
                      className="text-sm text-slate-600"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-3 bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-sm text-indigo-800 flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 shrink-0" />
                <EditableContent
                  storageKey="lesson:differentiation:accessibility"
                  initialValue="Accessibility: Screen-reader compatible code editors and keyboard navigation"
                  as="span"
                />
              </p>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('differentiation') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('differentiation')}
                disabled={isSectionComplete('differentiation')}
              >
                {isSectionComplete('differentiation') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 10: Evaluation & Improvement */}
          <LessonSection id="evaluation" title="8. Evaluation & Improvement" badge="Evaluation">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">Success Indicators</h3>
                <ul className="space-y-2">
                  {[
                    'Tool proficiency: 70% completion rate of coding challenges',
                    'Cognitive engagement: >75% participation in discussions',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckSquare className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:evaluation:success:${i}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">Feedback Mechanisms</h3>
                <ul className="space-y-2">
                  {[
                    'Post-session survey with Net Promoter Score',
                    'Follow-up alumni interview at semester end',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent
                        storageKey={`lesson:evaluation:feedback:${i}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">Potential Improvements</h3>
                <ul className="space-y-2">
                  {[
                    'More diverse case studies',
                    'Integration of version control tools in workflow exercises',
                    'Expand ethics discussion to include code ownership and IP implications',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <EditableContent
                        storageKey={`lesson:evaluation:improve:${i}`}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {!isGuest && user && (
              <Button
                variant={isSectionComplete('evaluation') ? 'secondary' : 'default'}
                size="sm"
                className="mt-4"
                onClick={() => handleMarkComplete('evaluation')}
                disabled={isSectionComplete('evaluation')}
              >
                {isSectionComplete('evaluation') ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </LessonSection>

          {/* Section 11: Supplementary Materials */}
          <LessonSection id="supplementary" title="Supplementary Materials" badge="Extras">
            <div className="space-y-4">
              <Card className="border-l-4 border-l-violet-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Interactive Visualization: The AI-Enhanced Coding Loop</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">
                    A scrollable webpage showing iterative process with embedded code examples at each stage:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['1. Planning', '2. Code Generation', '3. Testing', '4. Iteration Loop'].map((step, i) => (
                      <Badge key={i} variant="outline" className="text-sm">{step}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Checklist: AI-Enhanced Solution Evaluation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-2">4-point rubric for group presentations:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    {['Code quality metrics', 'Tool utilization effectiveness', 'Innovation in problem solving', 'Ethical risk mitigation'].map((item, i) => (
                      <li key={i} className="text-sm text-slate-700">{item}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sandbox Exercise: AI-Powered Coding Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    15-minute timed exercise creating a Python unit test suite using GitHub Copilot with immediate feedback mechanism.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4" /> Discussion Forum
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Join the discussion about AI in software development.
                </p>
                <Link href="/discussion">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" /> Go to Discussion Forum
                  </Button>
                </Link>
              </div>
            </div>
          </LessonSection>

          {/* Progress summary */}
          {!isGuest && user && (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-slate-800">Your Progress</p>
                    <p className="text-xs text-slate-500">
                      {Array.from(progressMap.values()).filter(Boolean).length} of {SECTIONS.length} sections completed
                    </p>
                  </div>
                  <Link href="/slides">
                    <Button variant="default" size="sm" className="gap-2">
                      <Layout className="h-4 w-4" /> View Slides
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
