'use client';

import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Quiz from '@/components/lesson/interactive/Quiz';
import DiscussionEmbed from '@/components/lesson/interactive/DiscussionEmbed';
import SeciModel from '@/components/lesson/interactive/SeciModel';
import AlignmentMatrix from '@/components/lesson/interactive/AlignmentMatrix';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { markSectionComplete } from '@/lib/actions/progress';
import { toast } from 'sonner';
import Link from 'next/link';
import { BookOpen, Video, ClipboardCheck, MessageSquare, FileText, Clock, Users, Brain, Target, BarChart3, Monitor, Heart, Lightbulb, Coffee } from 'lucide-react';
import { useState } from 'react';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quiz: { id: number; storageKey: string; title: string; description: string | null; quizType: string };
  questions: QuizQuestion[];
}

interface DiscussionItem {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  isPinned: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
}

interface ConceptCheckItem {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
  createdAt: Date | null;
}

interface LessonClientProps {
  preTest: QuizData | null;
  postTest: QuizData | null;
  discussions: DiscussionItem[];
  conceptChecks: ConceptCheckItem[];
}

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'development-a', label: 'KM Frameworks' },
  { id: 'development-b', label: 'Case Study' },
  { id: 'development-c', label: 'Audit Simulation' },
  { id: 'development-d', label: 'Strategy Creation' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'inclusivity', label: 'Inclusivity' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'additional', label: 'Additional Notes' },
];

function SectionCompleteButton({ sectionKey }: { sectionKey: string }) {
  const { user } = useUser();
  const [completed, setCompleted] = useState(false);

  if (!user || user.role === 'GUEST') return null;

  const handleComplete = async () => {
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompleted(true);
      toast.success('Section marked as complete!');
    }
  };

  return (
    <Button
      variant={completed ? 'default' : 'outline'}
      size="sm"
      onClick={handleComplete}
      disabled={completed}
      className="mt-2"
    >
      {completed ? 'Completed' : 'Mark Complete'}
    </Button>
  );
}

export default function LessonClient({ preTest, postTest, discussions, conceptChecks }: LessonClientProps) {
  const { user } = useUser();
  const userId = user?.userId ?? 0;
  const userRole = user?.role ?? 'GUEST';

  const getConceptCheck = (sectionKey: string) =>
    conceptChecks.filter((c) => c.sectionKey === sectionKey);

  const getDiscussionByStorageKey = (key: string) =>
    discussions.find((d) => d.storageKey === key);

  return (
    <ScrollRootProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex max-w-7xl mx-auto px-4 py-6 gap-6">
          <LessonSideMenu sections={SECTIONS} />

          <main className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    <EditableContent storageKey="content:ilos:title" initialValue="Knowledge Management and School Development" as="span" />
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 180 minutes</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 90 students</span>
                    <span className="flex items-center gap-1"><Brain className="h-3.5 w-3.5" /> First-year undergraduates</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link href="/slides">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Monitor className="h-4 w-4" /> View Slides
                  </Button>
                </Link>
                {userRole === 'TEACHER' && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <BarChart3 className="h-4 w-4" /> Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Section 1: ILOs */}
            <LessonSection id="ilos" title="Intended Learning Outcomes (ILOs)" badge="Outcomes">
              <EditableContent storageKey="content:ilos:description" initialValue="By the end of this session, students will be able to:" as="p" className="text-muted-foreground mb-4" />
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5 shrink-0">ILO 1</Badge>
                  <EditableContent storageKey="content:ilos:1" initialValue="Analyze how rapid IT and internet development impacts knowledge creation and sharing in educational settings." as="span" className="text-sm" />
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5 shrink-0">ILO 2</Badge>
                  <EditableContent storageKey="content:ilos:2" initialValue="Evaluate the effectiveness of existing knowledge management (KM) strategies in addressing school leadership challenges." as="span" className="text-sm" />
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5 shrink-0">ILO 3</Badge>
                  <EditableContent storageKey="content:ilos:3" initialValue="Create a tailored KM strategy for a hypothetical school context, integrating knowledge auditing and sharing mechanisms." as="span" className="text-sm" />
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5 shrink-0">ILO 4</Badge>
                  <EditableContent storageKey="content:ilos:4" initialValue="Apply techniques to identify and assess knowledge assets within an organization." as="span" className="text-sm" />
                </li>
              </ol>
              <SectionCompleteButton sectionKey="ilos" />
            </LessonSection>

            {/* Section 2: Pre-Class Preparation */}
            <LessonSection id="preclass" title="Pre-Class Preparation" badge="Flipped Learning">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" /> Pre-Reading
                  </h3>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="content:preclass:reading1" initialValue="Nonaka & Takeuchi's SECI Model (summary handout) [Existing Material]." as="span" className="text-sm" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="content:preclass:reading2" initialValue="Case Study: School A's KM System Failure (PDF uploaded to LMS)." as="span" className="text-sm" />
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-blue-600" /> Pre-Test / Diagnostic Quiz
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete this 5-question quiz to assess your prior knowledge of key KM concepts before the session.
                  </p>
                  {preTest && userId > 0 ? (
                    <Quiz
                      quizId={preTest.quiz.id}
                      title={preTest.quiz.title}
                      questions={preTest.questions}
                      userId={userId}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {userId <= 0 ? 'Please log in to take the pre-test quiz.' : 'Pre-test quiz is not available yet.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> Guiding Questions
                  </h3>
                  <div className="space-y-2">
                    {getDiscussionByStorageKey('discussion:cloud-tools') && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-amber-800">
                          &ldquo;How might cloud storage tools (e.g., Google Workspace) reshape knowledge sharing among teachers?&rdquo;
                        </p>
                      </div>
                    )}
                    {getDiscussionByStorageKey('discussion:km-barriers') && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-amber-800">
                          &ldquo;What barriers do school leaders face in preserving institutional knowledge?&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="preclass" />
            </LessonSection>

            {/* Section 3: Introduction */}
            <LessonSection id="introduction" title="Introduction (25 minutes)" badge="Warm-up">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-500" /> Hook: Digital Overload
                  </h3>
                  <EditableContent storageKey="content:intro:hook" initialValue={"Show a 3-minute video (\"Digital Overload: A School's KM Crisis\") prompting discussion on IT's mixed impact."} as="p" className="text-sm text-muted-foreground" />
                  <div className="mt-3 bg-slate-100 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                    <div className="text-center">
                      <Video className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Video: &ldquo;Digital Overload: A School&apos;s KM Crisis&rdquo; (3 min)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" /> Pre-Test Review
                  </h3>
                  <EditableContent storageKey="content:intro:pretest" initialValue="Analyze quiz results in real time using Mentimeter word cloud for common misconceptions." as="p" className="text-sm text-muted-foreground" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" /> Real-World Connection
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <EditableContent storageKey="content:intro:realworld" initialValue="How has your prior workplace/school managed knowledge? Was it effective?" as="p" className="text-sm font-medium text-blue-800" />
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="introduction" />
            </LessonSection>

            {/* Section 4: Development A - KM Frameworks */}
            <LessonSection id="development-a" title="KM Frameworks & IT Disruption" badge="Activity A | 30 min">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Interactive Lecture on KM Frameworks and how IT disrupts knowledge management.</p>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">SECI Model Visualization</h3>
                  <EditableContent storageKey="content:dev-a:seci" initialValue="Use animated SECI model visualization to illustrate knowledge conversion processes." as="p" className="text-sm text-muted-foreground mb-3" />
                  <SeciModel />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">IT&apos;s Dual Role</h3>
                  <EditableContent storageKey="content:dev-a:it-role" initialValue="Discuss IT's dual role (e.g., Slack for collaboration vs. fragmented information)." as="p" className="text-sm text-muted-foreground" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-emerald-800 mb-1">Enhances</p>
                      <ul className="text-sm text-emerald-700 space-y-1 ml-4">
                        <li>- Real-time collaboration (Slack, Teams)</li>
                        <li>- Cloud storage (Google Drive)</li>
                        <li>- Knowledge repositories (wikis)</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-red-800 mb-1">Hinders</p>
                      <ul className="text-sm text-red-700 space-y-1 ml-4">
                        <li>- Information fragmentation</li>
                        <li>- Digital overload</li>
                        <li>- Loss of tacit knowledge transfer</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Think-Pair-Share</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <EditableContent storageKey="content:dev-a:thinkpair" initialValue="Describe a KM tool you use. Does it enhance or hinder learning?" as="p" className="text-sm font-medium text-amber-800" />
                  </div>
                </div>

                {/* Concept Checks for this section */}
                {userId > 0 && getConceptCheck('development-a').map((cc) => (
                  <ConceptCheck
                    key={cc.id}
                    checkId={cc.id}
                    title={cc.title}
                    prompt={cc.prompt}
                    checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={userId}
                    userRole={userRole}
                  />
                ))}

                {/* Discussion embed */}
                {getDiscussionByStorageKey('discussion:seci-school') && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Discussion: Applying the SECI Model</h3>
                    <DiscussionEmbed discussionId={getDiscussionByStorageKey('discussion:seci-school')!.id} userId={userId} userRole={userRole} />
                  </div>
                )}
              </div>
              <SectionCompleteButton sectionKey="development-a" />
            </LessonSection>

            {/* Section 5: Development B - Case Study */}
            <LessonSection id="development-b" title="Case Study Analysis" badge="Activity B | 40 min">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Small group discussion analyzing School A&apos;s KM Failure.</p>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Structured Prompts</h3>
                  <div className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="text-sm font-semibold text-blue-800 mr-2">Prompt 1:</span>
                      <EditableContent storageKey="content:dev-b:prompt1" initialValue="Identify 2 strengths and 2 weaknesses in the school's KM strategy." as="span" className="text-sm text-blue-700" />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="text-sm font-semibold text-blue-800 mr-2">Prompt 2:</span>
                      <EditableContent storageKey="content:dev-b:prompt2" initialValue="Suggest 1 IT solution to address the weaknesses." as="span" className="text-sm text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-2">Deliverable</h3>
                  <p className="text-sm text-muted-foreground">
                    Groups post summaries on the discussion board below.
                  </p>
                </div>

                {/* Discussion embeds for case study */}
                {getDiscussionByStorageKey('discussion:km-barriers') && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Discussion: KM Barriers in Schools</h3>
                    <DiscussionEmbed discussionId={getDiscussionByStorageKey('discussion:km-barriers')!.id} userId={userId} userRole={userRole} />
                  </div>
                )}
              </div>
              <SectionCompleteButton sectionKey="development-b" />
            </LessonSection>

            {/* Section 6: Development C - Knowledge Audit */}
            <LessonSection id="development-c" title="Knowledge Audit Simulation" badge="Activity C | 30 min">
              <div className="space-y-4">
                <EditableContent storageKey="content:dev-c:template" initialValue="Provide template for auditing knowledge assets (e.g., staff expertise, digital archives)." as="p" className="text-sm text-muted-foreground" />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Knowledge Asset Audit Template</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200 rounded-lg">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-slate-700 border-b">Asset Type</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700 border-b">Current State</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700 border-b">Gap</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700 border-b">Action Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium">Staff Expertise</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium">Digital Archives</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium">Process Documentation</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Communities of Practice</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                          <td className="py-2 px-3 text-muted-foreground">_</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <EditableContent storageKey="content:dev-c:activity" initialValue="Simulate audit for a hypothetical underperforming school using fictional data." as="p" className="text-sm text-muted-foreground" />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Key Terms</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Knowledge Mapping</Badge>
                    <Badge variant="secondary">Communities of Practice</Badge>
                    <Badge variant="secondary">Knowledge Audit</Badge>
                    <Badge variant="secondary">Tacit Knowledge</Badge>
                    <Badge variant="secondary">Explicit Knowledge</Badge>
                    <Badge variant="secondary">Socialization</Badge>
                    <Badge variant="secondary">Externalization</Badge>
                  </div>
                </div>

                {/* Concept checks for audit section */}
                {userId > 0 && getConceptCheck('development-c').map((cc) => (
                  <ConceptCheck
                    key={cc.id}
                    checkId={cc.id}
                    title={cc.title}
                    prompt={cc.prompt}
                    checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={userId}
                    userRole={userRole}
                  />
                ))}
              </div>
              <SectionCompleteButton sectionKey="development-c" />
            </LessonSection>

            {/* Section 7: Development D - Peer Teaching */}
            <LessonSection id="development-d" title="KM Strategy Creation" badge="Activity D | 25 min">
              <div className="space-y-4">
                <EditableContent storageKey="content:dev-d:activity" initialValue={"Groups present audit findings and co-construct a KM strategy. Use \"Speed Dating\" format: Rotate groups to refine strategies with feedback from peers."} as="p" className="text-sm text-muted-foreground" />

                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <h3 className="font-semibold text-violet-800 mb-2">Speed Dating Format</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-violet-200 text-center">
                      <div className="text-2xl mb-1">1</div>
                      <p className="text-xs font-medium text-violet-800">Present findings</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-violet-200 text-center">
                      <div className="text-2xl mb-1">2</div>
                      <p className="text-xs font-medium text-violet-800">Rotate & receive feedback</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-violet-200 text-center">
                      <div className="text-2xl mb-1">3</div>
                      <p className="text-xs font-medium text-violet-800">Refine strategy</p>
                    </div>
                  </div>
                </div>

                {/* Discussion embed for cloud tools */}
                {getDiscussionByStorageKey('discussion:cloud-tools') && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Discussion: Cloud Tools & Knowledge Sharing</h3>
                    <DiscussionEmbed discussionId={getDiscussionByStorageKey('discussion:cloud-tools')!.id} userId={userId} userRole={userRole} />
                  </div>
                )}
              </div>
              <SectionCompleteButton sectionKey="development-d" />
            </LessonSection>

            {/* Section 8: Synthesis & Closure */}
            <LessonSection id="synthesis" title="Synthesis & Closure" badge="30 min">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-blue-600" /> Post-Test
                  </h3>
                  <EditableContent storageKey="content:synthesis:posttest" initialValue="Short online quiz (3 questions mirroring pre-test to measure progress)." as="p" className="text-sm text-muted-foreground mb-3" />
                  {postTest && userId > 0 ? (
                    <Quiz
                      quizId={postTest.quiz.id}
                      title={postTest.quiz.title}
                      questions={postTest.questions}
                      userId={userId}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {userId <= 0 ? 'Please log in to take the post-test quiz.' : 'Post-test quiz is not available yet.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" /> Reflective Discussion
                  </h3>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <EditableContent storageKey="content:synthesis:reflection" initialValue="One thing I'll apply to improve knowledge sharing at my school." as="p" className="text-sm font-medium text-emerald-800" />
                  </div>
                </div>

                {/* Concept check for synthesis */}
                {userId > 0 && getConceptCheck('synthesis').map((cc) => (
                  <ConceptCheck
                    key={cc.id}
                    checkId={cc.id}
                    title={cc.title}
                    prompt={cc.prompt}
                    checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={userId}
                    userRole={userRole}
                  />
                ))}

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Preview: Next Session</h3>
                  <EditableContent storageKey="content:synthesis:preview" initialValue="Next session on Implementing KM Systems (include readings on change management)." as="p" className="text-sm text-muted-foreground" />
                </div>
              </div>
              <SectionCompleteButton sectionKey="synthesis" />
            </LessonSection>

            {/* Section 9: Assessment Methods */}
            <LessonSection id="assessment" title="Assessment Methods" badge="Assessment">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Formative Assessment</h3>
                  <ul className="space-y-2 ml-4 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <span><strong>Mentimeter Word Cloud</strong>: Track pre/post-test misconceptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <span><strong>Discussion Postings</strong>: Quality of case study analysis and audit conclusions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <span><strong>Peer Feedback</strong>: Evaluate participation in speed-dating activity</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Summative Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Case Study Assignment</strong> (due next week): Develop a KM plan for a real school context.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Rubric</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <EditableContent storageKey="content:assessment:rubric1" initialValue="Analysis depth" as="span" className="text-sm" />
                        <Badge variant="outline">30%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <EditableContent storageKey="content:assessment:rubric2" initialValue="Strategy feasibility" as="span" className="text-sm" />
                        <Badge variant="outline">30%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <EditableContent storageKey="content:assessment:rubric3" initialValue="Use of KM frameworks" as="span" className="text-sm" />
                        <Badge variant="outline">30%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <EditableContent storageKey="content:assessment:rubric4" initialValue="Creativity/presentation" as="span" className="text-sm" />
                        <Badge variant="outline">10%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="assessment" />
            </LessonSection>

            {/* Section 10: Constructive Alignment Matrix */}
            <LessonSection id="alignment" title="Constructive Alignment Matrix" badge="Alignment">
              <AlignmentMatrix />
              <SectionCompleteButton sectionKey="alignment" />
            </LessonSection>

            {/* Section 11: Required Resources & Technology */}
            <LessonSection id="resources" title="Required Resources & Technology" badge="Resources">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">LMS</h4>
                    <EditableContent storageKey="content:resources:lms" initialValue="Moodle for pre/post-tests and readings." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Interactive Tools</h4>
                    <EditableContent storageKey="content:resources:tools" initialValue="Mentimeter (polls/q&a), Padlet (group boards), Kahoot! (flashcards)." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Physical Materials</h4>
                    <EditableContent storageKey="content:resources:physical" initialValue="SECI model poster (printed for classroom display)." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="resources" />
            </LessonSection>

            {/* Section 12: Differentiation & Inclusivity */}
            <LessonSection id="inclusivity" title="Differentiation & Inclusivity" badge="Inclusivity">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Support</h4>
                    <EditableContent storageKey="content:inclusivity:support" initialValue="Provide captioned videos, readable screen materials, and extended time for neurodivergent learners." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Advanced Learners</h4>
                    <EditableContent storageKey="content:inclusivity:advanced" initialValue="Optional reading on social network analysis for KM." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Multilingual</h4>
                    <EditableContent storageKey="content:inclusivity:multilingual" initialValue="Glossary of terms in Traditional Chinese and English." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>

                {/* Glossary */}
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">Glossary / 詞彙表</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { en: 'Knowledge Management', zh: '知識管理' },
                      { en: 'Tacit Knowledge', zh: '隱性知識' },
                      { en: 'Explicit Knowledge', zh: '顯性知識' },
                      { en: 'SECI Model', zh: 'SECI 模型' },
                      { en: 'Socialization', zh: '社會化' },
                      { en: 'Externalization', zh: '外化' },
                      { en: 'Combination', zh: '組合化' },
                      { en: 'Internalization', zh: '內化' },
                      { en: 'Knowledge Audit', zh: '知識審計' },
                      { en: 'Community of Practice', zh: '實踐社群' },
                      { en: 'Knowledge Mapping', zh: '知識地圖' },
                      { en: 'Knowledge Sharing', zh: '知識分享' },
                    ].map((item) => (
                      <div key={item.en} className="flex items-center gap-2 text-sm bg-slate-50 rounded px-3 py-1.5">
                        <span className="font-medium text-slate-800">{item.en}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-blue-700">{item.zh}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="inclusivity" />
            </LessonSection>

            {/* Section 13: Reflection & Improvement */}
            <LessonSection id="reflection" title="Reflection & Improvement" badge="Reflection">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Success Indicators</h4>
                    <EditableContent storageKey="content:reflection:success" initialValue="High quiz score improvement and Padlet activity rates." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Feedback</h4>
                    <EditableContent storageKey="content:reflection:feedback" initialValue="Anonymized student survey on perceived KM skill gains." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Future Modifications</h4>
                    <EditableContent storageKey="content:reflection:future" initialValue="Replace case study annually with diverse global school examples." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="reflection" />
            </LessonSection>

            {/* Section 14: Additional Notes */}
            <LessonSection id="additional" title="Additional Notes" badge="Info">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Coffee className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Breaks</h4>
                    <EditableContent storageKey="content:additional:breaks" initialValue="10-minute break after 60 minutes and 15-minute break after 100 minutes." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Scalability</h4>
                    <EditableContent storageKey="content:additional:scalability" initialValue="Use Padlet breakout rooms for synchronous group collaboration." as="p" className="text-sm text-muted-foreground" />
                  </div>
                </div>
              </div>
              <SectionCompleteButton sectionKey="additional" />
            </LessonSection>
          </main>
        </div>
      </div>
    </ScrollRootProvider>
  );
}
