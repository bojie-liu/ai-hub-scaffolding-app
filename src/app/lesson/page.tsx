'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { getQuizByStorageKey } from '@/lib/actions/quiz';
import { getDiscussionByStorageKey } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Users,
  Target,
  Video,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface QuizData {
  quiz: { id: number; storageKey: string; title: string; description: string | null };
  questions: {
    id: number;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'short_answer';
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null };
  creator: { id: number; username: string; displayName: string | null } | null;
  posts: {
    id: number;
    discussionId: number;
    parentPostId: number | null;
    authorId: number;
    content: string;
    createdAt: string | null;
    updatedAt: string | null;
    authorUsername: string | null;
    authorDisplayName: string | null;
    authorRole: string | null;
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

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'part1', label: 'Defining Professionalism' },
  { id: 'break', label: 'Break' },
  { id: 'part2', label: 'Case Study & Ethics' },
  { id: 'part3', label: 'Ethics Application' },
  { id: 'synthesis', label: 'Synthesis & Closure' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment Matrix' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
];

export default function LessonPage() {
  const { user } = useUser();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [preTest, setPreTest] = useState<QuizData | null>(null);
  const [popUpQuiz, setPopUpQuiz] = useState<QuizData | null>(null);
  const [postTest, setPostTest] = useState<QuizData | null>(null);
  const [brainstormDiscussion, setBrainstormDiscussion] = useState<DiscussionData | null>(null);
  const [caseStudyDiscussion, setCaseStudyDiscussion] = useState<DiscussionData | null>(null);
  const [culturalDiscussion, setCulturalDiscussion] = useState<DiscussionData | null>(null);
  const [practicumDiscussion, setPracticumDiscussion] = useState<DiscussionData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          preTestRes,
          popUpRes,
          postTestRes,
          brainstormRes,
          caseStudyRes,
          culturalRes,
          practicumRes,
          conceptRes,
        ] = await Promise.all([
          getQuizByStorageKey('quiz:pre-test'),
          getQuizByStorageKey('quiz:popup-professionalism'),
          getQuizByStorageKey('quiz:post-test'),
          getDiscussionByStorageKey('discussion:brainstorming-intro'),
          getDiscussionByStorageKey('discussion:case-study-ethics'),
          getDiscussionByStorageKey('discussion:cultural-sensitivity'),
          getDiscussionByStorageKey('discussion:practicum-reflection'),
          getConceptChecks(),
        ]);

        if (preTestRes.success && 'data' in preTestRes) setPreTest(preTestRes.data as QuizData);
        if (popUpRes.success && 'data' in popUpRes) setPopUpQuiz(popUpRes.data as QuizData);
        if (postTestRes.success && 'data' in postTestRes) setPostTest(postTestRes.data as QuizData);
        if (brainstormRes.success && 'data' in brainstormRes) setBrainstormDiscussion(brainstormRes.data as DiscussionData);
        if (caseStudyRes.success && 'data' in caseStudyRes) setCaseStudyDiscussion(caseStudyRes.data as DiscussionData);
        if (culturalRes.success && 'data' in culturalRes) setCulturalDiscussion(culturalRes.data as DiscussionData);
        if (practicumRes.success && 'data' in practicumRes) setPracticumDiscussion(practicumRes.data as DiscussionData);
        if (conceptRes.success && 'data' in conceptRes) setConceptChecks(conceptRes.data as ConceptCheckData[]);
      } catch (error) {
        console.error('Failed to load lesson data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (user && user.role !== 'GUEST' && user.userId > 0) {
      getStudentProgress(user.userId).then((res) => {
        if (res.success && res.data) {
          setCompletedSections(new Set(res.data.filter((p) => p.completed).map((p) => p.sectionKey)));
        }
      });
    }
  }, [user]);

  const handleMarkComplete = useCallback(async (sectionKey: string) => {
    if (!user || user.role === 'GUEST' || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections((prev) => new Set([...prev, sectionKey]));
      toast.success('Section marked as complete');
    }
  }, [user]);

  if (!user) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  const isStudent = user.role === 'STUDENT';
  const userId = user.userId > 0 ? user.userId : 0;

  const getConceptCheck = (storageKey: string) => conceptChecks.find((c) => c.storageKey === storageKey);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-96" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <ScrollRootProvider>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          <LessonSideMenu sections={SECTIONS} />
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                <EditableContent storageKey="lesson:title" initialValue="Teacher Professionalism in Hong Kong" as="span" />
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant="secondary" className="gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> 150 minutes
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" /> 35 students
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Teacher Professionalism
                </Badge>
              </div>
            </div>

            {/* 1. Intended Learning Outcomes */}
            <LessonSection id="ilos" title="1. Intended Learning Outcomes (ILOs)" badge="Outcomes">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">
                      <EditableContent storageKey="ilo:1" initialValue="Analyze key components of teacher professionalism through local (Hong Kong) and international frameworks (e.g., NCATE, INTO), referencing academic journals and policy documents." multiline />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">
                      <EditableContent storageKey="ilo:2" initialValue="Evaluate ethical dilemmas using the Hong Kong Teachers' Professional Conduct Guidelines (TPCG) as a reference, applying scholarly definitions of professionalism." multiline />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">
                      <EditableContent storageKey="ilo:3" initialValue="Apply understanding of professional standards to real-world teaching scenarios and connect these to their first teaching practicum experiences." multiline />
                    </p>
                  </div>
                </div>
                {isStudent && userId > 0 && (
                  <Button
                    variant={completedSections.has('ilos') ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleMarkComplete('ilos')}
                    disabled={completedSections.has('ilos')}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedSections.has('ilos') ? 'Completed' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            </LessonSection>

            {/* 2. Pre-Class Preparation */}
            <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Before Class">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <Video className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">
                      <EditableContent storageKey="preclass:video" initialValue="Watch: TED-Ed &quot;What Makes a Good Teacher?&quot; (8 mins)" />
                    </p>
                    <a href="https://www.youtube.com/watch?v=7d8NX5iZUMM" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                      YouTube Link <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <FileText className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">
                      <EditableContent storageKey="preclass:reading1" initialValue="Official EDB Guidelines on Teachers' Professional Conduct (2021) - Sections 1-3 (15 mins)" />
                    </p>
                    <a href="https://www.edb.gov.hk/en/teacher/guidelines_tpc/index.html" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                      EDB Guidelines <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <FileText className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">
                      <EditableContent storageKey="preclass:reading2" initialValue="Excerpt from &quot;Teacher Professionalism: International Policies and Teacher Education Practices&quot; (5 mins)" />
                    </p>
                    <a href="https://www.ibe.unesco.org/en/sites/default/files/media-links/teacher-professionalism-policy-paper.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                      UNESCO Paper <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <MessageSquare className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-indigo-900">
                      <EditableContent storageKey="preclass:guiding" initialValue="Guiding Question: &quot;How did your teaching practicum experience relate to the concept of teacher professionalism?&quot;" multiline />
                    </p>
                  </div>
                </div>
                {preTest && userId > 0 && (
                  <div className="mt-4">
                    <Quiz
                      quizId={preTest.quiz.id}
                      title={preTest.quiz.title}
                      questions={preTest.questions}
                      userId={userId}
                    />
                  </div>
                )}
                {isStudent && userId > 0 && (
                  <Button
                    variant={completedSections.has('preclass') ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleMarkComplete('preclass')}
                    disabled={completedSections.has('preclass')}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedSections.has('preclass') ? 'Completed' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            </LessonSection>

            {/* 3. Introduction (20 minutes) */}
            <LessonSection id="introduction" title="3. Introduction (20 minutes)" badge="20 mins">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-500" /> Hook (10 mins)
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    <EditableContent storageKey="intro:hook" initialValue="Show a 3-minute Hong Kong Education Bureau video clip of a teacher-student interaction scenario (e.g., handling a disruptive student). Ask: &quot;How would you evaluate the teacher's professionalism here?&quot; Facilitate whole-class discussion, linking responses to their practicum experiences." multiline />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Pre-Test Review (5 mins)
                  </h3>
                  <p className="text-sm text-slate-600">
                    <EditableContent storageKey="intro:pretest-review" initialValue="Share anonymized pre-test results. Highlight misconceptions (e.g., conflating &quot;friendliness&quot; with professionalism)." multiline />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" /> Brainstorming Questions (5 mins)
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="intro:brainstorm1" initialValue="&quot;In one word, how would you describe the most important aspect of teacher professionalism?&quot;" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="intro:brainstorm2" initialValue="&quot;What are three common ethical challenges teachers face in Hong Kong schools?&quot;" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="intro:brainstorm3" initialValue="&quot;Can you recall a time when you saw a teacher violate or exemplify professionalism during your practicum?&quot;" />
                    </li>
                  </ul>
                </CardSection>

                {/* Brainstorming Discussion */}
                {brainstormDiscussion && userId > 0 && (
                  <div className="mt-4">
                    <Discussion
                      discussionId={brainstormDiscussion.discussion.id}
                      title={brainstormDiscussion.discussion.title}
                      description={brainstormDiscussion.discussion.description}
                      posts={brainstormDiscussion.posts.map((p) => ({
                        id: p.id,
                        parentId: p.parentPostId,
                        authorId: p.authorId,
                        authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                        content: p.content,
                        createdAt: p.createdAt ?? new Date().toISOString(),
                      }))}
                      userId={userId}
                      
                    />
                  </div>
                )}

                {isStudent && userId > 0 && (
                  <Button
                    variant={completedSections.has('introduction') ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleMarkComplete('introduction')}
                    disabled={completedSections.has('introduction')}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedSections.has('introduction') ? 'Completed' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            </LessonSection>

            {/* Part 1: Defining Teacher Professionalism (30 mins) */}
            <LessonSection id="part1" title="Part 1: Defining Teacher Professionalism (30 mins)" badge="30 mins">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" /> Interactive Lecture + Think-Pair-Share (20 mins)
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    <EditableContent storageKey="part1:lecture" initialValue="Define professionalism using a graphic organizer with citations (e.g., Linda Darling-Hammond 2017, EDB 2021). Pause at 10 mins:" multiline />
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <EditableContent storageKey="part1:pause-q" initialValue="&quot;How would TPCG respond to a teacher who leaks exam papers — ethically and procedurally?&quot;" />
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-500" /> Animated Illustration (10 mins)
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    <EditableContent storageKey="part1:venn" initialValue="Animated Venn diagram comparing international standards (NCATE vs. TPCG)." multiline />
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
                    <EditableContent storageKey="part1:venn-q" initialValue="Pop-up question: &quot;Which standard emphasizes cultural sensitivity most?&quot;" />
                  </div>
                </CardSection>

                {/* NCATE vs TPCG Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-200">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-blue-800 mb-2">NCATE Standards</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li className="flex items-start gap-2"><span className="text-blue-500">&#8226;</span> Candidate performance</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500">&#8226;</span> Assessment system</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500">&#8226;</span> Clinical practice</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500">&#8226;</span> <strong>Cultural sensitivity &amp; diversity</strong></li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-200">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-emerald-800 mb-2">TPCG (Hong Kong)</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li className="flex items-start gap-2"><span className="text-emerald-500">&#8226;</span> Professional integrity</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500">&#8226;</span> Duty of care</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500">&#8226;</span> Student well-being</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500">&#8226;</span> <strong>Professional conduct</strong></li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Pop-Up Quiz */}
                {popUpQuiz && userId > 0 && (
                  <div className="mt-4">
                    <Quiz
                      quizId={popUpQuiz.quiz.id}
                      title={popUpQuiz.quiz.title}
                      questions={popUpQuiz.questions}
                      userId={userId}
                    />
                  </div>
                )}

                {/* Concept checks for Part 1 */}
                {(() => {
                  const cc = getConceptCheck('concept:understand-tpecg');
                  if (cc && userId > 0) {
                    return (
                      <ConceptCheck
                        checkId={cc.id}
                        title={cc.title}
                        prompt={cc.prompt}
                        checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        
                      />
                    );
                  }
                  return null;
                })()}
                {(() => {
                  const cc = getConceptCheck('concept:framework-comparison');
                  if (cc && userId > 0) {
                    return (
                      <ConceptCheck
                        checkId={cc.id}
                        title={cc.title}
                        prompt={cc.prompt}
                        checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        
                      />
                    );
                  }
                  return null;
                })()}

                {isStudent && userId > 0 && (
                  <Button
                    variant={completedSections.has('development') ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleMarkComplete('development')}
                    disabled={completedSections.has('development')}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedSections.has('development') ? 'Completed' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            </LessonSection>

            {/* Break */}
            <LessonSection id="break" title="Break (15 minutes)" badge="15 mins">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-4xl mb-3">&#9749;</div>
                  <p className="text-lg text-muted-foreground">
                    <EditableContent storageKey="break:message" initialValue="Take a short break before Part 2." />
                  </p>
                </div>
              </div>
            </LessonSection>

            {/* Part 2: Case Study & Ethics (60 mins) */}
            <LessonSection id="part2" title="Part 2: Case Study & Ethics (60 mins)" badge="60 mins">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> Case Study Activity (30 mins)
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                    <p className="font-medium text-red-900 mb-1">EDB Case Report: Teacher Dismissed for Inappropriate Online Behavior (2019)</p>
                    <p className="text-sm text-red-700">
                      <EditableContent storageKey="part2:case" initialValue="A secondary school teacher was dismissed after posting inappropriate content about students on social media. The posts included identifiable student information and derogatory comments about student performance. The teacher argued this was private communication, but the EDB found violations of TPCG guidelines on professional conduct and student confidentiality." multiline />
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <EditableContent storageKey="part2:case-q" initialValue="&quot;How did the teacher violate TPCG? What safeguards could prevent this?&quot;" />
                  </div>
                </CardSection>

                {/* Case Study Discussion */}
                {caseStudyDiscussion && userId > 0 && (
                  <Discussion
                    discussionId={caseStudyDiscussion.discussion.id}
                    title={caseStudyDiscussion.discussion.title}
                    description={caseStudyDiscussion.discussion.description}
                    posts={caseStudyDiscussion.posts.map((p) => ({
                      id: p.id,
                      parentId: p.parentPostId,
                      authorId: p.authorId,
                      authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                      content: p.content,
                      createdAt: p.createdAt ?? new Date().toISOString(),
                    }))}
                    userId={userId}
                    
                  />
                )}

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-500" /> Video Sharing (15 mins)
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    <EditableContent storageKey="part2:video" initialValue="Watch EDB documentary clip: &quot;Ethical Challenges in Practice&quot; (10 mins)" multiline />
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <EditableContent storageKey="part2:video-q" initialValue="Q&amp;A: &quot;What TPCG guidelines were upheld?&quot;" />
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-500" /> Brainstorming Session (15 mins)
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    <EditableContent storageKey="part2:brainstorm" initialValue="Discussion on cultural sensitivity in Hong Kong's diverse school environments." multiline />
                  </p>
                </CardSection>

                {/* Cultural Sensitivity Discussion */}
                {culturalDiscussion && userId > 0 && (
                  <Discussion
                    discussionId={culturalDiscussion.discussion.id}
                    title={culturalDiscussion.discussion.title}
                    description={culturalDiscussion.discussion.description}
                    posts={culturalDiscussion.posts.map((p) => ({
                      id: p.id,
                      parentId: p.parentPostId,
                      authorId: p.authorId,
                      authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                      content: p.content,
                      createdAt: p.createdAt ?? new Date().toISOString(),
                    }))}
                    userId={userId}
                    
                  />
                )}

                {/* Concept check for ethics */}
                {(() => {
                  const cc = getConceptCheck('concept:ethics-application');
                  if (cc && userId > 0) {
                    return (
                      <ConceptCheck
                        checkId={cc.id}
                        title={cc.title}
                        prompt={cc.prompt}
                        checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            </LessonSection>

            {/* Part 3: Professional Ethics Application (20 mins) */}
            <LessonSection id="part3" title="Part 3: Professional Ethics Application (20 mins)" badge="20 mins">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-violet-500" /> Role-Play Scenarios (15 mins)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-violet-200 bg-violet-50/50">
                      <CardContent className="pt-4">
                        <p className="font-medium text-violet-900 mb-1">Scenario 1: Accepting a Parent&apos;s Gift</p>
                        <p className="text-sm text-violet-700">
                          <EditableContent storageKey="part3:scenario1" initialValue="A parent offers you an expensive gift at the end of the school year. How do you respond while maintaining professional integrity?" multiline />
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-violet-200 bg-violet-50/50">
                      <CardContent className="pt-4">
                        <p className="font-medium text-violet-900 mb-1">Scenario 2: Student-to-Student Discrimination</p>
                        <p className="text-sm text-violet-700">
                          <EditableContent storageKey="part3:scenario2" initialValue="You overhear students making discriminatory remarks toward a classmate of ethnic minority background. How do you address this while upholding TPCG guidelines?" multiline />
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Peer-assess using TPCG rubric.</p>
                </CardSection>

                {/* Role-play reflection concept check */}
                {(() => {
                  const cc = getConceptCheck('concept:roleplay-reflection');
                  if (cc && userId > 0) {
                    return (
                      <ConceptCheck
                        checkId={cc.id}
                        title={cc.title}
                        prompt={cc.prompt}
                        checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            </LessonSection>

            {/* Synthesis & Closure (15 mins) */}
            <LessonSection id="synthesis" title="Synthesis & Closure (15 minutes)" badge="15 mins">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Post-Test (5 mins)
                  </h3>
                  <p className="text-sm text-slate-600">
                    <EditableContent storageKey="synthesis:posttest" initialValue="Reuse 2 pre-test questions to measure knowledge gains. Compare with pre-test results." />
                  </p>
                </CardSection>

                {/* Post-Test Quiz */}
                {postTest && userId > 0 && (
                  <Quiz
                    quizId={postTest.quiz.id}
                    title={postTest.quiz.title}
                    questions={postTest.questions}
                    userId={userId}
                  />
                )}

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" /> Reflective Discussion (5 mins)
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <EditableContent storageKey="synthesis:reflect" initialValue="&quot;How did today's discussion align with or challenge your practicum experiences?&quot;" />
                  </div>
                </CardSection>

                {/* Practicum Reflection Discussion */}
                {practicumDiscussion && userId > 0 && (
                  <Discussion
                    discussionId={practicumDiscussion.discussion.id}
                    title={practicumDiscussion.discussion.title}
                    description={practicumDiscussion.discussion.description}
                    posts={practicumDiscussion.posts.map((p) => ({
                      id: p.id,
                      parentId: p.parentPostId,
                      authorId: p.authorId,
                      authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                      content: p.content,
                      createdAt: p.createdAt ?? new Date().toISOString(),
                    }))}
                    userId={userId}
                    
                  />
                )}

                {/* Overall learning concept check */}
                {(() => {
                  const cc = getConceptCheck('concept:overall-learning');
                  if (cc && userId > 0) {
                    return (
                      <ConceptCheck
                        checkId={cc.id}
                        title={cc.title}
                        prompt={cc.prompt}
                        checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={userId}
                        
                      />
                    );
                  }
                  return null;
                })()}

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-500" /> Preview Next Session (5 mins)
                  </h3>
                  <p className="text-sm text-slate-600">
                    <EditableContent storageKey="synthesis:preview" initialValue="Legal obligations under Hong Kong's Education Ordinance." />
                  </p>
                </CardSection>

                {isStudent && userId > 0 && (
                  <Button
                    variant={completedSections.has('synthesis') ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleMarkComplete('synthesis')}
                    disabled={completedSections.has('synthesis')}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedSections.has('synthesis') ? 'Completed' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            </LessonSection>

            {/* 4. Assessment Methods */}
            <LessonSection id="assessment" title="4. Assessment Methods" badge="Assessment">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Formative Assessment</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-500 mt-1">&#8226;</span>
                    <EditableContent storageKey="assessment:form1" initialValue="Pre-Post Test: Track knowledge gains (e.g., 60% → 90% mastery)" />
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-500 mt-1">&#8226;</span>
                    <EditableContent storageKey="assessment:form2" initialValue="Padlet/Role-Play Analysis: Observe critical thinking in applying guidelines" />
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-500 mt-1">&#8226;</span>
                    <EditableContent storageKey="assessment:form3" initialValue="Exit Ticket: Collect reflections to assess synthesis" />
                  </div>
                </div>

                <Separator />

                <h3 className="font-semibold text-slate-800">Summative Assessment</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="font-medium text-amber-900 mb-1">Individual Case Study Analysis (Due Week 2)</p>
                  <p className="text-sm text-amber-700">
                    <EditableContent storageKey="assessment:summative" initialValue="Analyze an EDB-published misconduct case using the TPCG Rubric: Ethics Application (4 criteria)." multiline />
                  </p>
                </div>
              </div>
            </LessonSection>

            {/* 5. Constructive Alignment Matrix */}
            <LessonSection id="alignment" title="5. Constructive Alignment Matrix" badge="Alignment">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Learning Outcome</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Teaching Activity</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Assessment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-3 text-slate-600">Analyze professionalism frameworks</td>
                      <td className="py-3 px-3 text-slate-600">Interactive lecture with journal/EDB sources</td>
                      <td className="py-3 px-3"><Badge variant="outline">Pop-up quiz</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-3 text-slate-600">Evaluate ethical dilemmas</td>
                      <td className="py-3 px-3 text-slate-600">EDB case study &amp; role-play</td>
                      <td className="py-3 px-3"><Badge variant="outline">Peer evaluations + post-test</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-3 text-slate-600">Apply standards to real scenarios</td>
                      <td className="py-3 px-3 text-slate-600">Discussion + reflective discussion</td>
                      <td className="py-3 px-3"><Badge variant="outline">Case study analysis (Week 2)</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </LessonSection>

            {/* 6. Required Resources & Technology */}
            <LessonSection id="resources" title="6. Required Resources & Technology" badge="Resources">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-blue-500 mt-1">&#8226;</span>
                  <EditableContent storageKey="resources:preclass" initialValue="Pre-Class: Moodle/Canvas links for EDB documents and videos" />
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-blue-500 mt-1">&#8226;</span>
                  <EditableContent storageKey="resources:inclass" initialValue="In-Class: Mentimeter, Padlet, projector for EDB videos" />
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-blue-500 mt-1">&#8226;</span>
                  <EditableContent storageKey="resources:materials" initialValue="Materials: Printed EDB misconduct case reports" />
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-blue-500 mt-1">&#8226;</span>
                  <EditableContent storageKey="resources:video" initialValue="Video: EDB Ethics in Practice (YouTube)" />
                </div>
              </div>
            </LessonSection>

            {/* 7. Differentiation & Inclusivity */}
            <LessonSection id="differentiation" title="7. Differentiation & Inclusivity" badge="Inclusivity">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <Users className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-900">Practicum Relevance</p>
                    <p className="text-sm text-emerald-700">
                      <EditableContent storageKey="diff:practicum" initialValue="Use scenarios based on common student reports (e.g., classroom management challenges)." />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Globe className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Language Support</p>
                    <p className="text-sm text-blue-700">
                      <EditableContent storageKey="diff:language" initialValue="Provide EDB materials in Chinese and English." />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <BookOpen className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-violet-900">Advanced Extension</p>
                    <p className="text-sm text-violet-700">
                      <EditableContent storageKey="diff:advanced" initialValue="Challenge groups to compare EDB guidelines with UNESCO's global standards." />
                    </p>
                  </div>
                </div>
              </div>
            </LessonSection>

            {/* 8. Reflection & Improvement */}
            <LessonSection id="reflection" title="8. Reflection & Improvement" badge="Reflection">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500 mt-1">&#8226;</span>
                  <div>
                    <span className="font-medium text-slate-800">Success Metrics:</span>{' '}
                    <EditableContent storageKey="reflect:metrics" initialValue="High Padlet activity (e.g., 80% participation), 20% score improvement post-test" />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-blue-500 mt-1">&#8226;</span>
                  <div>
                    <span className="font-medium text-slate-800">Feedback:</span>{' '}
                    <EditableContent storageKey="reflect:feedback" initialValue="Use anonymized post-lesson surveys (e.g., Google Forms)" />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-violet-500 mt-1">&#8226;</span>
                  <div>
                    <span className="font-medium text-slate-800">Improvements:</span>{' '}
                    <EditableContent storageKey="reflect:improvements" initialValue="Adjust role-play scenarios based on exit tickets" />
                  </div>
                </div>

                <Separator />

                <h3 className="font-semibold text-slate-800 mt-4">Authentic References</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">&#8226;</span>
                    <a href="https://www.edb.gov.hk/en/teacher/guidelines_tpc/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      EDB Guidelines on Teachers&apos; Professional Conduct (2021)
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">&#8226;</span>
                    <a href="https://www.edb.gov.hk/disciplinary" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      EDB Disciplinary Actions Archive
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">&#8226;</span>
                    <a href="https://www.ibe.unesco.org/en/publications/teacher-professionalism-policy-paper" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      UNESCO&apos;s Teacher Professionalism Policy Paper
                    </a>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Integration with Scholarship: Cited Linda Darling-Hammond, EDB documents, and UNESCO research in defining professionalism.
                </p>
                <p className="text-xs text-muted-foreground">
                  Hong Kong Context: All materials anchored in EDB guidelines with cases from Hong Kong schools.
                </p>
              </div>
            </LessonSection>
          </div>
        </div>
      </main>
    </ScrollRootProvider>
  );
}
