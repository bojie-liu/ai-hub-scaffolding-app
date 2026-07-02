'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getQuiz } from '@/lib/actions/quiz';
import { getDiscussion } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getStudentProgress } from '@/lib/actions/progress';
import { markSectionComplete } from '@/lib/actions/progress';
import {
  GraduationCap, BookOpen, Video, HelpCircle, MessageSquare, Users,
  Scale, ClipboardCheck, Target, Wrench, Heart, Lightbulb, CheckCircle2,
} from 'lucide-react';

const SECTIONS = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'activity1', label: 'Ethical Dilemma' },
  { id: 'activity2', label: 'Role-Play' },
  { id: 'activity3', label: 'Whole Person Dev.' },
  { id: 'activity4', label: 'Equity Debate' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
];

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
}

interface QuestionData {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface PostData {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function LessonPage() {
  const { user } = useUser();
  const [preTestQuestions, setPreTestQuestions] = useState<QuestionData[]>([]);
  const [postTestQuestions, setPostTestQuestions] = useState<QuestionData[]>([]);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussionData, setDiscussionData] = useState<{ id: number; title: string; description: string | null; posts: PostData[] } | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const results = await Promise.allSettled([
        getQuiz(1).catch(() => null),
        getQuiz(2).catch(() => null),
        getConceptChecks(),
        getDiscussion(1).catch(() => null),
        user && user.userId > 0 ? getStudentProgress(user.userId) : Promise.resolve({ success: false, data: [] }),
      ]);

      // Pre-test quiz (id=1)
      if (results[0].status === 'fulfilled' && results[0].value?.success && results[0].value?.data) {
        setPreTestQuestions(results[0].value.data.questions as QuestionData[]);
      }
      // Post-test quiz (id=2)
      if (results[1].status === 'fulfilled' && results[1].value?.success && results[1].value?.data) {
        setPostTestQuestions(results[1].value.data.questions as QuestionData[]);
      }
      // Concept checks
      if (results[2].status === 'fulfilled' && results[2].value?.success && results[2].value?.data) {
        setConceptChecks(results[2].value.data as ConceptCheckData[]);
      }
      // Discussion
      if (results[3].status === 'fulfilled' && results[3].value?.success && results[3].value?.data) {
        const d = results[3].value.data;
        setDiscussionData({
          id: d.discussion.id,
          title: d.discussion.title,
          description: d.discussion.description,
          posts: d.posts.map((p) => ({
            id: p.id,
            parentId: p.parentPostId,
            authorId: p.authorId,
            authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
            content: p.content,
            createdAt: String(p.createdAt ?? new Date()),
          })),
        });
      }
      // Progress
      if (results[4].status === 'fulfilled' && results[4].value?.success && results[4].value?.data) {
        setCompletedSections(new Set(
          (results[4].value.data as { sectionKey: string; completed: boolean }[])
            .filter((p) => p.completed)
            .map((p) => p.sectionKey)
        ));
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleMarkComplete = useCallback(async (sectionKey: string) => {
    if (!user || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections((prev) => new Set(prev).add(sectionKey));
    }
  }, [user]);

  const getConceptCheckForSection = (sectionKey: string) => {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <ScrollRootProvider>
        <div className="flex max-w-7xl mx-auto">
          <LessonSideMenu sections={SECTIONS} />
          <main className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
                <GraduationCap className="h-4 w-4" />
                Teacher Professionalism (Test 03)
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Professional Ethics in Teaching Practice
              </h1>
              <p className="text-muted-foreground">Duration: 150 minutes | Class Size: 40 students | Year 4 Undergraduates | Hong Kong Context</p>
            </div>

            {/* 1. ILOs */}
            <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="ILOs">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg mt-0.5"><Target className="h-4 w-4 text-blue-600" /></div>
                      <div>
                        <EditableContent storageKey="content:ilo1" initialValue="Analyze ethical dilemmas in Hong Kong teaching contexts using EDB guidelines." as="p" className="text-sm" />
                        <Badge variant="outline" className="mt-1 text-xs">Bloom: Analyze</Badge>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg mt-0.5"><ClipboardCheck className="h-4 w-4 text-indigo-600" /></div>
                      <div>
                        <EditableContent storageKey="content:ilo2" initialValue="Evaluate attributes of a professional teacher through self-assessment and peer feedback." as="p" className="text-sm" />
                        <Badge variant="outline" className="mt-1 text-xs">Bloom: Evaluate</Badge>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg mt-0.5"><Heart className="h-4 w-4 text-emerald-600" /></div>
                      <div>
                        <EditableContent storageKey="content:ilo3" initialValue="Apply principles of whole person development to address student diversity in schools." as="p" className="text-sm" />
                        <Badge variant="outline" className="mt-1 text-xs">Bloom: Apply</Badge>
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg mt-0.5"><Scale className="h-4 w-4 text-amber-600" /></div>
                      <div>
                        <EditableContent storageKey="content:ilo4" initialValue="Critique education equity policies in Hong Kong using case studies." as="p" className="text-sm" />
                        <Badge variant="outline" className="mt-1 text-xs">Bloom: Evaluate</Badge>
                      </div>
                    </div>
                  </CardSection>
                </div>
                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('ilos') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('ilos')}
                      disabled={completedSections.has('ilos')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('ilos') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('ilos') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* 2. Pre-Class Preparation */}
            <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Before Class">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" /> Materials
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">&#8226;</span>
                      <span>Reading: <a href="https://www.edb.gov.hk/attachment/en/teacher/guidelines_tpc/guidelines_en.pdf" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">Guidelines on Professional Conduct for Teachers</a> (Focus on Sections 2.1–2.3, 3.1)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">&#8226;</span>
                      <span>Video: <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">Ethical Challenges in Hong Kong Classrooms</a></span>
                    </li>
                  </ul>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-blue-500" /> Pre-Test Quiz
                  </h3>
                  {preTestQuestions.length > 0 && user && user.userId > 0 ? (
                    <Quiz quizId={1} title="Pre-Test: Teacher Professionalism" questions={preTestQuestions} userId={user.userId} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sign in to take the pre-test quiz.</p>
                  )}
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" /> Guiding Questions
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#8226;</span>
                      <EditableContent storageKey="content:gq1" initialValue="Recall an ethical issue you observed during teaching practice. How did you resolve it?" as="span" className="text-sm" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#8226;</span>
                      <EditableContent storageKey="content:gq2" initialValue='How might "education equity" differ in rural vs. urban Hong Kong schools?' as="span" className="text-sm" />
                    </li>
                  </ul>
                </CardSection>

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('preclass') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('preclass')}
                      disabled={completedSections.has('preclass')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('preclass') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('preclass') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* 3. Introduction */}
            <LessonSection id="introduction" title="3. Introduction" badge="15 min">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-500" /> Hook
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">&#8226;</span>
                      <EditableContent storageKey="content:hook1" initialValue="Show a short video clip of a Hong Kong teacher whistleblowing on unfair grading policies." as="span" className="text-sm" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">&#8226;</span>
                      <EditableContent storageKey="content:hook2" initialValue='Provocative question: "Is it ethical to withhold grades to encourage improvement? Why or why not?"' as="span" className="text-sm" />
                    </li>
                  </ul>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" /> Pre-Test Discussion
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">&#8226;</span>
                      <EditableContent storageKey="content:predisc1" initialValue="Review quiz results using Mentimeter polls to highlight common misconceptions (e.g., conflating equality with equity)." as="span" className="text-sm" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">&#8226;</span>
                      <EditableContent storageKey="content:predisc2" initialValue="Share anonymized survey quotes from former students on challenges of upholding EDB guidelines." as="span" className="text-sm" />
                    </li>
                  </ul>
                </CardSection>

                {getConceptCheckForSection('introduction') && user && user.userId > 0 && (
                  <ConceptCheck
                    checkId={getConceptCheckForSection('introduction')!.id}
                    title={getConceptCheckForSection('introduction')!.title}
                    prompt={getConceptCheckForSection('introduction')!.prompt}
                    checkType={getConceptCheckForSection('introduction')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                )}

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('introduction') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('introduction')}
                      disabled={completedSections.has('introduction')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('introduction') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('introduction') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* Activity 1: Ethical Dilemma */}
            <LessonSection id="activity1" title="Activity 1: Ethical Dilemma Case Study Analysis" badge="30 min">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Task</h3>
                  <EditableContent storageKey="content:act1-task" initialValue="Analyze a case study: A teacher discovers a parent falsifying their child's Special Educational Needs (SEN) documentation to access exam accommodations." as="p" className="text-sm" multiline />
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Process</h3>
                  <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                    <li>Small groups (4–5 students) discuss using a decision-making framework: &quot;Identify Stakeholders → Legal/Ethical Implications → EDB Guidelines&quot;</li>
                    <li>Groups present solutions; peers critique using the hashtag <Badge variant="secondary" className="text-xs">#EdEthicsHK</Badge></li>
                  </ol>
                </CardSection>

                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-amber-800">Brainteaser</p>
                        <EditableContent storageKey="content:act1-brain" initialValue='Should teachers prioritize student well-being over school policies in such cases?' as="p" className="text-sm text-amber-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Discussion for Activity 1 */}
                {discussionData && user && user.userId > 0 && (
                  <Discussion
                    discussionId={discussionData.id}
                    title={discussionData.title}
                    description={discussionData.description}
                    posts={discussionData.posts}
                    userId={user.userId}
                    userRole={user.role}
                  />
                )}

                {getConceptCheckForSection('activity1') && user && user.userId > 0 && (
                  <ConceptCheck
                    checkId={getConceptCheckForSection('activity1')!.id}
                    title={getConceptCheckForSection('activity1')!.title}
                    prompt={getConceptCheckForSection('activity1')!.prompt}
                    checkType={getConceptCheckForSection('activity1')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                )}

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('activity1') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('activity1')}
                      disabled={completedSections.has('activity1')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('activity1') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('activity1') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* Activity 2: Role-Play */}
            <LessonSection id="activity2" title="Activity 2: Role-Play – Professional Teacher Attributes" badge="20 min">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Task</h3>
                  <EditableContent storageKey="content:act2-task" initialValue="Role-play scenarios (e.g., handling a parent complaint, addressing plagiarism)." as="p" className="text-sm" multiline />
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Process</h3>
                  <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                    <li>Students self-assign roles (teacher, student, parent, principal).</li>
                    <li>Reflect on <a href="https://www.edb.gov.hk/attachment/en/teacher/guidelines_tpc/guidelines_en.pdf" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">EDB Guideline 3.1</a> during a debrief.</li>
                  </ol>
                </CardSection>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-blue-800">Brainstorming Question</p>
                        <EditableContent storageKey="content:act2-brain" initialValue="What traits define a &quot;role model&quot; teacher in Hong Kong&apos;s multicultural schools?" as="p" className="text-sm text-blue-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {getConceptCheckForSection('activity2') && user && user.userId > 0 && (
                  <ConceptCheck
                    checkId={getConceptCheckForSection('activity2')!.id}
                    title={getConceptCheckForSection('activity2')!.title}
                    prompt={getConceptCheckForSection('activity2')!.prompt}
                    checkType={getConceptCheckForSection('activity2')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                )}

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('activity2') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('activity2')}
                      disabled={completedSections.has('activity2')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('activity2') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('activity2') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* Activity 3: Whole Person Development */}
            <LessonSection id="activity3" title="Activity 3: Whole Person Development in Practice" badge="25 min">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Task</h3>
                  <EditableContent storageKey="content:act3-task" initialValue="Critique a mock school policy (e.g., mandatory uniform rules vs. student self-expression)." as="p" className="text-sm" multiline />
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Process</h3>
                  <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                    <li>Groups redesign the policy to align with <a href="https://www.edb.gov.hk/attachment/en/curriculum-development/kla/pshe/edb-guidelines.pdf" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">EDB&apos;s Life-Wide Learning Framework</a>.</li>
                    <li>Present using a Padlet board with visual aids.</li>
                  </ol>
                </CardSection>

                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-amber-800">Brainteaser</p>
                        <EditableContent storageKey="content:act3-brain" initialValue="How can career guidance programs for DSE students promote whole person development?" as="p" className="text-sm text-amber-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {getConceptCheckForSection('activity3') && user && user.userId > 0 && (
                  <ConceptCheck
                    checkId={getConceptCheckForSection('activity3')!.id}
                    title={getConceptCheckForSection('activity3')!.title}
                    prompt={getConceptCheckForSection('activity3')!.prompt}
                    checkType={getConceptCheckForSection('activity3')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                )}

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('activity3') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('activity3')}
                      disabled={completedSections.has('activity3')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('activity3') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('activity3') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* Activity 4: Equity Debate */}
            <LessonSection id="activity4" title="Activity 4: Equity vs. Equality Debate" badge="30 min">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Task</h3>
                  <EditableContent storageKey="content:act4-task" initialValue="Analyze Hong Kong's school funding disparities (e.g., International vs. Local schools)." as="p" className="text-sm" multiline />
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Process</h3>
                  <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                    <li>Divide class into proponents of &quot;funding equality&quot; vs. &quot;funding equity.&quot;</li>
                    <li>Use a &quot;Yes, But...&quot; debate format to refine arguments.</li>
                  </ol>
                </CardSection>

                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-amber-800">Brainteaser</p>
                        <EditableContent storageKey="content:act4-brain" initialValue="Is providing free textbooks to all students equitable, or does it exacerbate inequality?" as="p" className="text-sm text-amber-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {getConceptCheckForSection('activity4') && user && user.userId > 0 && (
                  <ConceptCheck
                    checkId={getConceptCheckForSection('activity4')!.id}
                    title={getConceptCheckForSection('activity4')!.title}
                    prompt={getConceptCheckForSection('activity4')!.prompt}
                    checkType={getConceptCheckForSection('activity4')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                )}

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('activity4') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('activity4')}
                      disabled={completedSections.has('activity4')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('activity4') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('activity4') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* Synthesis & Closure */}
            <LessonSection id="synthesis" title="Synthesis & Closure" badge="20 min">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-green-500" /> Post-Test
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">Kahoot quiz with 5 questions to measure learning gain.</p>
                  {postTestQuestions.length > 0 && user && user.userId > 0 ? (
                    <Quiz quizId={2} title="Post-Test: Professional Ethics Review" questions={postTestQuestions} userId={user.userId} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sign in to take the post-test quiz.</p>
                  )}
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> Exit Ticket Reflection
                  </h3>
                  <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                    <li><EditableContent storageKey="content:exit1" initialValue='What is one ethical principle you will prioritize in your first year as a teacher?' as="span" className="text-sm" /></li>
                    <li><EditableContent storageKey="content:exit2" initialValue='How did your teaching practice experiences shape your understanding of professionalism?' as="span" className="text-sm" /></li>
                  </ol>
                </CardSection>

                {user && user.userId > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant={completedSections.has('synthesis') ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkComplete('synthesis')}
                      disabled={completedSections.has('synthesis')}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1.5 ${completedSections.has('synthesis') ? 'text-emerald-500' : ''}`} />
                      {completedSections.has('synthesis') ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </LessonSection>

            {/* Assessment Methods */}
            <LessonSection id="assessment" title="4. Assessment Methods">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Formative</h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li className="flex items-start gap-2"><span className="text-indigo-500">&#8226;</span> Observation of group discussions and role-play</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-500">&#8226;</span> Exit ticket responses and post-test results</li>
                  </ul>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Summative — Case Study Analysis (Individual Assignment)</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">Rubric:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-50 rounded px-3 py-2">Analysis depth</div>
                      <div className="bg-slate-50 rounded px-3 py-2 font-medium">30%</div>
                      <div className="bg-slate-50 rounded px-3 py-2">EDB guideline citation</div>
                      <div className="bg-slate-50 rounded px-3 py-2 font-medium">25%</div>
                      <div className="bg-slate-50 rounded px-3 py-2">Practical solutions</div>
                      <div className="bg-slate-50 rounded px-3 py-2 font-medium">30%</div>
                      <div className="bg-slate-50 rounded px-3 py-2">Clarity</div>
                      <div className="bg-slate-50 rounded px-3 py-2 font-medium">15%</div>
                    </div>
                  </div>
                </CardSection>
              </div>
            </LessonSection>

            {/* Constructive Alignment Matrix */}
            <LessonSection id="alignment" title="5. Constructive Alignment Matrix">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Learning Outcome</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Teaching Activity</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Assessment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['ILO 1', 'Case study analysis', 'Case study assignment'],
                      ['ILO 2', 'Role-play and peer feedback', 'Exit ticket self-reflection'],
                      ['ILO 3', 'Policy redesign task', 'Padlet presentation'],
                      ['ILO 4', 'Equity debate', 'Debates and post-test'],
                    ].map(([ilo, activity, assessment], i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-indigo-700">{ilo}</td>
                        <td className="py-3 px-3">{activity}</td>
                        <td className="py-3 px-3">{assessment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LessonSection>

            {/* Resources */}
            <LessonSection id="resources" title="6. Required Resources & Technology">
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-start gap-2"><span className="text-indigo-500">&#8226;</span><span>LMS (e.g., Moodle) for pre-class materials</span></div>
                <div className="flex items-start gap-2"><span className="text-indigo-500">&#8226;</span><span>Mentimeter for polls; Padlet for group work</span></div>
                <div className="flex items-start gap-2"><span className="text-indigo-500">&#8226;</span><span>Printed role-play scenarios and EDB guideline excerpts</span></div>
                <div className="flex items-start gap-2"><span className="text-indigo-500">&#8226;</span><span>Projector for video clips and case study display</span></div>
              </div>
            </LessonSection>

            {/* Differentiation & Inclusivity */}
            <LessonSection id="differentiation" title="7. Differentiation & Inclusivity">
              <div className="space-y-4">
                <CardSection>
                  <h4 className="font-semibold text-sm text-emerald-700 mb-1">Support</h4>
                  <p className="text-sm text-slate-700">Provide multilingual glossaries (Cantonese/English) for policy terms.</p>
                </CardSection>
                <CardSection>
                  <h4 className="font-semibold text-sm text-blue-700 mb-1">Extensions</h4>
                  <p className="text-sm text-slate-700">Advanced students compare HK vs. international equity policies.</p>
                </CardSection>
                <CardSection>
                  <h4 className="font-semibold text-sm text-purple-700 mb-1">Accommodations</h4>
                  <p className="text-sm text-slate-700">Offer alternative formats (e.g., audio summaries for visually impaired learners).</p>
                </CardSection>
              </div>
            </LessonSection>

            {/* Reflection & Improvement */}
            <LessonSection id="reflection" title="8. Reflection & Improvement">
              <div className="space-y-4">
                <CardSection>
                  <h4 className="font-semibold text-sm text-slate-800 mb-2">Success Indicators</h4>
                  <p className="text-sm text-slate-700">75% of students score 80%+ on post-test; active participation in debates.</p>
                </CardSection>
                <CardSection>
                  <h4 className="font-semibold text-sm text-slate-800 mb-2">Feedback Tools</h4>
                  <p className="text-sm text-slate-700">Anonymous Google Form for lesson feedback.</p>
                </CardSection>
                <CardSection>
                  <h4 className="font-semibold text-sm text-slate-800 mb-2">Future Enhancements</h4>
                  <p className="text-sm text-slate-700">Include guest lectures from EDB representatives or practicing teachers.</p>
                </CardSection>
              </div>
            </LessonSection>

            <Separator />

            <div className="text-center text-sm text-muted-foreground pb-8">
              <p>All activities incorporate Hong Kong-specific policies, cases, and terminology.</p>
              <p className="mt-1">The lesson emphasizes new teachers&apos; challenges (e.g., balancing institutional rules vs. ethical obligations).</p>
            </div>
          </main>
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
