'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import QuizComponent from '@/components/lesson/interactive/Quiz';
import ConceptCheckComponent from '@/components/lesson/interactive/ConceptCheck';
import { markSectionComplete } from '@/lib/actions/progress';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Video,
  HelpCircle,
  Lightbulb,
  Target,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  PenTool,
  BarChart3,
  FileText,
  Link2,
  Accessibility,
  RefreshCw,
  Presentation,
} from 'lucide-react';
import Link from 'next/link';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface ConceptCheckItem {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
  sectionKey: string | null;
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
  { id: 'materials', label: 'Materials' },
];

export default function LessonPage() {
  const { user, isGuest } = useUser();
  const [preTestQuiz, setPreTestQuiz] = useState<{
    id: number;
    title: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [formativeQuiz, setFormativeQuiz] = useState<{
    id: number;
    title: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [postTestQuiz, setPostTestQuiz] = useState<{
    id: number;
    title: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const loadQuizzes = useCallback(async () => {
    try {
      const [preResult, formativeResult, postResult, ccResult] = await Promise.all([
        getQuiz(1),
        getQuiz(2),
        getQuiz(3),
        getConceptChecks(),
      ]);

      if (preResult.success && preResult.data) {
        setPreTestQuiz({
          id: preResult.data.quiz.id,
          title: preResult.data.quiz.title,
          questions: preResult.data.questions as QuizQuestion[],
        });
      }
      if (formativeResult.success && formativeResult.data) {
        setFormativeQuiz({
          id: formativeResult.data.quiz.id,
          title: formativeResult.data.quiz.title,
          questions: formativeResult.data.questions as QuizQuestion[],
        });
      }
      if (postResult.success && postResult.data) {
        setPostTestQuiz({
          id: postResult.data.quiz.id,
          title: postResult.data.quiz.title,
          questions: postResult.data.questions as QuizQuestion[],
        });
      }
      if (ccResult.success && ccResult.data) {
        setConceptChecks(ccResult.data as ConceptCheckItem[]);
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || isGuest || user.userId < 0) return;
    setCompletedSections((prev: Set<string>) => new Set(prev).add(sectionKey));
    await markSectionComplete(user.userId, sectionKey);
  }

  function getConceptCheckForSection(sectionKey: string): ConceptCheckItem | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  }

  if (!user) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <ScrollRootProvider>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-8">
              <LessonSideMenu sections={SECTIONS} />

              <div className="flex-1 min-w-0 space-y-6 pb-16">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">Curriculum Design</h1>
                      <p className="text-muted-foreground">Lesson Plan for University Year 4 Students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 120 minutes</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Group-based</span>
                    <span className="flex items-center gap-1"><Target className="h-4 w-4" /> Bloom&apos;s Taxonomy</span>
                  </div>
                  <div className="mt-4">
                    <Link href="/slides">
                      <Button variant="outline" className="gap-2">
                        <Presentation className="h-4 w-4" /> View Slide Presentation
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* === Section 1: ILOs === */}
                <LessonSection id="ilos" title="Intended Learning Outcomes (ILOs)" badge="Outcomes">
                  <p className="text-muted-foreground mb-4">By the end of the lesson, students will be able to:</p>
                  <div className="space-y-3">
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <Badge className="mt-0.5 bg-blue-600">Analyze</Badge>
                        <EditableContent storageKey="ilo-1" initialValue="Foundational principles of curriculum design and their impact on educational outcomes." />
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <Badge className="mt-0.5 bg-purple-600">Evaluate</Badge>
                        <EditableContent storageKey="ilo-2" initialValue="Different curriculum models (e.g., traditional, learner-centered, standards-based) against predefined criteria." />
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <Badge className="mt-0.5 bg-emerald-600">Design</Badge>
                        <EditableContent storageKey="ilo-3" initialValue="A curriculum framework for a hypothetical secondary subject area that aligns with learning theories, goals, and assessment standards." />
                      </div>
                    </CardSection>
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('ilos') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('ilos')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('ilos') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 2: Pre-Class === */}
                <LessonSection id="preclass" title="Pre-Class Preparation" badge="Before Class">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Materials</h3>
                      <div className="space-y-2">
                        <CardSection>
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <EditableContent storageKey="preclass-reading" initialValue="Pre-reading: &quot;Understanding Curriculum Development&quot; (Smith, 2020)" as="p" className="font-medium" />
                              <a href="https://example.com/curriculum-reading" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Reading Material</a>
                            </div>
                          </div>
                        </CardSection>
                        <CardSection>
                          <div className="flex items-start gap-3">
                            <Video className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <EditableContent storageKey="preclass-video" initialValue="Video: Curriculum Design Models Explained" as="p" className="font-medium" />
                              <a href="https://www.youtube.com/watch?v=ABC123" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Watch on YouTube</a>
                            </div>
                          </div>
                        </CardSection>
                        <CardSection>
                          <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <EditableContent storageKey="preclass-quiz" initialValue="Pre-test: 8-question quiz on Moodle (e.g., &quot;Define &apos;backward design model&apos; and its implications for assessment&quot;)" as="p" className="font-medium" />
                            </div>
                          </div>
                        </CardSection>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Guiding Questions</h3>
                      <div className="space-y-2">
                        <CardSection>
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-1" />
                            <EditableContent storageKey="guiding-q1" initialValue="What factors influence curriculum design in your previous educational experiences?" />
                          </div>
                        </CardSection>
                        <CardSection>
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-1" />
                            <EditableContent storageKey="guiding-q2" initialValue="Can you identify strengths and weaknesses of learner-centered models?" />
                          </div>
                        </CardSection>
                        <CardSection>
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-1" />
                            <EditableContent storageKey="guiding-q3" initialValue="How might cultural context affect curriculum priorities?" />
                          </div>
                        </CardSection>
                      </div>
                    </div>

                    {/* Pre-test Quiz */}
                    {loading ? (
                      <Skeleton className="h-48 w-full rounded-lg" />
                    ) : preTestQuiz && !isGuest && user.userId > 0 ? (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Pre-Class Quiz
                        </h3>
                        <QuizComponent
                          quizId={preTestQuiz.id}
                          title={preTestQuiz.title}
                          questions={preTestQuiz.questions}
                          userId={user.userId}
                        />
                      </div>
                    ) : null}
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('preclass') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('preclass')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('preclass') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 3: Introduction === */}
                <LessonSection id="introduction" title="Introduction (15 minutes)" badge="Hook">
                  <div className="space-y-4">
                    <CardSection className="bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-800">Hook Scenario</p>
                          <EditableContent storageKey="intro-hook" initialValue="You are tasked with redesigning a failing high school curriculum. What are your first steps?" as="p" className="text-blue-700 italic" />
                        </div>
                      </div>
                    </CardSection>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Pre-test Review</h3>
                      <CardSection>
                        <EditableContent storageKey="intro-pretest-review" initialValue="Share anonymous word cloud results from pre-test responses to identify common misconceptions (e.g., confusion between instructional models and assessment frameworks)." as="p" />
                      </CardSection>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Connection to Prior Learning</h3>
                      <CardSection>
                        <EditableContent storageKey="intro-prior" initialValue="Link to prior session on learning theories (e.g., &quot;How does constructivism influence curriculum design?&quot;)" as="p" />
                      </CardSection>
                    </div>

                    {/* Concept Check */}
                    {(() => {
                      const cc = getConceptCheckForSection('introduction');
                      if (cc && !isGuest && user.userId > 0) {
                        return (
                          <ConceptCheckComponent
                            checkId={cc.id}
                            title={cc.title}
                            prompt={cc.prompt}
                            checkType={cc.checkType}
                            userId={user.userId}
                            userRole={user.role}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('introduction') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('introduction')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('introduction') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 4: Development Activities === */}
                <LessonSection id="development" title="Development Activities (90 minutes)" badge="Core Activities">
                  <Tabs defaultValue="lecture" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="lecture" className="gap-1 text-xs sm:text-sm">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Lecture</span>
                      </TabsTrigger>
                      <TabsTrigger value="case-study" className="gap-1 text-xs sm:text-sm">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Case Study</span>
                      </TabsTrigger>
                      <TabsTrigger value="framework" className="gap-1 text-xs sm:text-sm">
                        <PenTool className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Design</span>
                      </TabsTrigger>
                      <TabsTrigger value="quiz" className="gap-1 text-xs sm:text-sm">
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Quiz</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab: Interactive Lecture */}
                    <TabsContent value="lecture" className="mt-4 space-y-4">
                      <CardSection className="bg-indigo-50 border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <span className="font-semibold text-indigo-800">20 minutes</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Interactive Lecture &amp; Think-Pair-Share</h3>
                        <CardSection>
                          <p className="font-medium text-slate-700 mb-1">Topic:</p>
                          <EditableContent storageKey="lecture-topic" initialValue="Overview of curriculum design frameworks (traditional vs. backward design vs. competency-based models)." />
                        </CardSection>
                        <CardSection className="mt-2">
                          <p className="font-medium text-slate-700 mb-1">Think-Pair-Share Prompt:</p>
                          <EditableContent storageKey="lecture-tps" initialValue="Which model best supports inclusive education? Why?" as="p" className="italic" />
                        </CardSection>
                        <CardSection className="mt-2">
                          <p className="font-medium text-slate-700 mb-1">Visual Aid:</p>
                          <EditableContent storageKey="lecture-visual" initialValue="Animated flowchart comparing stages of backward design (Wiggins & McTighe) with traditional models." as="p" />
                        </CardSection>
                      </CardSection>

                      {/* Think-Pair-Share Discussion */}
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> Discussion: Which Model Supports Inclusive Education?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">Share your thoughts on which curriculum model best supports inclusive education.</p>
                        <Link href="/discussion/2">
                          <Button variant="outline" size="sm" className="gap-1">
                            Go to Discussion <MessageSquare className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>

                      {/* Concept Check */}
                      {(() => {
                        const cc = getConceptCheckForSection('development');
                        if (cc && !isGuest && user.userId > 0) {
                          return (
                            <ConceptCheckComponent
                              checkId={cc.id}
                              title={cc.title}
                              prompt={cc.prompt}
                              checkType={cc.checkType}
                              userId={user.userId}
                              userRole={user.role}
                            />
                          );
                        }
                        return null;
                      })()}
                    </TabsContent>

                    {/* Tab: Case Study */}
                    <TabsContent value="case-study" className="mt-4 space-y-4">
                      <CardSection className="bg-amber-50 border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="font-semibold text-amber-800">30 minutes</span>
                          <Badge variant="outline">Group Discussion</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Case Study: STEM Integration in Rural Schools</h3>
                        <EditableContent storageKey="case-study-desc" initialValue="A rural high school seeks to integrate STEM into its curriculum but lacks resources." as="p" className="text-slate-700 mb-3" />

                        <div className="space-y-2 mb-4">
                          <p className="font-medium text-slate-700">Guided Questions:</p>
                          <CardSection>
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-600">1.</span>
                              <EditableContent storageKey="case-q1" initialValue="What contextual factors (e.g., funding, community needs) influence this curriculum redesign?" />
                            </div>
                          </CardSection>
                          <CardSection>
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-600">2.</span>
                              <EditableContent storageKey="case-q2" initialValue="Propose two alignment strategies between standards and classroom practice." />
                            </div>
                          </CardSection>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-amber-100">
                          <p className="font-medium text-slate-700 mb-1">Scaffolding: DACUM Method</p>
                          <EditableContent storageKey="case-scaffold" initialValue="Use the DACUM (Developing A CUrriculum) graphic organizer to structure your analysis." as="p" className="text-sm text-slate-600" />
                        </div>
                      </CardSection>

                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> Case Study Discussion
                        </h3>
                        <Link href="/discussion/1">
                          <Button variant="outline" size="sm" className="gap-1">
                            Go to Discussion <MessageSquare className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Additional Case Study
                        </h3>
                        <CardSection className="bg-orange-50 border-orange-200">
                          <p className="font-semibold text-slate-800 mb-1">Urban Math Curriculum Overhaul</p>
                          <EditableContent storageKey="urban-case" initialValue="An urban school district aims to overhaul its math curriculum but faces resistance from teachers unfamiliar with new standards." as="p" className="text-slate-700 text-sm mb-2" />
                          <EditableContent storageKey="urban-prompt" initialValue="What steps would you take to build teacher buy-in while ensuring curricular alignment?" as="p" className="text-slate-700 text-sm italic" />
                        </CardSection>
                        <Link href="/discussion/4">
                          <Button variant="outline" size="sm" className="gap-1 mt-2">
                            Go to Discussion <MessageSquare className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </TabsContent>

                    {/* Tab: Framework Design */}
                    <TabsContent value="framework" className="mt-4 space-y-4">
                      <CardSection className="bg-emerald-50 border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-800">30 minutes</span>
                          <Badge variant="outline">Group Work</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Curriculum Framework Design</h3>
                        <EditableContent storageKey="framework-task" initialValue="Design a 4-week micro-curriculum for a secondary subject (e.g., biology, history) that:" as="p" className="text-slate-700 mb-2" />
                        <div className="space-y-1 ml-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <EditableContent storageKey="framework-criteria-1" initialValue="Aligns with Bloom's Taxonomy." />
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <EditableContent storageKey="framework-criteria-2" initialValue="Incorporates formative and summative assessments." />
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <EditableContent storageKey="framework-criteria-3" initialValue="Addresses diversity (e.g., multilingual learners)." />
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-medium">Tools:</span> <EditableContent storageKey="framework-tools" initialValue="Digital whiteboard (Jamboard) or physical poster paper for sketches." /></p>
                          <p><span className="font-medium">Gallery Walk:</span> <EditableContent storageKey="framework-gallery" initialValue="Groups present frameworks to the class and receive peer feedback via sticky notes." /></p>
                        </div>
                      </CardSection>

                      {/* Graphic Organizer / Backward Design Template */}
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Backward Design Framework Template</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <CardSection className="bg-blue-50 border-blue-200">
                            <p className="font-semibold text-blue-800 mb-1">Stage 1: Desired Results</p>
                            <EditableContent storageKey="bd-stage1" initialValue="Standards, objectives, and essential questions" as="p" className="text-sm text-blue-700" multiline />
                          </CardSection>
                          <CardSection className="bg-purple-50 border-purple-200">
                            <p className="font-semibold text-purple-800 mb-1">Stage 2: Assessment Events</p>
                            <EditableContent storageKey="bd-stage2" initialValue="Formative + summative assessments aligned to objectives" as="p" className="text-sm text-purple-700" multiline />
                          </CardSection>
                          <CardSection className="bg-emerald-50 border-emerald-200">
                            <p className="font-semibold text-emerald-800 mb-1">Stage 3: Learning Activities</p>
                            <EditableContent storageKey="bd-stage3" initialValue="Activities aligned to objectives and assessments" as="p" className="text-sm text-emerald-700" multiline />
                          </CardSection>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab: Formative Quiz */}
                    <TabsContent value="quiz" className="mt-4 space-y-4">
                      <CardSection className="bg-violet-50 border-violet-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-violet-600" />
                          <span className="font-semibold text-violet-800">10 minutes</span>
                          <Badge variant="outline">Formative Quiz</Badge>
                        </div>
                        <p className="text-slate-700 text-sm mb-1">Platform: Mentimeter poll</p>
                        <EditableContent storageKey="formative-platform-note" initialValue="Display anonymized response trends (e.g., 70% correct answers to &quot;What is the purpose of curriculum mapping?&quot;)." as="p" className="text-slate-600 text-sm" />
                      </CardSection>

                      {loading ? (
                        <Skeleton className="h-48 w-full rounded-lg" />
                      ) : formativeQuiz && !isGuest && user.userId > 0 ? (
                        <QuizComponent
                          quizId={formativeQuiz.id}
                          title={formativeQuiz.title}
                          questions={formativeQuiz.questions}
                          userId={user.userId}
                        />
                      ) : null}
                    </TabsContent>
                  </Tabs>

                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('development') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('development')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('development') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 5: Synthesis === */}
                <LessonSection id="synthesis" title="Synthesis & Closure (15 minutes)" badge="Wrap-Up">
                  <div className="space-y-4">
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Post-Test</p>
                          <EditableContent storageKey="synthesis-posttest" initialValue="Mirror 3 questions from pre-test to assess learning gains." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>

                    <CardSection>
                      <div className="flex items-start gap-3">
                        <PenTool className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Reflection: One-Minute Paper</p>
                          <EditableContent storageKey="synthesis-reflection" initialValue="One challenge I foresee in curriculum design and how to overcome it." as="p" className="text-slate-600 text-sm italic" />
                        </div>
                      </div>
                    </CardSection>

                    <CardSection>
                      <div className="flex items-start gap-3">
                        <Link2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Preview: Next Session</p>
                          <EditableContent storageKey="synthesis-preview" initialValue="Assessment alignment — students should explore a real-world curriculum example (e.g., IB diploma programme)." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>

                    {/* Post-test Quiz */}
                    {loading ? (
                      <Skeleton className="h-48 w-full rounded-lg" />
                    ) : postTestQuiz && !isGuest && user.userId > 0 ? (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Post-Test Quiz
                        </h3>
                        <QuizComponent
                          quizId={postTestQuiz.id}
                          title={postTestQuiz.title}
                          questions={postTestQuiz.questions}
                          userId={user.userId}
                        />
                      </div>
                    ) : null}

                    {/* Reflection Discussion */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Reflection Discussion
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">Share your reflection on challenges in curriculum design.</p>
                      <Link href="/discussion/3">
                        <Button variant="outline" size="sm" className="gap-1">
                          Go to Discussion <MessageSquare className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('synthesis') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('synthesis')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('synthesis') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 6: Assessment === */}
                <LessonSection id="assessment" title="Assessment Methods" badge="Assessment">
                  <Tabs defaultValue="formative" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="formative">Formative</TabsTrigger>
                      <TabsTrigger value="summative">Summative</TabsTrigger>
                    </TabsList>

                    <TabsContent value="formative" className="mt-4 space-y-3">
                      <CardSection>
                        <div className="flex items-start gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800">Pre-/Post-Test Comparison</p>
                            <EditableContent storageKey="assessment-prepost" initialValue="Measure knowledge shifts (e.g., understanding of backward design)." as="p" className="text-slate-600 text-sm" />
                          </div>
                        </div>
                      </CardSection>
                      <CardSection>
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800">Peer Feedback</p>
                            <EditableContent storageKey="assessment-peer" initialValue="Groups use a checklist to evaluate each other's frameworks." as="p" className="text-slate-600 text-sm" />
                          </div>
                        </div>
                      </CardSection>
                      <CardSection>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800">Exit Tickets</p>
                            <EditableContent storageKey="assessment-exit" initialValue="Themes from one-minute papers." as="p" className="text-slate-600 text-sm" />
                          </div>
                        </div>
                      </CardSection>
                    </TabsContent>

                    <TabsContent value="summative" className="mt-4 space-y-4">
                      <CardSection className="bg-violet-50 border-violet-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-violet-600" />
                          <Badge variant="outline">Due One Week Later</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Curriculum Proposal</h3>
                        <EditableContent storageKey="summative-desc" initialValue="1500-word document outlining a semester-long curriculum for a subject of choice, including:" as="p" className="text-slate-700 mb-2" />
                        <div className="space-y-1 ml-4 mb-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                            <EditableContent storageKey="summative-req-1" initialValue="Aligned learning objectives (using SMART criteria)." />
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                            <EditableContent storageKey="summative-req-2" initialValue="Assessment rubrics and instructional strategies." />
                          </div>
                        </div>

                        <Separator className="my-3" />
                        <h4 className="font-semibold text-slate-800 mb-2">Rubric</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-violet-100">
                            <EditableContent storageKey="rubric-1" initialValue="Clarity and alignment of objectives, instruction, and assessment" />
                            <Badge className="bg-violet-600">40%</Badge>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-violet-100">
                            <EditableContent storageKey="rubric-2" initialValue="Incorporation of equity, diversity, and cultural relevance" />
                            <Badge className="bg-violet-600">30%</Badge>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-violet-100">
                            <EditableContent storageKey="rubric-3" initialValue="Theoretical justification (e.g., why Bloom's Taxonomy is appropriate)" />
                            <Badge className="bg-violet-600">30%</Badge>
                          </div>
                        </div>
                      </CardSection>
                    </TabsContent>
                  </Tabs>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('assessment') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('assessment')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('assessment') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 7: Alignment Matrix === */}
                <LessonSection id="alignment" title="Constructive Alignment Matrix" badge="Alignment">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Learning Outcome</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Teaching Activity</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Assessment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-outcome-1" initialValue="Analyze curriculum principles" />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-activity-1" initialValue="Case study analysis group work" />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-assess-1" initialValue="Post-test, Summative proposal" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-outcome-2" initialValue="Evaluate curriculum models" />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-activity-2" initialValue="Think-pair-share and poll" />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-assess-2" initialValue="Formative quiz, Exit ticket themes" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-outcome-3" initialValue="Design curriculum framework" />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-activity-3" initialValue="Framework design activity" />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey="matrix-assess-3" initialValue="Summative proposal (peer feedback)" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Concept Check for alignment */}
                  {(() => {
                    const cc = getConceptCheckForSection('alignment');
                    if (cc && !isGuest && user.userId > 0) {
                      return (
                        <div className="mt-4">
                          <ConceptCheckComponent
                            checkId={cc.id}
                            title={cc.title}
                            prompt={cc.prompt}
                            checkType={cc.checkType}
                            userId={user.userId}
                            userRole={user.role}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('alignment') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('alignment')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('alignment') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 8: Resources === */}
                <LessonSection id="resources" title="Required Resources & Technology" badge="Resources">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">LMS Tools</p>
                          <EditableContent storageKey="resource-lms" initialValue="Moodle (pre/post-tests), Mentimeter for polls." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Physical Materials</p>
                          <EditableContent storageKey="resource-physical" initialValue="Printed graphic organizers, poster paper for gallery walks." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <Video className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Digital Tools</p>
                          <EditableContent storageKey="resource-digital" initialValue="Jamboard, YouTube video access." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <Link2 className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">References</p>
                          <EditableContent storageKey="resource-ref" initialValue="Smith (2020) article, Wiggins & McTighe's Understanding by Design." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('resources') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('resources')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('resources') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 9: Differentiation === */}
                <LessonSection id="differentiation" title="Differentiation & Inclusivity" badge="Inclusivity">
                  <div className="space-y-3">
                    <CardSection className="bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <Accessibility className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-800">Support</p>
                          <EditableContent storageKey="diff-support" initialValue="Provide audio summaries of written materials for auditory learners." as="p" className="text-blue-700 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection className="bg-purple-50 border-purple-200">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-purple-800">Extension</p>
                          <EditableContent storageKey="diff-extension" initialValue="Advanced students explore UNESCO's Global Citizenship Education framework." as="p" className="text-purple-700 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection className="bg-emerald-50 border-emerald-200">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-800">Accessibility</p>
                          <EditableContent storageKey="diff-accessibility" initialValue="Use alt-text on slides, ensure group roles accommodate all participation styles." as="p" className="text-emerald-700 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('differentiation') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('differentiation')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('differentiation') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 10: Reflection === */}
                <LessonSection id="reflection" title="Reflection & Improvement" badge="Reflection">
                  <div className="space-y-3">
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Success Indicators</p>
                          <EditableContent storageKey="reflect-success" initialValue="High engagement in group discussions and quality of framework designs." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Feedback</p>
                          <EditableContent storageKey="reflect-feedback" initialValue="Collect student surveys on LMS; track summative proposal grades." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                    <CardSection>
                      <div className="flex items-start gap-3">
                        <RefreshCw className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">Future Modifications</p>
                          <EditableContent storageKey="reflect-mods" initialValue="Add a guest speaker (curriculum director) for real-world insights." as="p" className="text-slate-600 text-sm" />
                        </div>
                      </div>
                    </CardSection>
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('reflection') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('reflection')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('reflection') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>

                {/* === Section 11: Generated Materials === */}
                <LessonSection id="materials" title="Generated Materials" badge="Supplementary">
                  <div className="space-y-4">
                    <CardSection className="bg-amber-50 border-amber-200">
                      <h3 className="font-semibold text-slate-800 mb-2">Case Study: Urban Math Curriculum Overhaul</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-slate-700 text-sm">Scenario:</p>
                          <EditableContent storageKey="material-case-scenario" initialValue="An urban school district aims to overhaul its math curriculum but faces resistance from teachers unfamiliar with new standards." as="p" className="text-slate-700 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">Prompt:</p>
                          <EditableContent storageKey="material-case-prompt" initialValue="What steps would you take to build teacher buy-in while ensuring curricular alignment?" as="p" className="text-slate-700 text-sm italic" />
                        </div>
                      </div>
                    </CardSection>

                    <CardSection className="bg-indigo-50 border-indigo-200">
                      <h3 className="font-semibold text-slate-800 mb-2">Graphic Organizer: Backward Design Framework Template</h3>
                      <p className="text-sm text-slate-600 mb-3">Title: <EditableContent storageKey="material-go-title" initialValue="Backward Design Framework Template" /></p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-indigo-100">
                          <p className="font-semibold text-blue-800 text-sm mb-1">Stage 1: Desired Results</p>
                          <EditableContent storageKey="material-go-s1" initialValue="Standards, objectives" as="p" className="text-xs text-blue-700" />
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-100">
                          <p className="font-semibold text-purple-800 text-sm mb-1">Stage 2: Assessment Events</p>
                          <EditableContent storageKey="material-go-s2" initialValue="Formative + summative" as="p" className="text-xs text-purple-700" />
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-100">
                          <p className="font-semibold text-emerald-800 text-sm mb-1">Stage 3: Learning Activities</p>
                          <EditableContent storageKey="material-go-s3" initialValue="Aligned to objectives" as="p" className="text-xs text-emerald-700" />
                        </div>
                      </div>
                    </CardSection>
                  </div>
                  {!isGuest && user.userId > 0 && (
                    <Button
                      variant={completedSections.has('materials') ? 'secondary' : 'outline'}
                      size="sm"
                      className="mt-4 gap-1"
                      onClick={() => handleMarkComplete('materials')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedSections.has('materials') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  )}
                </LessonSection>
              </div>
            </div>
          </div>
        </ScrollRootProvider>
      </div>
    </AuthGuard>
  );
}
