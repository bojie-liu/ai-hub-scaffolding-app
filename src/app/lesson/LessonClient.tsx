'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import Flashcard from '@/components/learning/Flashcard';
import ScenarioQuiz from '@/components/learning/ScenarioQuiz';
import VideoPlayer from '@/components/media/VideoPlayer';
import { useUser } from '@/contexts/UserContext';
import { markSectionComplete } from '@/lib/actions/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, BookOpen, Users, Clock, Target, Lightbulb, Brain, MessageSquare, PenTool, Coffee, BarChart3, AlignLeft, FolderOpen, Heart, RefreshCw, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  questionOrder: number;
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean; answerOrder: number }[];
}

interface QuizData {
  quiz: { id: number; title: string; description: string | null; quizType: string };
  questions: QuizQuestion[];
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

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null };
  creator: { id: number; username: string; displayName: string | null } | null;
  posts: {
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
}

interface LessonClientProps {
  pretest: QuizData | null;
  formative: QuizData | null;
  posttest: QuizData | null;
  conceptChecks: ConceptCheckData[];
  discussion: DiscussionData | null;
}

// --- Section definitions for side menu ---
const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'development', label: 'Activities' },
  { id: 'lecture', label: 'Lecture' },
  { id: 'case-analysis', label: 'Case Analysis' },
  { id: 'jigsaw', label: 'Jigsaw' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'break', label: 'Break' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
];

export default function LessonClient({ pretest, formative, posttest, conceptChecks, discussion }: LessonClientProps) {
  const { user, isGuest } = useUser();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const handleMarkComplete = useCallback(async (sectionKey: string) => {
    if (!user || isGuest) return;
    setCompletedSections((prev) => new Set(prev).add(sectionKey));
    try {
      await markSectionComplete(user.userId, sectionKey);
      toast.success('Section marked complete');
    } catch {
      // Optimistic update already applied
    }
  }, [user, isGuest]);

  const isTeacher = user?.role === 'TEACHER';

  // Find concept checks by section
  const getConceptCheck = (sectionKey: string) => conceptChecks.find((c) => c.sectionKey === sectionKey);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Side Menu */}
          <LessonSideMenu sections={SECTIONS} />

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-8 pb-16">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-8 w-8" />
                <EditableContent storageKey="lesson:title" initialValue="3-Hour Lesson Plan: Cognitive and Social Constructivism Theory" as="h1" className="text-3xl font-bold" />
              </div>
              <div className="flex flex-wrap gap-4 text-blue-100 text-sm">
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Introduction to Educational Psychology</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> First-year undergraduates (90 students)</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 3 hours</span>
              </div>
            </div>

            {/* 1. ILOs */}
            <section id="ilos" className="scroll-mt-20">
              <LessonSection id="ilos-inner" title="1. Intended Learning Outcomes (ILOs)" badge="Outcomes">
                <p className="text-muted-foreground mb-4">By the end of this session, students will be able to:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-blue-800">ILO 1:</span>{' '}
                      <EditableContent storageKey="lesson:ilo1" initialValue="Analyze the core principles of cognitive and social constructivism using comparative frameworks." />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Target className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-indigo-800">ILO 2:</span>{' '}
                      <EditableContent storageKey="lesson:ilo2" initialValue="Distinguish between Piagetian schema theory and Vygotskian sociocultural theory in shaping learning processes." />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <Target className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-violet-800">ILO 3:</span>{' '}
                      <EditableContent storageKey="lesson:ilo3" initialValue="Apply constructivist principles to design a lesson plan structure for elementary education." />
                    </div>
                  </div>
                </div>
              </LessonSection>
            </section>

            {/* 2. Pre-Class Preparation */}
            <section id="preclass" className="scroll-mt-20">
              <LessonSection id="preclass-inner" title="2. Pre-Class Preparation" badge="Before Class">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Materials</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:preclass-reading" initialValue="Textbook reading: Educational Psychology: Theory into Practice (Slavin, 2023), pp. 88–112 (Constructivist Frameworks)" />
                      </li>
                      <li className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>Video lecture (12 min): </span>
                        <a href="https://example.com/constructivism" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Constructivism Explained</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:preclass-quiz" initialValue="Pre-Test: 5-item quiz on LMS (Quiz: Piaget and Vygotsky Concepts) assessing prior knowledge of assimilation, accommodation, and zone of proximal development (ZPD)." />
                      </li>
                    </ul>
                  </div>

                  {/* Video player */}
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-3">Video Lecture</h4>
                    <VideoPlayer
                      title="Constructivism Explained"
                      description="Pre-class video lecture on cognitive and social constructivism"
                      videoId="https://example.com/constructivism"
                      duration="12:00"
                      allowCustomUrl={isTeacher}
                    />
                  </CardSection>

                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Guiding Questions</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:guiding-q1" initialValue="How does prior knowledge influence new learning?" className="text-sm" />
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:guiding-q2" initialValue="Why might social interaction be essential for cognitive development?" className="text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Pre-Test Quiz */}
                  {pretest && (
                    <CardSection>
                      <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Pre-Test Quiz
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">Assess your prior knowledge of constructivism concepts before the lesson.</p>
                      <Quiz
                        quizId={pretest.quiz.id}
                        title={pretest.quiz.title}
                        questions={pretest.questions as QuizQuestion[]}
                        userId={user?.userId ?? 0}
                      />
                    </CardSection>
                  )}

                  {/* Concept check */}
                  {getConceptCheck('preclass') && user && !isGuest && (
                    <ConceptCheck
                      checkId={getConceptCheck('preclass')!.id}
                      title={getConceptCheck('preclass')!.title}
                      prompt={getConceptCheck('preclass')!.prompt}
                      checkType={getConceptCheck('preclass')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  )}
                </div>
              </LessonSection>
            </section>

            {/* 3. Introduction (25 mins) */}
            <section id="introduction" className="scroll-mt-20">
              <LessonSection id="introduction-inner" title="3. Introduction" badge="25 mins">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Hook</h4>
                      <EditableContent storageKey="lesson:hook" initialValue="Show a video clip of a child solving a puzzle. Pose question: &ldquo;Is learning passive absorption of information? Why/why not?&rdquo;" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Pre-Test Discussion</h4>
                      <EditableContent storageKey="lesson:pretest-discussion" initialValue="Use Mentimeter word cloud to visualize common quiz mistakes. Clarify misconceptions (e.g., conflation of ZPD and scaffolding)." />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <BookOpen className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Real-World Link</h4>
                      <EditableContent storageKey="lesson:realworld-link" initialValue="Briefly discuss how constructivism impacts current educational practices like inquiry-based learning." />
                    </div>
                  </div>

                  {/* Concept check */}
                  {getConceptCheck('introduction') && user && !isGuest && (
                    <ConceptCheck
                      checkId={getConceptCheck('introduction')!.id}
                      title={getConceptCheck('introduction')!.title}
                      prompt={getConceptCheck('introduction')!.prompt}
                      checkType={getConceptCheck('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  )}
                </div>
              </LessonSection>
            </section>

            {/* 4. Development Activities Header */}
            <section id="development" className="scroll-mt-20">
              <LessonSection id="development-inner" title="4. Teaching & Learning Activities" badge="130 mins">
                <p className="text-muted-foreground">The core of the lesson, divided into five development segments.</p>
              </LessonSection>
            </section>

            {/* 4A. Interactive Lecture & Visualization (30 mins) */}
            <section id="lecture" className="scroll-mt-20">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">4A. Interactive Lecture & Visualization</CardTitle>
                      <Badge variant="outline" className="mt-1">30 mins</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Segment 1: Theory Comparison</h4>
                    <EditableContent storageKey="lesson:lecture-seg1" initialValue="Compare cognitive (Piaget) vs. social (Vygotsky) theories using animated concept maps (via Prezi). Pause for Think-Pair-Share after each key point:" multiline as="div" className="text-sm text-slate-700" />
                    <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-sm font-medium text-indigo-800 mb-1">Think-Pair-Share Prompt:</p>
                      <EditableContent storageKey="lesson:tps-prompt1" initialValue="How would Piaget explain a child learning fractions differently than Vygotsky?" className="text-sm italic text-indigo-700" />
                    </div>
                  </div>

                  {/* Piaget vs Vygotsky Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left p-3 font-semibold text-slate-800 border-b">Dimension</th>
                          <th className="text-left p-3 font-semibold text-blue-800 border-b">Piaget (Cognitive)</th>
                          <th className="text-left p-3 font-semibold text-violet-800 border-b">Vygotsky (Sociocultural)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-slate-700">Key Process</td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-process-p" initialValue="Schema adaptation (assimilation & accommodation)" /></td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-process-v" initialValue="Mediation through social interaction & cultural tools" /></td>
                        </tr>
                        <tr className="border-b bg-slate-50">
                          <td className="p-3 font-medium text-slate-700">Development Driver</td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-driver-p" initialValue="Self-discovery; equilibration from within" /></td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-driver-v" initialValue="Social interaction; More Knowledgeable Other" /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-slate-700">Stages</td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-stages-p" initialValue="Universal, invariant stages (sensorimotor → formal)" /></td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-stages-v" initialValue="No fixed stages; development is culturally variable" /></td>
                        </tr>
                        <tr className="border-b bg-slate-50">
                          <td className="p-3 font-medium text-slate-700">Key Concept</td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-concept-p" initialValue="Schema, equilibration, cognitive dissonance" /></td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-concept-v" initialValue="Zone of Proximal Development (ZPD), scaffolding" /></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-700">Language Role</td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-lang-p" initialValue="Byproduct of cognitive development" /></td>
                          <td className="p-3 text-slate-600"><EditableContent storageKey="lesson:compare-lang-v" initialValue="Primary driver of thought; inner speech" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Segment 2: Case Study Walkthrough</h4>
                    <EditableContent storageKey="lesson:lecture-seg2" initialValue="Case study walkthrough of a primary school literacy lesson integrating both theories." className="text-sm text-slate-700" />
                  </div>

                  {/* Concept check */}
                  {getConceptCheck('lecture') && user && !isGuest && (
                    <ConceptCheck
                      checkId={getConceptCheck('lecture')!.id}
                      title={getConceptCheck('lecture')!.title}
                      prompt={getConceptCheck('lecture')!.prompt}
                      checkType={getConceptCheck('lecture')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  )}
                </CardContent>
              </Card>
            </section>

            {/* 4B. Small Group Case Analysis (40 mins) */}
            <section id="case-analysis" className="scroll-mt-20">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">4B. Small Group Case Analysis</CardTitle>
                      <Badge variant="outline" className="mt-1">40 mins</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="lesson:case-step1" initialValue="Divide students into 6 mixed-ability groups using randomizer on Zoom breakout rooms." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="lesson:case-step2" initialValue="Task: Analyze a scenario of a student struggling with algebra. Apply constructivist principles to design a 5-step intervention. Groups submit via Padlet." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="lesson:case-step3" initialValue="Use graphic organizers for scaffolding (e.g., &ldquo;Constructivism Strategy Matrix&rdquo;)." />
                    </li>
                  </ul>

                  {/* Constructivism Strategy Matrix */}
                  <CardSection>
                    <h4 className="font-medium text-slate-800 mb-3">Constructivism Strategy Matrix</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="text-left p-2 font-medium text-slate-700 border-b">Strategy</th>
                            <th className="text-left p-2 font-medium text-slate-700 border-b">Piagetian Basis</th>
                            <th className="text-left p-2 font-medium text-slate-700 border-b">Vygotskian Basis</th>
                            <th className="text-left p-2 font-medium text-slate-700 border-b">Application</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-slate-700">Scaffolding</td>
                            <td className="p-2 text-slate-600">Creating disequilibrium</td>
                            <td className="p-2 text-slate-600">ZPD support from MKO</td>
                            <td className="p-2 text-slate-600">Guided problem-solving</td>
                          </tr>
                          <tr className="border-b bg-slate-50">
                            <td className="p-2 font-medium text-slate-700">Peer Collaboration</td>
                            <td className="p-2 text-slate-600">Social negotiation of meaning</td>
                            <td className="p-2 text-slate-600">Co-construction of knowledge</td>
                            <td className="p-2 text-slate-600">Group investigations</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-slate-700">Inquiry-Based</td>
                            <td className="p-2 text-slate-600">Active exploration</td>
                            <td className="p-2 text-slate-600">Cultural tools & mediation</td>
                            <td className="p-2 text-slate-600">Hypothesis testing</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium text-slate-700">Reflection</td>
                            <td className="p-2 text-slate-600">Metacognition & equilibration</td>
                            <td className="p-2 text-slate-600">Inner speech development</td>
                            <td className="p-2 text-slate-600">Journaling & self-assessment</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardSection>

                  {/* Discussion forum */}
                  {discussion && user && !isGuest && (
                    <CardSection>
                      <h4 className="font-medium text-slate-800 mb-3">Group Discussion</h4>
                      <Discussion
                        discussionId={discussion.discussion.id}
                        title={discussion.discussion.title}
                        description={discussion.discussion.description}
                        posts={discussion.posts}
                        userId={user.userId}
                        userRole={user.role}
                      />
                    </CardSection>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* 4C. Peer Teaching + Jigsaw (30 mins) */}
            <section id="jigsaw" className="scroll-mt-20">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">4C. Peer Teaching + Jigsaw Activity</CardTitle>
                      <Badge variant="outline" className="mt-1">30 mins</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="lesson:jigsaw-step1" initialValue="Assign each group to become experts on one subtopic (e.g., metacognition, peer scaffolding)." />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="lesson:jigsaw-step2" initialValue="Reorganize groups so they have representatives from each subtopic. Teach peers using structured prompts:" />
                    </li>
                  </ul>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-800 mb-1">Structured Prompt:</p>
                    <EditableContent storageKey="lesson:jigsaw-prompt" initialValue="Explain how your assigned theory addresses motivation in learning." className="text-sm italic text-green-700" />
                  </div>

                  {/* Concept check */}
                  {getConceptCheck('jigsaw') && user && !isGuest && (
                    <ConceptCheck
                      checkId={getConceptCheck('jigsaw')!.id}
                      title={getConceptCheck('jigsaw')!.title}
                      prompt={getConceptCheck('jigsaw')!.prompt}
                      checkType={getConceptCheck('jigsaw')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  )}
                </CardContent>
              </Card>
            </section>

            {/* 4D. Digital Flashcards & Formative Quiz (20 mins) */}
            <section id="flashcards" className="scroll-mt-20">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <PenTool className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">4D. Digital Flashcards & Formative Quiz</CardTitle>
                      <Badge variant="outline" className="mt-1">20 mins</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Key Terminology Flashcards</h4>
                    <p className="text-sm text-muted-foreground mb-4">Click to flip. Review these key terms from constructivism theory.</p>
                    <Flashcard
                      cards={[
                        { front: 'Assimilation', back: 'The process of incorporating new information into existing cognitive schemas without changing the schema.' },
                        { front: 'Accommodation', back: 'The process of modifying existing schemas or creating new ones to incorporate new information that does not fit.' },
                        { front: 'Cognitive Dissonance', back: 'The mental discomfort experienced when new information conflicts with existing beliefs, driving schema reorganization.' },
                        { front: 'Scaffolding', back: 'Temporary support provided by a More Knowledgeable Other to help a learner accomplish a task within their ZPD.' },
                        { front: 'Zone of Proximal Development (ZPD)', back: 'The gap between what a learner can do independently and what they can do with guidance from a MKO.' },
                        { front: 'Equilibration', back: "Piaget's concept of the self-regulating process that balances assimilation and accommodation to achieve cognitive stability." },
                        { front: 'Metacognition', back: 'Thinking about one\'s own thinking processes; awareness and regulation of one\'s own learning strategies.' },
                        { front: 'More Knowledgeable Other (MKO)', back: 'Anyone who has a better understanding or higher ability level than the learner in a particular domain.' },
                      ]}
                    />
                  </div>

                  <Separator />

                  {/* Scenario Quiz */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Scenario-Based Quiz: What Would You Fix?</h4>
                    <ScenarioQuiz />
                  </div>

                  <Separator />

                  {/* Formative Quiz from DB */}
                  {formative && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3">Formative Quiz</h4>
                      <p className="text-sm text-muted-foreground mb-4">Test your understanding with instant feedback.</p>
                      <Quiz
                        quizId={formative.quiz.id}
                        title={formative.quiz.title}
                        questions={formative.questions as QuizQuestion[]}
                        userId={user?.userId ?? 0}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* 4E. In-Class Break (10 mins) */}
            <section id="break" className="scroll-mt-20">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Coffee className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">4E. In-Class Break</CardTitle>
                      <Badge variant="outline" className="mt-1">10 mins</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <Coffee className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                    <EditableContent storageKey="lesson:break" initialValue="Mid-session guided breathing exercise via YouTube audio to reduce cognitive load." />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 5. Synthesis & Closure (25 mins) */}
            <section id="synthesis" className="scroll-mt-20">
              <LessonSection id="synthesis-inner" title="5. Synthesis & Closure" badge="25 mins">
                <div className="space-y-4">
                  {/* Post-Test */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Post-Test</h4>
                    <EditableContent storageKey="lesson:posttest-desc" initialValue="Short-answer quiz on LMS (2 questions: a theory comparison and an application prompt)." className="text-sm text-slate-700" />
                  </div>

                  {posttest && (
                    <CardSection>
                      <Quiz
                        quizId={posttest.quiz.id}
                        title={posttest.quiz.title}
                        questions={posttest.questions as QuizQuestion[]}
                        userId={user?.userId ?? 0}
                      />
                    </CardSection>
                  )}

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Reflection: Exit Ticket</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
                        <Lightbulb className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:reflection-q1" initialValue="What surprised you tonight? How might you teach differently after understanding constructivism?" className="text-sm text-violet-700" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">
                      Next Session Preview: Behaviorist vs. Constructivist Learning
                    </p>
                  </div>

                  {/* Mark complete button */}
                  {user && !isGuest && (
                    <div className="flex justify-end">
                      <Button
                        variant={completedSections.has('synthesis') ? 'secondary' : 'default'}
                        className="gap-2"
                        onClick={() => handleMarkComplete('synthesis')}
                        disabled={completedSections.has('synthesis')}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {completedSections.has('synthesis') ? 'Completed' : 'Mark Section Complete'}
                      </Button>
                    </div>
                  )}
                </div>
              </LessonSection>
            </section>

            {/* 6. Assessment Methods */}
            <section id="assessment" className="scroll-mt-20">
              <LessonSection id="assessment-inner" title="6. Assessment Methods" badge="Assessment">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Formative</h4>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:formative-1" initialValue="Mentimeter word cloud (prior misconceptions)" />
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:formative-2" initialValue="Padlet group submissions (application skills)" />
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:formative-3" initialValue="Poll Everywhere quiz (terminology mastery)" />
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Summative (Week Later)</h4>
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 space-y-3">
                      <p className="font-medium text-rose-800">Individual Reflective Essay (500 words)</p>
                      <EditableContent storageKey="lesson:summative-prompt" initialValue="Apply constructivist principles to redesign a K-12 lesson." className="text-sm text-rose-700" />
                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-2">Rubric</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>&#8226; Depth of theoretical integration (30%)</li>
                          <li>&#8226; Creativity in scaffolding strategies (30%)</li>
                          <li>&#8226; Clarity of application to real-world context (40%)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </LessonSection>
            </section>

            {/* 7. Constructive Alignment Matrix */}
            <section id="alignment" className="scroll-mt-20">
              <LessonSection id="alignment-inner" title="7. Constructive Alignment Matrix">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 font-semibold text-slate-700 border-b">Learning Outcome</th>
                        <th className="text-left p-3 font-semibold text-slate-700 border-b">Teaching Activity</th>
                        <th className="text-left p-3 font-semibold text-slate-700 border-b">Assessment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 text-slate-700"><Badge variant="secondary" className="mr-1">ILO 1</Badge> Analyze theories</td>
                        <td className="p-3 text-slate-600">Think-Pair-Share + concept map</td>
                        <td className="p-3 text-slate-600">Post-test short answers</td>
                      </tr>
                      <tr className="border-b bg-slate-50">
                        <td className="p-3 text-slate-700"><Badge variant="secondary" className="mr-1">ILO 2</Badge> Distinguish theories</td>
                        <td className="p-3 text-slate-600">Interactive lecture + terminology quiz</td>
                        <td className="p-3 text-slate-600">Poll Everywhere quiz</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-slate-700"><Badge variant="secondary" className="mr-1">ILO 3</Badge> Apply to lesson design</td>
                        <td className="p-3 text-slate-600">Small group case analysis + essay</td>
                        <td className="p-3 text-slate-600">Padlet submissions + rubric</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </LessonSection>
            </section>

            {/* 8. Required Resources */}
            <section id="resources" className="scroll-mt-20">
              <LessonSection id="resources-inner" title="8. Required Resources">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: BookOpen, label: 'LMS (e.g., Moodle)', desc: 'Pre/post-tests, flashcards' },
                    { icon: Users, label: 'Padlet', desc: 'Group collaboration' },
                    { icon: Brain, label: 'Prezi/YouTube', desc: 'Animated concept maps' },
                    { icon: BarChart3, label: 'Poll Everywhere/Mentimeter', desc: 'Real-time polling' },
                    { icon: AlignLeft, label: 'Graphic Organizers', desc: 'Printed/PDF for small groups' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <r.icon className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </LessonSection>
            </section>

            {/* 9. Differentiation & Inclusivity */}
            <section id="differentiation" className="scroll-mt-20">
              <LessonSection id="differentiation-inner" title="9. Differentiation & Inclusivity">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800 text-sm">For visual learners</p>
                      <EditableContent storageKey="lesson:diff-visual" initialValue="Provide annotated diagrams of Piaget's stages." className="text-sm text-blue-700" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <Brain className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-violet-800 text-sm">For advanced learners</p>
                      <EditableContent storageKey="lesson:diff-advanced" initialValue='Offer optional extension article (PDF: "Beyond Piaget: Neoconstructivist Extensions").' className="text-sm text-violet-700" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <MessageSquare className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-green-800 text-sm">For multilingual students</p>
                      <EditableContent storageKey="lesson:diff-multilingual" initialValue="Subtitled video, bilingual terminology glossary on LMS." className="text-sm text-green-700" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 text-sm">For ADHD learners</p>
                      <EditableContent storageKey="lesson:diff-adhd" initialValue="Segment activities into 10–15 min blocks with clear transitions." className="text-sm text-amber-700" />
                    </div>
                  </div>
                </div>
              </LessonSection>
            </section>

            {/* 10. Reflection & Improvement */}
            <section id="reflection" className="scroll-mt-20">
              <LessonSection id="reflection-inner" title="10. Reflection & Improvement">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Success Indicators</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:success-1" initialValue="Post-test score improvement vs. pre-test" />
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:success-2" initialValue="Padlet participation rates" />
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Feedback Survey</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">&#8226;</span>
                        <EditableContent storageKey="lesson:feedback-1" initialValue="Did the animated visualizations enhance your comprehension?" />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">&#8226;</span>
                        <EditableContent storageKey="lesson:feedback-2" initialValue="Was the peer teaching activity structured enough?" />
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Modifications</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:mod-1" initialValue="Adjust quiz difficulty if >40% miss a question persistently." />
                      </li>
                      <li className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <EditableContent storageKey="lesson:mod-2" initialValue="Replace case studies with peer interviews for future iterations." />
                      </li>
                    </ul>
                  </div>
                </div>
              </LessonSection>
            </section>

            {/* Lesson Notes */}
            <Card className="bg-slate-800 text-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  <CardTitle className="text-lg">Lesson Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <EditableContent storageKey="lesson:note-1" initialValue="For large classes, use pre-assignable roles in groups (Presenter, Timekeeper, Notetaker) to improve task efficiency." />
                <EditableContent storageKey="lesson:note-2" initialValue="Reserve TA support for guiding breakout room discussions via Zoom." />
                <EditableContent storageKey="lesson:note-3" initialValue="All multimedia resources include alt-text and subtitles for accessibility compliance." />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
