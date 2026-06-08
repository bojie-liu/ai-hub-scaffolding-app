'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonQuiz from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import LessonDiscussion from '@/components/lesson/interactive/Discussion';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { markSectionComplete } from '@/lib/actions/progress';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussion } from '@/lib/actions/discussion';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Code,
  Users,
  Lightbulb,
  MessageSquare,
  Scale,
  Wrench,
  Target,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
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
  discussionId: number;
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

export default function LessonPage() {
  return (
    <AuthGuard>
      <Navbar />
      <ScrollRootProvider>
        <LessonContent />
      </ScrollRootProvider>
    </AuthGuard>
  );
}

function LessonContent() {
  const { user } = useUser();
  const [preTestQuiz, setPreTestQuiz] = useState<QuizData | null>(null);
  const [postTestQuiz, setPostTestQuiz] = useState<QuizData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [thinkPairDiscussion, setThinkPairDiscussion] = useState<DiscussionData | null>(null);
  const [reflectionDiscussion, setReflectionDiscussion] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [preTestResult, postTestResult, checksResult] = await Promise.all([
        getQuiz(1),
        getQuiz(2),
        getConceptChecks(),
      ]);

      if (preTestResult.success && preTestResult.data) {
        setPreTestQuiz(preTestResult.data as QuizData);
      }
      if (postTestResult.success && postTestResult.data) {
        setPostTestQuiz(postTestResult.data as QuizData);
      }
      if (checksResult.success && checksResult.data) {
        setConceptChecks(checksResult.data as ConceptCheckData[]);
      }

      // Load discussions
      try {
        const disc1 = await getDiscussion(1);
        if (disc1.success && disc1.data) {
          const d = disc1.data;
          setThinkPairDiscussion({
            discussionId: d.discussion.id,
            title: d.discussion.title,
            description: d.discussion.description,
            posts: d.posts.map((p) => ({
              id: p.id,
              parentId: p.parentPostId,
              authorId: p.authorId,
              authorName: p.authorDisplayName || p.authorUsername || 'User',
              content: p.content,
              createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
            })),
          });
        }
      } catch {}

      try {
        const disc2 = await getDiscussion(2);
        if (disc2.success && disc2.data) {
          const d = disc2.data;
          setReflectionDiscussion({
            discussionId: d.discussion.id,
            title: d.discussion.title,
            description: d.discussion.description,
            posts: d.posts.map((p) => ({
              id: p.id,
              parentId: p.parentPostId,
              authorId: p.authorId,
              authorName: p.authorDisplayName || p.authorUsername || 'User',
              content: p.content,
              createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
            })),
          });
        }
      } catch {}
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkComplete = async (sectionKey: string) => {
    if (!user || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      toast.success('Section marked complete!');
    }
  };

  const getConceptCheck = (sectionKey: string) =>
    conceptChecks.find((c) => c.sectionKey === sectionKey);

  const userId = user?.userId ?? -1;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-60" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <LessonSideMenu sections={SECTIONS} />

        <div className="flex-1 min-w-0 space-y-8 pb-16">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  <EditableContent storageKey="lesson:title" initialValue="The Modern Software Developer" as="span" />
                </h1>
                <p className="text-muted-foreground">
                  <EditableContent storageKey="lesson:subtitle" initialValue="AI-Enhanced Software Development Workflows" as="span" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> <EditableContent storageKey="lesson:duration" initialValue="90 minutes" as="span" /></span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> <EditableContent storageKey="lesson:classSize" initialValue="30 students" as="span" /></span>
              <Badge variant="outline">English</Badge>
            </div>
          </div>

          {/* Section 1: ILOs */}
          <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="ILOs">
            <div className="space-y-4">
              <p className="text-muted-foreground">By the end of this lesson, students will be able to:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'ilo:1', icon: Brain, label: 'ILO 1', color: 'blue', text: 'Analyze how AI tools address traditional software engineering challenges (e.g., debugging, code generation).' },
                  { key: 'ilo:2', icon: Scale, label: 'ILO 2', color: 'emerald', text: 'Evaluate the effectiveness of AI-powered code assistants like GitHub Copilot using real-world scenarios.' },
                  { key: 'ilo:3', icon: Code, label: 'ILO 3', color: 'violet', text: 'Apply an iterative "plan, generate, modify" workflow to solve a simple coding problem with AI assistance.' },
                  { key: 'ilo:4', icon: Lightbulb, label: 'ILO 4', color: 'amber', text: 'Critique ethical and practical limitations of AI-driven software development.' },
                ].map(({ key, icon: Icon, label, color, text }) => (
                  <CardSection key={key} className={`border-l-4 border-l-${color}-500`}>
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 text-${color}-600 mt-0.5 shrink-0`} />
                      <div>
                        <Badge variant="outline" className="mb-1 text-xs">{label}</Badge>
                        <EditableContent storageKey={key} initialValue={text} as="p" className="text-sm text-slate-700" multiline />
                      </div>
                    </div>
                  </CardSection>
                ))}
              </div>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('ilos')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 2: Pre-Class Preparation */}
          <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Pre-Work">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Pre-Reading (10-15 minutes)
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">&#8226;</span>
                    <span>Text: <em>&quot;The Future of Code is AI&quot;</em> by GitHub — <a href="https://github.blog/2022-09-06-ai-pairs-with-developers/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Read Article</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">&#8226;</span>
                    <span>Video: <em>&quot;GitHub Copilot in 1 Hour&quot;</em> (YouTube, 10 min) — <a href="https://www.youtube.com/watch?v=hDg58fA1Ack" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Watch Video</a></span>
                  </li>
                </ul>
              </div>

              <Separator />

              {preTestQuiz && userId > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Pre-Test
                  </h3>
                  <LessonQuiz
                    quizId={preTestQuiz.quiz.id}
                    title={preTestQuiz.quiz.title}
                    questions={preTestQuiz.questions.map((q) => ({
                      id: q.id,
                      questionText: q.questionText,
                      questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                      explanation: q.explanation,
                      answers: q.answers,
                    }))}
                    userId={userId}
                  />
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Guiding Questions</h3>
                <div className="space-y-3">
                  <CardSection className="bg-amber-50 border-amber-200">
                    <p className="text-sm text-amber-800">&#x2753; How might AI tools change the skill sets required for beginner programmers?</p>
                  </CardSection>
                  <CardSection className="bg-amber-50 border-amber-200">
                    <p className="text-sm text-amber-800">&#x2753; When would you prefer manual coding over using an AI assistant?</p>
                  </CardSection>
                </div>
              </div>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('preclass')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 3: Introduction */}
          <LessonSection id="introduction" title="3. Introduction" badge="10 min">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Hook
                </h3>
                <CardSection className="bg-blue-50 border-blue-200">
                  <p className="text-blue-800 font-medium mb-2">
                    <EditableContent storageKey="hook:question" initialValue="Can a neural network write error-free code faster than a human?" as="span" />
                  </p>
                  <p className="text-sm text-blue-700">Side-by-side comparison: Manual vs. AI-Assisted Debugging</p>
                </CardSection>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Pre-Test Review &amp; Misconceptions</h3>
                <div className="space-y-3">
                  <CardSection className="bg-red-50 border-red-200">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">Common Misconception:</span>{' '}
                      <EditableContent storageKey="hook:misconception" initialValue="AI replaces programmers" as="span" className="line-through" />
                    </p>
                  </CardSection>
                  <CardSection className="bg-emerald-50 border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      <span className="font-semibold">Reality:</span>{' '}
                      <EditableContent storageKey="hook:data" initialValue="GitHub Copilot saves developers 40% time on average" as="span" />
                    </p>
                  </CardSection>
                </div>
              </div>

              {getConceptCheck('introduction') && userId > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Quick Check</h3>
                  <ConceptCheck
                    checkId={getConceptCheck('introduction')!.id}
                    title={getConceptCheck('introduction')!.title}
                    prompt={getConceptCheck('introduction')!.prompt}
                    checkType={getConceptCheck('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={userId}
                  />
                </div>
              )}
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('introduction')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 4: Development */}
          <LessonSection id="development" title="4. Teaching & Learning Activities" badge="60 min">
            <div className="space-y-8">
              {/* Interactive Lecture */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Interactive Lecture: AI&apos;s Impact on Software Workflows (15 min)
                </h3>
                <div className="space-y-3">
                  <CardSection>
                    <h4 className="font-medium text-sm text-slate-700 mb-2">Scaffolded Segments</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                      <li>Evolution of software engineering: code creation → augmentation (2000s) → iterative AI workflows</li>
                      <li>Case Study: <EditableContent storageKey="case:facebook" initialValue="How Facebook automated accessibility improvements using AI" as="span" /></li>
                    </ol>
                  </CardSection>

                  {getConceptCheck('development') && userId > 0 && (
                    <ConceptCheck
                      checkId={getConceptCheck('development')!.id}
                      title={getConceptCheck('development')!.title}
                      prompt={getConceptCheck('development')!.prompt}
                      checkType={getConceptCheck('development')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={userId}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Think-Pair-Share Discussion */}
              {thinkPairDiscussion && userId > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Think-Pair-Share
                  </h3>
                  <LessonDiscussion
                    discussionId={thinkPairDiscussion.discussionId}
                    title={thinkPairDiscussion.title}
                    description={thinkPairDiscussion.description}
                    posts={thinkPairDiscussion.posts}
                    userId={userId}
                  />
                </div>
              )}

              <Separator />

              {/* Hands-On Demo */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4" /> Hands-On AI Tool Demo (10 min)
                </h3>
                <CardSection>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Live Demo: Solve a basic Python task using GitHub Copilot</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Create a sorting function with comments as prompts</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Compare: AI-generated vs. manual code efficiency</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Shared Replit IDE for real-time collaboration</li>
                  </ul>
                </CardSection>
              </div>

              <Separator />

              {/* Guided Hands-On Coding */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Guided Hands-On Coding (25 min)
                </h3>
                <CardSection>
                  <h4 className="font-medium text-sm text-slate-700 mb-2">Iterative Workflow Practice</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                    <li><span className="font-medium">Plan:</span> In pairs, design a simple calculator app in Python (user input, error handling)</li>
                    <li><span className="font-medium">Generate:</span> Use Copilot to scaffold the code (20 min)</li>
                    <li><span className="font-medium">Modify:</span> Debug and optimize with peer review</li>
                    <li><span className="font-medium">Repeat:</span> Document improvements in a Padlet reflection board</li>
                  </ol>
                </CardSection>
                <div className="mt-3 space-y-2">
                  <CardSection className="bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-800"><span className="font-semibold">Support:</span> Scaffolded template provided for beginners</p>
                  </CardSection>
                  <CardSection className="bg-violet-50 border-violet-200">
                    <p className="text-sm text-violet-800"><span className="font-semibold">Challenge:</span> Generate a non-trivial test case for your partner&apos;s code</p>
                  </CardSection>
                </div>
              </div>

              <Separator />

              {/* Group Presentations */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Group Presentations &amp; Peer Review (10 min)
                </h3>
                <CardSection>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Each pair shares workflow modifications using 1-slide summaries</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Peers vote on &quot;Most Creative AI Use&quot; via Mentimeter</li>
                  </ul>
                </CardSection>
              </div>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('development')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 5: Synthesis & Closure */}
          <LessonSection id="synthesis" title="5. Synthesis & Closure" badge="10 min">
            <div className="space-y-6">
              {postTestQuiz && userId > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Post-Test
                  </h3>
                  <LessonQuiz
                    quizId={postTestQuiz.quiz.id}
                    title={postTestQuiz.quiz.title}
                    questions={postTestQuiz.questions.map((q) => ({
                      id: q.id,
                      questionText: q.questionText,
                      questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                      explanation: q.explanation,
                      answers: q.answers,
                    }))}
                    userId={userId}
                  />
                </div>
              )}

              {getConceptCheck('synthesis') && userId > 0 && (
                <ConceptCheck
                  checkId={getConceptCheck('synthesis')!.id}
                  title={getConceptCheck('synthesis')!.title}
                  prompt={getConceptCheck('synthesis')!.prompt}
                  checkType={getConceptCheck('synthesis')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                />
              )}

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Real-World Connection</h3>
                <CardSection className="bg-emerald-50 border-emerald-200">
                  <p className="text-sm text-emerald-800">Microsoft&apos;s AI-powered Power Apps interface for democratized UX design</p>
                </CardSection>
              </div>

              {reflectionDiscussion && userId > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Exit Ticket
                  </h3>
                  <LessonDiscussion
                    discussionId={reflectionDiscussion.discussionId}
                    title={reflectionDiscussion.title}
                    description={reflectionDiscussion.description}
                    posts={reflectionDiscussion.posts}
                    userId={userId}
                  />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Preview Next Session</h3>
                <CardSection className="bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Homework:</span>{' '}
                    <EditableContent storageKey="homework" initialValue="Research AI's role in software ethics (bias in training data, job market impact)" as="span" />
                  </p>
                </CardSection>
              </div>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('synthesis')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 6: Assessment Methods */}
          <LessonSection id="assessment" title="6. Assessment Methods" badge="Assessment">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Formative (In-Class)</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CardSection className="text-center">
                    <BarChart3 className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-slate-700">Pre/Post-Test Comparison</p>
                    <p className="text-xs text-muted-foreground mt-1">Knowledge Gains on AI capabilities</p>
                  </CardSection>
                  <CardSection className="text-center">
                    <MessageSquare className="h-6 w-6 mx-auto text-violet-600 mb-2" />
                    <p className="text-sm font-medium text-slate-700">Mentimeter Polls</p>
                    <p className="text-xs text-muted-foreground mt-1">Peer voting during presentations</p>
                  </CardSection>
                  <CardSection className="text-center">
                    <BookOpen className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-medium text-slate-700">Exit Tickets</p>
                    <p className="text-xs text-muted-foreground mt-1">Padlet reflections</p>
                  </CardSection>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Summative (Post-Class)</h3>
                <CardSection>
                  <p className="text-sm text-slate-700 mb-3">
                    <span className="font-medium">Individual Assignment:</span> Analyze a real-world AI development tool (e.g., Amazon CodeWhisperer) using the provided rubric:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Badge className="w-8 justify-center">30%</Badge>
                      <EditableContent storageKey="rubric:relevance" initialValue="Relevance to traditional challenges" as="span" className="text-slate-700" />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge className="w-8 justify-center">30%</Badge>
                      <EditableContent storageKey="rubric:integration" initialValue="Workflow integration" as="span" className="text-slate-700" />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge className="w-8 justify-center">40%</Badge>
                      <EditableContent storageKey="rubric:ethics" initialValue="Ethical critique" as="span" className="text-slate-700" />
                    </div>
                  </div>
                </CardSection>
              </div>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('assessment')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 7: Constructive Alignment Matrix */}
          <LessonSection id="alignment" title="7. Constructive Alignment Matrix" badge="Alignment">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Learning Outcome</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Teaching Activity</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Assessment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { outcome: 'ILO 1: Analyze AI\'s advantages', activity: 'Interactive lecture & case study', assessment: 'Pre-Test & Exit Ticket' },
                    { outcome: 'ILO 2: Evaluate AI tools', activity: 'GitHub Copilot demo & peer review', assessment: 'Mentimeter poll & Rubric' },
                    { outcome: 'ILO 3: Apply workflow', activity: 'Guided coding & presentations', assessment: 'Hands-on activity & Exit Ticket' },
                    { outcome: 'ILO 4: Critique limitations', activity: 'Ethical preview discussion', assessment: 'Reflection & Rubric' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-3 font-medium text-slate-800">{row.outcome}</td>
                      <td className="py-3 px-3 text-slate-600">{row.activity}</td>
                      <td className="py-3 px-3 text-slate-600">{row.assessment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('alignment')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 8: Required Resources */}
          <LessonSection id="resources" title="8. Required Resources" badge="Resources">
            <div className="grid gap-4 sm:grid-cols-2">
              <CardSection>
                <h4 className="font-medium text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> LMS
                </h4>
                <p className="text-sm text-slate-600">Canvas/LMS with pre-test/post-test module</p>
              </CardSection>
              <CardSection>
                <h4 className="font-medium text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Tools
                </h4>
                <p className="text-sm text-slate-600">GitHub Copilot (trial access), Replit IDE, Mentimeter, Padlet</p>
              </CardSection>
              <CardSection>
                <h4 className="font-medium text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" /> Media
                </h4>
                <p className="text-sm text-slate-600">Animated debugging comparison graphic, GitHub blog PDF</p>
              </CardSection>
              <CardSection>
                <h4 className="font-medium text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Physical
                </h4>
                <p className="text-sm text-slate-600">None required (fully digital)</p>
              </CardSection>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('resources')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 9: Differentiation & Inclusivity */}
          <LessonSection id="differentiation" title="9. Differentiation & Inclusivity" badge="Inclusivity">
            <div className="grid gap-4 sm:grid-cols-2">
              <CardSection className="bg-blue-50 border-blue-200">
                <h4 className="font-medium text-sm text-blue-800 mb-2">For Struggling Students</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>&#8226; Pre-scaffolded starter code templates</li>
                  <li>&#8226; 2-person teams for hands-on activities</li>
                </ul>
              </CardSection>
              <CardSection className="bg-violet-50 border-violet-200">
                <h4 className="font-medium text-sm text-violet-800 mb-2">For Advanced Learners</h4>
                <ul className="space-y-1 text-sm text-violet-700">
                  <li>&#8226; Challenge: Use AI to generate test cases for your code</li>
                </ul>
              </CardSection>
              <CardSection className="bg-emerald-50 border-emerald-200">
                <h4 className="font-medium text-sm text-emerald-800 mb-2">Multilingual Support</h4>
                <ul className="space-y-1 text-sm text-emerald-700">
                  <li>&#8226; Code comments in Spanish/Chinese via Copilot settings</li>
                  <li>&#8226; Subtitled demo video (YouTube auto-translate)</li>
                </ul>
              </CardSection>
              <CardSection className="bg-amber-50 border-amber-200">
                <h4 className="font-medium text-sm text-amber-800 mb-2">Disability Access</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>&#8226; Keyboard shortcuts for Copilot demonstrated for motor-impaired users</li>
                </ul>
              </CardSection>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('differentiation')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>

          {/* Section 10: Reflection & Improvement */}
          <LessonSection id="reflection" title="10. Reflection & Improvement" badge="Reflection">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Success Metrics</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CardSection className="text-center">
                    <p className="text-2xl font-bold text-blue-600">&gt;70%</p>
                    <p className="text-sm text-muted-foreground">Pre/Post-Test score improvement</p>
                  </CardSection>
                  <CardSection className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">80%</p>
                    <p className="text-sm text-muted-foreground">Engagement in hands-on activity</p>
                  </CardSection>
                  <CardSection className="text-center">
                    <p className="text-2xl font-bold text-violet-600">Even</p>
                    <p className="text-sm text-muted-foreground">Peer votes distribution</p>
                  </CardSection>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Feedback</h3>
                <CardSection>
                  <p className="text-sm text-slate-700 mb-2">Collected via anonymous LMS survey (3 questions):</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                    <li>What tool features confused you most?</li>
                    <li>Would you use AI tools for homework after this class?</li>
                  </ol>
                </CardSection>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Improvements for Next Iteration</h3>
                <CardSection>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Add 5-minute breakout room tutorials for Copilot basics</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">&#8226;</span> Introduce a &quot;code quality checklist&quot; for ethical critiques</li>
                  </ul>
                </CardSection>
              </div>
            </div>
            {userId > 0 && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('reflection')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </LessonSection>
        </div>
      </div>
    </div>
  );
}
