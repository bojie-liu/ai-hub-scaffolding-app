'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Clock,
  Users,
  Target,
  Video,
  MessageSquare,
  PenTool,
  CheckCircle2,
  BarChart3,
  Monitor,
  Accessibility,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { markSectionComplete } from '@/lib/actions/progress';
import { getEditableContent, saveEditableContent } from '@/lib/actions/editable-content';
import { submitConceptCheckResponse } from '@/lib/actions/concept-check';
import VennDiagram from '@/components/interactive/VennDiagram';
import VideoPlayer from '@/components/media/VideoPlayer';
import ScenarioQuiz from '@/components/learning/ScenarioQuiz';
import Flashcard from '@/components/learning/Flashcard';
import { ConceptCheck } from '@/components/lesson/interactive/ConceptCheck';
import { Quiz } from '@/components/lesson/interactive/Quiz';
import { Discussion } from '@/components/lesson/interactive/Discussion';
import Link from 'next/link';

const SECTION_KEYS = [
  'ilos', 'preclass', 'introduction', 'development', 'synthesis',
  'assessment', 'alignment', 'resources', 'differentiation', 'reflection'
] as const;

type SectionKey = typeof SECTION_KEYS[number];

interface EditableBlockProps {
  storageKey: string;
  fallback: string;
  isTeacher: boolean;
}

function EditableBlock({ storageKey, fallback, isTeacher }: EditableBlockProps) {
  const [content, setContent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEditableContent(storageKey).then((data) => {
      setContent(data ?? fallback);
      setDraft(data ?? fallback);
      setLoading(false);
    });
  }, [storageKey, fallback]);

  async function handleSave() {
    setSaving(true);
    await saveEditableContent(storageKey, draft);
    setContent(draft);
    setEditing(false);
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse bg-muted rounded-lg h-20" />;
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setEditing(false); setDraft(content ?? fallback); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div
        className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{
          __html: (content ?? fallback)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>')
        }}
      />
      {isTeacher && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setEditing(true)}
        >
          <PenTool className="h-3 w-3 mr-1" /> Edit
        </Button>
      )}
    </div>
  );
}

const FLASHCARDS = [
  { front: 'Schema', back: 'A mental framework that helps organize and interpret information. Schemas are modified through assimilation and accommodation.' },
  { front: 'Assimilation', back: 'The process of fitting new information into existing schemas without changing the schema.' },
  { front: 'Accommodation', back: 'The process of modifying existing schemas or creating new ones to incorporate new information that does not fit.' },
  { front: 'Zone of Proximal Development (ZPD)', back: 'The gap between what a learner can do independently and what they can do with guidance from a More Knowledgeable Other.' },
  { front: 'Scaffolding', back: 'Temporary support provided by a more knowledgeable person to help a learner accomplish a task within their ZPD. Support is gradually withdrawn.' },
  { front: 'More Knowledgeable Other (MKO)', back: 'Anyone who has a better understanding or higher ability level than the learner — can be a teacher, peer, or even a digital tool.' },
  { front: 'Equilibration', back: "Piaget's concept of the balancing process between assimilation and accommodation that drives cognitive development." },
  { front: 'Spiral Curriculum', back: "An educational approach where topics are revisited at increasing depth over time, reflecting Piaget's view of schema refinement." },
];

export default function LessonPage() {
  const { user } = useUser();
  const isTeacher = user?.role === 'TEACHER';
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ilos']));

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCompleteSection = useCallback(async (key: string) => {
    if (!user || user.role === 'GUEST') return;
    setCompletedSections((prev) => new Set(prev).add(key));
    await markSectionComplete(user.userId, key);
  }, [user]);

  const totalSections = SECTION_KEYS.length;
  const completedCount = completedSections.size;
  const progressPct = Math.round((completedCount / totalSections) * 100);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
            <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/40 mb-4">
              Introduction to Educational Psychology
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Cognitive &amp; Social Constructivism Theory
            </h1>
            <p className="mt-3 text-blue-200 text-lg max-w-2xl">
              A comprehensive lesson exploring Piaget&apos;s cognitive constructivism and Vygotsky&apos;s social constructivism
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-blue-200">
                <Clock className="h-4 w-4" /> 180 minutes
              </span>
              <span className="flex items-center gap-1.5 text-blue-200">
                <Users className="h-4 w-4" /> 90 students
              </span>
              <span className="flex items-center gap-1.5 text-blue-200">
                <BookOpen className="h-4 w-4" /> Flipped classroom
              </span>
            </div>
            {user && user.role !== 'GUEST' && (
              <div className="mt-6">
                <div className="flex items-center gap-3 text-sm text-blue-200">
                  <span>Progress: {completedCount}/{totalSections} sections</span>
                  <div className="w-40 bg-blue-900 rounded-full h-2">
                    <div className="bg-blue-300 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span>{progressPct}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          {/* Section 1: ILOs */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('ilos')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">1. Intended Learning Outcomes (ILOs)</CardTitle>
                    <CardDescription>What students will achieve by the end of the lesson</CardDescription>
                  </div>
                </div>
                {expandedSections.has('ilos') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('ilos') && (
              <CardContent className="space-y-4">
                <EditableBlock
                  storageKey="content:ilos"
                  fallback={`By the end of the lesson, students will be able to:\n1. Compare **cognitive constructivism (Piaget)** and **social constructivism (Vygotsky)** using specific theoretical principles.\n2. Analyze educational scenarios to evaluate how each theory informs instructional strategies.\n3. Design a lesson plan outline that incorporates elements of both theories.`}
                  isTeacher={isTeacher}
                />
                <div className="grid sm:grid-cols-3 gap-3 mt-4">
                  {['Compare theories', 'Analyze scenarios', 'Design application'].map((ilo, i) => (
                    <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">{i + 1}</span>
                      <span className="text-sm text-blue-900">{ilo}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    variant={completedSections.has('ilos') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('ilos')}
                    disabled={completedSections.has('ilos')}
                  >
                    {completedSections.has('ilos') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 2: Pre-Class Preparation */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('preclass')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">2. Pre-Class Preparation</CardTitle>
                    <CardDescription>Flipped learning components to complete before class</CardDescription>
                  </div>
                </div>
                {expandedSections.has('preclass') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('preclass') && (
              <CardContent className="space-y-6">
                <EditableBlock
                  storageKey="content:preclass-description"
                  fallback={`**Flipped Learning Components**:\n- **Pre-Reading**: Excerpt from *Educational Psychology: Theory and Practice* (Slavin, 2023) on Piaget and Vygotsky.\n- **Pre-Test** (5 questions via LMS): Topics include key terms (schema, scaffolding), core principles, and differences between theories.`}
                  isTeacher={isTeacher}
                />

                {/* Video */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4" /> Pre-Class Video
                  </h4>
                  <VideoPlayer
                    title="How Kids Learn — Debbie Reese"
                    description="TED Talk: Explore how children learn through constructivist principles"
                    videoId="1vN505dJj4M"
                    duration="15:32"
                    allowCustomUrl={isTeacher}
                  />
                </div>

                {/* Guiding Questions */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Guiding Questions
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-900">1. How might social interactions shape a child&apos;s cognitive development?</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-900">2. Recall a personal learning experience that aligns with either Piagetian or Vygotskian theory.</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link href="/discussion">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> Discuss in Forum
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Pre-Test Link */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Pre-Test: Constructivism</p>
                    <p className="text-xs text-blue-700 mt-0.5">5 questions — assess your prior knowledge</p>
                  </div>
                  <Link href="/quizzes">
                    <Button size="sm">Take Pre-Test</Button>
                  </Link>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('preclass') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('preclass')}
                    disabled={completedSections.has('preclass')}
                  >
                    {completedSections.has('preclass') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 3: Introduction */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('introduction')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">3. Introduction (20 minutes)</CardTitle>
                    <CardDescription>Hook, pre-test review, and real-world connection</CardDescription>
                  </div>
                </div>
                {expandedSections.has('introduction') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('introduction') && (
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 text-sm mb-1">Hook Activity</h5>
                    <EditableBlock
                      storageKey="content:intro-hook"
                      fallback={`Poll question via Mentimeter – "Do you think *learning is solitary or social*? Vote and discuss."`}
                      isTeacher={isTeacher}
                    />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 text-sm mb-1">Pre-Test Review</h5>
                    <EditableBlock
                      storageKey="content:intro-pretest-review"
                      fallback="Display anonymized pre-test results, address misconceptions (e.g., conflating assimilation with scaffolding)."
                      isTeacher={isTeacher}
                    />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 text-sm mb-1">Real-World Connection</h5>
                    <EditableBlock
                      storageKey="content:intro-realworld"
                      fallback="Why might a teacher use peer mentoring (Vygotsky) for complex math problems?"
                      isTeacher={isTeacher}
                    />
                  </div>
                </div>

                {/* Concept Check for Introduction */}
                <ConceptCheck
                  checkId={0}
                  storageKey="conceptcheck:intro-hook"
                  title="Learning: Solitary or Social?"
                  prompt="Do you think learning is primarily a solitary or social process?"
                  sectionKey="introduction"
                />

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('introduction') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('introduction')}
                    disabled={completedSections.has('introduction')}
                  >
                    {completedSections.has('introduction') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 4: Development (130 minutes) */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('development')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PenTool className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">4. Teaching &amp; Learning Activities (130 minutes)</CardTitle>
                    <CardDescription>Interactive lecture, group work, case studies, peer teaching</CardDescription>
                  </div>
                </div>
                {expandedSections.has('development') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('development') && (
              <CardContent className="space-y-6">
                <Tabs defaultValue="segment1" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="segment1" className="text-xs sm:text-sm">Segment 1</TabsTrigger>
                    <TabsTrigger value="segment2" className="text-xs sm:text-sm">Segment 2</TabsTrigger>
                    <TabsTrigger value="segment3" className="text-xs sm:text-sm">Segment 3</TabsTrigger>
                    <TabsTrigger value="segment4" className="text-xs sm:text-sm">Segment 4</TabsTrigger>
                  </TabsList>

                  {/* Segment 1: Interactive Lecture */}
                  <TabsContent value="segment1" className="space-y-5 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">30 minutes</Badge>
                      <span className="font-semibold text-slate-800">Interactive Lecture &amp; Visualizations</span>
                    </div>
                    <EditableBlock
                      storageKey="content:dev-segment1"
                      fallback={`**Annotated Diagrams**: Show Piaget's schema development process and Vygotsky's ZPD.\n\n**Think-Pair-Share**: "How does a 'spiral curriculum' reflect cognitive constructivism?"`}
                      isTeacher={isTeacher}
                    />

                    {/* Venn Diagram */}
                    <div>
                      <h5 className="font-semibold text-slate-800 mb-3">Theory Comparison: Venn Diagram</h5>
                      <VennDiagram />
                    </div>

                    <div className="mt-4">
                      <h5 className="font-semibold text-slate-800 mb-3">Comprehension Checks</h5>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <ConceptCheck
                          checkId={0}
                          storageKey="conceptcheck:piaget-understand"
                          title="Piaget Comprehension"
                          prompt="Do you understand the key principles of cognitive constructivism?"
                          sectionKey="development"
                        />
                        <ConceptCheck
                          checkId={0}
                          storageKey="conceptcheck:vygotsky-understand"
                          title="Vygotsky Comprehension"
                          prompt="Do you understand the key principles of social constructivism?"
                          sectionKey="development"
                        />
                      </div>
                    </div>

                    {/* Key Terms Flashcards */}
                    <div>
                      <h5 className="font-semibold text-slate-800 mb-3">Key Terms Flashcards</h5>
                      <Flashcard cards={FLASHCARDS} />
                    </div>
                  </TabsContent>

                  {/* Segment 2: Padlet Group Work */}
                  <TabsContent value="segment2" className="space-y-5 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">40 minutes</Badge>
                      <span className="font-semibold text-slate-800">Small Group Work via Padlet</span>
                    </div>
                    <EditableBlock
                      storageKey="content:dev-segment2"
                      fallback={`Split into 15 groups (6 students each). Use Padlet to:\n- List 3 unique principles of each theory.\n- Post one classroom scenario applying each theory.\n\n**Scaffolding**: Provide concept map template for comparing theories.`}
                      isTeacher={isTeacher}
                    />
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-900 text-sm">Padlet Board</span>
                      </div>
                      <a
                        href="https://padlet.com/bojieliu711/agile-nnwo314w5anmx0ep"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-700 underline hover:text-purple-900"
                      >
                        Open Padlet: Compare Piaget &amp; Vygotsky
                      </a>
                    </div>
                  </TabsContent>

                  {/* Segment 3: Case Study Analysis */}
                  <TabsContent value="segment3" className="space-y-5 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">30 minutes</Badge>
                      <span className="font-semibold text-slate-800">Case Study Analysis</span>
                    </div>
                    <EditableBlock
                      storageKey="content:dev-segment3"
                      fallback={`Analyze 2 case studies:\n1. "A teacher introduces group projects to teach conflict resolution"\n2. "A student independently discovers a new math concept through trial and error"\n\nDebate which theory best supports each strategy using key terms.`}
                      isTeacher={isTeacher}
                    />
                    <ScenarioQuiz />
                    <ConceptCheck
                      checkId={0}
                      storageKey="conceptcheck:case-study"
                      title="Case Study Confidence"
                      prompt="How confident are you in analyzing scenarios using both theories?"
                      sectionKey="development"
                    />
                  </TabsContent>

                  {/* Segment 4: Peer Teaching */}
                  <TabsContent value="segment4" className="space-y-5 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">30 minutes</Badge>
                      <span className="font-semibold text-slate-800">Peer Teaching &amp; Formative Quizzes</span>
                    </div>
                    <EditableBlock
                      storageKey="content:dev-segment4"
                      fallback={`**Jigsaw Activity**: Groups present Padlet boards to peers.\n\n**Mentimeter Poll**: Quick quiz — "Which theory aligns with using mentors?"`}
                      isTeacher={isTeacher}
                    />
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-medium text-purple-900 text-sm mb-2">Jigsaw Activity Instructions</h5>
                      <ol className="list-decimal list-inside text-sm text-purple-800 space-y-1">
                        <li>Each group becomes an &quot;expert&quot; on one theory</li>
                        <li>Present your Padlet findings to the class</li>
                        <li>Other groups take notes and ask questions</li>
                        <li>Complete the formative quiz to check understanding</li>
                      </ol>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('development') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('development')}
                    disabled={completedSections.has('development')}
                  >
                    {completedSections.has('development') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 5: Synthesis & Closure */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('synthesis')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-teal-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">5. Synthesis &amp; Closure (20 minutes)</CardTitle>
                    <CardDescription>Post-test, one-minute paper, and next class preview</CardDescription>
                  </div>
                </div>
                {expandedSections.has('synthesis') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('synthesis') && (
              <CardContent className="space-y-5">
                <EditableBlock
                  storageKey="content:synthesis"
                  fallback={`**Post-Test**: 5-question quiz measuring gains compared to pre-test.\n\n**One-Minute Paper**: "Summarize how both theories could coexist in a classroom."\n\n**Preview of Next Class**: Connect to lesson on differentiated instruction strategies.`}
                  isTeacher={isTeacher}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h5 className="font-semibold text-teal-900 text-sm mb-1">Post-Test</h5>
                    <p className="text-xs text-teal-700 mb-3">5 questions — measure your learning gains</p>
                    <Link href="/quizzes">
                      <Button size="sm" variant="outline">Take Post-Test</Button>
                    </Link>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h5 className="font-semibold text-teal-900 text-sm mb-1">One-Minute Paper</h5>
                    <p className="text-xs text-teal-700 mb-3">Reflect: How could both theories coexist in a classroom?</p>
                    <Link href="/discussion">
                      <Button size="sm" variant="outline">Share in Discussion</Button>
                    </Link>
                  </div>
                </div>
                <ConceptCheck
                  checkId={0}
                  storageKey="conceptcheck:synthesis"
                  title="Synthesis Check"
                  prompt="Can you see how both theories could be integrated in classroom practice?"
                  sectionKey="synthesis"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('synthesis') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('synthesis')}
                    disabled={completedSections.has('synthesis')}
                  >
                    {completedSections.has('synthesis') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 6: Assessment Methods */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('assessment')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-rose-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">6. Assessment Methods</CardTitle>
                    <CardDescription>Formative and summative assessment strategies</CardDescription>
                  </div>
                </div>
                {expandedSections.has('assessment') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('assessment') && (
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Formative Assessment
                    </h5>
                    <EditableBlock
                      storageKey="content:assessment-formative"
                      fallback={`- Padlet participation quality.\n- Mentimeter quiz responses.\n- Exit ticket reflection on pre- and post-test differences.`}
                      isTeacher={isTeacher}
                    />
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" /> Summative Assessment
                    </h5>
                    <EditableBlock
                      storageKey="content:assessment-summative"
                      fallback={`**Assignment**: Design a 1-week lesson plan outline applying both theories (rubric evaluates theoretical integration and practicality).`}
                      isTeacher={isTeacher}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('assessment') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('assessment')}
                    disabled={completedSections.has('assessment')}
                  >
                    {completedSections.has('assessment') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 7: Constructive Alignment Matrix */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('alignment')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">7. Constructive Alignment Matrix</CardTitle>
                    <CardDescription>Mapping outcomes to activities and assessments</CardDescription>
                  </div>
                </div>
                {expandedSections.has('alignment') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('alignment') && (
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-indigo-50">
                        <th className="text-left py-3 px-3 font-semibold text-indigo-900">Learning Outcome</th>
                        <th className="text-left py-3 px-3 font-semibold text-indigo-900">Teaching Activity</th>
                        <th className="text-left py-3 px-3 font-semibold text-indigo-900">Assessment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-3">
                          <EditableBlock storageKey="content:alignment-row1" fallback="**Compare theories** → Padlet group discussion, animated visualizations → Post-test structured-response questions" isTeacher={isTeacher} />
                        </td>
                        <td className="py-3 px-3 text-slate-600">Padlet discussion, visualizations</td>
                        <td className="py-3 px-3 text-slate-600">Post-test questions</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-3">
                          <EditableBlock storageKey="content:alignment-row2" fallback="**Analyze scenarios** → Case study analysis, peer teaching → Lesson plan rubric: theoretical justification" isTeacher={isTeacher} />
                        </td>
                        <td className="py-3 px-3 text-slate-600">Case study, peer teaching</td>
                        <td className="py-3 px-3 text-slate-600">Rubric: justification</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3">
                          <EditableBlock storageKey="content:alignment-row3" fallback="**Design application** → Group scenario creation, jigsaw activity → Lesson plan rubric: strategy implementation" isTeacher={isTeacher} />
                        </td>
                        <td className="py-3 px-3 text-slate-600">Group scenarios, jigsaw</td>
                        <td className="py-3 px-3 text-slate-600">Rubric: implementation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('alignment') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('alignment')}
                    disabled={completedSections.has('alignment')}
                  >
                    {completedSections.has('alignment') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 8: Resources & Technology */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('resources')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Monitor className="h-5 w-5 text-cyan-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">8. Required Resources &amp; Technology</CardTitle>
                    <CardDescription>Tools and materials for the lesson</CardDescription>
                  </div>
                </div>
                {expandedSections.has('resources') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('resources') && (
              <CardContent className="space-y-4">
                <EditableBlock
                  storageKey="content:resources"
                  fallback={`- **LMS**: Pre/post-tests (e.g., Canvas, Moodle).\n- **Interactive Tools**: Mentimeter, Padlet, Quizlet flashcards.\n- **Materials**: Case studies, concept map templates, textbook excerpt.\n- **Video**: TED Talk by Debbie Reese.`}
                  isTeacher={isTeacher}
                />
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { label: 'LMS', desc: 'Canvas, Moodle', icon: Monitor },
                    { label: 'Interactive', desc: 'Mentimeter, Padlet, Quizlet', icon: MessageSquare },
                    { label: 'Materials', desc: 'Case studies, concept maps', icon: FileText },
                    { label: 'Video', desc: 'TED Talk by Debbie Reese', icon: Video },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                      <item.icon className="h-5 w-5 text-cyan-700 shrink-0" />
                      <div>
                        <p className="font-medium text-cyan-900 text-sm">{item.label}</p>
                        <p className="text-xs text-cyan-700">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('resources') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('resources')}
                    disabled={completedSections.has('resources')}
                  >
                    {completedSections.has('resources') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 9: Differentiation & Inclusivity */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('differentiation')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Accessibility className="h-5 w-5 text-orange-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">9. Differentiation &amp; Inclusivity</CardTitle>
                    <CardDescription>Supporting diverse learning needs</CardDescription>
                  </div>
                </div>
                {expandedSections.has('differentiation') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('differentiation') && (
              <CardContent className="space-y-4">
                <EditableBlock
                  storageKey="content:differentiation"
                  fallback={`- **For Visual Learners**: Provide static theory comparison charts.\n- **Advanced Learners**: Optional extension – read original Piaget/Vygotsky texts.\n- **Multilingual Support**: Subtitles for video, multilingual Padlet interface.\n- **Accessibility**: Transcripts for video, screen-reader-compatible digital content.`}
                  isTeacher={isTeacher}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Visual Learners', desc: 'Static theory comparison charts', color: 'blue' },
                    { label: 'Advanced Learners', desc: 'Original Piaget/Vygotsky texts', color: 'purple' },
                    { label: 'Multilingual Support', desc: 'Subtitles, multilingual Padlet', color: 'emerald' },
                    { label: 'Accessibility', desc: 'Transcripts, screen-reader support', color: 'amber' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="font-medium text-slate-800 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('differentiation') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('differentiation')}
                    disabled={completedSections.has('differentiation')}
                  >
                    {completedSections.has('differentiation') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 10: Reflection & Improvement */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSection('reflection')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">10. Reflection &amp; Improvement</CardTitle>
                    <CardDescription>Success indicators, feedback, and future modifications</CardDescription>
                  </div>
                </div>
                {expandedSections.has('reflection') ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {expandedSections.has('reflection') && (
              <CardContent className="space-y-4">
                <EditableBlock
                  storageKey="content:reflection"
                  fallback={`- **Success Indicators**: 80% post-test improvement from pre-test; Padlet engagement metrics.\n- **Feedback**: Post-class survey (e.g., "Which activity most clarified the theories?").\n- **Modifications**: For future iterations, integrate role-play activities for kinesthetic learners.`}
                  isTeacher={isTeacher}
                />
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="font-medium text-emerald-900 text-sm">Success Indicators</p>
                    <p className="text-xs text-emerald-700 mt-0.5">80% post-test improvement; Padlet engagement metrics</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-blue-900 text-sm">Feedback</p>
                    <p className="text-xs text-blue-700 mt-0.5">Post-class survey on activity effectiveness</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="font-medium text-amber-900 text-sm">Modifications</p>
                    <p className="text-xs text-amber-700 mt-0.5">Add role-play for kinesthetic learners</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={completedSections.has('reflection') ? 'secondary' : 'default'}
                    onClick={() => handleCompleteSection('reflection')}
                    disabled={completedSections.has('reflection')}
                  >
                    {completedSections.has('reflection') ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Footer */}
          <div className="text-center py-8 text-sm text-slate-400">
            <p>Constructivism Lesson Plan — Pedagogical approach validated by Constructive Alignment principles and scaffolding best practices.</p>
          </div>
        </div>
      </div>
    </>
  );
}
