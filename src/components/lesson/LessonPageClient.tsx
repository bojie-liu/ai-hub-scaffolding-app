'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import Navbar from '@/components/common/Navbar';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import Quiz from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Discussion from '@/components/lesson/interactive/Discussion';
import Flashcard from '@/components/learning/Flashcard';
import { getQuizByStorageKey } from '@/lib/actions/quiz';
import { getDiscussionByStorageKey } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import {
  CheckCircle,
  BookOpen,
  Video,
  MessageSquare,
  Lightbulb,
  Target,
  Clock,
  Users,
  BarChart3,
  FileText,
  Palette,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// --- Types ---

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

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null };
  posts: {
    id: number;
    parentId: number | null;
    authorId: number;
    content: string;
    createdAt: string;
    authorName: string;
  }[];
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
  sectionKey: string | null;
}

// --- Section definitions ---

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

// --- Flashcard data ---

const FLASHCARD_TERMS = [
  { front: 'Scaffolding', back: 'Temporary support provided by a more knowledgeable person to help a learner accomplish tasks within their Zone of Proximal Development. The support is gradually removed as competence grows.' },
  { front: 'Zone of Proximal Development (ZPD)', back: 'The gap between what a learner can do independently and what they can achieve with guidance from a more knowledgeable other. Central to Vygotsky\'s social constructivism.' },
  { front: 'Assimilation', back: 'Piaget\'s term for the process of incorporating new information into existing cognitive schemas without changing the schema itself.' },
  { front: 'Accommodation', back: 'Piaget\'s term for the process of modifying existing cognitive schemas to incorporate new information that does not fit the current schema.' },
  { front: 'Peer Modeling', back: 'Learning by observing and imitating peers. Central to Bandura\'s social learning theory, where learners acquire new behaviors through observation.' },
  { front: 'Cultural Tools', back: 'Artifacts, symbols, and especially language that mediate thinking and learning. Central to Vygotsky\'s theory of how social and cultural contexts shape cognition.' },
  { front: 'Discovery Learning', back: 'Bruner\'s educational approach where students construct knowledge through guided exploration and problem-solving rather than direct instruction.' },
  { front: 'Equilibration', back: 'Piaget\'s concept describing the self-regulatory process that drives cognitive development, balancing assimilation and accommodation to achieve cognitive stability.' },
];

// --- Main Component ---

export default function LessonPageClient() {
  const { user, isGuest } = useUser();
  const [preTest, setPreTest] = useState<QuizData | null>(null);
  const [postTest, setPostTest] = useState<QuizData | null>(null);
  const [exitTicket, setExitTicket] = useState<QuizData | null>(null);
  const [mythsDiscussion, setMythsDiscussion] = useState<DiscussionData | null>(null);
  const [adoptionDiscussion, setAdoptionDiscussion] = useState<DiscussionData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getQuizByStorageKey('quiz:pretest'),
        getQuizByStorageKey('quiz:posttest'),
        getQuizByStorageKey('quiz:exitticket'),
        getDiscussionByStorageKey('discussion:myths-vs-facts'),
        getDiscussionByStorageKey('discussion:principle-adoption'),
        getConceptChecks(),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.success && results[0].value.data) {
        setPreTest(results[0].value.data as QuizData);
      }
      if (results[1].status === 'fulfilled' && results[1].value.success && results[1].value.data) {
        setPostTest(results[1].value.data as QuizData);
      }
      if (results[2].status === 'fulfilled' && results[2].value.success && results[2].value.data) {
        setExitTicket(results[2].value.data as QuizData);
      }
      if (results[3].status === 'fulfilled' && results[3].value.success && results[3].value.data) {
        const d = results[3].value.data;
        setMythsDiscussion({
          discussion: d.discussion,
          posts: d.posts.map((p) => ({
            id: p.id,
            parentId: p.parentPostId,
            authorId: p.authorId,
            content: p.content,
            createdAt: String(p.createdAt ?? new Date()),
            authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
          })),
        });
      }
      if (results[4].status === 'fulfilled' && results[4].value.success && results[4].value.data) {
        const d = results[4].value.data;
        setAdoptionDiscussion({
          discussion: d.discussion,
          posts: d.posts.map((p) => ({
            id: p.id,
            parentId: p.parentPostId,
            authorId: p.authorId,
            content: p.content,
            createdAt: String(p.createdAt ?? new Date()),
            authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
          })),
        });
      }
      if (results[5].status === 'fulfilled' && results[5].value.success && results[5].value.data) {
        setConceptChecks(results[5].value.data as ConceptCheckData[]);
      }

      // Load student progress
      if (user && !isGuest && user.userId > 0) {
        const progressResult = await getStudentProgress(user.userId);
        if (progressResult.success && progressResult.data) {
          setCompletedSections(new Set(progressResult.data.filter(p => p.completed).map(p => p.sectionKey)));
        }
      }
    } catch (err) {
      console.error('Failed to load lesson data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || isGuest || user.userId < 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections(prev => new Set([...prev, sectionKey]));
      toast.success('Section marked as complete');
    }
  }

  function getConceptCheck(storageKey: string): ConceptCheckData | undefined {
    return conceptChecks.find(cc => cc.storageKey === storageKey);
  }

  function SectionCompleteButton({ sectionKey }: { sectionKey: string }) {
    if (!user || isGuest) return null;
    const isComplete = completedSections.has(sectionKey);
    if (isComplete) {
      return (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mt-4">
          <CheckCircle className="h-4 w-4" /> Section completed
        </div>
      );
    }
    return (
      <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete(sectionKey)}>
        <CheckCircle className="h-4 w-4 mr-1" /> Mark as Complete
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <ScrollRootProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          <LessonSideMenu sections={SECTIONS} />
          <main className="flex-1 min-w-0 space-y-6 pb-16">
            {/* Header */}
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                Cognitive &amp; Social Constructivism Theory
              </h1>
              <p className="text-slate-600 mt-2">
                <EditableContent storageKey="lesson:subtitle" initialValue="Introduction to Educational Psychology | 180 Minutes | First-Year Undergraduates | Class Size: 90" as="span" className="text-slate-600" />
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />180 min</Badge>
                <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />90 students</Badge>
                <Link href="/slides">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> View Slides
                  </Button>
                </Link>
              </div>
            </div>

            <Separator />

            {/* Section 1: ILOs */}
            <LessonSection id="ilos" title="Intended Learning Outcomes" badge="ILOs">
              <p className="text-sm text-slate-600 mb-4">
                <EditableContent storageKey="ilos:intro" initialValue="By the end of this lesson, students will be able to:" />
              </p>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">1</span>
                  <EditableContent storageKey="ilos:1" as="span" initialValue="Compare key principles of cognitive constructivism (Piaget, Bruner) and social constructivism (Vygotsky, Bandura) using a structured framework." className="text-slate-700" />
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">2</span>
                  <EditableContent storageKey="ilos:2" as="span" initialValue="Apply scaffolding strategies to design a short lesson plan aligned with constructivist principles." className="text-slate-700" />
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">3</span>
                  <EditableContent storageKey="ilos:3" as="span" initialValue="Evaluate case studies of classroom interactions to identify evidence of zone of proximal development (ZPD) and peer mediation." className="text-slate-700" />
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">4</span>
                  <EditableContent storageKey="ilos:4" as="span" initialValue="Explain the implications of constructivist theories for inclusive education practices." className="text-slate-700" />
                </li>
              </ol>
              <SectionCompleteButton sectionKey="ilos" />
            </LessonSection>

            {/* Section 2: Pre-Class Preparation */}
            <LessonSection id="preclass" title="Pre-Class Preparation" badge="Flipped Learning">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" /> A. Pre-Reading / Video (20 minutes)
                  </h3>
                  <CardSection>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <EditableContent storageKey="preclass:video" as="span" initialValue='Video: Theories of Cognitive Development: Piaget vs Vygotsky (CrashCourse) — https://www.youtube.com/watch?v=KukWgqC-ofg' />
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <EditableContent storageKey="preclass:reading" as="span" initialValue="Reading: Short excerpt from Johnmarshall Reeve's Understanding Motivation and Emotion (Ch. 9: Constructivist Classrooms)." />
                      </li>
                    </ul>
                  </CardSection>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-600" /> B. Pre-Test Quiz
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    <EditableContent storageKey="preclass:quiz-intro" initialValue="5-question true/false quiz to check your prior knowledge before the lesson." />
                  </p>
                  {preTest && user && !isGuest && user.userId > 0 ? (
                    <Quiz
                      quizId={preTest.quiz.id}
                      title={preTest.quiz.title}
                      questions={preTest.questions}
                      userId={user.userId}
                    />
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="pt-4 text-center text-sm text-slate-500">
                        {isGuest ? 'Sign in to take the pre-test quiz' : 'Loading quiz...'}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" /> C. Guiding Questions
                  </h3>
                  <CardSection>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>
                        <EditableContent storageKey="preclass:q1" as="span" initialValue="What role do peers play in knowledge-building according to Vygotsky?" className="text-slate-700" />
                      </li>
                      <li>
                        <EditableContent storageKey="preclass:q2" as="span" initialValue="How might a constructivist approach address students with learning disabilities?" className="text-slate-700" />
                      </li>
                    </ol>
                  </CardSection>
                </div>
              </div>
              <SectionCompleteButton sectionKey="preclass" />
            </LessonSection>

            {/* Section 3: Introduction */}
            <LessonSection id="introduction" title="Introduction" badge="20 min">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Hook</h3>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <EditableContent storageKey="intro:hook" as="p" initialValue="Imagine three students solving a math problem: one works alone for hours, one asks teachers questions, and one debates solutions with classmates. Which &ldquo;learns best&rdquo;? Why?" className="text-blue-800 font-medium" />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Pre-Test Review</h3>
                  <EditableContent storageKey="intro:review" as="p" initialValue="Display live quiz results, correct misconceptions using peer explanations (e.g., clarify scaffolding's role in both cognitive and social constructivism)." className="text-sm text-slate-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Real-World Connection</h3>
                  <EditableContent storageKey="intro:realworld" as="p" initialValue="Finland's education system integrates constructivist principles: student-centered learning, collaborative problem-solving, minimal standardized testing, and teachers as facilitators rather than lecturers. This approach consistently produces top international education outcomes." className="text-sm text-slate-600" />
                </div>
              </div>
              <SectionCompleteButton sectionKey="introduction" />
            </LessonSection>

            {/* Section 4: Development Activities */}
            <LessonSection id="development" title="Development Activities" badge="130 min">
              <div className="space-y-8">
                {/* A. Interactive Lecture */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">A</Badge>
                    <h3 className="font-semibold text-slate-800">Interactive Lecture + Think-Pair-Share (30 min)</h3>
                  </div>
                  <div className="space-y-3">
                    <EditableContent storageKey="dev:a-keypoints" as="p" initialValue="Key points: Piaget's assimilation/accommodation vs Vygotsky's cultural tools/ZPD. Cognitive constructivism focuses on individual knowledge construction through biological maturation and exploration, while social constructivism emphasizes social interaction and cultural mediation." className="text-sm text-slate-600" />

                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Discussion: Constructivism Myths vs Facts</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        <EditableContent storageKey="dev:a-prompt" initialValue='Paired task: Debunk misconceptions about constructivist theories (e.g., "Is all group work social constructivism?"). Share your thoughts below.' />
                      </p>
                      {mythsDiscussion && user && !isGuest && user.userId > 0 ? (
                        <Discussion
                          discussionId={mythsDiscussion.discussion.id}
                          title={mythsDiscussion.discussion.title}
                          description={mythsDiscussion.discussion.description}
                          posts={mythsDiscussion.posts}
                          userId={user.userId}
                        />
                      ) : (
                        <Card className="border-dashed">
                          <CardContent className="pt-4 text-center text-sm text-slate-500">
                            {isGuest ? 'Sign in to participate in the discussion' : 'Loading discussion...'}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* B. Animated Illustration */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">B</Badge>
                    <h3 className="font-semibold text-slate-800">Evolution of Constructivist Theories (15 min)</h3>
                  </div>
                  <CardSection>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Interactive Timeline</h4>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />
                      {[
                        { year: 'Early 1900s', title: "Montessori's Materials", desc: 'Self-directed learning with carefully designed materials' },
                        { year: '1920s-1950s', title: "Piaget's Stage Theory", desc: 'Cognitive development through assimilation and accommodation' },
                        { year: '1930s (pub. 1978)', title: "Vygotsky's ZPD", desc: 'Zone of Proximal Development and cultural mediation' },
                        { year: '1960s', title: "Bruner's Discovery Learning", desc: 'Guided exploration and spiral curriculum' },
                        { year: '1977', title: "Bandura's Social Learning", desc: 'Observation, imitation, and modeling' },
                        { year: '1991', title: 'Situated Learning', desc: 'Lave & Wenger: Learning as participation in communities of practice' },
                        { year: '2000s', title: 'Neuroconstructivism', desc: "Karmiloff-Smith: Interaction between brain development and environment" },
                      ].map((item, i) => (
                        <div key={i} className="relative pl-10 pb-4">
                          <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                          <EditableContent
                            storageKey={`timeline:${i}`}
                            as="span"
                            initialValue={`${item.year}: ${item.title} — ${item.desc}`}
                            className="text-sm text-slate-700"
                          />
                        </div>
                      ))}
                    </div>
                  </CardSection>
                </div>

                <Separator />

                {/* C. Case Study Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">C</Badge>
                    <h3 className="font-semibold text-slate-800">Case Study Analysis (40 min)</h3>
                  </div>
                  <div className="space-y-3">
                    <Card className="bg-amber-50 border-amber-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Case Study: Constructivist Math Classrooms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <EditableContent storageKey="dev:c-casestudy" as="p" multiline initialValue={`A 6th-grade teacher uses peer tutoring for fractions. In the dialogue below, observe how the tutor (Maria, a stronger student) helps her peer (Jamal) who is struggling with adding fractions with unlike denominators.

Maria: "Okay, so you have 1/3 and 1/4. What do you notice about the denominators?"
Jamal: "They're different. I can't just add them."
Maria: "Right! So what could we do to make them the same?"
Jamal: "Multiply? But I don't know what to multiply by..."
Maria: "Let's think about it. What number can both 3 and 4 go into?"
Jamal: "12?"
Maria: "Exactly! So how would you change 1/3 to have a denominator of 12?"
Jamal: "I multiply the top and bottom by 4... so 4/12?"
Maria: "Perfect! Now you try 1/4."
Jamal: "Multiply by 3... so 3/12. Then 4/12 + 3/12 = 7/12!"

Your task:
1. Identify ZPD scaffolding in this interaction.
2. Propose one adjustment using Bruner's discovery learning.`} className="text-sm text-amber-900 whitespace-pre-wrap" />
                      </CardContent>
                    </Card>

                    {/* Concept Check for case study */}
                    {getConceptCheck('concept:identify-zpd') && user && !isGuest && user.userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheck('concept:identify-zpd')!.id}
                        title={getConceptCheck('concept:identify-zpd')!.title}
                        prompt={getConceptCheck('concept:identify-zpd')!.prompt}
                        checkType={getConceptCheck('concept:identify-zpd')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={user.userId}
                      />
                    )}
                  </div>
                </div>

                <Separator />

                {/* D. Problem-Solving Exercise */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">D</Badge>
                    <h3 className="font-semibold text-slate-800">Problem-Solving Exercise (25 min)</h3>
                  </div>
                  <div className="space-y-3">
                    <EditableContent storageKey="dev:d-task" as="p" initialValue="Task: Design a 15-minute high school biology lesson using either cognitive or social constructivism." className="text-sm text-slate-600" />

                    <Card className="border-violet-200 bg-violet-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Worksheet: Lesson Design Template</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-violet-800">Learning Objectives:</label>
                            <EditableContent storageKey="worksheet:objectives" as="p" initialValue="What should students know or be able to do by the end of this lesson?" className="text-sm text-violet-700 mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-violet-800">Chosen Approach:</label>
                            <EditableContent storageKey="worksheet:approach" as="p" initialValue="Cognitive constructivism (Piaget/Bruner) or Social constructivism (Vygotsky/Bandura)?" className="text-sm text-violet-700 mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-violet-800">ZPD Integration:</label>
                            <EditableContent storageKey="worksheet:zpd" as="p" initialValue="How does your lesson plan address the Zone of Proximal Development? What scaffolding will you provide?" className="text-sm text-violet-700 mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-violet-800">Cultural Tools / Materials:</label>
                            <EditableContent storageKey="worksheet:tools" as="p" initialValue="What cultural tools, language, or materials will mediate learning in your lesson?" className="text-sm text-violet-700 mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lesson design confidence concept check */}
                    {getConceptCheck('concept:lesson-design-confidence') && user && !isGuest && user.userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheck('concept:lesson-design-confidence')!.id}
                        title={getConceptCheck('concept:lesson-design-confidence')!.title}
                        prompt={getConceptCheck('concept:lesson-design-confidence')!.prompt}
                        checkType={getConceptCheck('concept:lesson-design-confidence')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={user.userId}
                      />
                    )}
                  </div>
                </div>

                <Separator />

                {/* E. Digital Flashcards & Quiz */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">E</Badge>
                    <h3 className="font-semibold text-slate-800">Digital Flashcards & Quiz (20 min)</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Constructivism Terms Match Game</h4>
                      <Flashcard cards={FLASHCARD_TERMS} />
                    </div>

                    {/* Understanding concept check */}
                    {getConceptCheck('concept:understand-difference') && user && !isGuest && user.userId > 0 && (
                      <ConceptCheck
                        checkId={getConceptCheck('concept:understand-difference')!.id}
                        title={getConceptCheck('concept:understand-difference')!.title}
                        prompt={getConceptCheck('concept:understand-difference')!.prompt}
                        checkType={getConceptCheck('concept:understand-difference')!.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={user.userId}
                      />
                    )}

                    {/* Exit Ticket */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Exit Ticket</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        <EditableContent storageKey="dev:e-exit" initialValue="Summarize the difference between Piaget and Vygotsky in 2 tweets." />
                      </p>
                      {exitTicket && user && !isGuest && user.userId > 0 ? (
                        <Quiz
                          quizId={exitTicket.quiz.id}
                          title={exitTicket.quiz.title}
                          questions={exitTicket.questions}
                          userId={user.userId}
                        />
                      ) : (
                        <Card className="border-dashed">
                          <CardContent className="pt-4 text-center text-sm text-slate-500">
                            {isGuest ? 'Sign in to complete the exit ticket' : 'Loading exit ticket...'}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="development" />
            </LessonSection>

            {/* Section 5: Synthesis & Closure */}
            <LessonSection id="synthesis" title="Synthesis & Closure" badge="30 min">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" /> Post-Test
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    <EditableContent storageKey="synthesis:posttest-intro" initialValue='5-question comparison quiz to assess your understanding (e.g., "Which theory emphasizes cultural artifacts like language the most?").' />
                  </p>
                  {postTest && user && !isGuest && user.userId > 0 ? (
                    <Quiz
                      quizId={postTest.quiz.id}
                      title={postTest.quiz.title}
                      questions={postTest.questions}
                      userId={user.userId}
                    />
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="pt-4 text-center text-sm text-slate-500">
                        {isGuest ? 'Sign in to take the post-test' : 'Loading quiz...'}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" /> Class Discussion
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    <EditableContent storageKey="synthesis:discussion-prompt" initialValue='Poll: "Which constructivist principle should be most widely adopted in schools today? Why?"' />
                  </p>
                  {adoptionDiscussion && user && !isGuest && user.userId > 0 ? (
                    <Discussion
                      discussionId={adoptionDiscussion.discussion.id}
                      title={adoptionDiscussion.discussion.title}
                      description={adoptionDiscussion.discussion.description}
                      posts={adoptionDiscussion.posts}
                      userId={user.userId}
                    />
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="pt-4 text-center text-sm text-slate-500">
                        {isGuest ? 'Sign in to participate in the discussion' : 'Loading discussion...'}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Preview</h3>
                  <EditableContent storageKey="synthesis:preview" as="p" initialValue='Introduce next session: "Behaviorism vs Constructivism". Pre-reading assigned from textbook.' className="text-sm text-slate-600" />
                </div>
              </div>
              <SectionCompleteButton sectionKey="synthesis" />
            </LessonSection>

            {/* Section 6: Assessment Methods */}
            <LessonSection id="assessment" title="Assessment Methods">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Formative Assessment</h3>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:form1" as="span" initialValue="Exit ticket responses: Quality of ZPD examples." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:form2" as="span" initialValue="Mentimeter quiz accuracy (80%+ correct on ZPD definitions)." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:form3" as="span" initialValue="Peer evaluations during case study group work." />
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Summative Assessment</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    <EditableContent storageKey="assessment:summative-intro" as="span" initialValue="Assignment: Submit lesson plan with justification linking to theories (300 words)." />
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Criteria</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Excellent (4-5 pts)</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Proficient (2-3 pts)</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Needs Improvement (0-1 pt)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-3 font-medium text-slate-700">Application of theory</td>
                          <td className="py-2 px-3">
                            <EditableContent storageKey="rubric:app-excellent" as="span" initialValue="Clear integration of Piaget/Vygotsky" className="text-slate-600" />
                          </td>
                          <td className="py-2 px-3">
                            <EditableContent storageKey="rubric:app-proficient" as="span" initialValue="Minor inconsistencies" className="text-slate-600" />
                          </td>
                          <td className="py-2 px-3">
                            <EditableContent storageKey="rubric:app-needs" as="span" initialValue="No evidence of theory application" className="text-slate-600" />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-3 font-medium text-slate-700">Scaffolding explanation</td>
                          <td className="py-2 px-3">
                            <EditableContent storageKey="rubric:scaff-excellent" as="span" initialValue="Precise description" className="text-slate-600" />
                          </td>
                          <td className="py-2 px-3">
                            <EditableContent storageKey="rubric:scaff-proficient" as="span" initialValue="Vague or incomplete" className="text-slate-600" />
                          </td>
                          <td className="py-2 px-3">
                            <EditableContent storageKey="rubric:scaff-needs" as="span" initialValue="Missing or inaccurate" className="text-slate-600" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="assessment" />
            </LessonSection>

            {/* Section 7: Constructive Alignment Matrix */}
            <LessonSection id="alignment" title="Constructive Alignment Matrix">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">Learning Outcome</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">Teaching Activity</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">Assessment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r1-ilo" as="span" initialValue="ILO 1 (Compare principles)" className="text-slate-700" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r1-teach" as="span" initialValue="Case study analysis, animated timeline" className="text-slate-600" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r1-assess" as="span" initialValue="Post-test multiple choice" className="text-slate-600" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r2-ilo" as="span" initialValue="ILO 2 (Apply scaffolding)" className="text-slate-700" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r2-teach" as="span" initialValue="Lesson design exercise, guided worksheet" className="text-slate-600" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r2-assess" as="span" initialValue="Summative lesson plan assignment" className="text-slate-600" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r3-ilo" as="span" initialValue="ILO 3 (Evaluate case studies)" className="text-slate-700" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r3-teach" as="span" initialValue="Small group case analysis" className="text-slate-600" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r3-assess" as="span" initialValue="Exit ticket & peer evaluation" className="text-slate-600" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r4-ilo" as="span" initialValue="ILO 4 (Explain inclusive practices)" className="text-slate-700" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r4-teach" as="span" initialValue="Padlet myth-busting & discussion" className="text-slate-600" />
                      </td>
                      <td className="py-2 px-3">
                        <EditableContent storageKey="matrix:r4-assess" as="span" initialValue="Reflection in exit ticket" className="text-slate-600" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <SectionCompleteButton sectionKey="alignment" />
            </LessonSection>

            {/* Section 8: Required Resources & Technology */}
            <LessonSection id="resources" title="Required Resources & Technology">
              <div className="grid gap-3 sm:grid-cols-2">
                <CardSection>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" /> LMS
                  </h4>
                  <EditableContent storageKey="resources:lms" as="p" initialValue="Moodle/Canvas for pre-class materials & exit tickets." className="text-sm text-slate-600" />
                </CardSection>
                <CardSection>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" /> Interactive Tools
                  </h4>
                  <EditableContent storageKey="resources:tools" as="p" initialValue="Mentimeter, Padlet, Quizlet." className="text-sm text-slate-600" />
                </CardSection>
                <CardSection>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" /> Hardware
                  </h4>
                  <EditableContent storageKey="resources:hardware" as="p" initialValue="Document camera for sharing group work." className="text-sm text-slate-600" />
                </CardSection>
                <CardSection>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" /> Readings
                  </h4>
                  <EditableContent storageKey="resources:readings" as="p" initialValue="PDF excerpts from The Cambridge Handbook of the Learning Sciences." className="text-sm text-slate-600" />
                </CardSection>
              </div>
              <SectionCompleteButton sectionKey="resources" />
            </LessonSection>

            {/* Section 9: Differentiation & Inclusivity */}
            <LessonSection id="differentiation" title="Differentiation & Inclusivity">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5 text-xs">Support</Badge>
                  <EditableContent storageKey="diff:support" as="span" initialValue="Provide closed captions for videos, audio recordings of readings, and bilingual glossaries." className="text-sm text-slate-600" />
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5 text-xs">Extension</Badge>
                  <EditableContent storageKey="diff:extension" as="span" initialValue="Advanced learners research neuroconstructivism (Karmiloff-Smith)." className="text-sm text-slate-600" />
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5 text-xs">Accommodations</Badge>
                  <EditableContent storageKey="diff:accommodations" as="span" initialValue="Offer pre-printed concept maps for students without tablets." className="text-sm text-slate-600" />
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5 text-xs">Multilingual</Badge>
                  <EditableContent storageKey="diff:multilingual" as="span" initialValue="Translate key terms into top 3 languages represented in class (e.g., Spanish, Chinese)." className="text-sm text-slate-600" />
                </div>
              </div>

              {/* Inclusive practices concept check */}
              {getConceptCheck('concept:inclusive-practices') && user && !isGuest && user.userId > 0 && (
                <div className="mt-4">
                  <ConceptCheck
                    checkId={getConceptCheck('concept:inclusive-practices')!.id}
                    title={getConceptCheck('concept:inclusive-practices')!.title}
                    prompt={getConceptCheck('concept:inclusive-practices')!.prompt}
                    checkType={getConceptCheck('concept:inclusive-practices')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                  />
                </div>
              )}

              <SectionCompleteButton sectionKey="differentiation" />
            </LessonSection>

            {/* Section 10: Reflection & Improvement */}
            <LessonSection id="reflection" title="Reflection & Improvement">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Success Indicators
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="reflect:success1" as="span" initialValue="80% post-test accuracy on theory comparisons." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="reflect:success2" as="span" initialValue="70% of lesson plans include specific ZPD examples." />
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" /> Feedback
                  </h3>
                  <EditableContent storageKey="reflect:feedback" as="p" initialValue="Post-class survey via Google Forms (open-ended responses)." className="text-sm text-slate-600" />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-violet-600" /> Modifications
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="reflect:mod1" as="span" initialValue="If large groups struggle, assign rotating group roles (e.g., timekeeper, recorder)." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#8226;</span>
                      <EditableContent storageKey="reflect:mod2" as="span" initialValue="Add closed captioning to all videos if requested." />
                    </li>
                  </ul>
                </div>
              </div>
              <SectionCompleteButton sectionKey="reflection" />
            </LessonSection>
          </main>
        </div>
      </div>
    </ScrollRootProvider>
  );
}
