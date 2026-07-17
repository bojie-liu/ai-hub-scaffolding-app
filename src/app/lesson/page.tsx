'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Flashcard from '@/components/learning/Flashcard';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { markSectionComplete } from '@/lib/actions/progress';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Presentation,
  Scale,
  Shield,
  Target,
  Users,
  Zap,
} from 'lucide-react';

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
  { id: 'materials', label: 'Materials' },
];

const FLASHCARD_DATA = [
  { front: 'Content Knowledge (CK)', back: 'Deep understanding of the subject matter being taught. In software engineering: debugging theory, algorithm design, system architecture principles.' },
  { front: 'Pedagogical Knowledge (PK)', back: 'Knowledge of teaching methods and practices. How to sequence activities, scaffold learning, assess understanding, and manage classroom dynamics.' },
  { front: 'Technological Knowledge (TK)', back: 'Understanding of various technologies and how to use them. In this context: GitHub Copilot, Tabnine, AI code generation tools, and their capabilities/limitations.' },
  { front: 'TPACK Intersection', back: 'The intersection of all three knowledge domains where effective technology integration occurs. Lesson design must balance CK, PK, and TK synergistically.' },
  { front: 'Peer Assessment', back: 'A structured evaluation process where students review and provide feedback on each other\'s work using defined rubric criteria, promoting deeper learning through critical analysis.' },
];

export default function LessonPage() {
  const { user } = useUser();
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    getConceptChecks().then((result) => {
      if (result.success && result.data) {
        setConceptChecks(result.data as ConceptCheckData[]);
      }
    });
  }, []);

  const handleMarkComplete = useCallback(async (sectionKey: string) => {
    if (!user || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections((prev) => new Set(prev).add(sectionKey));
      toast.success('Section marked complete');
    }
  }, [user]);

  function getConceptCheckForSection(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((c) => c.sectionKey === sectionKey);
  }

  return (
    <AuthGuard>
      <ScrollRootProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
            <LessonSideMenu sections={SECTIONS} />

            <main className="flex-1 min-w-0 space-y-8 pb-16">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="h-8 w-8" />
                  <Badge className="bg-white/20 text-white border-white/30">The Modern Software Developer</Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  AI-Augmented Software Engineering
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  Pedagogical Integration — TPACK Framework + Peer Assessment
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5">
                    <Clock className="h-4 w-4" /> 90 minutes
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5">
                    <Users className="h-4 w-4" /> University Level
                  </div>
                  <Link href="/slides">
                    <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5 hover:bg-white/25 transition-colors cursor-pointer">
                      <Presentation className="h-4 w-4" /> View Slides
                    </div>
                  </Link>
                </div>
              </div>

              {/* 1. ILOs */}
              <LessonSection id="ilos" title="Intended Learning Outcomes (ILOs)" badge="ILOs">
                <EditableContent
                  storageKey="editable:ilos:description"
                  initialValue="By the end of the lesson, students will be able to analyze, apply, evaluate, and collaborate on AI-augmented software engineering topics through the TPACK framework."
                  as="p"
                  className="text-muted-foreground mb-6"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Brain, label: 'ILO1', desc: 'Analyze the impact of AI tooling (e.g., GitHub Copilot, Tabnine) on software engineering workflows and pedagogical design', tag: 'TPACK-CK+TK', color: 'blue' },
                    { icon: Edit3, label: 'ILO2', desc: 'Apply TPACK components to design lesson prototypes that integrate AI-assisted coding tools', tag: 'TPACK-PK', color: 'green' },
                    { icon: Scale, label: 'ILO3', desc: 'Evaluate peer-designed lessons using structured rubrics focused on content relevance and technological fluency', tag: 'Peer Assessment', color: 'amber' },
                    { icon: Users, label: 'ILO4', desc: 'Collaborate to address misconceptions about AI democratization risks (e.g., bias, over-reliance)', tag: 'Social Constructivism', color: 'purple' },
                  ].map((ilo) => (
                    <CardSection key={ilo.label}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${ilo.color}-100 text-${ilo.color}-600 shrink-0`}>
                          <ilo.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{ilo.label}</span>
                            <Badge variant="outline" className="text-xs">{ilo.tag}</Badge>
                          </div>
                          <p className="text-sm text-slate-700">{ilo.desc}</p>
                        </div>
                      </div>
                    </CardSection>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkComplete('ilos')}
                    disabled={completedSections.has('ilos')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('ilos') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 2. Pre-Class Preparation */}
              <LessonSection id="preclass" title="Pre-Class Preparation" badge="TPACK Foundation">
                <EditableContent
                  storageKey="editable:preclass:description"
                  initialValue="Complete the pre-class materials including the video on AI in software development, the TPACK framework article, and the 5-question pre-test before attending the session."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="space-y-3">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Video: Democratizing Software</p>
                        <p className="text-sm text-muted-foreground">10-min video: &quot;Democratizing Software: How AI is Reshaping Programming&quot; (linked to TPACK CK-TK integration)</p>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Article: TPACK Framework</p>
                        <p className="text-sm text-muted-foreground">&quot;TPACK Framework for Tech Integration in Education&quot; — key components: Content Knowledge, Pedagogical Knowledge, Technological Knowledge</p>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Pre-Test (5 Questions)</p>
                        <p className="text-sm text-muted-foreground">Assess baseline understanding of AI coding tools and TPACK definitions via LMS. Adaptive feedback maps misconceptions to peer assessment criteria.</p>
                        <Link href="/quizzes" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
                          Take Pre-Test <Zap className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </CardSection>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-medium text-blue-900 text-sm mb-2">Guiding Prompts</p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>&#8226; Which AI tools address traditional software engineering challenges?</li>
                    <li>&#8226; How can lesson objectives combine technical skills with critical thinking about AI ethics?</li>
                  </ul>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('preclass')} disabled={completedSections.has('preclass')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('preclass') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 3. Introduction */}
              <LessonSection id="introduction" title="Introduction (12 minutes)" badge="Hook">
                <EditableContent
                  storageKey="editable:introduction:description"
                  initialValue="The session opens with a 2-minute montage comparing AI coding tools with manual development, followed by a live poll and pre-test review."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="space-y-3">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-100 text-violet-600 shrink-0">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Pedagogy-Aligned Hook</p>
                        <p className="text-sm text-muted-foreground">2-minute montage of AI coding tools (Copilot, Replit) juxtaposed with manual development.</p>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600 shrink-0">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Live Poll</p>
                        <p className="text-sm text-muted-foreground">&quot;Does AI coding tooling reduce creativity in software development?&quot; — Mentimeter live word cloud for discussion trigger.</p>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shrink-0">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Pre-Test Review &amp; Real-World Connection</p>
                        <p className="text-sm text-muted-foreground">Address misconceptions (e.g., &quot;AI eliminates need for debugging&quot;). Share stats: Gartner reports 70% of devs use AI assistants. Risks: data privacy issues with AI-generated code.</p>
                      </div>
                    </div>
                  </CardSection>
                </div>

                {/* Concept Check */}
                {getConceptCheckForSection('introduction') && user && user.userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheckForSection('introduction')!.id}
                      title={getConceptCheckForSection('introduction')!.title}
                      prompt={getConceptCheckForSection('introduction')!.prompt}
                      checkType={getConceptCheckForSection('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('introduction')} disabled={completedSections.has('introduction')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('introduction') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 4. Development Activities */}
              <LessonSection id="development" title="Development Activities (63 minutes)" badge="Core Activities">
                <EditableContent
                  storageKey="editable:development:description"
                  initialValue="Three activities: TPACK Lesson Design Sprint (35 min), Structured Peer Assessment (20 min), and Collaborative Refinement (8 min)."
                  as="p"
                  className="text-muted-foreground mb-6"
                />

                {/* Activity 1 */}
                <Card className="border-l-4 border-l-blue-500 mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800">35 min</Badge>
                      <CardTitle className="text-lg">Activity 1: TPACK-Based Lesson Design Sprint</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700">
                      In pairs, design a 15-minute micro-lesson plan on AI-assisted debugging using the TPACK lens:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-semibold text-blue-900 text-sm">CK: Content Knowledge</p>
                        <p className="text-xs text-blue-700 mt-1">Core concepts — AI tool limitations</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="font-semibold text-amber-900 text-sm">TK: Technological Knowledge</p>
                        <p className="text-xs text-amber-700 mt-1">Tools selected — e.g., GitHub Copilot exercises</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="font-semibold text-green-900 text-sm">PK: Pedagogical Knowledge</p>
                        <p className="text-xs text-green-700 mt-1">Strategies — collaborative code reviews</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">Deliverables</p>
                      <p className="text-sm text-muted-foreground">A Miro board with lesson structure, including at least one interactive component (e.g., AI-generated code snippet for students to debug).</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-sm font-medium text-indigo-900">Scaffolding</p>
                      <p className="text-sm text-indigo-700">TPACK graphic organizer with labeled CK/TK/PK circles.</p>
                      <p className="text-sm text-indigo-700">Template: Plan &rarr; AI generate &rarr; Peer evaluate &rarr; Iterate (PAIR programming)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity 2 */}
                <Card className="border-l-4 border-l-green-500 mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-800">20 min</Badge>
                      <CardTitle className="text-lg">Activity 2: Structured Peer Assessment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700">Exchange lesson plans using Peergrade.io.</p>
                    <p className="text-sm font-medium text-slate-800">Rubric Criteria (TPACK + Peer Assessment alignment):</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                      <li>Integration of AI tools with pedagogy (CK-TK synergy).</li>
                      <li>Clarity of learning objectives (e.g., &quot;Students will evaluate AI code suggestions using X standard&quot;).</li>
                      <li>Ethical considerations (data bias, accessibility).</li>
                    </ol>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">Process</p>
                      <ul className="space-y-1 text-sm text-muted-foreground mt-1">
                        <li>&#8226; Students calibrate by reviewing model responses (instructor provides exemplar).</li>
                        <li>&#8226; Annotate lesson plans with constructive feedback.</li>
                      </ul>
                      <p className="text-sm text-blue-600 mt-2 italic">Example: &quot;Your CK-TK alignment is strong, but the PK lacks scaffolding for beginners.&quot;</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity 3 */}
                <Card className="border-l-4 border-l-purple-500 mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-100 text-purple-800">8 min</Badge>
                      <CardTitle className="text-lg">Activity 3: Collaborative Refinement</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li>&#8226; Revise lesson plans based on peer feedback.</li>
                      <li>&#8226; Submit final version to LMS portfolio with reflection: <em>Which TPACK component did your peer critiques most improve, and why?</em></li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Concept Check for development */}
                {getConceptCheckForSection('development') && user && user.userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheckForSection('development')!.id}
                      title={getConceptCheckForSection('development')!.title}
                      prompt={getConceptCheckForSection('development')!.prompt}
                      checkType={getConceptCheckForSection('development')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('development')} disabled={completedSections.has('development')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('development') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 5. Synthesis & Closure */}
              <LessonSection id="synthesis" title="Synthesis & Closure (15 minutes)" badge="Closure">
                <EditableContent
                  storageKey="editable:synthesis:description"
                  initialValue="Post-test assessment, peer-teaching in triads, and preview of the next session on LLM prompt engineering."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="space-y-3">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Post-Test</p>
                        <p className="text-sm text-muted-foreground">3 conceptual application questions. Example: &quot;Evaluate how GitHub Copilot might affect code quality in legacy systems&quot; (targets ILO2).</p>
                        <Link href="/quizzes" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
                          Take Post-Test <Zap className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Peer-Teaching</p>
                        <p className="text-sm text-muted-foreground">In triads, summarize one peer&apos;s TPACK design that effectively addressed AI democratization.</p>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600 shrink-0">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Next Session Preview</p>
                        <p className="text-sm text-muted-foreground">Connect to future topics on LLM prompt engineering for AI tool customization (pedagogical progression).</p>
                      </div>
                    </div>
                  </CardSection>
                </div>

                {/* Concept Check for synthesis */}
                {getConceptCheckForSection('synthesis') && user && user.userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheckForSection('synthesis')!.id}
                      title={getConceptCheckForSection('synthesis')!.title}
                      prompt={getConceptCheckForSection('synthesis')!.prompt}
                      checkType={getConceptCheckForSection('synthesis')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('synthesis')} disabled={completedSections.has('synthesis')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('synthesis') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 6. Assessment Methods */}
              <LessonSection id="assessment" title="Assessment Methods" badge="Assessment">
                <EditableContent
                  storageKey="editable:assessment:description"
                  initialValue="Both formative and summative assessments are used, including TPACK checkpoints, peer feedback quality analysis, confidence polls, and a portfolio rubric."
                  as="p"
                  className="text-muted-foreground mb-4"
                />

                <h3 className="font-semibold text-slate-900 mb-3">Formative Assessment</h3>
                <div className="space-y-2 mb-6">
                  {[
                    'TPACK Checkpoints: Monitor TPACK component balance in Miro boards during Activity 1.',
                    'Peer Feedback Quality: Analyze peer assessment rubrics for constructive specificity.',
                    'Poll: "Rate your confidence using TPACK to design AI-integrated lessons" (Likert scale via Slido).',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 mt-0.5">&#8226;</span>
                      {item}
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold text-slate-900 mb-3">Summative Assessment — Portfolio Rubric</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Criteria</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Exemplary (4)</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Developing (2-3)</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Needs Revision (1)</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Pedagogy Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="py-3 px-3 font-medium">TPACK Alignment</td>
                        <td className="py-3 px-3">All 3 components synergistically integrated</td>
                        <td className="py-3 px-3">1-2 components evident</td>
                        <td className="py-3 px-3">Missing key TPACK elements</td>
                        <td className="py-3 px-3"><Badge variant="outline">TPACK Framework</Badge></td>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="py-3 px-3 font-medium">Ethical Consideration</td>
                        <td className="py-3 px-3">Proactive AI risk mitigation strategy</td>
                        <td className="py-3 px-3">Basic acknowledgment</td>
                        <td className="py-3 px-3">Absent or superficial</td>
                        <td className="py-3 px-3"><Badge variant="outline">Peer Assessment</Badge></td>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <td className="py-3 px-3 font-medium">Feedback Incorporation</td>
                        <td className="py-3 px-3">Extensive adoption of peer feedback</td>
                        <td className="py-3 px-3">Partial implementation</td>
                        <td className="py-3 px-3">Minimal/no changes</td>
                        <td className="py-3 px-3"><Badge variant="outline">Peer Assessment</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('assessment')} disabled={completedSections.has('assessment')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('assessment') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 7. Constructive Alignment Matrix */}
              <LessonSection id="alignment" title="Constructive Alignment Matrix" badge="Alignment">
                <EditableContent
                  storageKey="editable:alignment:description"
                  initialValue="Maps each learning outcome to teaching activities, assessment methods, and pedagogy links ensuring constructive alignment."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Learning Outcome</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Teaching Activity</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Assessment Method</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700">Pedagogy Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="py-3 px-3 font-medium">ILO1 (Analyze AI impact)</td>
                        <td className="py-3 px-3">TPACK Lesson Design Sprint</td>
                        <td className="py-3 px-3">Post-Test Conceptual Questions</td>
                        <td className="py-3 px-3">AI tool integration in CK/TK</td>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="py-3 px-3 font-medium">ILO2 (Apply TPACK)</td>
                        <td className="py-3 px-3">Miro TPACK Lesson Board</td>
                        <td className="py-3 px-3">Portfolio TPACK Rubric</td>
                        <td className="py-3 px-3">CK/PK/TK triad structure</td>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <td className="py-3 px-3 font-medium">ILO3 (Evaluate peers)</td>
                        <td className="py-3 px-3">Structured Rubric</td>
                        <td className="py-3 px-3">Peer Feedback Quality</td>
                        <td className="py-3 px-3">Calibrated peer assessment</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('alignment')} disabled={completedSections.has('alignment')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('alignment') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 8. Resources & Technology */}
              <LessonSection id="resources" title="Resources & Technology" badge="Resources">
                <EditableContent
                  storageKey="editable:resources:description"
                  initialValue="TPACK Tools: Miro, GitHub Classroom. Peer Assessment: Peergrade.io. AI Tools: GitHub Copilot Sandbox, Tabnine Code Completions."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-2">TPACK Tools</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>&#8226; Miro (collaborative boards)</li>
                      <li>&#8226; GitHub Classroom (sample AI projects)</li>
                    </ul>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-2">Peer Assessment</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>&#8226; Peergrade.io</li>
                      <li>&#8226; LMS rubric builder</li>
                    </ul>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-2">AI Tools</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>&#8226; GitHub Copilot Sandbox (live demos)</li>
                      <li>&#8226; Tabnine Code Completions</li>
                    </ul>
                  </CardSection>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('resources')} disabled={completedSections.has('resources')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('resources') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 9. Differentiation & Inclusivity */}
              <LessonSection id="differentiation" title="Differentiation & Inclusivity" badge="Inclusivity">
                <EditableContent
                  storageKey="editable:differentiation:description"
                  initialValue="TPACK Scaffolds: Tiered templates for novice learners, advanced options with low-code/no-code platforms. Accessibility: Captioned videos, screen-reader-friendly templates. Inclusive Design: Global case studies."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-2">TPACK Scaffolds</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>&#8226; Tiered templates for novice learners (pre-filled CK boxes)</li>
                      <li>&#8226; Advanced: low-code/no-code platforms (Teachable Machine)</li>
                    </ul>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-2">Accessibility</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>&#8226; Captioned videos + transcripts for AI tooling demos</li>
                      <li>&#8226; Screen-reader-friendly Miro templates</li>
                    </ul>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-2">Inclusive Design</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>&#8226; Case studies from global contexts (e.g., India&apos;s AI-assisted coding bootcamps)</li>
                    </ul>
                  </CardSection>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('differentiation')} disabled={completedSections.has('differentiation')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('differentiation') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 10. Reflection & Improvement */}
              <LessonSection id="reflection" title="Reflection & Improvement" badge="Reflection">
                <EditableContent
                  storageKey="editable:reflection:description"
                  initialValue="TPACK Metrics: Track lesson plan revisions from peer feedback. Student Voice: Qualtrics survey. Modification Strategy: Adjust based on peer assessment depth and TPACK component balance."
                  as="p"
                  className="text-muted-foreground mb-4"
                />
                <div className="space-y-3">
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-1">TPACK Metrics</p>
                    <p className="text-sm text-muted-foreground">Track lesson plan revisions prompted by peer feedback (quantify % of improvements).</p>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-1">Student Voice</p>
                    <p className="text-sm text-muted-foreground">Collect feedback via Qualtrics survey: &quot;Did TPACK rubrics clarify how to integrate AI tools pedagogically?&quot; (Likert scale + open response).</p>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-slate-900 text-sm mb-1">Modification Strategy</p>
                    <ul className="space-y-1 text-sm text-muted-foreground mt-1">
                      <li>&#8226; If peer assessments lack depth &rarr; Add more calibration examples with AI ethical dilemmas.</li>
                      <li>&#8226; If TPACK designs show TK over PK &rarr; Schedule supplemental workshop on instructional design basics.</li>
                    </ul>
                  </CardSection>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('reflection')} disabled={completedSections.has('reflection')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('reflection') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>

              {/* 11. Material Generation — Interactive & Non-Interactive */}
              <LessonSection id="materials" title="Generated Materials" badge="Interactive">
                <div className="space-y-6">
                  {/* TPACK Flashcards */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      TPACK Components Flashcards
                    </h3>
                    <Flashcard cards={FLASHCARD_DATA} />
                  </div>

                  <Separator />

                  {/* TPACK Venn Diagram (simplified) */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-violet-600" />
                      TPACK Venn Diagram
                    </h3>
                    <div className="relative w-64 h-56 mx-auto">
                      {/* Overlapping circles */}
                      <div className="absolute w-36 h-36 rounded-full bg-blue-200/60 top-2 left-4 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-800">CK</span>
                      </div>
                      <div className="absolute w-36 h-36 rounded-full bg-green-200/60 top-2 right-4 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-800">PK</span>
                      </div>
                      <div className="absolute w-36 h-36 rounded-full bg-amber-200/60 bottom-0 left-14 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-800">TK</span>
                      </div>
                      {/* Center label */}
                      <div className="absolute top-16 left-20 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-800 bg-white/80 rounded px-1">TPACK</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Case Study */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-600" />
                      TPACK Case Study Development
                    </h3>
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="pt-4">
                        <p className="text-sm text-amber-900">
                          <strong>Scenario:</strong> A learner struggles with AI-generated code violating accessibility standards. Instructors co-create a case study analyzing where TPACK components were misaligned:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-amber-800">
                          <li>&#8226; <strong>CK:</strong> Accessibility principles</li>
                          <li>&#8226; <strong>TK:</strong> Copilot limitations</li>
                          <li>&#8226; <strong>PK:</strong> Scaffolding strategies</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Peer Assessment Feedback Guide */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      Peer Assessment Feedback Guide
                    </h3>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4 space-y-2">
                        <p className="text-sm text-green-900 font-medium">Phrase starters for constructive peer reviews:</p>
                        <ul className="space-y-2 text-sm text-green-800">
                          <li className="p-2 bg-white/60 rounded">&quot;Your lesson effectively used [AI tool] to address [topic], however...&quot;</li>
                          <li className="p-2 bg-white/60 rounded">&quot;Consider strengthening [TPACK domain] by adding...&quot;</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleMarkComplete('materials')} disabled={completedSections.has('materials')}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {completedSections.has('materials') ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </LessonSection>
            </main>
          </div>
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
