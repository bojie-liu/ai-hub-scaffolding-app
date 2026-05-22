'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useScrollRoot } from '@/contexts';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import Quiz from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Discussion from '@/components/lesson/interactive/Discussion';
import VennDiagram from '@/components/interactive/VennDiagram';
import Flashcard from '@/components/learning/Flashcard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions, getDiscussion } from '@/lib/actions/discussion';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import {
  Target, BookOpen, Clock, Users, BarChart3, Lightbulb,
  CheckCircle2, ArrowRight, Brain, MessageSquare, GraduationCap,
} from 'lucide-react';

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
  { id: 'reflection', label: 'Reflection' },
];

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
  questions: Array<{
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: Array<{ id: number; answerText: string; isCorrect: boolean }>;
  }>;
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
}

interface DiscussionPostRaw {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

function LessonContent() {
  const { user } = useUser();
  const scrollRootRef = useScrollRoot();
  const [preTestQuiz, setPreTestQuiz] = useState<QuizData | null>(null);
  const [kahootQuiz, setKahootQuiz] = useState<QuizData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [hookDiscussion, setHookDiscussion] = useState<{ id: number; title: string; description: string | null; posts: DiscussionPostRaw[] } | null>(null);
  const [reflectionDiscussion, setReflectionDiscussion] = useState<{ id: number; title: string; description: string | null; posts: DiscussionPostRaw[] } | null>(null);
  const [accommodationDiscussion, setAccommodationDiscussion] = useState<{ id: number; title: string; description: string | null; posts: DiscussionPostRaw[] } | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [preTestResult, kahootResult, ccResult, discussionsResult] = await Promise.all([
        getQuiz(1),
        getQuiz(2),
        getConceptChecks(),
        getDiscussions(),
      ]);

      if (preTestResult.success && preTestResult.data) {
        setPreTestQuiz(preTestResult.data as QuizData);
      }
      if (kahootResult.success && kahootResult.data) {
        setKahootQuiz(kahootResult.data as QuizData);
      }
      if (ccResult.success && ccResult.data) {
        setConceptChecks(ccResult.data as ConceptCheckData[]);
      }

      if (discussionsResult.success && discussionsResult.data) {
        const discs = discussionsResult.data;
        for (const d of discs) {
          const detail = await getDiscussion(d.id);
          if (detail.success && detail.data) {
            const posts = detail.data.posts.map((p: { id: number; parentPostId: number | null; authorId: number; authorUsername: string | null; authorDisplayName: string | null; content: string; createdAt: Date | null }) => ({
              id: p.id,
              parentId: p.parentPostId,
              authorId: p.authorId,
              authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
              content: p.content,
              createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
            }));
            if (d.storageKey === 'discussion:individual-vs-social') {
              setHookDiscussion({ id: d.id, title: d.title, description: d.description, posts });
            } else if (d.storageKey === 'discussion:learning-style-reflection') {
              setReflectionDiscussion({ id: d.id, title: d.title, description: d.description, posts });
            } else if (d.storageKey === 'discussion:accommodation-experience') {
              setAccommodationDiscussion({ id: d.id, title: d.title, description: d.description, posts });
            }
          }
        }
      }

      if (userId > 0) {
        const progressResult = await getStudentProgress(userId);
        if (progressResult.success && progressResult.data) {
          const completed = new Set<string>();
          for (const p of progressResult.data) {
            if (p.completed) completed.add(p.sectionKey);
          }
          setCompletedSections(completed);
        }
      }
    } catch (err) {
      console.error('Failed to load lesson data:', err);
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

  function getConceptCheckForSection(sectionKey: string, titleSubstring: string): ConceptCheckData | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey && cc.title.includes(titleSubstring));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" ref={scrollRootRef}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <LessonSideMenu sections={SECTIONS} />

        <main className="flex-1 min-w-0 space-y-6 pb-16">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cognitive and Social Constructivism Theory</h1>
            <p className="text-blue-100 text-sm sm:text-base">University Year 1 — Education Psychology</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-white/20 text-white border-white/30">Piaget</Badge>
              <Badge className="bg-white/20 text-white border-white/30">Vygotsky</Badge>
              <Badge className="bg-white/20 text-white border-white/30">180 mins</Badge>
            </div>
          </div>

          {/* Section 1: ILOs */}
          <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="ILOs">
            <p className="text-slate-600 mb-4">By the end of this lesson, students will be able to:</p>
            <div className="space-y-3">
              {[
                { num: 1, text: 'Compare and contrast cognitive constructivism (Piaget) and social constructivism (Vygotsky) using specific theoretical principles', icon: Brain },
                { num: 2, text: 'Explain practical applications of both theories in contemporary educational settings', icon: Lightbulb },
                { num: 3, text: 'Analyze case studies to identify constructivist elements in classroom scenarios', icon: BarChart3 },
                { num: 4, text: 'Evaluate the effectiveness of each theory in addressing different learning contexts', icon: Target },
                { num: 5, text: 'Apply theoretical principles to design a basic constructivist-inspired lesson activity', icon: GraduationCap },
              ].map((ilo) => (
                <div key={ilo.num} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
                    {ilo.num}
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base pt-1">
                    <EditableContent storageKey={`ilo:${ilo.num}`} initialValue={ilo.text} multiline />
                  </p>
                </div>
              ))}
            </div>
            {userId > 0 && !completedSections.has('ilos') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('ilos')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('ilos') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 2: Pre-Class Preparation */}
          <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Before Class">
            <div className="space-y-4">
              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Pre-Reading</h3>
                    <EditableContent storageKey="preclass:reading" initialValue="15-min video lecture summarizing Piaget and Vygotsky's key contributions" multiline />
                    <p className="text-xs text-slate-500 mt-1">Video: Modern Perspectives on Constructivist Theory</p>
                  </div>
                </div>
              </CardSection>

              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-2">Pre-Test: Cognitive & Social Constructivism Basics (10 questions)</h3>
                    {preTestQuiz && userId > 0 ? (
                      <Quiz
                        quizId={preTestQuiz.quiz.id}
                        title={preTestQuiz.quiz.title}
                        questions={preTestQuiz.questions.map((q) => ({
                          ...q,
                          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                        }))}
                        userId={userId}
                      />
                    ) : (
                      <p className="text-sm text-slate-500">Sign in to take the pre-test quiz.</p>
                    )}
                  </div>
                </div>
              </CardSection>

              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg shrink-0">
                    <Lightbulb className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Guiding Questions</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-slate-700 text-sm">
                        <span className="text-blue-600 font-bold shrink-0">1.</span>
                        <EditableContent storageKey="preclass:q1" initialValue="What is the primary difference between assimilation/accommodation and zone of proximal development?" multiline />
                      </div>
                      <div className="flex items-start gap-2 text-slate-700 text-sm">
                        <span className="text-blue-600 font-bold shrink-0">2.</span>
                        <EditableContent storageKey="preclass:q2" initialValue="How might social interaction affect cognitive development differently according to each theory?" multiline />
                      </div>
                    </div>
                  </div>
                </div>
              </CardSection>
            </div>
            {userId > 0 && !completedSections.has('preclass') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('preclass')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('preclass') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 3: Introduction (25 minutes) */}
          <LessonSection id="introduction" title="3. Introduction" badge="25 mins">
            <div className="space-y-4">
              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg shrink-0">
                    <MessageSquare className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">Hook Activity: Debate</h3>
                    <EditableContent storageKey="intro:hook" initialValue='Is learning primarily an individual or social process? — Poll using Mentimeter: Constructivism Debate Opinions' multiline />
                  </div>
                </div>
              </CardSection>

              {/* Concept Check: Hook debate poll */}
              {getConceptCheckForSection('introduction', 'Poll') && userId > 0 && (
                <ConceptCheck
                  checkId={getConceptCheckForSection('introduction', 'Poll')!.id}
                  title={getConceptCheckForSection('introduction', 'Poll')!.title}
                  prompt={getConceptCheckForSection('introduction', 'Poll')!.prompt}
                  checkType={getConceptCheckForSection('introduction', 'Poll')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              {/* Hook Discussion */}
              {hookDiscussion && userId > 0 && (
                <CardSection>
                  <Discussion
                    discussionId={hookDiscussion.id}
                    title={hookDiscussion.title}
                    description={hookDiscussion.description}
                    posts={hookDiscussion.posts}
                    userId={userId}
                    userRole={userRole}
                  />
                </CardSection>
              )}

              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Pre-Test Review</h3>
                    <EditableContent storageKey="intro:pretest-review" initialValue="Immediate feedback session on quiz responses with targeted clarification of misconceptions" multiline />
                  </div>
                </div>
              </CardSection>

              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-100 rounded-lg shrink-0">
                    <Users className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Real-World Connection</h3>
                    <EditableContent storageKey="intro:realworld" initialValue="Show viral video of child problem-solving task, ask students to identify constructivist elements" multiline />
                  </div>
                </div>
              </CardSection>
            </div>
            {userId > 0 && !completedSections.has('introduction') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('introduction')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('introduction') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 4: Development Activities (130 minutes) */}
          <LessonSection id="development" title="4. Teaching & Learning Activities" badge="130 mins">
            <div className="space-y-6">
              {/* Interactive Lecture Segments */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" /> Interactive Lecture Segments
                </h3>

                {/* Cognitive Constructivism */}
                <CardSection>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">20 mins</Badge>
                      <h4 className="font-semibold text-slate-800">Cognitive Constructivism (Piaget)</h4>
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent storageKey="dev:cognitive-1" initialValue="Piaget's stages with animated concept map showing schema development" multiline />
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent storageKey="dev:cognitive-2" initialValue='Think-Pair-Share: "Identify a recent learning experience that required accommodation"' multiline />
                      </div>
                    </div>
                    {getConceptCheckForSection('development', 'Cognitive') && userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheckForSection('development', 'Cognitive')!.id}
                        title={getConceptCheckForSection('development', 'Cognitive')!.title}
                        prompt={getConceptCheckForSection('development', 'Cognitive')!.prompt}
                        checkType={getConceptCheckForSection('development', 'Cognitive')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        userRole={userRole}
                      />
                    )}
                  </div>
                </CardSection>

                {/* Social Constructivism */}
                <CardSection>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-violet-600">20 mins</Badge>
                      <h4 className="font-semibold text-slate-800">Social Constructivism (Vygotsky)</h4>
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        <EditableContent storageKey="dev:social-1" initialValue="Vygotsky's ZPD animation with scaffolding examples" multiline />
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        <EditableContent storageKey="dev:social-2" initialValue="Role Play Demonstration: Modeling effective guided discovery teaching" multiline />
                      </div>
                    </div>
                    {getConceptCheckForSection('development', 'Social') && userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheckForSection('development', 'Social')!.id}
                        title={getConceptCheckForSection('development', 'Social')!.title}
                        prompt={getConceptCheckForSection('development', 'Social')!.prompt}
                        checkType={getConceptCheckForSection('development', 'Social')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        userRole={userRole}
                      />
                    )}
                  </div>
                </CardSection>

                {/* Accommodation Discussion */}
                {accommodationDiscussion && userId > 0 && (
                  <CardSection>
                    <Discussion
                      discussionId={accommodationDiscussion.id}
                      title={accommodationDiscussion.title}
                      description={accommodationDiscussion.description}
                      posts={accommodationDiscussion.posts}
                      userId={userId}
                      userRole={userRole}
                    />
                  </CardSection>
                )}
              </div>

              <Separator />

              {/* Group Activities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" /> Group Activities (2 rotations @ 30 mins each)
                </h3>

                <CardSection>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Case Study Analysis (Groups of 6)</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="font-medium text-blue-800 text-sm mb-1">Case Study 1: Montessori Classroom</p>
                        <EditableContent storageKey="dev:case1" initialValue="Analyze video of early childhood Montessori classroom (cognitive focus)" multiline />
                      </div>
                      <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                        <p className="font-medium text-violet-800 text-sm mb-1">Case Study 2: Debate-Based Lesson</p>
                        <EditableContent storageKey="dev:case2" initialValue="Analyze video of secondary debate-based lesson (social emphasis)" multiline />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">Use Worksheet: Constructivist Case Analysis with guiding prompts</p>
                    {getConceptCheckForSection('development', 'Case') && userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheckForSection('development', 'Case')!.id}
                        title={getConceptCheckForSection('development', 'Case')!.title}
                        prompt={getConceptCheckForSection('development', 'Case')!.prompt}
                        checkType={getConceptCheckForSection('development', 'Case')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        userRole={userRole}
                      />
                    )}
                  </div>
                </CardSection>

                <CardSection>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Theory Comparison Challenge: Venn Diagram</h4>
                    <p className="text-sm text-slate-600">Create a comparative Venn diagram — groups add principle examples to appropriate sections (individual/social, discovery/social mediation)</p>
                    <VennDiagram />
                    {getConceptCheckForSection('development', 'Venn') && userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheckForSection('development', 'Venn')!.id}
                        title={getConceptCheckForSection('development', 'Venn')!.title}
                        prompt={getConceptCheckForSection('development', 'Venn')!.prompt}
                        checkType={getConceptCheckForSection('development', 'Venn')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        userRole={userRole}
                      />
                    )}
                  </div>
                </CardSection>
              </div>

              <Separator />

              {/* Formative Assessments */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" /> Formative Assessments
                </h3>

                <CardSection>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Constructivist Theory Quiz (15 questions)</h4>
                    {kahootQuiz && userId > 0 ? (
                      <Quiz
                        quizId={kahootQuiz.quiz.id}
                        title={kahootQuiz.quiz.title}
                        questions={kahootQuiz.questions.map((q) => ({
                          ...q,
                          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                        }))}
                        userId={userId}
                      />
                    ) : (
                      <p className="text-sm text-slate-500">Sign in to take the formative quiz.</p>
                    )}
                  </div>
                </CardSection>

                <CardSection>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Digital Flashcards: Key Terms</h4>
                    <p className="text-sm text-slate-600">Term-to-theory matching for key concepts</p>
                    <Flashcard cards={[
                      { front: 'Assimilation', back: 'Piaget — Fitting new information into existing schemas without changing them' },
                      { front: 'Accommodation', back: 'Piaget — Modifying existing schemas or creating new ones for new information' },
                      { front: 'ZPD', back: 'Vygotsky — Zone of Proximal Development: gap between independent and guided ability' },
                      { front: 'Scaffolding', back: 'Vygotsky/Bruner — Temporary support gradually removed as learner gains competence' },
                      { front: 'Egocentrism', back: 'Piaget — Inability to see things from another\'s perspective (preoperational stage)' },
                      { front: 'MKO', back: 'Vygotsky — More Knowledgeable Other: anyone with more understanding than the learner' },
                    ]} />
                  </div>
                </CardSection>
              </div>

              <Separator />

              {/* Peer Teaching */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" /> Peer Teaching (15 mins)
                </h3>
                <CardSection>
                  <p className="text-slate-700 text-sm mb-3">Each group teaches key takeaways to classmates through:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 font-bold shrink-0">1.</span>
                      <EditableContent storageKey="dev:peer-1" initialValue="Metaphor creation representing each theory" multiline />
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 font-bold shrink-0">2.</span>
                      <EditableContent storageKey="dev:peer-2" initialValue="One-minute elevator pitch for their assigned theory" multiline />
                    </div>
                  </div>
                </CardSection>
              </div>

              <Separator />

              {/* Breaks */}
              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    <Clock className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Breaks (10 minutes each)</h4>
                    <p className="text-sm text-slate-600">After 60 and 120 minutes for cognitive refreshment (mindfulness meditation optional)</p>
                  </div>
                </div>
              </CardSection>
            </div>
            {userId > 0 && !completedSections.has('development') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('development')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('development') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 5: Synthesis & Closure (25 minutes) */}
          <LessonSection id="synthesis" title="5. Synthesis & Closure" badge="25 mins">
            <div className="space-y-4">
              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Post-Test</h3>
                    <EditableContent storageKey="synthesis:posttest" initialValue="Constructivism Learning Gain Assessment — same questions as pre-test" multiline />
                  </div>
                </div>
              </CardSection>

              <CardSection>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Reflective Circle</h3>
                  <p className="text-sm text-slate-600">In pairs, discuss: &ldquo;Which theory better explains my personal learning style and why?&rdquo;</p>
                  {reflectionDiscussion && userId > 0 && (
                    <Discussion
                      discussionId={reflectionDiscussion.id}
                      title={reflectionDiscussion.title}
                      description={reflectionDiscussion.description}
                      posts={reflectionDiscussion.posts}
                      userId={userId}
                      userRole={userRole}
                    />
                  )}
                </div>
              </CardSection>

              {/* Self-reflection concept check */}
              {getConceptCheckForSection('synthesis', 'Reflection') && userId > 0 && (
                <ConceptCheck
                  checkId={getConceptCheckForSection('synthesis', 'Reflection')!.id}
                  title={getConceptCheckForSection('synthesis', 'Reflection')!.title}
                  prompt={getConceptCheckForSection('synthesis', 'Reflection')!.prompt}
                  checkType={getConceptCheckForSection('synthesis', 'Reflection')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <CardSection>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Preview</h3>
                    <EditableContent storageKey="synthesis:preview" initialValue="Introduction to constructivist classroom applications (next session)" multiline />
                  </div>
                </div>
              </CardSection>
            </div>
            {userId > 0 && !completedSections.has('synthesis') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('synthesis')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('synthesis') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 6: Assessment Methods */}
          <LessonSection id="assessment" title="6. Assessment Methods" badge="Assessment">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Formative</h3>
              <div className="space-y-2">
                {[
                  'Pre/Post-Test comparison metrics',
                  'Mentimeter poll responses and Kahoot quiz scores',
                  'Exit Ticket: "Explain one practical application of either theory in your own words" (collected via LMS)',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <EditableContent storageKey={`assessment:formative:${i}`} initialValue={item} multiline />
                  </div>
                ))}
              </div>

              {/* Exit Ticket Concept Check */}
              {getConceptCheckForSection('assessment', 'Exit') && userId > 0 && (
                <ConceptCheck
                  checkId={getConceptCheckForSection('assessment', 'Exit')!.id}
                  title={getConceptCheckForSection('assessment', 'Exit')!.title}
                  prompt={getConceptCheckForSection('assessment', 'Exit')!.prompt}
                  checkType={getConceptCheckForSection('assessment', 'Exit')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <Separator />

              <h3 className="font-semibold text-slate-800">Summative</h3>
              <CardSection>
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-800">Written Analysis Assignment (Due Next Week)</h4>
                  <EditableContent storageKey="assessment:summative" initialValue="Analyze two lesson plans (one for each theory) using provided rubric:" multiline />

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Criteria</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Excellent (4)</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Good (3)</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Satisfactory (2)</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Needs Work (1)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td className="py-2 px-3 font-medium text-slate-800">Theoretical Accuracy</td>
                          <td className="py-2 px-3 text-slate-600">Clear, nuanced understanding</td>
                          <td className="py-2 px-3 text-slate-600">Correct principles, minor inaccuracies</td>
                          <td className="py-2 px-3 text-slate-600">Some misunderstandings</td>
                          <td className="py-2 px-3 text-slate-600">Major misrepresentations</td>
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50/50">
                          <td className="py-2 px-3 font-medium text-slate-800">Application Quality</td>
                          <td className="py-2 px-3 text-slate-600">Innovative, context-sensitive</td>
                          <td className="py-2 px-3 text-slate-600">Practical examples included</td>
                          <td className="py-2 px-3 text-slate-600">Limited connections</td>
                          <td className="py-2 px-3 text-slate-600">Absent or irrelevant</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="py-2 px-3 font-medium text-slate-800">Comparative Analysis</td>
                          <td className="py-2 px-3 text-slate-600">Sophisticated differentiation</td>
                          <td className="py-2 px-3 text-slate-600">Clear distinctions</td>
                          <td className="py-2 px-3 text-slate-600">Basic comparisons</td>
                          <td className="py-2 px-3 text-slate-600">Unclear or absent</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardSection>
            </div>
            {userId > 0 && !completedSections.has('assessment') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('assessment')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('assessment') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 7: Constructive Alignment Matrix */}
          <LessonSection id="alignment" title="7. Constructive Alignment Matrix" badge="Alignment">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Learning Outcome</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Teaching Activity</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Assessment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { outcome: 'Compare theories', activity: 'Venn diagram activity, peer metaphors', assessment: 'Written analysis comparison section' },
                    { outcome: 'Explain applications', activity: 'Case studies, role play', assessment: 'Written analysis examples' },
                    { outcome: 'Analyze case studies', activity: 'Video analysis worksheets', assessment: 'Exit ticket written responses' },
                    { outcome: 'Evaluate effectiveness', activity: 'Debate hook, reflective questions', assessment: 'Post-test extended responses' },
                    { outcome: 'Apply principles', activity: 'Peer teaching metaphors', assessment: 'Written lesson component' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-t border-slate-200 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        <EditableContent storageKey={`alignment:outcome:${i}`} initialValue={row.outcome} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <EditableContent storageKey={`alignment:activity:${i}`} initialValue={row.activity} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <EditableContent storageKey={`alignment:assessment:${i}`} initialValue={row.assessment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userId > 0 && !completedSections.has('alignment') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('alignment')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('alignment') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 8: Required Resources */}
          <LessonSection id="resources" title="8. Required Resources" badge="Resources">
            <div className="space-y-2">
              {[
                'LMS course page with embedded videos and Padlet links',
                'Animated lecture slides with embedded questions',
                'Pre-recorded case study videos (15 mins each)',
                'Digital flashcard sets (Quizlet: Constructivist Terminology)',
                'Constructivist Analysis Rubric (posted in LMS)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <EditableContent storageKey={`resources:${i}`} initialValue={item} multiline />
                </div>
              ))}
            </div>
            {userId > 0 && !completedSections.has('resources') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('resources')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('resources') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 9: Differentiation Strategies */}
          <LessonSection id="differentiation" title="9. Differentiation Strategies" badge="Inclusive">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Multimodal Materials', desc: 'Provided in text (English/Spanish), audio, and video formats', icon: '📖' },
                { label: 'Grouping Strategy', desc: 'Intentional mixed-ability groups with assigned roles', icon: '👥' },
                { label: 'Extension Activity', desc: 'Optional advanced reading on critical perspectives of constructivism', icon: '🚀' },
                { label: 'Accommodations', desc: 'Closed captioning for videos, extended time for processing', icon: '♿' },
                { label: 'Participation Options', desc: 'Choice between verbal/written responses in activities', icon: '✋' },
              ].map((item, i) => (
                <CardSection key={i} className={i === 4 ? 'sm:col-span-2' : ''}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{item.label}</h4>
                      <EditableContent storageKey={`diff:${i}`} initialValue={item.desc} multiline className="text-sm text-slate-600" />
                    </div>
                  </div>
                </CardSection>
              ))}
            </div>
            {userId > 0 && !completedSections.has('differentiation') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('differentiation')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('differentiation') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>

          {/* Section 10: Reflection & Improvement */}
          <LessonSection id="reflection" title="10. Reflection & Improvement" badge="Meta">
            <div className="space-y-4">
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">Success Indicators</h3>
                <div className="space-y-2">
                  {[
                    '70%+ average improvement in post-test scores',
                    '80%+ on-time submission of written assignment',
                    'High-quality comparative analysis in student work',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <EditableContent storageKey={`reflect:success:${i}`} initialValue={item} multiline />
                    </div>
                  ))}
                </div>
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">Feedback Collection</h3>
                <div className="space-y-2">
                  {[
                    'LMS discussion board for lesson reflections',
                    'Anonymous mid-course survey (week 4)',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <EditableContent storageKey={`reflect:feedback:${i}`} initialValue={item} multiline />
                    </div>
                  ))}
                </div>
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">Future Modifications</h3>
                <div className="space-y-2">
                  {[
                    'If students struggle with abstract concepts: Add more concrete analogy examples',
                    'If time constrained: Reduce case study count to prioritize comparative activities',
                    'Consider peer assessment component for written assignments',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <EditableContent storageKey={`reflect:mod:${i}`} initialValue={item} multiline />
                    </div>
                  ))}
                </div>
              </CardSection>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs text-slate-500 italic">
                  This plan incorporates evidence-based practices from constructivist pedagogy research
                  (Piaget, 1954; Vygotsky, 1978) and active learning principles (Freeman et al., 2014),
                  with scalable strategies for large classrooms and continuous assessment throughout the lesson.
                </p>
              </div>
            </div>
            {userId > 0 && !completedSections.has('reflection') && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMarkComplete('reflection')} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </div>
            )}
            {completedSections.has('reflection') && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </div>
            )}
          </LessonSection>
        </main>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading lesson...</div>
      </div>
    }>
      <LessonContent />
    </Suspense>
  );
}
