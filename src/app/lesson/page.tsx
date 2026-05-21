'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import Quiz from '@/components/lesson/interactive/Quiz';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { getQuizByStorageKey } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions } from '@/lib/actions/discussion';
import { getStudentProgress, markSectionComplete } from '@/lib/actions/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Clock,
  Video,
  HelpCircle,
  Users,
  Presentation,
  Wrench,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Monitor,
  Heart,
  RefreshCw,
  FileText,
  Lightbulb,
  Target,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface QuizDetail {
  quiz: { id: number; title: string; description: string | null };
  questions: {
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
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

interface DiscussionSummary {
  id: number;
  title: string;
  description: string | null;
  postCount: number;
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
  { id: 'appendices', label: 'Appendices' },
];

export default function LessonPage() {
  const { user } = useUser();
  const [pretestQuiz, setPretestQuiz] = useState<QuizDetail | null>(null);
  const [posttestQuiz, setPosttestQuiz] = useState<QuizDetail | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch pre-test quiz by storage key
      const pretestResult = await getQuizByStorageKey('pretest-tpack');
      if (pretestResult.success && pretestResult.data) {
        setPretestQuiz(pretestResult.data as QuizDetail);
      }

      // Fetch post-test quiz by storage key
      const posttestResult = await getQuizByStorageKey('posttest-tpack');
      if (posttestResult.success && posttestResult.data) {
        setPosttestQuiz(posttestResult.data as QuizDetail);
      }

      // Fetch concept checks
      const checksResult = await getConceptChecks();
      if (checksResult.success && checksResult.data) {
        setConceptChecks(checksResult.data);
      }

      // Fetch discussions
      const discussionsResult = await getDiscussions();
      if (discussionsResult.success && discussionsResult.data) {
        setDiscussions(discussionsResult.data);
      }

      // Fetch student progress
      if (user && user.userId > 0) {
        const progressResult = await getStudentProgress(user.userId);
        if (progressResult.success && progressResult.data) {
          const completed = new Set(
            progressResult.data.filter((p) => p.completed).map((p) => p.sectionKey)
          );
          setCompletedSections(completed);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || user.userId <= 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections((prev) => new Set(prev).add(sectionKey));
      toast.success('Section marked complete!');
    }
  }

  function getConceptCheckForSection(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((c) => c.sectionKey === sectionKey);
  }

  function getDiscussionForGuidingQ(index: number): DiscussionSummary | undefined {
    return discussions[index];
  }

  const isTeacher = user?.role === 'TEACHER';

  return (
    <AuthGuard>
      <ScrollRootProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
            <LessonSideMenu sections={SECTIONS} />

            <main className="flex-1 min-w-0 space-y-6 pb-12">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 sm:p-8 text-white">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Intelligent TPACK Lesson Plan</h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Technology, Pedagogy, and Content Knowledge for the AI Era
                </p>
                <div className="flex items-center gap-4 mt-4 text-blue-200 text-sm">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 180 min</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 90 students</span>
                  <span className="flex items-center gap-1"><Target className="h-4 w-4" /> University Year 2</span>
                </div>
              </div>

              {/* Section 1: ILOs */}
              <LessonSection id="ilos" title="1. Intended Learning Outcomes (ILOs)" badge="Outcomes">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold shrink-0">{n}</span>
                      <EditableContent
                        storageKey={`ilo-${n}`}
                        initialValue={[
                          'Analyze the seven components of Intelligent TPACK and their intersections',
                          'Evaluate existing lesson plans for strengths/weaknesses in technology integration using Intelligent TPACK framework',
                          'Apply intelligent design principles to create innovative technology-enhanced pedagogical approaches',
                          'Synthesize disciplinary content knowledge with educational technology tools to solve authentic teaching problems',
                          'Critique ethical considerations of AI integration in teaching practice',
                        ][n - 1]}
                        as="p"
                        className="text-slate-700 text-sm"
                        multiline
                      />
                    </div>
                  ))}
                </div>
                {getConceptCheckForSection('ilos') && user && user.userId > 0 && (
                  <div className="mt-4">
                    <ConceptCheck
                      checkId={getConceptCheckForSection('ilos')!.id}
                      title={getConceptCheckForSection('ilos')!.title}
                      prompt={getConceptCheckForSection('ilos')!.prompt}
                      checkType={getConceptCheckForSection('ilos')!.checkType as 'thumbs' | 'scale' | 'text'}
                      userId={user.userId}
                      userRole={user.role}
                    />
                  </div>
                )}
                {!completedSections.has('ilos') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('ilos')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 2: Pre-Class Preparation */}
              <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Before Class">
                <div className="space-y-4">
                  {/* Video */}
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Required Viewing</h3>
                        <EditableContent
                          storageKey="preclass-video"
                          initialValue='"TPACK Framework Explained" (7min) + OECD 2021 Report excerpt: "Artificial Intelligence in Education" (2 pages)'
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
                  </CardSection>

                  {/* Pre-test Quiz */}
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">Pre-Test Quiz</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          10-question quiz on TPACK basics and AI integration challenges
                        </p>
                        {pretestQuiz && user && user.userId > 0 ? (
                          <div className="mt-3">
                            <Quiz
                              quizId={pretestQuiz.quiz.id}
                              title={pretestQuiz.quiz.title}
                              questions={pretestQuiz.questions.map((q) => ({
                                id: q.id,
                                questionText: q.questionText,
                                questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                                explanation: q.explanation,
                                answers: q.answers,
                              }))}
                              userId={user.userId}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">Log in to take the pre-test quiz</p>
                        )}
                      </div>
                    </div>
                  </CardSection>

                  {/* Guiding Questions */}
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">Guiding Questions</h3>
                        <div className="space-y-3 mt-2">
                          {[
                            'How do you currently integrate technology in your teaching practice?',
                            'What do you consider the "intelligence" components in technology-based teaching?',
                            'What ethical dilemmas might arise from AI tools in classrooms?',
                          ].map((q, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-indigo-500 font-bold text-sm">{i + 1}.</span>
                              <div className="flex-1">
                                <EditableContent
                                  storageKey={`guiding-q-${i + 1}`}
                                  initialValue={q}
                                  as="p"
                                  className="text-sm text-slate-700"
                                  multiline
                                />
                                {getDiscussionForGuidingQ(i) && (
                                  <Link href={`/discussion/${getDiscussionForGuidingQ(i)!.id}`}>
                                    <Button variant="link" size="sm" className="text-xs px-0 mt-1">
                                      Join Discussion <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardSection>
                </div>
                {!completedSections.has('preclass') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('preclass')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 3: Introduction */}
              <LessonSection id="introduction" title="3. Teaching & Learning Activities: Introduction (27 min)" badge="27 min">
                <div className="space-y-4">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Hook Activity</h3>
                        <EditableContent
                          storageKey="intro-hook"
                          initialValue="Project image of a traditional classroom vs. AI-integrated classroom side-by-side. Think-pair-share: Which elements would you want to maintain/transform in these environments?"
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Pre-Test Review</h3>
                        <EditableContent
                          storageKey="intro-pretest-review"
                          initialValue="5min overview of common misconceptions shown in pre-test responses using Mentimeter word cloud"
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Real-world Connection</h3>
                        <EditableContent
                          storageKey="intro-case"
                          initialValue={"Case scenario \"Ms. Chen's Tech Dilemma\" - a teacher struggling to engage students with current tech tools"}
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
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
                </div>
                {!completedSections.has('introduction') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('introduction')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 4: Development Activities */}
              <LessonSection id="development" title="3. Teaching & Learning Activities: Development (135 min)" badge="135 min">
                <div className="space-y-6">
                  {/* Activity 1 */}
                  <CardSection className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Presentation className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">Activity 1: Interactive Lecture & Graphic Organizer</h3>
                      <Badge variant="outline" className="text-xs">30 min</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <EditableContent
                        storageKey="activity1-content"
                        initialValue="Co-construct digital concept map using Padlet displaying the framework's 7 components. Scaffolding: Worked example analyzing historical TPACK application."
                        as="p"
                        multiline
                      />
                    </div>
                    {getConceptCheckForSection('activity1') && user && user.userId > 0 && (
                      <div className="mt-3">
                        <ConceptCheck
                          checkId={getConceptCheckForSection('activity1')!.id}
                          title={getConceptCheckForSection('activity1')!.title}
                          prompt={getConceptCheckForSection('activity1')!.prompt}
                          checkType={getConceptCheckForSection('activity1')!.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={user.userId}
                          userRole={user.role}
                        />
                      </div>
                    )}
                  </CardSection>

                  {/* Activity 2 */}
                  <CardSection className="border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-semibold text-slate-800">Activity 2: Case Analysis Roundtables</h3>
                      <Badge variant="outline" className="text-xs">45 min</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <EditableContent
                        storageKey="activity2-content"
                        initialValue="5 case studies (Google Docs) showing varying degrees of TPACK implementation. Groups rotate through stations every 8min, using the Case Analysis Template to: 1) Identify TPACK components used, 2) Suggest enhancements using intelligent tools, 3) Propose ethical considerations"
                        as="p"
                        multiline
                      />
                    </div>
                  </CardSection>

                  {/* Activity 3 */}
                  <CardSection className="border-l-4 border-l-violet-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="h-5 w-5 text-violet-600" />
                      <h3 className="font-semibold text-slate-800">Activity 3: AI Toolkit Workshop</h3>
                      <Badge variant="outline" className="text-xs">40 min</Badge>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <EditableContent
                        storageKey="activity3-content"
                        initialValue="Demonstration of 4 intelligent tools. Groups create 3-5 min demos integrating specific content/pedagogy needs."
                        as="p"
                        multiline
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { name: 'Canva for Education', desc: 'Visual content creation' },
                          { name: 'Quizizz AI', desc: 'Adaptive assessments' },
                          { name: 'Genially', desc: 'Interactive presentations' },
                          { name: 'Edpuzzle', desc: 'Interactive video' },
                        ].map((tool, i) => (
                          <div key={i} className="p-2 rounded-lg bg-violet-50 border border-violet-100">
                            <p className="font-medium text-violet-800 text-xs">{tool.name}</p>
                            <p className="text-violet-600 text-xs">{tool.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {getConceptCheckForSection('activity3') && user && user.userId > 0 && (
                      <div className="mt-3">
                        <ConceptCheck
                          checkId={getConceptCheckForSection('activity3')!.id}
                          title={getConceptCheckForSection('activity3')!.title}
                          prompt={getConceptCheckForSection('activity3')!.prompt}
                          checkType={getConceptCheckForSection('activity3')!.checkType as 'thumbs' | 'scale' | 'text'}
                          userId={user.userId}
                          userRole={user.role}
                        />
                      </div>
                    )}
                  </CardSection>

                  {/* Activity 4 */}
                  <CardSection className="border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-semibold text-slate-800">Activity 4: Peer Teaching Carousel</h3>
                      <Badge variant="outline" className="text-xs">20 min</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="font-medium text-slate-700">6 rotating stations with focus areas:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Content/TK intersection in STEM',
                          'Adaptive instruction in language learning',
                          'Ethical use frameworks',
                          'Assessment with AI tools',
                          'Student engagement design',
                          'Professional development strategies',
                        ].map((area, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-emerald-50 border border-emerald-100">
                            <span className="text-emerald-600 font-bold text-xs">{i + 1}.</span>
                            <span className="text-emerald-800 text-xs">{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardSection>

                  {/* Breaks */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-slate-50 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>Breaks: 10 min mid-section break + 5 min hydration break</span>
                  </div>
                </div>
                {!completedSections.has('development') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('development')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 5: Synthesis & Closure */}
              <LessonSection id="synthesis" title="3. Teaching & Learning Activities: Synthesis & Closure (18 min)" badge="18 min">
                <div className="space-y-4">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">Post-Test Quiz</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          10-item adaptive quiz with immediate individual feedback
                        </p>
                        {posttestQuiz && user && user.userId > 0 ? (
                          <div className="mt-3">
                            <Quiz
                              quizId={posttestQuiz.quiz.id}
                              title={posttestQuiz.quiz.title}
                              questions={posttestQuiz.questions.map((q) => ({
                                id: q.id,
                                questionText: q.questionText,
                                questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                                explanation: q.explanation,
                                answers: q.answers,
                              }))}
                              userId={user.userId}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">Log in to take the post-test quiz</p>
                        )}
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Reflective Discussion</h3>
                        <EditableContent
                          storageKey="synthesis-discussion"
                          initialValue='How might your teaching philosophy need to evolve to incorporate intelligent technologies?'
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Next Session Preview</h3>
                        <EditableContent
                          storageKey="synthesis-preview"
                          initialValue='Assignment prompt for next session: "Designing a 21st Century Professional Learning Plan"'
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
                  </CardSection>
                </div>
                {!completedSections.has('synthesis') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('synthesis')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 6: Assessment Methods */}
              <LessonSection id="assessment" title="4. Assessment Methods" badge="Assessment">
                <div className="space-y-6">
                  {/* Formative */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Formative Assessment</h3>
                    <div className="space-y-2">
                      {[
                        'Participation in roundtable discussions (tracked via Padlet interaction)',
                        'Quality of digital demonstrations',
                        'Immediate feedback from adaptive post-test',
                        'Exit ticket: "Identify one technology misconception you now understand differently"',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-blue-500 mt-1">&#8226;</span>
                          <EditableContent
                            storageKey={`formative-${i + 1}`}
                            initialValue={item}
                            as="span"
                            className="flex-1"
                            multiline
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Summative */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Summative Assessment</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      <EditableContent
                        storageKey="summative-desc"
                        initialValue="Design a technology-integrated lesson plan using Intelligent TPACK (3 pages)"
                        as="span"
                        multiline
                      />
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">Component</th>
                            <th className="text-center p-3 font-semibold text-slate-700 border border-slate-200">Excellent (4)</th>
                            <th className="text-center p-3 font-semibold text-slate-700 border border-slate-200">Proficient (3)</th>
                            <th className="text-center p-3 font-semibold text-slate-700 border border-slate-200">Developing (2)</th>
                            <th className="text-center p-3 font-semibold text-slate-700 border border-slate-200">Needs Work (1)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              component: 'TPACK Framework Integration',
                              excellent: 'All 7 components clearly identified and interconnected',
                              proficient: '5+ components explained with minor gaps',
                              developing: '3-4 components addressed',
                              needsWork: '<3 components incorporated',
                            },
                            {
                              component: 'Intelligent Design Elements',
                              excellent: '3+ AI tools intentionally connected to pedagogy',
                              proficient: '2 tools with clear rationale',
                              developing: '1 tool with basic justification',
                              needsWork: 'Tools mentioned without explanation',
                            },
                            {
                              component: 'Ethical Reflection',
                              excellent: 'Multifaceted analysis of equity/privacy issues',
                              proficient: 'Basic ethical considerations addressed',
                              developing: 'Surface-level acknowledgment',
                              needsWork: 'No ethical analysis provided',
                            },
                            {
                              component: 'Innovation & Practicality',
                              excellent: 'Creatively combines content/technology',
                              proficient: 'Effective application with minor limitations',
                              developing: 'Limited innovation, some feasibility issues',
                              needsWork: 'Unrealistic implementation plan',
                            },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-3 font-medium text-slate-800 border border-slate-200">{row.component}</td>
                              <td className="p-3 text-emerald-700 border border-slate-200">{row.excellent}</td>
                              <td className="p-3 text-blue-700 border border-slate-200">{row.proficient}</td>
                              <td className="p-3 text-amber-700 border border-slate-200">{row.developing}</td>
                              <td className="p-3 text-red-700 border border-slate-200">{row.needsWork}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {!completedSections.has('assessment') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('assessment')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 7: Constructive Alignment Matrix */}
              <LessonSection id="alignment" title="5. Constructive Alignment Matrix" badge="Alignment">
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
                      {[
                        { outcome: 'Analyze components', activity: 'Interactive lecture + graphic organizer', assessment: 'Pre/post-test multiple choice' },
                        { outcome: 'Evaluate lesson plans', activity: 'Case analysis roundtables', assessment: 'Case analysis worksheet + rubric' },
                        { outcome: 'Apply design principles', activity: 'AI Toolkit workshop + peer teaching', assessment: 'Digital demonstration rubric' },
                        { outcome: 'Synthesize knowledge', activity: 'Lesson plan design workshop', assessment: 'Summative assignment rubric' },
                        { outcome: 'Critique ethics', activity: 'Rotating station ethics discussion', assessment: 'Ethics rubric dimension in assignment' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800 border border-slate-200">{row.outcome}</td>
                          <td className="p-3 text-slate-600 border border-slate-200">{row.activity}</td>
                          <td className="p-3 text-slate-600 border border-slate-200">{row.assessment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!completedSections.has('alignment') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('alignment')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 8: Required Resources & Technology */}
              <LessonSection id="resources" title="6. Required Resources & Technology" badge="Resources">
                <div className="space-y-4">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Monitor className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">LMS Tools (Canvas)</h3>
                        <p className="text-sm text-slate-600">Pre-assessment, readings, case studies</p>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Interactive Platforms</h3>
                        <div className="space-y-1 mt-2">
                          {[
                            { name: 'Mentimeter', desc: 'Pre/post tests' },
                            { name: 'Padlet', desc: 'Concept mapping' },
                            { name: 'Zoom breakout rooms', desc: 'For 90 students' },
                          ].map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-indigo-700">{p.name}</span>
                              <span className="text-slate-500">&mdash;</span>
                              <span className="text-slate-600">{p.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Wrench className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Technology Demonstration Tools</h3>
                        <p className="text-sm text-slate-600">Google Workspace, Canva for Education</p>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Reference Materials</h3>
                        <div className="space-y-1 mt-2 text-sm text-slate-600">
                          <p>&#8226; Koehler & Mishra (2009) TPACK framework article</p>
                          <p>&#8226; UNESCO&apos;s AI & Teacher Toolkit (2022)</p>
                        </div>
                      </div>
                    </div>
                  </CardSection>
                </div>
                {!completedSections.has('resources') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('resources')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 9: Differentiation & Inclusivity */}
              <LessonSection id="differentiation" title="7. Differentiation & Inclusivity" badge="Inclusivity">
                <div className="space-y-4">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Supports</h3>
                        <div className="space-y-1 mt-1 text-sm text-slate-600">
                          <p>&#8226; Visual guides for auditory components</p>
                          <p>&#8226; Multiple access points to digital materials (mobile/web/desktop)</p>
                        </div>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Extensions</h3>
                        <p className="text-sm text-slate-600 mt-1">Advanced learners analyze UNESCO&apos;s AI guidelines</p>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Accommodations</h3>
                        <div className="space-y-1 mt-1 text-sm text-slate-600">
                          <p>&#8226; Closed captioning for videos</p>
                          <p>&#8226; Alternative formats for all digital materials</p>
                        </div>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Language</h3>
                        <div className="space-y-1 mt-1 text-sm text-slate-600">
                          <p>&#8226; Bilingual terminology flashcards</p>
                          <p>&#8226; Plain language summaries for technical concepts</p>
                        </div>
                      </div>
                    </div>
                  </CardSection>
                </div>
                {!completedSections.has('differentiation') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('differentiation')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 10: Reflection & Improvement */}
              <LessonSection id="reflection" title="8. Reflection & Improvement" badge="Reflection">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-slate-800 mb-2">Indicators</h3>
                    <div className="space-y-2">
                      {[
                        { target: '80%', desc: 'participation in peer teaching carousel' },
                        { target: '70%', desc: 'average score on post-test' },
                        { target: '90%', desc: 'submission rate for summative assignment' },
                      ].map((ind, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded bg-slate-50">
                          <Badge variant="default" className="text-xs">{ind.target}</Badge>
                          <span className="text-sm text-slate-600">{ind.desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 mb-2">Feedback</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>&#8226; Mid-lesson pulse check (Mentimeter)</p>
                      <p>&#8226; Post-lesson survey with Likert scale questions</p>
                    </div>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 mb-2">Modifications</h3>
                    <EditableContent
                      storageKey="reflection-modifications"
                      initialValue="Adjust breakout group sizes based on engagement data; update case studies annually with current tech examples"
                      as="p"
                      className="text-sm text-slate-600"
                      multiline
                    />
                  </CardSection>
                </div>
                {!completedSections.has('reflection') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('reflection')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>

              {/* Section 11: Appendices */}
              <LessonSection id="appendices" title="Appendices" badge="Reference">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Case Analysis Template</h3>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                      {[
                        { label: 'Case Title', key: 'case-title' },
                        { label: 'Current TPACK Components Identified', key: 'case-tpack' },
                        { label: 'Technology Integration Gaps', key: 'case-gaps' },
                        { label: 'Proposed Intelligent Tools', key: 'case-tools' },
                        { label: 'Ethical Considerations', key: 'case-ethics' },
                        { label: 'Recommended Modifications', key: 'case-mods' },
                      ].map((field) => (
                        <div key={field.key}>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                          <div className="h-8 border-b border-dashed border-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Interactive Tools</h3>
                    <div className="space-y-3">
                      <CardSection>
                        <h4 className="font-medium text-slate-700 text-sm">Canvas Module: Intelligent TPACK Resources</h4>
                        <div className="space-y-1 mt-2 text-sm text-slate-600">
                          <p>&#8226; All pre-class materials</p>
                          <p>&#8226; Downloadable graphic organizer</p>
                          <p>&#8226; Case studies repository</p>
                          <p>&#8226; Demonstration recordings</p>
                        </div>
                      </CardSection>

                      <CardSection>
                        <h4 className="font-medium text-slate-700 text-sm">Mentimeter Polls Collection</h4>
                        <div className="space-y-1 mt-2 text-sm text-slate-600">
                          <p>1. Pre-test</p>
                          <p>2. Post-test</p>
                          <p>3. Ethical Dilemma Pulse Check</p>
                        </div>
                      </CardSection>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Pedagogical Approaches</h3>
                    <div className="space-y-2">
                      {[
                        'Scaffolded learning through concrete to abstract progression',
                        'Active blended learning combining synchronous and asynchronous activities',
                        'Collaborative knowledge construction through peer teaching',
                        'Technology-mediated pedagogy reflecting course content',
                      ].map((approach, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <RefreshCw className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <EditableContent
                            storageKey={`pedagogy-${i + 1}`}
                            initialValue={approach}
                            as="span"
                            className="flex-1"
                            multiline
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {!completedSections.has('appendices') && user && user.userId > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleMarkComplete('appendices')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </Button>
                )}
              </LessonSection>
            </main>
          </div>
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
