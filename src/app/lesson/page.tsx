'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Flashcard from '@/components/learning/Flashcard';
import ScenarioQuiz from '@/components/learning/ScenarioQuiz';
import VideoPlayer from '@/components/media/VideoPlayer';
import { ScrollRootProvider, useScrollRoot } from '@/contexts';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { getDiscussions, getDiscussion } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { CheckCircle2, BookOpen, Clock, Users, Lightbulb, FileText, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuizData {
  id: number;
  storageKey: string;
  title: string;
  questions: {
    id: number;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'short_answer';
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

interface DiscussionData {
  id: number;
  storageKey: string;
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

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
  sectionKey: string | null;
}

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'development', label: 'Activities' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'materials', label: 'Materials' },
];

const ALL_SECTION_KEYS = [
  'ilos',
  'preclass',
  'introduction',
  'lecture',
  'case-study',
  'flashcards',
  'peer-teaching',
  'formative',
  'scaffolding',
  'synthesis',
  'assessment',
  'alignment',
  'resources',
  'differentiation',
  'reflection',
  'materials',
];

// ---------------------------------------------------------------------------
// Flashcard data
// ---------------------------------------------------------------------------

const FLASHCARD_DATA = [
  { front: 'Assimilation', back: 'Fitting new information into existing schemas' },
  { front: 'Accommodation', back: 'Modifying existing schemas to incorporate new information' },
  { front: 'Scaffolding', back: 'Temporary support provided by a more knowledgeable other' },
  { front: 'Zone of Proximal Development (ZPD)', back: 'The gap between what a learner can do independently and what they can do with help' },
  { front: 'Social Constructivism', back: 'Learning occurs through social interaction and collaboration' },
  { front: 'Cognitive Constructivism', back: 'Learning is an internal process of constructing knowledge' },
  { front: 'More Knowledgeable Other (MKO)', back: 'Anyone with more understanding than the learner' },
  { front: 'Disequilibrium', back: 'Cognitive conflict that occurs when new information contradicts existing schemas' },
  { front: 'Equilibration', back: 'The process of balancing assimilation and accommodation' },
  { front: 'Internalisation', back: 'The process of absorbing knowledge from social interactions' },
  { front: 'Collaborative Learning', back: 'Learning through working together toward a shared goal' },
  { front: 'Discovery Learning', back: 'Learner discovers ideas through exploration and problem-solving' },
  { front: 'Schema', back: 'Mental framework for understanding and organising information' },
  { front: 'Mediated Learning', back: 'Learning assisted by tools, symbols, or more knowledgeable others' },
  { front: 'Constructivism', back: 'Theory that learners actively construct their own understanding' },
];

// ---------------------------------------------------------------------------
// Mark Complete button
// ---------------------------------------------------------------------------

function MarkCompleteButton({
  sectionKey,
  userId,
  isComplete,
  onMarked,
}: {
  sectionKey: string;
  userId: number;
  isComplete: boolean;
  onMarked: (key: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await markSectionComplete(userId, sectionKey);
    if (result.success) {
      onMarked(sectionKey);
    }
    setLoading(false);
  }

  if (isComplete) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Completed</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-1.5 text-xs"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {loading ? 'Saving...' : 'Mark Complete'}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Scrollable content area with scrollRootRef
// ---------------------------------------------------------------------------

function LessonContent({
  quizzes,
  discussions,
  conceptChecks,
  progressMap,
  onMarked,
}: {
  quizzes: Map<string, QuizData>;
  discussions: Map<string, DiscussionData>;
  conceptChecks: Map<string, ConceptCheckData>;
  progressMap: Map<string, boolean>;
  onMarked: (key: string) => void;
}) {
  const scrollRootRef = useScrollRoot();
  const { user } = useUser();
  const userId = user?.userId ?? 0;
  const userRole = user?.role ?? 'STUDENT';

  // Helper to find a concept check by storageKey
  function findCheck(storageKey: string): ConceptCheckData | null {
    return conceptChecks.get(storageKey) ?? null;
  }

  // Helper to find a quiz by storageKey
  function findQuiz(storageKey: string): QuizData | null {
    return quizzes.get(storageKey) ?? null;
  }

  // Helper to find a discussion by storageKey
  function findDiscussion(storageKey: string): DiscussionData | null {
    return discussions.get(storageKey) ?? null;
  }

  // Helper to render a ConceptCheck if found, otherwise a placeholder
  function renderConceptCheck(storageKey: string, title: string, prompt: string) {
    const check = findCheck(storageKey);
    if (check) {
      return (
        <ConceptCheck
          checkId={check.id}
          title={check.title}
          prompt={check.prompt}
          checkType={check.checkType as 'thumbs' | 'scale' | 'text'}
          userId={userId}
          userRole={userRole}
        />
      );
    }
    // Fallback: render with placeholder checkId 0 (will not submit correctly until seeded)
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="font-medium text-sm text-slate-800">{title}</p>
          <p className="text-sm text-slate-600">{prompt}</p>
          <p className="text-xs text-muted-foreground italic">Concept check will be available once configured.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to render a Quiz if found
  function renderQuiz(storageKey: string) {
    const quiz = findQuiz(storageKey);
    if (quiz && quiz.questions.length > 0) {
      return (
        <Quiz
          quizId={quiz.id}
          title={quiz.title}
          questions={quiz.questions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            explanation: q.explanation,
            answers: q.answers,
          }))}
          userId={userId}
        />
      );
    }
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground italic">Quiz will be available once configured.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to render a Discussion if found
  function renderDiscussion(storageKey: string) {
    const disc = findDiscussion(storageKey);
    if (disc) {
      return (
        <Discussion
          discussionId={disc.id}
          title={disc.title}
          description={disc.description}
          posts={disc.posts}
          userId={userId}
          userRole={userRole}
        />
      );
    }
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground italic">Discussion will be available once configured.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage
  const completedCount = ALL_SECTION_KEYS.filter((k) => progressMap.get(k) === true).length;
  const progressPercent = Math.round((completedCount / ALL_SECTION_KEYS.length) * 100);

  return (
    <div ref={scrollRootRef} className="flex-1 overflow-y-auto">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Lesson Progress</span>
          <Progress value={progressPercent} className="flex-1" />
          <span className="text-sm text-slate-500 whitespace-nowrap">
            {progressPercent}% ({completedCount}/{ALL_SECTION_KEYS.length})
          </span>
        </div>
      </div>

      <div className="space-y-8 pb-16">
        {/* ================================================================= */}
        {/* Section 1: ILOs                                                    */}
        {/* ================================================================= */}
        <LessonSection id="ilos" title="Intended Learning Outcomes" badge="90 min">
          <div className="space-y-6">
            {/* ILOs */}
            <div className="space-y-3">
              {[
                {
                  storageKey: 'ilo-1',
                  text: 'Analyze fundamental differences between cognitive and social constructivism through comparative frameworks',
                },
                {
                  storageKey: 'ilo-2',
                  text: 'Evaluate the practical applications of Vygotsky\'s ZPD and Piaget\'s assimilation/accommodation in educational settings',
                },
                {
                  storageKey: 'ilo-3',
                  text: 'Create a concept map demonstrating relationships between constructivist principles and teaching practices',
                },
                {
                  storageKey: 'ilo-4',
                  text: 'Apply scaffolding strategies to hypothetical classroom scenarios',
                },
              ].map((ilo, i) => (
                <div key={ilo.storageKey} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <EditableContent storageKey={ilo.storageKey} initialValue={ilo.text} as="p" className="text-slate-700 text-sm leading-relaxed" />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Concept Check: ILO Understanding */}
            {renderConceptCheck('cc:ilo-understanding', 'ILO Understanding', 'Do you understand the learning outcomes?')}

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="ilos" userId={userId} isComplete={progressMap.get('ilos') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 2: Pre-Class Preparation                                   */}
        {/* ================================================================= */}
        <LessonSection id="preclass" title="Pre-Class Preparation" badge="Homework">
          <div className="space-y-6">
            {/* Reading list */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Required Readings
              </h3>
              <div className="space-y-3">
                <CardSection>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      1
                    </span>
                    <EditableContent
                      storageKey="reading-1"
                      initialValue="Excerpt from Vygotsky's 'Mind in Society' (pp. 75-82) on Zone of Proximal Development"
                      as="p"
                      className="text-slate-700 text-sm leading-relaxed"
                    />
                  </div>
                </CardSection>
                <CardSection>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      2
                    </span>
                    <EditableContent
                      storageKey="reading-2"
                      initialValue="Piaget's Cognitive Development Theory summary (McInerney & McInerney, 2015)"
                      as="p"
                      className="text-slate-700 text-sm leading-relaxed"
                    />
                  </div>
                </CardSection>
              </div>
            </div>

            <Separator />

            {/* Video */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Video Resource
              </h3>
              <VideoPlayer
                title="How kids learn through social interaction"
                videoId="dQw4w9WgXcQ"
                duration="8 min"
              />
            </div>

            <Separator />

            {/* Pre-Test Quiz */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pre-Test Quiz
              </h3>
              {renderQuiz('quiz:pre-test')}
            </div>

            <Separator />

            {/* Guiding Questions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Guiding Questions
              </h3>
              <CardSection>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <EditableContent
                      storageKey="guiding-q-1"
                      initialValue="What role does the teacher play in each theory?"
                      as="p"
                      className="text-slate-700 text-sm leading-relaxed"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <EditableContent
                      storageKey="guiding-q-2"
                      initialValue="How do cognitive and social approaches differ in explaining learning struggles?"
                      as="p"
                      className="text-slate-700 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </CardSection>
            </div>

            {/* Discussion for Guiding Questions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Discussion: Guiding Questions
              </h3>
              {renderDiscussion('discussion:guiding-questions')}
            </div>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="preclass" userId={userId} isComplete={progressMap.get('preclass') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 3: Teaching & Learning Activities                          */}
        {/* ================================================================= */}
        <LessonSection id="development" title="Teaching & Learning Activities" badge="66 min">
          <div className="space-y-8">
            {/* ---- 3a: Introduction ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="introduction" className="text-lg font-semibold text-slate-800 scroll-mt-20">Introduction</h3>
                  <Badge variant="outline" className="text-xs">Opening</Badge>
                </div>

                <EditableContent
                  storageKey="activity-hook"
                  initialValue="Hook: Show classroom video scenario A (lectures) vs B (group activities), ask: 'Which approach aligns with constructivism?'"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <EditableContent
                  storageKey="activity-pretest-review"
                  initialValue="Pre-Test Review: Use Mentimeter poll to display pre-class quiz results, address common misconceptions"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <EditableContent
                  storageKey="activity-realworld"
                  initialValue="Real-World Connection: Discuss current education trends (maker spaces, peer tutoring) with constructivist foundations"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                {renderConceptCheck('cc:constructivism-understanding', 'Constructivism Understanding', 'Do you understand the key constructivist concepts?')}

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="introduction" userId={userId} isComplete={progressMap.get('introduction') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>

            {/* ---- 3b: Interactive Lecture ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="lecture" className="text-lg font-semibold text-slate-800 scroll-mt-20">Interactive Lecture</h3>
                  <Badge variant="outline" className="text-xs">Theory</Badge>
                </div>

                <EditableContent
                  storageKey="activity-animated-diagram"
                  initialValue="Animated diagram comparing cognitive vs social constructivism axes"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Discussion: Think-Pair-Share</h4>
                  {renderDiscussion('discussion:think-pair-share')}
                </div>

                {renderConceptCheck('cc:theory-comparison', 'Theory Comparison', 'Can you distinguish between cognitive and social constructivism?')}

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="lecture" userId={userId} isComplete={progressMap.get('lecture') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>

            {/* ---- 3c: Case Study Analysis ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="case-study" className="text-lg font-semibold text-slate-800 scroll-mt-20">Case Study Analysis</h3>
                  <Badge variant="outline" className="text-xs">Application</Badge>
                </div>

                <EditableContent
                  storageKey="activity-case-study-1"
                  initialValue="Small groups analyze 3 classroom scenarios"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <EditableContent
                  storageKey="activity-case-study-2"
                  initialValue="Structured Prompt: 'Apply ZPD and Piagetian adaptation to create intervention strategies'"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <ScenarioQuiz />

                {renderConceptCheck('cc:case-study', 'Case Study Comprehension', 'Can you apply constructivist principles to classroom scenarios?')}

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="case-study" userId={userId} isComplete={progressMap.get('case-study') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>

            {/* ---- 3d: Digital Flashcards ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="flashcards" className="text-lg font-semibold text-slate-800 scroll-mt-20">Digital Flashcards</h3>
                  <Badge variant="outline" className="text-xs">Vocabulary</Badge>
                </div>

                <p className="text-sm text-slate-600">
                  Review the 15 key terms for this lesson. Click each card to reveal the definition.
                </p>

                <Flashcard cards={FLASHCARD_DATA} />

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="flashcards" userId={userId} isComplete={progressMap.get('flashcards') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>

            {/* ---- 3e: Peer Teaching ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="peer-teaching" className="text-lg font-semibold text-slate-800 scroll-mt-20">Peer Teaching</h3>
                  <Badge variant="outline" className="text-xs">Collaboration</Badge>
                </div>

                <EditableContent
                  storageKey="activity-peer-teaching-1"
                  initialValue="Groups create 3-minute mini-lessons demonstrating constructivist methods"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <EditableContent
                  storageKey="activity-peer-teaching-2"
                  initialValue="Present using whiteboards how you'd teach a concept using scaffolding"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                {renderDiscussion('discussion:peer-teaching')}

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="peer-teaching" userId={userId} isComplete={progressMap.get('peer-teaching') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>

            {/* ---- 3f: Formative Assessment ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="formative" className="text-lg font-semibold text-slate-800 scroll-mt-20">Formative Assessment</h3>
                  <Badge variant="outline" className="text-xs">Check</Badge>
                </div>

                {renderQuiz('quiz:formative')}

                {renderConceptCheck('cc:formative-check', 'Formative Check', 'How confident are you in your understanding?')}

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="formative" userId={userId} isComplete={progressMap.get('formative') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>

            {/* ---- 3g: Scaffolding Strategies ---- */}
            <CardSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 id="scaffolding" className="text-lg font-semibold text-slate-800 scroll-mt-20">Scaffolding Strategies</h3>
                  <Badge variant="outline" className="text-xs">Support</Badge>
                </div>

                <EditableContent
                  storageKey="activity-scaffolding-1"
                  initialValue="Provide concept map template with core constructs pre-filled"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <EditableContent
                  storageKey="activity-scaffolding-2"
                  initialValue="Worked example of scaffolding sequence from Vygotsky study"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <EditableContent
                  storageKey="activity-scaffolding-3"
                  initialValue="Chunk theory into 'individual cognition' vs 'social context' modules"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                  multiline
                />

                <div className="flex justify-end">
                  <MarkCompleteButton sectionKey="scaffolding" userId={userId} isComplete={progressMap.get('scaffolding') === true} onMarked={onMarked} />
                </div>
              </div>
            </CardSection>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 4: Synthesis & Closure                                     */}
        {/* ================================================================= */}
        <LessonSection id="synthesis" title="Synthesis & Closure" badge="12 min">
          <div className="space-y-6">
            {/* Post-Test Quiz */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Post-Test Quiz</h3>
              {renderQuiz('quiz:post-test')}
            </div>

            <Separator />

            {/* Concept Checks */}
            <div className="space-y-4">
              {renderConceptCheck('cc:confidence-rating', 'Confidence Rating', 'Rate your confidence applying these theories (1-5)')}
              {renderConceptCheck('cc:exit-ticket', 'Exit Ticket', 'One question I still have about constructivism')}
            </div>

            <Separator />

            {/* Guided Reflection */}
            <CardSection>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800">Guided Reflection</h4>
                <EditableContent
                  storageKey="synthesis-reflection"
                  initialValue="What surprised you most about your understanding after class?"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                />
              </div>
            </CardSection>

            {/* Preview of Next Session */}
            <CardSection>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800">Next Session Preview</h4>
                <EditableContent
                  storageKey="synthesis-preview"
                  initialValue="Connect to next session on 'Digital Learning & Constructivism' by showing MinecraftEDU example"
                  as="p"
                  className="text-slate-700 text-sm leading-relaxed"
                />
              </div>
            </CardSection>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="synthesis" userId={userId} isComplete={progressMap.get('synthesis') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 5: Assessment Methods                                      */}
        {/* ================================================================= */}
        <LessonSection id="assessment" title="Assessment Methods">
          <div className="space-y-6">
            <Tabs defaultValue="formative" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="formative" className="flex-1">Formative</TabsTrigger>
                <TabsTrigger value="summative" className="flex-1">Summative</TabsTrigger>
              </TabsList>
              <TabsContent value="formative" className="mt-4">
                <CardSection>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800">Formative Assessment Methods</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="assessment-formative-1"
                          initialValue="Mentimeter poll for real-time feedback on understanding"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="assessment-formative-2"
                          initialValue="Concept map peer evaluation (3-point scale)"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="assessment-formative-3"
                          initialValue="Exit ticket: one question I still have about constructivism"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                    </ul>
                  </div>
                </CardSection>
              </TabsContent>
              <TabsContent value="summative" className="mt-4">
                <CardSection>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800">Summative Assessment</h4>
                    <div className="space-y-2">
                      <EditableContent
                        storageKey="assessment-summative-1"
                        initialValue="Take-home assignment with rubric (A/B/C criteria)"
                        as="p"
                        className="text-slate-700 text-sm leading-relaxed"
                      />
                      <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Rubric Criteria</h5>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant="default" className="text-xs shrink-0">A</Badge>
                            <EditableContent
                              storageKey="rubric-criteria-a"
                              initialValue="Demonstrates deep understanding of both cognitive and social constructivism with nuanced application"
                              as="span"
                              className="text-xs text-slate-700"
                            />
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="text-xs shrink-0">B</Badge>
                            <EditableContent
                              storageKey="rubric-criteria-b"
                              initialValue="Shows clear understanding of key concepts with appropriate application to scenarios"
                              as="span"
                              className="text-xs text-slate-700"
                            />
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">C</Badge>
                            <EditableContent
                              storageKey="rubric-criteria-c"
                              initialValue="Identifies basic concepts but lacks depth in application or comparison"
                              as="span"
                              className="text-xs text-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardSection>
              </TabsContent>
            </Tabs>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="assessment" userId={userId} isComplete={progressMap.get('assessment') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 6: Constructive Alignment Matrix                           */}
        {/* ================================================================= */}
        <LessonSection id="alignment" title="Constructive Alignment Matrix">
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">Learning Outcome</th>
                    <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">Teaching Activity</th>
                    <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">Assessment Method</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-outcome-1"
                        initialValue="Analyze fundamental differences between cognitive and social constructivism"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-activity-1"
                        initialValue="Interactive lecture with animated comparison diagram; Think-Pair-Share discussion"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-assessment-1"
                        initialValue="Pre-test quiz; Formative quiz; Concept check thumbs"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-outcome-2"
                        initialValue="Evaluate practical applications of Vygotsky's ZPD and Piaget's assimilation/accommodation"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-activity-2"
                        initialValue="Case study analysis with structured prompts; Scenario-based quiz"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-assessment-2"
                        initialValue="Scenario quiz score; Case study concept check; Peer evaluation"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-outcome-3"
                        initialValue="Create a concept map demonstrating relationships between constructivist principles and teaching practices"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-activity-3"
                        initialValue="Scaffolding strategies with concept map template; Digital flashcards for vocabulary"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-assessment-3"
                        initialValue="Concept map peer evaluation (3-point scale); Post-test quiz"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-outcome-4"
                        initialValue="Apply scaffolding strategies to hypothetical classroom scenarios"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-activity-4"
                        initialValue="Peer teaching mini-lessons; Group whiteboard presentations using scaffolding"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 align-top">
                      <EditableContent
                        storageKey="alignment-assessment-4"
                        initialValue="Take-home assignment with rubric; Exit ticket reflection"
                        as="span"
                        className="text-sm"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="alignment" userId={userId} isComplete={progressMap.get('alignment') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 7: Required Resources                                      */}
        {/* ================================================================= */}
        <LessonSection id="resources" title="Required Resources">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LMS Tools */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">LMS</Badge>
                    LMS Tools
                  </h4>
                  <EditableContent
                    storageKey="resources-lms"
                    initialValue="Moodle quiz module, Discussion forum, Grade book, Turnitin for assignment submission"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Presentation */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Slides</Badge>
                    Presentation
                  </h4>
                  <EditableContent
                    storageKey="resources-presentation"
                    initialValue="Animated comparison diagram (cognitive vs social constructivism), Video scenario clips A and B, Mentimeter integration slides"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Interactive Platforms */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Interactive</Badge>
                    Interactive Platforms
                  </h4>
                  <EditableContent
                    storageKey="resources-interactive"
                    initialValue="Mentimeter (polls), Padlet (collaborative boards), Kahoot (quiz review), Digital flashcard tool"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Physical Materials */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Physical</Badge>
                    Physical Materials
                  </h4>
                  <EditableContent
                    storageKey="resources-physical"
                    initialValue="A3 paper for concept maps, Coloured markers, Whiteboard and markers for group presentations, Printed scenario cards (3 per group)"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>
            </div>

            {/* References */}
            <CardSection>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800">References</h4>
                <div className="space-y-2">
                  <EditableContent
                    storageKey="reference-1"
                    initialValue="Vygotsky, L. S. (1978). Mind in Society: The Development of Higher Psychological Processes. Harvard University Press."
                    as="p"
                    className="text-slate-700 text-xs leading-relaxed"
                  />
                  <EditableContent
                    storageKey="reference-2"
                    initialValue="Piaget, J. (1970). Science of Education and the Psychology of the Child. Orion Press."
                    as="p"
                    className="text-slate-700 text-xs leading-relaxed"
                  />
                  <EditableContent
                    storageKey="reference-3"
                    initialValue="McInerney, D. M., & McInerney, V. (2015). Educational Psychology: Constructing Learning. Pearson."
                    as="p"
                    className="text-slate-700 text-xs leading-relaxed"
                  />
                </div>
              </div>
            </CardSection>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="resources" userId={userId} isComplete={progressMap.get('resources') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 8: Differentiation & Inclusivity                           */}
        {/* ================================================================= */}
        <LessonSection id="differentiation" title="Differentiation & Inclusivity">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Multimodal Materials */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Multimodal Materials</h4>
                  <EditableContent
                    storageKey="differentiation-multimodal"
                    initialValue="Video clips with captions, Audio summaries of key readings, Visual concept map templates, Tactile manipulatives for schema-building activities"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Extension Activities */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Extension Activities</h4>
                  <EditableContent
                    storageKey="differentiation-extension"
                    initialValue="Advanced scenario: Design a constructivist lesson plan for a challenging topic, Research critique: Compare Vygotsky and Piaget on language and thought, Create a digital mind map linking all key concepts"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Accommodations */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Accommodations</h4>
                  <EditableContent
                    storageKey="differentiation-accommodations"
                    initialValue="Extended time for quizzes and reflections, Simplified scenario cards with glossary, Peer note-taking support, Alternative assessment formats (oral, visual, written)"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Cultural Consideration */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Cultural Consideration</h4>
                  <EditableContent
                    storageKey="differentiation-cultural"
                    initialValue="Include examples from diverse educational contexts (Asian, African, Indigenous pedagogies), Acknowledge collectivist vs individualist learning traditions, Discuss how social constructivism relates to communal learning practices"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>
            </div>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="differentiation" userId={userId} isComplete={progressMap.get('differentiation') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 9: Reflection & Improvement                                */}
        {/* ================================================================= */}
        <LessonSection id="reflection" title="Reflection & Improvement">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Success Metrics */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Success Metrics</h4>
                  <EditableContent
                    storageKey="reflection-metrics"
                    initialValue="80% of students score above 70% on post-test, Concept maps show at least 5 valid connections between theories, All students contribute at least one discussion post, Exit tickets show reduced confusion about key terms"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Feedback Mechanisms */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Feedback Mechanisms</h4>
                  <EditableContent
                    storageKey="reflection-feedback"
                    initialValue="Mentimeter real-time polling, Concept check thumbs/scale/text responses, Post-lesson survey (Likert scale), Peer feedback during group activities"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>

              {/* Future Improvements */}
              <CardSection>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Future Improvements</h4>
                  <EditableContent
                    storageKey="reflection-improvements"
                    initialValue="Add MinecraftEDU or SimCityEDU hands-on activity, Integrate peer assessment rubric for mini-lessons, Develop video case studies featuring local classrooms, Create online discussion board for asynchronous reflection"
                    as="p"
                    className="text-slate-700 text-sm leading-relaxed"
                    multiline
                  />
                </div>
              </CardSection>
            </div>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="reflection" userId={userId} isComplete={progressMap.get('reflection') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>

        {/* ================================================================= */}
        {/* Section 10: Materials                                              */}
        {/* ================================================================= */}
        <LessonSection id="materials" title="Materials">
          <div className="space-y-4">
            <Tabs defaultValue="preclass-links" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="preclass-links" className="flex-1">Pre-Class Links</TabsTrigger>
                <TabsTrigger value="interactive-tools" className="flex-1">Interactive Tools</TabsTrigger>
                <TabsTrigger value="case-studies" className="flex-1">Case Studies</TabsTrigger>
              </TabsList>

              <TabsContent value="preclass-links" className="mt-4">
                <CardSection>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800">Pre-Class Materials</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-preclass-1"
                          initialValue="Vygotsky 'Mind in Society' reading excerpt (pp. 75-82)"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-preclass-2"
                          initialValue="Piaget Cognitive Development Theory summary (McInerney & McInerney, 2015)"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-preclass-3"
                          initialValue="Video: 'How kids learn through social interaction' (8 min)"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-preclass-4"
                          initialValue="Pre-test quiz (LMS)"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                    </ul>
                  </div>
                </CardSection>
              </TabsContent>

              <TabsContent value="interactive-tools" className="mt-4">
                <CardSection>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800">Interactive Tools Used in Class</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-interactive-1"
                          initialValue="Mentimeter - real-time polls and word clouds"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-interactive-2"
                          initialValue="Digital flashcards - 15 key constructivist terms"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-interactive-3"
                          initialValue="Scenario-based quiz - classroom diagnostic scenarios"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <EditableContent
                          storageKey="material-interactive-4"
                          initialValue="Padlet - collaborative concept mapping"
                          as="span"
                          className="text-sm"
                        />
                      </li>
                    </ul>
                  </div>
                </CardSection>
              </TabsContent>

              <TabsContent value="case-studies" className="mt-4">
                <CardSection>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800">Non-Interactive Case Study Scenarios</h4>
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Scenario 1</p>
                        <EditableContent
                          storageKey="case-scenario-1"
                          initialValue="Mr. Tan delivers a 60-minute lecture on photosynthesis with no student interaction. Students copy notes verbatim. On the test, most cannot explain why leaves turn yellow in autumn."
                          as="p"
                          className="text-slate-700 text-sm leading-relaxed"
                        />
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Scenario 2</p>
                        <EditableContent
                          storageKey="case-scenario-2"
                          initialValue="A teacher assigns a group project but lets students work entirely independently with no guidance. Struggling students fall further behind while advanced students do all the work."
                          as="p"
                          className="text-slate-700 text-sm leading-relaxed"
                        />
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Scenario 3</p>
                        <EditableContent
                          storageKey="case-scenario-3"
                          initialValue="Ms. Rivera introduces fractions by immediately teaching the algorithm for addition. Students can compute answers but cannot explain what a fraction represents or draw one."
                          as="p"
                          className="text-slate-700 text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                </CardSection>
              </TabsContent>
            </Tabs>

            {/* Mark Complete */}
            <div className="flex justify-end">
              <MarkCompleteButton sectionKey="materials" userId={userId} isComplete={progressMap.get('materials') === true} onMarked={onMarked} />
            </div>
          </div>
        </LessonSection>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function LessonPage() {
  const { user } = useUser();
  const userId = user?.userId ?? 0;

  // Data state
  const [quizzes, setQuizzes] = useState<Map<string, QuizData>>(new Map());
  const [discussionsMap, setDiscussionsMap] = useState<Map<string, DiscussionData>>(new Map());
  const [conceptChecksMap, setConceptChecksMap] = useState<Map<string, ConceptCheckData>>(new Map());
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        // Load all data in parallel
        const [quizzesResult, discussionsResult, checksResult, progressResult] = await Promise.all([
          getAllQuizzes(),
          getDiscussions(),
          getConceptChecks(),
          getStudentProgress(userId),
        ]);

        // Process quizzes
        const quizMap = new Map<string, QuizData>();
        if (quizzesResult.success && quizzesResult.data) {
          // For each quiz, get full data with questions
          await Promise.all(
            quizzesResult.data.map(async (quiz) => {
              const fullQuiz = await getQuiz(quiz.id);
              if (fullQuiz.success && fullQuiz.data) {
                quizMap.set(quiz.storageKey, {
                  id: fullQuiz.data.quiz.id,
                  storageKey: quiz.storageKey,
                  title: fullQuiz.data.quiz.title,
                  questions: fullQuiz.data.questions.map((q) => ({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                    explanation: q.explanation,
                    answers: q.answers.map((a) => ({
                      id: a.id,
                      answerText: a.answerText,
                      isCorrect: a.isCorrect,
                    })),
                  })),
                });
              }
            })
          );
        }
        setQuizzes(quizMap);

        // Process discussions
        const discMap = new Map<string, DiscussionData>();
        if (discussionsResult.success && discussionsResult.data) {
          await Promise.all(
            discussionsResult.data.map(async (disc) => {
              const fullDisc = await getDiscussion(disc.id);
              if (fullDisc.success && fullDisc.data) {
                discMap.set(disc.storageKey, {
                  id: fullDisc.data.discussion.id,
                  storageKey: disc.storageKey,
                  title: fullDisc.data.discussion.title,
                  description: fullDisc.data.discussion.description,
                  posts: fullDisc.data.posts.map((p) => ({
                    id: p.id,
                    parentId: p.parentPostId,
                    authorId: p.authorId,
                    authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                    content: p.content,
                    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
                  })),
                });
              }
            })
          );
        }
        setDiscussionsMap(discMap);

        // Process concept checks
        const checkMap = new Map<string, ConceptCheckData>();
        if (checksResult.success && checksResult.data) {
          for (const check of checksResult.data) {
            checkMap.set(check.storageKey, {
              id: check.id,
              storageKey: check.storageKey,
              title: check.title,
              prompt: check.prompt,
              checkType: check.checkType as 'thumbs' | 'scale' | 'text',
              sectionKey: check.sectionKey,
            });
          }
        }
        setConceptChecksMap(checkMap);

        // Process progress
        const pMap = new Map<string, boolean>();
        if (progressResult.success && progressResult.data) {
          for (const record of progressResult.data) {
            pMap.set(record.sectionKey, record.completed);
          }
        }
        setProgressMap(pMap);
      } catch (error) {
        console.error('Failed to load lesson data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, userId]);

  // Handle section marked complete
  const handleMarked = useCallback((sectionKey: string) => {
    setProgressMap((prev) => {
      const next = new Map(prev);
      next.set(sectionKey, true);
      return next;
    });
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <ScrollRootProvider>
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Sidebar navigation */}
              <LessonSideMenu sections={SECTIONS} />

              {/* Main content */}
              {loading ? (
                <div className="flex-1 space-y-6">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-60 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-80 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                </div>
              ) : (
                <LessonContent
                  quizzes={quizzes}
                  discussions={discussionsMap}
                  conceptChecks={conceptChecksMap}
                  progressMap={progressMap}
                  onMarked={handleMarked}
                />
              )}
            </div>
          </main>
        </ScrollRootProvider>
      </div>
    </AuthGuard>
  );
}
