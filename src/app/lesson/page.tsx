'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonQuiz from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import LessonDiscussion from '@/components/lesson/interactive/Discussion';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import { ScrollRootProvider } from '@/contexts';
import { getQuiz } from '@/lib/actions/quiz';
import { getDiscussion } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { markSectionComplete } from '@/lib/actions/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Clock,
  Users,
  Target,
  Lightbulb,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Monitor,
  Heart,
  RefreshCw,
  Puzzle,
  Printer,
  CheckCircle,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
  questions: QuizQuestion[];
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
  discussion: { id: number; title: string; description: string | null };
  posts: DiscussionPost[];
}

interface ConceptCheckData {
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
  { id: 'interactive-tools', label: 'Interactive Tools' },
  { id: 'printable', label: 'Printables' },
];

export default function LessonPage() {
  const { user } = useUser();
  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';

  const [preTest, setPreTest] = useState<QuizData | null>(null);
  const [postTest, setPostTest] = useState<QuizData | null>(null);
  const [flashcardQuiz, setFlashcardQuiz] = useState<QuizData | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [preTestRes, postTestRes, flashcardRes, discussions1Res, discussions2Res, checksRes] = await Promise.all([
        getQuiz(1).catch(() => null),
        getQuiz(2).catch(() => null),
        getQuiz(3).catch(() => null),
        getDiscussion(1).catch(() => null),
        getDiscussion(2).catch(() => null),
        getConceptChecks().catch(() => null),
      ]);

      if (preTestRes?.success && preTestRes.data) setPreTest(preTestRes.data as QuizData);
      if (postTestRes?.success && postTestRes.data) setPostTest(postTestRes.data as QuizData);
      if (flashcardRes?.success && flashcardRes.data) setFlashcardQuiz(flashcardRes.data as QuizData);

      const discData: DiscussionData[] = [];
      if (discussions1Res?.success && discussions1Res.data) {
        const d = discussions1Res.data;
        discData.push({
          discussion: d.discussion,
          posts: d.posts.map((p: { id: number; parentPostId: number | null; authorId: number; authorDisplayName: string | null; authorUsername: string | null; content: string; createdAt: Date | null }) => ({
            id: p.id,
            parentId: p.parentPostId,
            authorId: p.authorId,
            authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
            content: p.content,
            createdAt: p.createdAt ? String(p.createdAt) : '',
          })),
        });
      }
      if (discussions2Res?.success && discussions2Res.data) {
        const d = discussions2Res.data;
        discData.push({
          discussion: d.discussion,
          posts: d.posts.map((p: { id: number; parentPostId: number | null; authorId: number; authorDisplayName: string | null; authorUsername: string | null; content: string; createdAt: Date | null }) => ({
            id: p.id,
            parentId: p.parentPostId,
            authorId: p.authorId,
            authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
            content: p.content,
            createdAt: p.createdAt ? String(p.createdAt) : '',
          })),
        });
      }
      setDiscussions(discData);

      if (checksRes?.success && checksRes.data) {
        setConceptChecks(checksRes.data as ConceptCheckData[]);
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

  async function handleSectionComplete(sectionKey: string) {
    if (userId <= 0) return;
    setCompletedSections((prev) => new Set(prev).add(sectionKey));
    await markSectionComplete(userId, sectionKey);
  }

  const getConceptCheck = (sectionKey: string) => {
    return conceptChecks.find((c) => c.sectionKey === sectionKey);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="px-4 py-6 max-w-5xl mx-auto space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <ScrollRootProvider>
          <div className="flex max-w-7xl mx-auto">
            <LessonSideMenu sections={SECTIONS} />
            <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  <EditableContent storageKey="lesson:title" initialValue="Introduction to Learning Theories" as="span" />
                </h1>
                <div className="flex flex-wrap gap-3 mt-3 text-blue-100 text-sm">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 90 minutes</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 43 students</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> Education</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">English</Badge>
                </div>
              </div>

              {/* Section 1: ILOs */}
              <LessonSection id="ilos" title="1. Intended Learning Outcomes (ILOs)" badge="Outcomes">
                <p className="text-muted-foreground mb-4">
                  <EditableContent storageKey="lesson:ilos:intro" initialValue="By the end of this lesson, students will be able to:" />
                </p>
                <div className="space-y-3">
                  {[
                    { key: 'lesson:ilos:1', value: 'Analyze key principles of behaviorism, cognitivism, and constructivism using academic terminology.', icon: Target },
                    { key: 'lesson:ilos:2', value: 'Compare strengths and limitations of three learning theories through real-world teaching scenarios.', icon: BarChart3 },
                    { key: 'lesson:ilos:3', value: 'Apply one learning theory to design a mini-lesson plan activity that aligns with specific educational goals.', icon: Lightbulb },
                  ].map((ilo, i) => {
                    const Icon = ilo.icon;
                    return (
                      <CardSection key={ilo.key}>
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-blue-600" />
                              <EditableContent storageKey={ilo.key} initialValue={ilo.value} multiline className="text-sm font-medium" />
                            </div>
                          </div>
                        </div>
                      </CardSection>
                    );
                  })}
                </div>
                {getConceptCheck('ilos') && userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheck('ilos')!.id}
                      title={getConceptCheck('ilos')!.title}
                      prompt={getConceptCheck('ilos')!.prompt}
                      checkType={getConceptCheck('ilos')!.checkType}
                      userId={userId}
                      userRole={userRole}
                    />
                  </div>
                )}
                {userId > 0 && !completedSections.has('ilos') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('ilos')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 2: Pre-Class Preparation */}
              <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Pre-Class">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" /> Reading Material
                    </h3>
                    <EditableContent storageKey="lesson:preclass:reading" initialValue='OpenStax Educational Psychology textbook (Chapter 4: "Foundations of Learning Theories") [Read sections 4.1–4.3]' multiline />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" /> Pre-Test (5 questions)
                    </h3>
                    {preTest ? (
                      <LessonQuiz
                        quizId={preTest.quiz.id}
                        title={preTest.quiz.title}
                        questions={preTest.questions}
                        userId={userId}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Pre-test quiz not available.</p>
                    )}
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" /> Guiding Questions
                    </h3>
                    <ul className="space-y-2">
                      {[
                        { key: 'lesson:preclass:q1', value: 'How might a teacher apply behaviorism in classroom management?' },
                        { key: 'lesson:preclass:q2', value: 'Can you recall a learning experience that felt more "cognitive" than "behavioral"?' },
                      ].map((q) => (
                        <li key={q.key} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">&#8226;</span>
                          <EditableContent storageKey={q.key} initialValue={q.value} multiline className="text-sm text-slate-700" />
                        </li>
                      ))}
                    </ul>
                  </CardSection>

                  {discussions.length > 0 && userId > 0 && (
                    <CardSection>
                      <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" /> Discussion Forums
                      </h3>
                      <div className="space-y-4">
                        {discussions.map((d) => (
                          <LessonDiscussion
                            key={d.discussion.id}
                            discussionId={d.discussion.id}
                            title={d.discussion.title}
                            description={d.discussion.description}
                            posts={d.posts}
                            userId={userId}
                            userRole={userRole}
                          />
                        ))}
                      </div>
                    </CardSection>
                  )}

                  {getConceptCheck('preclass') && userId > 0 && (
                    <ConceptCheck
                      checkId={getConceptCheck('preclass')!.id}
                      title={getConceptCheck('preclass')!.title}
                      prompt={getConceptCheck('preclass')!.prompt}
                      checkType={getConceptCheck('preclass')!.checkType}
                      userId={userId}
                      userRole={userRole}
                    />
                  )}
                </div>
                {userId > 0 && !completedSections.has('preclass') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('preclass')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 3: Introduction */}
              <LessonSection id="introduction" title="3. Teaching & Learning Activities — Introduction" badge="10 min">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Hook
                    </h3>
                    <EditableContent storageKey="lesson:intro:hook" multiline initialValue='Project an image of a teacher giving a student a gold star for sitting quietly. Ask: "What learning theory does this visualize? Why might this work or fail?"' />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" /> Pre-Test Discussion
                    </h3>
                    <EditableContent storageKey="lesson:intro:discussion" multiline initialValue="Use Mentimeter live word cloud to display responses. Address misconceptions (e.g., equating behaviorism solely with rewards)." />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-indigo-600" /> Real-World Connection
                    </h3>
                    <EditableContent storageKey="lesson:intro:video" multiline initialValue='Show a 2-minute video snippet of a classroom using gamified learning (e.g., Classcraft or Kahoot!).' />
                  </CardSection>
                </div>
              </LessonSection>

              {/* Section 4: Development Activities */}
              <LessonSection id="development" title="3. Teaching & Learning Activities — Development" badge="65 min">
                <div className="space-y-6">
                  {/* Activity 1: Mini-Lecture */}
                  <CardSection>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">15 min</Badge>
                      <h3 className="font-semibold text-slate-800">1. Interactive Mini-Lecture</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      <EditableContent storageKey="lesson:dev:lecture:desc" multiline initialValue="Explain behaviorism (Skinner), cognitivism (Piaget), and constructivism (Vygotsky) using an animated infographic." />
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="font-medium text-blue-800 text-xs uppercase tracking-wide mb-1">Think-Pair-Share</p>
                        <EditableContent storageKey="lesson:dev:lecture:tps" multiline initialValue='Which theory best explains how you learned to ride a bike?' className="text-blue-700" />
                      </div>
                    </div>
                  </CardSection>

                  {/* Activity 2: Case Study */}
                  <CardSection>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">25 min</Badge>
                      <h3 className="font-semibold text-slate-800">2. Small Group Case Study Analysis</h3>
                    </div>
                    <EditableContent storageKey="lesson:dev:case:intro" multiline initialValue="Divide students into 6 groups (7–8 members). Each group receives a unique case:" className="text-sm text-slate-700 mb-3" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { key: 'lesson:dev:case:a', label: 'Case A', desc: 'Teaching multiplication to 3rd graders (behaviorism)', color: 'bg-emerald-50 border-emerald-200' },
                        { key: 'lesson:dev:case:b', label: 'Case B', desc: 'High school dropout reengagement program (cognitivism)', color: 'bg-blue-50 border-blue-200' },
                        { key: 'lesson:dev:case:c', label: 'Case C', desc: 'Engineering design competition for college students (constructivism)', color: 'bg-purple-50 border-purple-200' },
                      ].map((c) => (
                        <div key={c.key} className={`rounded-lg p-3 border ${c.color}`}>
                          <p className="font-semibold text-xs text-slate-600 mb-1">{c.label}</p>
                          <EditableContent storageKey={c.key} initialValue={c.desc} multiline className="text-sm" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="font-medium text-xs text-slate-500 uppercase tracking-wide mb-2">Task</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                        <li><EditableContent storageKey="lesson:dev:case:task1" initialValue="Identify the dominant learning theory" /></li>
                        <li><EditableContent storageKey="lesson:dev:case:task2" initialValue="Propose two teaching strategies for the case" /></li>
                        <li><EditableContent storageKey="lesson:dev:case:task3" initialValue="Sketch a 3-step lesson plan fragment" /></li>
                      </ol>
                    </div>
                  </CardSection>

                  {/* Activity 3: Jigsaw */}
                  <CardSection>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700">15 min</Badge>
                      <h3 className="font-semibold text-slate-800">3. Digital Jigsaw Activity</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      <EditableContent storageKey="lesson:dev:jigsaw:desc" multiline initialValue='Regroup students into "theory expert" clusters (e.g., all original behaviorism groups meet). Use Padlet to share and critique group solutions.' />
                    </div>
                  </CardSection>

                  {/* Activity 4: Flashcard Challenge */}
                  <CardSection>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700">10 min</Badge>
                      <h3 className="font-semibold text-slate-800">4. Flashcard Challenge</h3>
                    </div>
                    <EditableContent storageKey="lesson:dev:flashcard:desc" multiline initialValue='Quizlet Live game with 10 terms (e.g., "operant conditioning," "scaffolding"). Groups compete to match terms with definitions.' className="text-sm text-slate-700 mb-3" />
                    {flashcardQuiz && userId > 0 ? (
                      <LessonQuiz
                        quizId={flashcardQuiz.quiz.id}
                        title={flashcardQuiz.quiz.title}
                        questions={flashcardQuiz.questions}
                        userId={userId}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Flashcard quiz not available.</p>
                    )}
                  </CardSection>
                </div>
                {getConceptCheck('development') && userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheck('development')!.id}
                      title={getConceptCheck('development')!.title}
                      prompt={getConceptCheck('development')!.prompt}
                      checkType={getConceptCheck('development')!.checkType}
                      userId={userId}
                      userRole={userRole}
                    />
                  </div>
                )}
                {userId > 0 && !completedSections.has('development') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('development')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 5: Synthesis & Closure */}
              <LessonSection id="synthesis" title="3. Teaching & Learning Activities — Synthesis & Closure" badge="15 min">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" /> Post-Test
                    </h3>
                    <EditableContent storageKey="lesson:synthesis:posttest:desc" multiline initialValue='Repeat 2 pre-test questions and add: "Design a classroom activity using your assigned learning theory."' className="text-sm text-slate-700 mb-3" />
                    {postTest && userId > 0 ? (
                      <LessonQuiz
                        quizId={postTest.quiz.id}
                        title={postTest.quiz.title}
                        questions={postTest.questions}
                        userId={userId}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Post-test quiz not available.</p>
                    )}
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-emerald-600" /> Reflection Circle
                    </h3>
                    <EditableContent storageKey="lesson:synthesis:reflection" multiline initialValue="Students share one takeaway and one unanswered question via Mentimeter polls." className="text-sm text-slate-700" />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-600" /> Preview
                    </h3>
                    <EditableContent storageKey="lesson:synthesis:preview" multiline initialValue="Introduce next session on social learning theory and technology integration." className="text-sm text-slate-700" />
                  </CardSection>
                </div>
                {getConceptCheck('synthesis') && userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheck('synthesis')!.id}
                      title={getConceptCheck('synthesis')!.title}
                      prompt={getConceptCheck('synthesis')!.prompt}
                      checkType={getConceptCheck('synthesis')!.checkType}
                      userId={userId}
                      userRole={userRole}
                    />
                  </div>
                )}
                {userId > 0 && !completedSections.has('synthesis') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('synthesis')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 6: Assessment Methods */}
              <LessonSection id="assessment" title="4. Assessment Methods" badge="Assessment">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-600" /> Formative Assessment
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {[
                        { key: 'lesson:assess:form1', value: 'Observation of group dynamics and solution quality' },
                        { key: 'lesson:assess:form2', value: 'Padlet contributions and Quizlet Live scores' },
                        { key: 'lesson:assess:form3', value: 'Exit ticket: "Rate your confidence in applying theories (1–5)"' },
                      ].map((item) => (
                        <li key={item.key} className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">&#8226;</span>
                          <EditableContent storageKey={item.key} initialValue={item.value} multiline />
                        </li>
                      ))}
                    </ul>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-600" /> Summative Assessment
                    </h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <EditableContent storageKey="lesson:assess:summative:desc" multiline initialValue="Written Assignment (Due next session): Create a 1-hour lesson plan for a K–12 grade of choice, explicitly aligning objectives/activities with one learning theory." />
                      <Separator className="my-3" />
                      <p className="font-semibold text-xs text-slate-500 uppercase tracking-wide">Rubric</p>
                      <div className="space-y-2 mt-2">
                        {[
                          { key: 'lesson:assess:rubric1', value: 'Theory selection justification (30%)', pct: 30 },
                          { key: 'lesson:assess:rubric2', value: 'Activity alignment with theory principles (40%)', pct: 40 },
                          { key: 'lesson:assess:rubric3', value: 'Practical applicability for teachers (30%)', pct: 30 },
                        ].map((r) => (
                          <div key={r.key} className="flex items-center gap-3">
                            <div className="w-24 text-right">
                              <Badge variant="outline" className="text-xs">{r.pct}%</Badge>
                            </div>
                            <EditableContent storageKey={r.key} initialValue={r.value} className="flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardSection>
                </div>
                {getConceptCheck('assessment') && userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheck('assessment')!.id}
                      title={getConceptCheck('assessment')!.title}
                      prompt={getConceptCheck('assessment')!.prompt}
                      checkType={getConceptCheck('assessment')!.checkType}
                      userId={userId}
                      userRole={userRole}
                    />
                  </div>
                )}
                {userId > 0 && !completedSections.has('assessment') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('assessment')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 7: Constructive Alignment Matrix */}
              <LessonSection id="alignment" title="5. Constructive Alignment Matrix" badge="Alignment">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Learning Outcome</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Teaching Activity</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Assessment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'align1', outcome: 'Analyze theory principles', activity: 'Mini-lecture + flashcard challenge', assessment: 'Pre/post-test terminology accuracy' },
                        { key: 'align2', outcome: 'Compare theories', activity: 'Jigsaw case study groups', assessment: 'Group solution presentations' },
                        { key: 'align3', outcome: 'Apply theory to lesson planning', activity: 'Modified lesson plan assignment', assessment: 'Rubric-scored written submission' },
                      ].map((row) => (
                        <tr key={row.key} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <EditableContent storageKey={`lesson:align:${row.key}:outcome`} initialValue={row.outcome} />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey={`lesson:align:${row.key}:activity`} initialValue={row.activity} />
                          </td>
                          <td className="py-3 px-4">
                            <EditableContent storageKey={`lesson:align:${row.key}:assessment`} initialValue={row.assessment} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {userId > 0 && !completedSections.has('alignment') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('alignment')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 8: Required Resources & Technology */}
              <LessonSection id="resources" title="6. Required Resources & Technology" badge="Resources">
                <ul className="space-y-2">
                  {[
                    { key: 'lesson:res:1', value: 'LMS (Canvas/Moodle) for pre/post-tests' },
                    { key: 'lesson:res:2', value: 'Mentimeter and Padlet accounts' },
                    { key: 'lesson:res:3', value: 'Projector and laptop' },
                    { key: 'lesson:res:4', value: 'Printer for graphic organizers' },
                    { key: 'lesson:res:5', value: 'Quizlet Live access' },
                    { key: 'lesson:res:6', value: 'Printed case studies (6 x 2 pages each)' },
                  ].map((item) => (
                    <li key={item.key} className="flex items-start gap-2 text-sm text-slate-700">
                      <Monitor className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <EditableContent storageKey={item.key} initialValue={item.value} />
                    </li>
                  ))}
                </ul>
                {userId > 0 && !completedSections.has('resources') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('resources')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 9: Differentiation & Inclusivity */}
              <LessonSection id="differentiation" title="7. Differentiation & Inclusivity" badge="Inclusivity">
                <ul className="space-y-2">
                  {[
                    { key: 'lesson:diff:1', value: 'Provide graphic organizers for all students to structure case analysis' },
                    { key: 'lesson:diff:2', value: 'Offer audio recordings of mini-lecture for auditory learners' },
                    { key: 'lesson:diff:3', value: 'Assign one advanced student per group as "theory coach" to support peers' },
                    { key: 'lesson:diff:4', value: 'Allow alternative format submissions for summative assessment (audio/video/visual learners)' },
                  ].map((item) => (
                    <li key={item.key} className="flex items-start gap-2 text-sm text-slate-700">
                      <Heart className="h-4 w-4 text-pink-400 mt-0.5 shrink-0" />
                      <EditableContent storageKey={item.key} initialValue={item.value} multiline />
                    </li>
                  ))}
                </ul>
                {userId > 0 && !completedSections.has('differentiation') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('differentiation')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 10: Reflection & Improvement */}
              <LessonSection id="reflection" title="8. Reflection & Improvement" badge="Reflection">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" /> Success Indicators
                    </h3>
                    <EditableContent storageKey="lesson:reflect:success" multiline initialValue="At least 80% of groups demonstrate accurate theory alignment in solutions; pre/post-average improvement ≥ 20%." className="text-sm text-slate-700" />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" /> Feedback Mechanisms
                    </h3>
                    <EditableContent storageKey="lesson:reflect:feedback" multiline initialValue="Post-class survey via Google Forms (5 questions)." className="text-sm text-slate-700" />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-amber-600" /> Modifications
                    </h3>
                    <EditableContent storageKey="lesson:reflect:mods" multiline initialValue="Reduce pre-test questions if pacing is tight; add video examples of theory failures as learning opportunities." className="text-sm text-slate-700" />
                  </CardSection>
                </div>
                {userId > 0 && !completedSections.has('reflection') && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSectionComplete('reflection')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 11: Interactive Tools */}
              <LessonSection id="interactive-tools" title="Interactive Tools" badge="Interactive">
                <div className="space-y-3">
                  {[
                    { key: 'lesson:tools:1', value: 'Quiz: Learning Theories Foundations with 5 questions', icon: ClipboardList, color: 'text-blue-600' },
                    { key: 'lesson:tools:2', value: 'Game: Quizlet Live - Learning Theory Terms', icon: Puzzle, color: 'text-amber-600' },
                    { key: 'lesson:tools:3', value: 'Animated Illustration: Behaviorism vs. Constructivism in Classroom Scenarios', icon: Monitor, color: 'text-violet-600' },
                    { key: 'lesson:tools:4', value: 'Poll: Live Word Cloud for Pre-Test Discussion', icon: BarChart3, color: 'text-emerald-600' },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div key={tool.key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <Icon className={`h-5 w-5 ${tool.color} mt-0.5 shrink-0`} />
                        <EditableContent storageKey={tool.key} initialValue={tool.value} className="text-sm text-slate-700" />
                      </div>
                    );
                  })}
                </div>
              </LessonSection>

              {/* Section 12: Printable Materials */}
              <LessonSection id="printable" title="Printable Materials" badge="Printable">
                <div className="space-y-3">
                  {[
                    { key: 'lesson:print:1', value: 'Case Study Worksheets (6 unique versions)', icon: Printer },
                    { key: 'lesson:print:2', value: 'Theory Comparison Graphic Organizer (3-column chart)', icon: Printer },
                    { key: 'lesson:print:3', value: 'Lesson Plan Template for Summative Assignment', icon: Printer },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <Icon className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                        <EditableContent storageKey={item.key} initialValue={item.value} className="text-sm text-slate-700" />
                      </div>
                    );
                  })}
                </div>
              </LessonSection>

              {/* Footer */}
              <div className="bg-slate-100 rounded-lg p-4 text-center text-sm text-muted-foreground">
                <EditableContent storageKey="lesson:footer" multiline initialValue="This plan scaffolds understanding through collaborative problem-solving while balancing theory with practical application. The jigsaw structure and theory-specific group expertise encourage student ownership of learning." />
              </div>
            </main>
          </div>
        </ScrollRootProvider>
      </div>
    </AuthGuard>
  );
}
