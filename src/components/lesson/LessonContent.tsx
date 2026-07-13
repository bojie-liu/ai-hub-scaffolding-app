'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { markSectionComplete } from '@/lib/actions/progress';
import { getStudentProgress } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle } from 'lucide-react';

interface QuizData {
  quiz: {
    id: number;
    storageKey: string;
    title: string;
    description: string | null;
    quizType: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  questions: {
    id: number;
    storageKey: string;
    createdAt: Date | null;
    quizId: number;
    questionText: string;
    questionOrder: number;
    questionType: string;
    explanation: string | null;
    answers: { id: number; questionId: number; answerText: string; isCorrect: boolean; answerOrder: number }[];
  }[];
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  sectionKey: string | null;
  title: string;
  prompt: string;
  checkType: string;
  createdAt: Date | null;
}

interface DiscussionData {
  discussion: {
    id: number;
    storageKey: string;
    title: string;
    description: string | null;
    createdBy: number;
    isPinned: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  creator: {
    id: number;
    username: string;
    displayName: string | null;
    role: string;
  } | null;
  posts: {
    id: number;
    discussionId: number;
    parentPostId: number | null;
    authorId: number;
    content: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    authorUsername: string | null;
    authorDisplayName: string | null;
    authorRole: string | null;
  }[];
}

interface LessonContentProps {
  quizData: QuizData[];
  conceptChecks: ConceptCheckData[];
  discussionData: DiscussionData[];
}

const sections = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'activities', label: 'Activities' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'materials', label: 'Materials' },
];

export default function LessonContent({
  quizData,
  conceptChecks,
  discussionData,
}: LessonContentProps) {
  const { user } = useUser();
  const [completed, setCompleted] = useState<string[]>([]);

  const userId = user?.userId ?? 0;
  const userRole = user?.role ?? 'GUEST';

  // Fetch progress on mount
  useEffect(() => {
    if (user && user.userId > 0) {
      getStudentProgress(user.userId).then((result) => {
        if (result.success && result.data) {
          setCompleted(
            result.data.filter((p) => p.completed).map((p) => p.sectionKey)
          );
        }
      });
    }
  }, [user]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompleted((prev) => [...prev, sectionKey]);
    }
  }

  // Find specific quizzes by storageKey
  const preTestQuiz = quizData.find((q) => q.quiz.storageKey === 'quiz:pre-test');
  const formativeQuiz = quizData.find(
    (q) => q.quiz.storageKey === 'quiz:formative'
  );

  // Cast quiz data to match Quiz component's expected types
  const castQuiz = (q: QuizData) => ({
    quiz: q.quiz,
    questions: q.questions.map((q) => ({
      ...q,
      questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
      answers: q.answers.map((a) => ({
        id: a.id,
        answerText: a.answerText,
        isCorrect: a.isCorrect,
      })),
    })),
  });

  // Find specific discussions by storageKey
  const interplayDiscussion = discussionData.find(
    (d) => d.discussion.storageKey === 'discussion:interplay'
  );
  const timeframeDiscussion = discussionData.find(
    (d) => d.discussion.storageKey === 'discussion:flexible-timeframe'
  );
  const reflectionDiscussion = discussionData.find(
    (d) => d.discussion.storageKey === 'discussion:reflection'
  );

  // Find concept check by section key
  const conceptCheck = (sectionKey: string) =>
    conceptChecks.find((cc) => cc.sectionKey === sectionKey);

  return (
    <ScrollRootProvider>
      <div className="flex gap-8">
        <LessonSideMenu sections={sections} />
        <div className="flex-1 min-w-0 space-y-8 overflow-y-auto">
          {/* ============================================================ */}
          {/* Section 1: Intended Learning Outcomes (ILOs) */}
          {/* ============================================================ */}
          <LessonSection
            id="ilos"
            title="1. Intended Learning Outcomes (ILOs)"
            badge="Bloom's Taxonomy"
          >
            <div className="space-y-4">
              <p className="text-slate-600 font-medium">
                By the end of this lesson, students will be able to:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-blue-600 mt-0.5">1.</span>
                  <div className="flex-1">
                    <EditableContent
                      storageKey="ilos:1"
                      initialValue="Analyze the key components of the Hong Kong EFL curriculum framework"
                      as="p"
                      className="text-slate-700"
                    />
                    <Badge variant="outline" className="mt-1 text-xs">
                      (Bloom&apos;s: Analyze)
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-semibold text-blue-600 mt-0.5">2.</span>
                  <div className="flex-1">
                    <EditableContent
                      storageKey="ilos:2"
                      initialValue="Evaluate pedagogical strategies aligned with the biliteracy-trilingualism policy"
                      as="p"
                      className="text-slate-700"
                    />
                    <Badge variant="outline" className="mt-1 text-xs">
                      (Bloom&apos;s: Evaluate)
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-semibold text-blue-600 mt-0.5">3.</span>
                  <div className="flex-1">
                    <EditableContent
                      storageKey="ilos:3"
                      initialValue="Adapt curriculum standards to context-specific lesson planning"
                      as="p"
                      className="text-slate-700"
                    />
                    <Badge variant="outline" className="mt-1 text-xs">
                      (Bloom&apos;s: Create)
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-semibold text-blue-600 mt-0.5">4.</span>
                  <div className="flex-1">
                    <EditableContent
                      storageKey="ilos:4"
                      initialValue="Critically reflect on the integration of CLIL (Content and Language Integrated Learning) approaches"
                      as="p"
                      className="text-slate-700"
                    />
                    <Badge variant="outline" className="mt-1 text-xs">
                      (Bloom&apos;s: Analyze/Evaluate)
                    </Badge>
                  </div>
                </div>
              </div>

              {conceptCheck('ilos') && (
                <ConceptCheck
                  checkId={conceptCheck('ilos')!.id}
                  title={conceptCheck('ilos')!.title}
                  prompt={conceptCheck('ilos')!.prompt}
                  checkType={conceptCheck('ilos')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={completed.includes('ilos') ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => handleMarkComplete('ilos')}
                  disabled={completed.includes('ilos')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('ilos')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 2: Pre-Class Preparation */}
          {/* ============================================================ */}
          <LessonSection id="preclass" title="2. Pre-Class Preparation">
            <div className="space-y-6">
              {/* Pre-Reading */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Pre-Reading
                </h3>
                <ul className="space-y-2 list-disc list-inside text-slate-700">
                  <li>
                    <EditableContent
                      storageKey="preclass:reading:1"
                      initialValue='Hong Kong Education Bureau (HKEB). (2020). English Language Curriculum Guide (Primary 1 – Secondary 6) (Excerpts on biliteracy policy and CLIL, pp.12-25)'
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                  <li>
                    Short video:{' '}
                    <EditableContent
                      storageKey="preclass:video:1"
                      initialValue='YouTube: "CLIL Strategies in Hong Kong Schools" (https://example.com/clilhk)'
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                </ul>
              </CardSection>

              {/* Pre-Test Quiz */}
              {preTestQuiz && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Pre-Test
                  </h3>
                  <Quiz
                    quizId={preTestQuiz.quiz.id}
                    title={preTestQuiz.quiz.title}
                    questions={castQuiz(preTestQuiz).questions}
                    userId={userId}
                  />
                </div>
              )}

              {/* Guiding Questions */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Guiding Questions
                </h3>
                <ul className="space-y-3 list-disc list-inside text-slate-700">
                  <li>
                    <EditableContent
                      storageKey="preclass:guiding:1"
                      initialValue="How does the Hong Kong curriculum address the interplay between English and local languages?"
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                  <li>
                    <EditableContent
                      storageKey="preclass:guiding:2"
                      initialValue="What are the implications of the 'three-year flexible timeframe' for EFL syllabus design?"
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                </ul>

                {/* Discussion for the first guiding question */}
                {interplayDiscussion && (
                  <div className="mt-4">
                    <Separator className="my-3" />
                    <Discussion
                      discussionId={interplayDiscussion.discussion.id}
                      title={interplayDiscussion.discussion.title}
                      description={interplayDiscussion.discussion.description}
                      posts={interplayDiscussion.posts.map((p) => ({
                        id: p.id,
                        parentId: p.parentPostId,
                        authorId: p.authorId,
                        authorName:
                          p.authorDisplayName || p.authorUsername || '',
                        content: p.content,
                        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
                      }))}
                      userId={userId}
                      userRole={userRole}
                    />
                  </div>
                )}
              </CardSection>

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('preclass') ? 'secondary' : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('preclass')}
                  disabled={completed.includes('preclass')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('preclass')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 3: Teaching & Learning Activities */}
          {/* ============================================================ */}
          <LessonSection
            id="activities"
            title="3. Teaching & Learning Activities"
          >
            <div className="space-y-8">
              {/* Introduction (12 minutes) */}
              <div>
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Badge variant="secondary">12 min</Badge>
                  Introduction
                </h3>
                <div className="space-y-4">
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">Hook</h4>
                    <EditableContent
                      storageKey="activities:hook"
                      initialValue={'Analyze a controversial news headline: "Is Hong Kong\'s English curriculum failing native speakers?"'}
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>

                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      Pre-Test Discussion
                    </h4>
                    <EditableContent
                      storageKey="activities:pretest-discussion"
                      initialValue="Use word cloud visualization (Mentimeter) to compare class responses, highlighting misconceptions like conflating biliteracy with bilingualism"
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>

                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      Real-World Connection
                    </h4>
                    <EditableContent
                      storageKey="activities:realworld"
                      initialValue="Showcase HKET (Hong Kong Examinations Authority) 2023 data about declining secondary-level EFL performance"
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>
                </div>
              </div>

              <Separator />

              {/* Development Activities (62 minutes) */}
              <div>
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Badge variant="secondary">62 min</Badge>
                  Development Activities
                </h3>
                <div className="space-y-4">
                  {/* A. Jigsaw Group Expertise Building */}
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      A. Jigsaw Group Expertise Building (15 min)
                    </h4>
                    <EditableContent
                      storageKey="activities:jigsaw-intro"
                      initialValue="Divide class into 5 expert groups (6 students each):"
                      as="p"
                      className="text-slate-700 mb-3"
                    />
                    <ol className="space-y-1.5 list-decimal list-inside text-slate-700 pl-2">
                      <li>
                        <EditableContent
                          storageKey="activities:jigsaw:group1"
                          initialValue="Group 1: Biliteracy Policy"
                          as="span"
                          className="text-slate-700"
                        />
                      </li>
                      <li>
                        <EditableContent
                          storageKey="activities:jigsaw:group2"
                          initialValue="Group 2: CLIL Implementation"
                          as="span"
                          className="text-slate-700"
                        />
                      </li>
                      <li>
                        <EditableContent
                          storageKey="activities:jigsaw:group3"
                          initialValue="Group 3: Four Key Strands Framework"
                          as="span"
                          className="text-slate-700"
                        />
                      </li>
                      <li>
                        <EditableContent
                          storageKey="activities:jigsaw:group4"
                          initialValue="Group 4: Assessment Literacy (HKDSE Exam Alignment)"
                          as="span"
                          className="text-slate-700"
                        />
                      </li>
                      <li>
                        <EditableContent
                          storageKey="activities:jigsaw:group5"
                          initialValue="Group 5: Technology Integration (EdCity Platform case study)"
                          as="span"
                          className="text-slate-700"
                        />
                      </li>
                    </ol>
                    <p className="text-slate-600 text-sm mt-2">
                      Each group analyzes assigned curriculum documents with
                      provided graphic organizer.
                    </p>
                  </CardSection>

                  {/* B. Group Problem-Solving */}
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      B. Group Problem-Solving (20 min)
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-slate-700">
                          Case Study:
                        </span>{' '}
                        <EditableContent
                          storageKey="activities:case-study"
                          initialValue="Create a mock school budget proposal meeting curriculum requirements within pandemic-era constraints"
                          as="span"
                          className="text-slate-700"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Scaffolding:
                        </span>{' '}
                        <EditableContent
                          storageKey="activities:scaffolding"
                          initialValue="Provide worked example showing CLIL integration in Primary Science class using EdCity resources"
                          as="span"
                          className="text-slate-700"
                        />
                      </div>
                    </div>
                  </CardSection>

                  {/* C. Peer Teaching Rounds */}
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      C. Peer Teaching Rounds (12 min)
                    </h4>
                    <EditableContent
                      storageKey="activities:peer-teaching"
                      initialValue='Groups develop 3-minute "TED-style" presentations with visual aids (Canva templates provided)'
                      as="p"
                      className="text-slate-700 mb-2"
                    />
                    <p className="text-slate-600 text-sm">
                      Cross-group feedback using criteria: Clarity of policy
                      interpretation / Feasibility of implementation
                    </p>
                  </CardSection>

                  {/* D. Concept Mapping Challenge */}
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      D. Concept Mapping Challenge (10 min)
                    </h4>
                    <EditableContent
                      storageKey="activities:concept-map"
                      initialValue="Use Padlet to create a collaborative concept map linking curriculum components"
                      as="p"
                      className="text-slate-700 mb-2"
                    />
                    <p className="text-slate-600 text-sm italic">
                      Example addition: &quot;Policy: Three-Year Flexible
                      Timeframe → Strategy: Modular Scheduling → Assessment:
                      Portfolio System&quot;
                    </p>
                  </CardSection>

                  {/* E. Formative Assessment */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">
                      E. Formative Assessment (5 min)
                    </h4>
                    {formativeQuiz ? (
                      <Quiz
                        quizId={formativeQuiz.quiz.id}
                        title={formativeQuiz.quiz.title}
                        questions={castQuiz(formativeQuiz).questions}
                        userId={userId}
                      />
                    ) : (
                      <CardSection>
                        <EditableContent
                          storageKey="activities:formative"
                          initialValue='Lightning quiz (Mentimeter): "Identify 2 challenges in implementing CLIL in Hong Kong" (Text response)'
                          as="p"
                          className="text-slate-700"
                        />
                      </CardSection>
                    )}
                  </div>

                  {/* Break */}
                  <CardSection className="bg-slate-50">
                    <p className="text-slate-500 font-medium text-center">
                      Break (5 minutes)
                    </p>
                  </CardSection>
                </div>
              </div>

              <Separator />

              {/* Synthesis & Closure (16 minutes) */}
              <div>
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Badge variant="secondary">16 min</Badge>
                  Synthesis &amp; Closure
                </h3>
                <div className="space-y-4">
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      Post-Test
                    </h4>
                    <EditableContent
                      storageKey="activities:posttest"
                      initialValue="Compare pre/post-test scores using LMS analytics"
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>

                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      Reflective Discussion
                    </h4>
                    <EditableContent
                      storageKey="activities:reflective-discussion"
                      initialValue={"How might Hong Kong's curriculum approach influence our own teaching context?"}
                      as="p"
                      className="text-slate-700 mb-3"
                    />
                    {reflectionDiscussion && (
                      <Discussion
                        discussionId={reflectionDiscussion.discussion.id}
                        title={reflectionDiscussion.discussion.title}
                        description={
                          reflectionDiscussion.discussion.description
                        }
                        posts={reflectionDiscussion.posts.map((p) => ({
                          id: p.id,
                          parentId: p.parentPostId,
                          authorId: p.authorId,
                          authorName:
                            p.authorDisplayName || p.authorUsername || '',
                          content: p.content,
                          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
                        }))}
                        userId={userId}
                        userRole={userRole}
                      />
                    )}
                  </CardSection>

                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-2">
                      Preview of Next Session
                    </h4>
                    <EditableContent
                      storageKey="activities:preview"
                      initialValue="Introduce next session's focus on differentiated instruction within curriculum constraints"
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>
                </div>
              </div>

              {/* Concept Check for Activities */}
              {conceptCheck('activities') && (
                <ConceptCheck
                  checkId={conceptCheck('activities')!.id}
                  title={conceptCheck('activities')!.title}
                  prompt={conceptCheck('activities')!.prompt}
                  checkType={conceptCheck('activities')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('activities') ? 'secondary' : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('activities')}
                  disabled={completed.includes('activities')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('activities')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 4: Assessment Methods */}
          {/* ============================================================ */}
          <LessonSection id="assessment" title="4. Assessment Methods">
            <div className="space-y-6">
              {/* Formative Assessment */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Formative Assessment
                </h3>
                <ul className="space-y-2 list-disc list-inside text-slate-700">
                  <li>
                    <EditableContent
                      storageKey="assessment:formative:1"
                      initialValue="Padlet concept map contributions (tracked via timestamps)"
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                  <li>
                    <EditableContent
                      storageKey="assessment:formative:2"
                      initialValue="Mentimeter quiz responses (anonymized analytics)"
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                  <li>
                    <EditableContent
                      storageKey="assessment:formative:3"
                      initialValue="Peer teaching observation checklist (rubric provided to students)"
                      as="span"
                      className="text-slate-700"
                    />
                  </li>
                </ul>
              </CardSection>

              {/* Summative Assessment */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Summative Assessment
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Group Presentation
                    </h4>
                    <EditableContent
                      storageKey="assessment:summative:1"
                      initialValue='15-minute podcast episode critiquing HK curriculum (rubric: Policy Analysis 40%, Practical Application 30%, Creativity 30%)'
                      as="p"
                      className="text-blue-800 text-sm"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Individual Assignment
                    </h4>
                    <EditableContent
                      storageKey="assessment:summative:2"
                      initialValue='800-word policy adaptation essay (rubric: Critical Thinking 50%, Contextualization 30%, Referencing 20%)'
                      as="p"
                      className="text-blue-800 text-sm"
                    />
                  </div>
                </div>
              </CardSection>

              {/* Concept Check */}
              {conceptCheck('assessment') && (
                <ConceptCheck
                  checkId={conceptCheck('assessment')!.id}
                  title={conceptCheck('assessment')!.title}
                  prompt={conceptCheck('assessment')!.prompt}
                  checkType={conceptCheck('assessment')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('assessment') ? 'secondary' : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('assessment')}
                  disabled={completed.includes('assessment')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('assessment')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 5: Constructive Alignment Matrix */}
          {/* ============================================================ */}
          <LessonSection
            id="alignment"
            title="5. Constructive Alignment Matrix"
          >
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-4 py-2.5 text-left font-semibold text-slate-800">
                        Learning Outcome
                      </th>
                      <th className="border border-slate-300 px-4 py-2.5 text-left font-semibold text-slate-800">
                        Teaching Activity
                      </th>
                      <th className="border border-slate-300 px-4 py-2.5 text-left font-semibold text-slate-800">
                        Assessment Method
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row1:outcome"
                          initialValue="Analyze curriculum components"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row1:activity"
                          initialValue="Jigsaw Groups"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row1:assessment"
                          initialValue="Podcast Presentation"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row2:outcome"
                          initialValue="Evaluate pedagogical strategies"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row2:activity"
                          initialValue="Case Study Problem-Solving"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row2:assessment"
                          initialValue="Adaptation Essay"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row3:outcome"
                          initialValue="Adapt standards to diverse contexts"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row3:activity"
                          initialValue="Peer Teaching Feedback"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                      <td className="border border-slate-300 px-4 py-2.5 text-slate-700">
                        <EditableContent
                          storageKey="alignment:row3:assessment"
                          initialValue="Concept Map Mapping"
                          as="span"
                          className="text-slate-700"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Concept Check */}
              {conceptCheck('alignment') && (
                <ConceptCheck
                  checkId={conceptCheck('alignment')!.id}
                  title={conceptCheck('alignment')!.title}
                  prompt={conceptCheck('alignment')!.prompt}
                  checkType={conceptCheck('alignment')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('alignment') ? 'secondary' : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('alignment')}
                  disabled={completed.includes('alignment')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('alignment')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 6: Required Resources & Technology */}
          {/* ============================================================ */}
          <LessonSection
            id="resources"
            title="6. Required Resources & Technology"
          >
            <div className="space-y-4">
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">Software</h3>
                <EditableContent
                  storageKey="resources:software"
                  initialValue="Mentimeter, Padlet, Canva, Google Jamboard"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Physical Materials
                </h3>
                <EditableContent
                  storageKey="resources:physical"
                  initialValue="Printed HKEB curriculum excerpts (with highlighted sections)"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Digital Tools
                </h3>
                <EditableContent
                  storageKey="resources:digital"
                  initialValue="EdCity sandbox environment, HKDSE past papers (2019-2023)"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Concept Check */}
              {conceptCheck('resources') && (
                <ConceptCheck
                  checkId={conceptCheck('resources')!.id}
                  title={conceptCheck('resources')!.title}
                  prompt={conceptCheck('resources')!.prompt}
                  checkType={conceptCheck('resources')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('resources') ? 'secondary' : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('resources')}
                  disabled={completed.includes('resources')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('resources')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 7: Differentiation & Inclusivity */}
          {/* ============================================================ */}
          <LessonSection
            id="differentiation"
            title="7. Differentiation & Inclusivity"
          >
            <div className="space-y-4">
              {/* Advanced Learners */}
              <CardSection>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Advanced Learners</Badge>
                </div>
                <EditableContent
                  storageKey="differentiation:advanced"
                  initialValue="Optional extension: Compare HK curriculum with Singapore's Mother Tongue Language Framework"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Visual Learners */}
              <CardSection>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Visual Learners</Badge>
                </div>
                <EditableContent
                  storageKey="differentiation:visual"
                  initialValue="Provide color-coded curriculum framework diagrams (PDF/AI formats)"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Multilingual Support */}
              <CardSection>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Multilingual Support</Badge>
                </div>
                <EditableContent
                  storageKey="differentiation:multilingual"
                  initialValue="Offer simplified Chinese annotations for HK-specific terminology"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Accessibility */}
              <CardSection>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Accessibility</Badge>
                </div>
                <EditableContent
                  storageKey="differentiation:accessibility"
                  initialValue="Ensure Padlet templates meet WCAG 2.1 standards"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Concept Check */}
              {conceptCheck('differentiation') && (
                <ConceptCheck
                  checkId={conceptCheck('differentiation')!.id}
                  title={conceptCheck('differentiation')!.title}
                  prompt={conceptCheck('differentiation')!.prompt}
                  checkType={conceptCheck('differentiation')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('differentiation')
                      ? 'secondary'
                      : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('differentiation')}
                  disabled={completed.includes('differentiation')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('differentiation')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Section 8: Reflection & Improvement */}
          {/* ============================================================ */}
          <LessonSection
            id="reflection"
            title="8. Reflection & Improvement"
          >
            <div className="space-y-4">
              {/* Success Indicators */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Success Indicators
                </h3>
                <EditableContent
                  storageKey="reflection:success"
                  initialValue="80% post-test score improvement over pre-test, high Padlet participation rates"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Feedback Mechanism */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Feedback Mechanism
                </h3>
                <EditableContent
                  storageKey="reflection:feedback"
                  initialValue="Google Form reflection survey with open-response questions"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Future Modifications */}
              <CardSection>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Future Modifications
                </h3>
                <EditableContent
                  storageKey="reflection:future"
                  initialValue="Incorporate more school-based case studies (request from previous cohort feedback)"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Discussion for reflection */}
              {timeframeDiscussion && (
                <Discussion
                  discussionId={timeframeDiscussion.discussion.id}
                  title={timeframeDiscussion.discussion.title}
                  description={timeframeDiscussion.discussion.description}
                  posts={timeframeDiscussion.posts.map((p) => ({
                    id: p.id,
                    parentId: p.parentPostId,
                    authorId: p.authorId,
                    authorName: p.authorDisplayName || p.authorUsername || '',
                    content: p.content,
                    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
                  }))}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              {/* Concept Check */}
              {conceptCheck('reflection') && (
                <ConceptCheck
                  checkId={conceptCheck('reflection')!.id}
                  title={conceptCheck('reflection')!.title}
                  prompt={conceptCheck('reflection')!.prompt}
                  checkType={conceptCheck('reflection')!.checkType as 'thumbs' | 'scale' | 'text'}
                  userId={userId}
                  userRole={userRole}
                />
              )}

              <div className="pt-2">
                <Button
                  variant={
                    completed.includes('reflection') ? 'secondary' : 'default'
                  }
                  size="sm"
                  onClick={() => handleMarkComplete('reflection')}
                  disabled={completed.includes('reflection')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completed.includes('reflection')
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </LessonSection>

          {/* ============================================================ */}
          {/* Material Generation */}
          {/* ============================================================ */}
          <LessonSection id="materials" title="Material Generation">
            <div className="space-y-4">
              {/* Concept Map */}
              <CardSection className="border-l-4 border-l-blue-400">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Concept Map
                </h3>
                <EditableContent
                  storageKey="materials:concept-map"
                  initialValue="HK Curriculum Components and Student-Generated Links"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Problem Solving Case Study */}
              <CardSection className="border-l-4 border-l-amber-400">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Problem Solving Case Study
                </h3>
                <EditableContent
                  storageKey="materials:case-study"
                  initialValue="Budget Allocation Constraints in Sham Shui Po Schools (2024 Update)"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>

              {/* Podcast Rubric Template */}
              <CardSection className="border-l-4 border-l-emerald-400">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Podcast Rubric Template
                </h3>
                <EditableContent
                  storageKey="materials:podcast-rubric"
                  initialValue="Curriculum Critique Structure"
                  as="p"
                  className="text-slate-700"
                />
              </CardSection>
            </div>
          </LessonSection>
        </div>
      </div>
    </ScrollRootProvider>
  );
}
