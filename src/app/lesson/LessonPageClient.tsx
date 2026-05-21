'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { getDiscussions, getDiscussion } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target, Video, Lightbulb, Factory, FlaskConical,
  Users, Waves, ClipboardCheck, FileText, Link2, Accessibility,
  RefreshCw, Package, ExternalLink
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: string;
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quiz: { id: number; title: string; storageKey: string };
  questions: QuizQuestion[];
}

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null; storageKey: string };
  posts: Array<{
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
}

const sections = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'pollution-control', label: 'Pollution Control' },
  { id: 'waste-hierarchy', label: 'Waste Hierarchy' },
  { id: 'case-study', label: 'Case Study' },
  { id: 'peer-teaching', label: 'Peer Teaching' },
  { id: 'marine-workshop', label: 'Marine Workshop' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
  { id: 'differentiation', label: 'Differentiation' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'materials', label: 'Materials' },
];

function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function LessonPageClient() {
  const { user, isGuest } = useUser();

  const [quizDataMap, setQuizDataMap] = useState<Map<string, QuizData>>(new Map());
  const [discussionDataMap, setDiscussionDataMap] = useState<Map<string, DiscussionData>>(new Map());
  const [conceptCheckList, setConceptCheckList] = useState<ConceptCheckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const quizzesResult = await getAllQuizzes();
        if (quizzesResult.success && quizzesResult.data) {
          const quizMap = new Map<string, QuizData>();
          await Promise.all(
            quizzesResult.data.map(async (quiz: { id: number; storageKey: string }) => {
              const detail = await getQuiz(quiz.id);
              if (detail.success && detail.data) {
                quizMap.set(quiz.storageKey, detail.data as QuizData);
              }
            })
          );
          setQuizDataMap(quizMap);
        }

        const discussionsResult = await getDiscussions();
        if (discussionsResult.success && discussionsResult.data) {
          const discMap = new Map<string, DiscussionData>();
          await Promise.all(
            discussionsResult.data.map(async (disc: { id: number; storageKey: string }) => {
              const detail = await getDiscussion(disc.id);
              if (detail.success && detail.data) {
                const d = detail.data as any;
                discMap.set(disc.storageKey, {
                  discussion: d.discussion,
                  posts: d.posts.map((p: any) => ({
                    id: p.id,
                    parentId: p.parentPostId,
                    authorId: p.authorId,
                    authorName: p.authorDisplayName || p.authorUsername || 'User',
                    content: p.content,
                    createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt?.toISOString() || '',
                  })),
                });
              }
            })
          );
          setDiscussionDataMap(discMap);
        }

        const checksResult = await getConceptChecks();
        if (checksResult.success && checksResult.data) {
          setConceptCheckList(checksResult.data as ConceptCheckData[]);
        }
      } catch (error) {
        console.error('Failed to load lesson data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function findConceptCheck(storageKey: string): ConceptCheckData | undefined {
    return conceptCheckList.find((cc: ConceptCheckData) => cc.storageKey === storageKey);
  }

  function renderQuiz(storageKey: string) {
    if (!user || isGuest) return <SignInPrompt message="Sign in to take this quiz" />;
    const data = quizDataMap.get(storageKey);
    if (!data) return null;
    return (
      <Quiz
        quizId={data.quiz.id}
        title={data.quiz.title}
        questions={data.questions.map((q: QuizQuestion) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
          explanation: q.explanation,
          answers: q.answers,
        }))}
        userId={user.userId}
      />
    );
  }

  function renderDiscussion(storageKey: string) {
    if (!user || isGuest) return <SignInPrompt message="Sign in to join the discussion" />;
    const data = discussionDataMap.get(storageKey);
    if (!data) return null;
    return (
      <Discussion
        discussionId={data.discussion.id}
        title={data.discussion.title}
        description={data.discussion.description}
        posts={data.posts}
        userId={user.userId}
        userRole={user.role}
      />
    );
  }

  function renderConceptCheck(storageKey: string) {
    if (!user || isGuest) return <SignInPrompt message="Sign in to respond" />;
    const check = findConceptCheck(storageKey);
    if (!check) return null;
    return (
      <ConceptCheck
        checkId={check.id}
        title={check.title}
        prompt={check.prompt}
        checkType={check.checkType as 'thumbs' | 'scale' | 'text'}
        userId={user.userId}
        userRole={user.role}
      />
    );
  }

  function interactiveLoading() {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  return (
    <AuthGuard>
      <ScrollRootProvider>
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <LessonSideMenu sections={sections} />
          <main className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="mb-8">
                <EditableContent
                  storageKey="lesson:title"
                  initialValue="Hong Kong Environment Science: Pollution Control and Waste Management"
                  as="h1"
                  className="text-3xl font-bold text-slate-900"
                />
                <EditableContent
                  storageKey="lesson:subtitle"
                  initialValue="University Year 1 | Environmental Science"
                  as="p"
                  className="text-muted-foreground mt-2"
                />
              </div>

              <Separator />

              {/* 1. Intended Learning Outcomes */}
              <LessonSection id="ilos" title="1. Intended Learning Outcomes (ILOs)" badge="Bloom's Taxonomy">
                <p className="text-sm text-muted-foreground mb-4">
                  <EditableContent
                    storageKey="lesson:ilo-intro"
                    initialValue="By the end of the session, students will be able to:"
                  />
                </p>
                <ol className="list-decimal list-inside space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">1.</span>
                    <span className="flex-1">
                      <EditableContent
                        storageKey="lesson:ilo-1"
                        initialValue="Compare pollution control strategies in Hong Kong with global best practices"
                      />
                      <Badge variant="outline" className="ml-2 text-xs">Analyze</Badge>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">2.</span>
                    <span className="flex-1">
                      <EditableContent
                        storageKey="lesson:ilo-2"
                        initialValue="Evaluate the effectiveness of waste management policies in reducing landfill dependency"
                      />
                      <Badge variant="outline" className="ml-2 text-xs">Evaluate</Badge>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">3.</span>
                    <span className="flex-1">
                      <EditableContent
                        storageKey="lesson:ilo-3"
                        initialValue="Design a localized solution for household waste reduction using circular economy principles"
                      />
                      <Badge variant="outline" className="ml-2 text-xs">Create</Badge>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">4.</span>
                    <span className="flex-1">
                      <EditableContent
                        storageKey="lesson:ilo-4"
                        initialValue="Analyze case studies of pollution crises in Hong Kong (e.g., microplastics in Victoria Harbour) to propose mitigation plans"
                      />
                      <Badge variant="outline" className="ml-2 text-xs">Analyze</Badge>
                    </span>
                  </li>
                </ol>
              </LessonSection>

              {/* 2. Pre-Class Preparation */}
              <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="Flipped Learning">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <EditableContent
                        storageKey="lesson:preclass-video"
                        initialValue="Pre-Video: Watch the 10-minute Hong Kong Environmental Protection Department Video on Waste Management"
                        as="p"
                        className="font-medium"
                      />
                      <a
                        href="https://www.environment.gov.hk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        www.environment.gov.hk <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <EditableContent
                        storageKey="lesson:preclass-test"
                        initialValue="Pre-Test: Complete a 5-question quiz on basic pollution terms (e.g., Define 'landfill leachate')"
                        as="p"
                        className="font-medium"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium text-sm text-blue-800 mb-2">Guiding Questions:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                      <li>
                        <EditableContent
                          storageKey="lesson:preclass-q1"
                          initialValue="What are the three biggest waste management challenges in Hong Kong?"
                        />
                      </li>
                      <li>
                        <EditableContent
                          storageKey="lesson:preclass-q2"
                          initialValue="How does a waste hierarchy pyramid work, and why is it relevant here?"
                        />
                      </li>
                    </ul>
                  </div>
                  {loading ? interactiveLoading() : renderQuiz('quiz:pre-test')}
                </div>
              </LessonSection>

              {/* 3. Introduction */}
              <LessonSection id="introduction" title="3. Introduction" badge="25 minutes">
                <div className="space-y-4">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Hook Activity</p>
                        <EditableContent
                          storageKey="lesson:hook"
                          initialValue={"Display a timelapse video of Hong Kong's landfills reaching capacity. Ask: \"How will Hong Kong manage waste when all landfills close by 2035?\""}
                          as="p"
                          className="text-sm text-slate-600 mt-1"
                          multiline
                        />
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-sm">Pre-Test Review</p>
                    <EditableContent
                      storageKey="lesson:pretest-review"
                      initialValue='Use live polling on Mentimeter to discuss common misconceptions (e.g., "Recycling alone solves waste issues").'
                      as="p"
                      className="text-sm text-slate-600 mt-1"
                      multiline
                    />
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-sm">Real-World Connection</p>
                    <EditableContent
                      storageKey="lesson:real-world"
                      initialValue="Link to recent news: HK's 2023 mandatory food waste recycling trial in restaurants."
                      as="p"
                      className="text-sm text-slate-600 mt-1"
                      multiline
                    />
                  </CardSection>
                </div>
              </LessonSection>

              {/* 4. Pollution Control in HK */}
              <LessonSection id="pollution-control" title="4. Pollution Control in Hong Kong" badge="20 minutes">
                <div className="space-y-4">
                  <EditableContent
                    storageKey="lesson:pollution-intro"
                    initialValue="Discuss air, water, and land pollution sources using Hong Kong's Environment Bureau Infographic."
                    as="p"
                    className="text-sm text-slate-600"
                    multiline
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CardSection className="text-center">
                      <Factory className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="font-medium text-sm">Air Pollution</p>
                      <p className="text-xs text-muted-foreground mt-1">Vehicle emissions, industrial output</p>
                    </CardSection>
                    <CardSection className="text-center">
                      <Waves className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="font-medium text-sm">Water Pollution</p>
                      <p className="text-xs text-muted-foreground mt-1">Victoria Harbour microplastics</p>
                    </CardSection>
                    <CardSection className="text-center">
                      <FlaskConical className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                      <p className="font-medium text-sm">Land Pollution</p>
                      <p className="text-xs text-muted-foreground mt-1">Landfill dependency</p>
                    </CardSection>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-2">Think-Pair-Share</p>
                    {loading ? interactiveLoading() : renderDiscussion('discussion:vehicle-emissions')}
                  </div>
                </div>
              </LessonSection>

              {/* 5. Waste Hierarchy Pyramid */}
              <LessonSection id="waste-hierarchy" title="5. Waste Hierarchy Pyramid" badge="15 minutes">
                <div className="space-y-4">
                  <EditableContent
                    storageKey="lesson:hierarchy-intro"
                    initialValue="Show animation of Hong Kong's Waste Hierarchy Pyramid (refuse, reduce, reuse, recycle, recover, dispose). Pause at each level to ask: Is HK succeeding at this level? Why/why not?"
                    as="p"
                    className="text-sm text-slate-600"
                    multiline
                  />
                  <div className="flex flex-col items-center gap-1">
                    {[
                      { level: 'Refuse', desc: 'Avoid unnecessary items', color: 'bg-emerald-500' },
                      { level: 'Reduce', desc: 'Minimize waste generation', color: 'bg-green-500' },
                      { level: 'Reuse', desc: 'Extend product lifecycle', color: 'bg-lime-500' },
                      { level: 'Recycle', desc: 'Process materials into new products', color: 'bg-yellow-500' },
                      { level: 'Recover', desc: 'Extract energy from waste', color: 'bg-orange-500' },
                      { level: 'Dispose', desc: 'Landfill as last resort', color: 'bg-red-500' },
                    ].map((item) => (
                      <div
                        key={item.level}
                        className={`${item.color} text-white text-center py-2 px-4 rounded font-medium`}
                        style={{ width: `${100 - ['Refuse', 'Reduce', 'Reuse', 'Recycle', 'Recover', 'Dispose'].indexOf(item.level) * 8}%` }}
                      >
                        <span className="font-bold">{item.level}</span>
                        <span className="text-sm opacity-90 ml-2">- {item.desc}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {loading ? interactiveLoading() : renderConceptCheck('concept:waste-hierarchy')}
                    {loading ? interactiveLoading() : renderDiscussion('discussion:waste-hierarchy-success')}
                  </div>
                </div>
              </LessonSection>

              {/* 6. Case Study Analysis */}
              <LessonSection id="case-study" title="6. Case Study Analysis: HK Plastic Crisis 2017" badge="30 minutes">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-bold text-red-800 text-lg">8 million plastic particles per km²</p>
                    <EditableContent
                      storageKey="lesson:plastic-crisis"
                      initialValue="In 2017, Hong Kong's bay waters were found to contain one of the highest concentrations of microplastics globally. Groups of 6 students analyze: How would you mitigate microplastic pollution using pollution control frameworks?"
                      as="p"
                      className="text-sm text-red-700 mt-2"
                      multiline
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CardSection>
                      <p className="font-medium text-sm">Source Reduction</p>
                      <p className="text-xs text-muted-foreground mt-1">Limit plastic at origin</p>
                    </CardSection>
                    <CardSection>
                      <p className="font-medium text-sm">Policy Intervention</p>
                      <p className="text-xs text-muted-foreground mt-1">Regulatory frameworks</p>
                    </CardSection>
                    <CardSection>
                      <p className="font-medium text-sm">Cleanup Strategies</p>
                      <p className="text-xs text-muted-foreground mt-1">Remediation programs</p>
                    </CardSection>
                  </div>
                  {loading ? interactiveLoading() : renderConceptCheck('concept:case-study-confidence')}
                </div>
              </LessonSection>

              {/* 7. Peer Teaching & Formative Quiz */}
              <LessonSection id="peer-teaching" title="7. Peer Teaching & Formative Quiz" badge="25 + 15 minutes">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm mb-2">Peer Teaching</p>
                    <EditableContent
                      storageKey="lesson:peer-teaching"
                      initialValue="Assign each group to present solutions for one waste stream (plastic/textiles/food). Use Padlet to share slides."
                      as="p"
                      className="text-sm text-slate-600"
                      multiline
                    />
                    <div className="grid gap-2 sm:grid-cols-3 mt-3">
                      <Badge variant="secondary" className="justify-center py-2">Plastic Waste</Badge>
                      <Badge variant="secondary" className="justify-center py-2">Textile Waste</Badge>
                      <Badge variant="secondary" className="justify-center py-2">Food Waste</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-2">Formative Quiz (Kahoot-style)</p>
                    {loading ? interactiveLoading() : renderQuiz('quiz:formative')}
                  </div>
                </div>
              </LessonSection>

              {/* 8. Marine Pollution Workshop */}
              <LessonSection id="marine-workshop" title="8. Marine Pollution Workshop" badge="20 minutes">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-bold text-blue-800">2018 Mirs Bay Oil Spill</p>
                    <EditableContent
                      storageKey="lesson:marine-spill"
                      initialValue="A sunken vessel caused an oil spill in Mirs Bay. Students propose a mitigation plan using the Marine Department's contingency framework."
                      as="p"
                      className="text-sm text-blue-700 mt-1"
                      multiline
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <CardSection className="text-center">
                      <p className="font-medium text-xs">Immediate Response</p>
                    </CardSection>
                    <CardSection className="text-center">
                      <p className="font-medium text-xs">Containment</p>
                    </CardSection>
                    <CardSection className="text-center">
                      <p className="font-medium text-xs">Cleanup</p>
                    </CardSection>
                    <CardSection className="text-center">
                      <p className="font-medium text-xs">Prevention</p>
                    </CardSection>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <EditableContent
                      storageKey="lesson:stakeholders"
                      initialValue="Stakeholder analysis: Government, fishing industry, environmental groups"
                    />
                  </p>
                </div>
              </LessonSection>

              {/* 9. Synthesis & Closure */}
              <LessonSection id="synthesis" title="9. Synthesis & Closure" badge="30 minutes">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm mb-2">Post-Test</p>
                    <EditableContent
                      storageKey="lesson:posttest-intro"
                      initialValue="5-question quiz on new concepts (e.g., Explain circular economy principles in household waste)."
                      as="p"
                      className="text-sm text-slate-600 mb-3"
                    />
                    {loading ? interactiveLoading() : renderQuiz('quiz:post-test')}
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-2">Reflective Discussion</p>
                    {loading ? interactiveLoading() : renderDiscussion('discussion:zero-waste')}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {loading ? interactiveLoading() : renderConceptCheck('concept:circular-economy')}
                  </div>
                  <Separator />
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="font-medium text-emerald-800 text-sm">Next Session Preview</p>
                    <EditableContent
                      storageKey="lesson:next-session"
                      initialValue='Air Pollution and Policy Advocacy'
                      as="p"
                      className="text-emerald-700 text-sm mt-1"
                    />
                  </div>
                </div>
              </LessonSection>

              {/* 10. Assessment Methods */}
              <LessonSection id="assessment" title="10. Assessment Methods">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Formative</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      <li>Mentimeter pre/post-test comparison</li>
                      <li>Group case study reports (2 pages max) on marine pollution, due within 48 hours</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Summative</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      <EditableContent
                        storageKey="lesson:assignment"
                        initialValue='Individual Assignment: Submit a 1,000-word "Waste Reduction Proposal for Hong Kong" using ILOs 1-4.'
                        multiline
                      />
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="font-medium text-sm mb-3">Rubric</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-right text-sm font-bold text-slate-500">30%</div>
                          <div className="flex-1 h-3 bg-blue-200 rounded-full"><div className="h-3 bg-blue-500 rounded-full" style={{ width: '30%' }} /></div>
                          <span className="text-sm text-slate-600">Analysis of HK's current policies</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-right text-sm font-bold text-slate-500">30%</div>
                          <div className="flex-1 h-3 bg-emerald-200 rounded-full"><div className="h-3 bg-emerald-500 rounded-full" style={{ width: '30%' }} /></div>
                          <span className="text-sm text-slate-600">Proposed solution creativity</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-right text-sm font-bold text-slate-500">40%</div>
                          <div className="flex-1 h-3 bg-amber-200 rounded-full"><div className="h-3 bg-amber-500 rounded-full" style={{ width: '40%' }} /></div>
                          <span className="text-sm text-slate-600">Case study application</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </LessonSection>

              {/* 11. Constructive Alignment Matrix */}
              <LessonSection id="alignment" title="11. Constructive Alignment Matrix">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Learning Outcome</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Teaching Activity</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Assessment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3">Compare HK strategies</td>
                        <td className="py-2 px-3">Interactive lecture & case study</td>
                        <td className="py-2 px-3">Kahoot quiz questions</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">Evaluate waste policies</td>
                        <td className="py-2 px-3">Padlet presentations</td>
                        <td className="py-2 px-3">Group case study report</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">Design waste solutions</td>
                        <td className="py-2 px-3">Peer teaching</td>
                        <td className="py-2 px-3">Individual assignment</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Analyze pollution cases</td>
                        <td className="py-2 px-3">Marine pollution workshop</td>
                        <td className="py-2 px-3">Case study rubric</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </LessonSection>

              {/* 12. Required Resources & Technology */}
              <LessonSection id="resources" title="12. Required Resources & Technology">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Link2 className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Video Link</p>
                      <a href="https://www.youtube.com/watch?v=example" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                        Hong Kong Landfill Timelapse <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                    <p className="text-sm"><span className="font-medium">Mentimeter & Kahoot</span> accounts for live quizzes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                    <p className="text-sm"><span className="font-medium">Padlet</span> for student presentations</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                    <p className="text-sm"><span className="font-medium">Case Study Handout</span>: PDF with HK government data on marine pollution</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                    <p className="text-sm"><span className="font-medium">Graphic Organizer</span>: Waste hierarchy pyramid template (interactive .pdf)</p>
                  </div>
                </div>
              </LessonSection>

              {/* 13. Differentiation & Inclusivity */}
              <LessonSection id="differentiation" title="13. Differentiation & Inclusivity">
                <div className="grid gap-3 sm:grid-cols-2">
                  <CardSection>
                    <p className="font-medium text-sm flex items-center gap-2"><Video className="h-4 w-4" /> Visual Learners</p>
                    <p className="text-xs text-muted-foreground mt-1">Animated pyramid and timelapse video</p>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Kinesthetic Learners</p>
                    <p className="text-xs text-muted-foreground mt-1">Padlet slide creation and group work</p>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Advanced Learners</p>
                    <p className="text-xs text-muted-foreground mt-1">Optional: Compare HK with Tokyo's waste policies</p>
                  </CardSection>
                  <CardSection>
                    <p className="font-medium text-sm flex items-center gap-2"><Accessibility className="h-4 w-4" /> Accessibility</p>
                    <p className="text-xs text-muted-foreground mt-1">Subtitles for videos, colorblind-friendly fonts</p>
                  </CardSection>
                </div>
              </LessonSection>

              {/* 14. Reflection & Improvement */}
              <LessonSection id="reflection" title="14. Reflection & Improvement">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Feedback</p>
                      <EditableContent
                        storageKey="lesson:feedback"
                        initialValue='Exit ticket asking, "What concept was most challenging? Why?"'
                        as="p"
                        className="text-sm text-slate-600 mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Success Indicators</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 mt-1 space-y-1">
                        <li>80% pass rate on Kahoot quiz</li>
                        <li>90% group participation</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Iteration</p>
                      <EditableContent
                        storageKey="lesson:iteration"
                        initialValue="For future classes, integrate a guest speaker from HK's Environmental Bureau."
                        as="p"
                        className="text-sm text-slate-600 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </LessonSection>

              {/* 15. Generated Materials */}
              <LessonSection id="materials" title="15. Generated Materials">
                <div className="space-y-4">
                  <CardSection>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <p className="font-medium text-sm">Handout: Hong Kong Pollution Case Study</p>
                    </div>
                    <div className="bg-slate-50 rounded p-3 text-sm space-y-2">
                      <p className="font-medium">Scenario</p>
                      <EditableContent
                        storageKey="lesson:handout-scenario"
                        initialValue="A factory illegally disposes chemical waste into the Shing Mun River."
                        as="p"
                        className="text-slate-600"
                      />
                      <p className="font-medium">Tasks</p>
                      <ol className="list-decimal list-inside text-slate-600 space-y-1">
                        <li>List 3 short-term impacts on the ecosystem</li>
                        <li>Propose a multi-agency cleanup strategy</li>
                      </ol>
                    </div>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardCheck className="h-4 w-4 text-blue-600" />
                      <p className="font-medium text-sm">Quiz: Waste Hierarchy Terminology</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      10 terms (e.g., &quot;closed-loop recycling&quot;) with definitions. Use Quizlet flashcards for review.
                    </p>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-sm">Kahoot Quiz: Pollution Control Policies in HK</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Effectiveness of &quot;Plastic Bag Levy&quot; vs. &quot;Food Waste Recycling Trials.&quot;
                    </p>
                  </CardSection>

                  <CardSection>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-violet-600" />
                      <p className="font-medium text-sm">Group Project: Marine Pollution Mitigation Plan</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Template</p>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                      <li>Executive summary</li>
                      <li>3 strategies</li>
                      <li>Stakeholder analysis</li>
                    </ol>
                  </CardSection>
                </div>
              </LessonSection>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground py-4 border-t">
                All activities are designed for scalability in large classrooms; use breakout rooms and digital collaboration tools to minimize logistical challenges.
              </div>
            </div>
          </main>
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
