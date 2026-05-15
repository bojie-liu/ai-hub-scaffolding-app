'use client';

import { ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ---------------------------------------------------------------------------
// Types for data passed from the server component
// ---------------------------------------------------------------------------

interface QuizQuestionData {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quizId: number;
  title: string;
  questions: QuizQuestionData[];
}

interface DiscussionPostData {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface DiscussionData {
  discussionId: number;
  title: string;
  description: string | null;
  posts: DiscussionPostData[];
}

interface ConceptCheckData {
  checkId: number;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
}

export interface LessonPageClientProps {
  quizData: QuizData | null;
  discussionData: DiscussionData | null;
  conceptCheckILOs: ConceptCheckData | null;
  conceptCheckMod1: ConceptCheckData | null;
  conceptCheckMod3: ConceptCheckData | null;
}

// ---------------------------------------------------------------------------
// Section menu definition
// ---------------------------------------------------------------------------

const sections = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preparation', label: 'Pre-Class Prep' },
  { id: 'activities', label: 'Activities' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment Matrix' },
  { id: 'resources', label: 'Resources' },
  { id: 'inclusivity', label: 'Inclusivity' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'materials', label: 'Materials' },
];

// ---------------------------------------------------------------------------
// Helper sub-components (local to this file)
// ---------------------------------------------------------------------------

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-2">
      {children}
    </h3>
  );
}

function ListItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 py-1">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      <span className="text-slate-700">{children}</span>
    </li>
  );
}

function NumberedItem({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 py-1">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
        {index}
      </span>
      <span className="text-slate-700 pt-0.5">{children}</span>
    </li>
  );
}

function TimeBadge({ time }: { time: string }) {
  return (
    <Badge variant="outline" className="text-xs font-mono">
      {time}
    </Badge>
  );
}

function InlineBold({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-800">{children}</span>;
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function LessonPageClient({
  quizData,
  discussionData,
  conceptCheckILOs,
  conceptCheckMod1,
  conceptCheckMod3,
}: LessonPageClientProps) {
  const { user } = useUser();
  const userId = user?.userId ?? -1;

  return (
    <AuthGuard>
      <ScrollRootProvider>
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Side menu - visible on lg and up */}
          <div className="hidden lg:block w-56 shrink-0 border-r border-slate-200 bg-slate-50/50 overflow-y-auto">
            <div className="sticky top-16 p-4">
              <LessonSideMenu sections={sections} />
            </div>
          </div>

          {/* Main scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* ---------------------------------------------------------------- */}
              {/* Page header                                                      */}
              {/* ---------------------------------------------------------------- */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  <EditableContent
                    storageKey="lesson_title"
                    initialValue="AI-Powered Software Engineering: From Manual Coding to Intelligent Workflows"
                    as="span"
                  />
                </h1>
                <p className="text-muted-foreground">
                  <EditableContent
                    storageKey="lesson_subtitle"
                    initialValue="Interactive lesson plan with activities, assessments, and materials"
                    as="span"
                  />
                </p>
                <Separator className="mt-4" />
              </div>

              {/* ---------------------------------------------------------------- */}
              {/* Section 1: Intended Learning Outcomes (ILOs)                     */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection
                id="ilos"
                title="Intended Learning Outcomes (ILOs)"
                badge="Bloom's Taxonomy"
              >
                <p className="text-slate-600 mb-4">
                  <EditableContent
                    storageKey="ilos_intro"
                    initialValue="By the end of the lesson, students will:"
                    as="span"
                  />
                </p>
                <ul className="space-y-2">
                  <ListItem>
                    <InlineBold>Analyze</InlineBold> the evolution of software
                    engineering methodologies from manual coding to AI-powered
                    workflows
                  </ListItem>
                  <ListItem>
                    <InlineBold>Apply</InlineBold> AI-assisted development tools
                    (e.g., GitHub Copilot) to solve basic coding challenges
                  </ListItem>
                  <ListItem>
                    <InlineBold>Evaluate</InlineBold> ethical considerations and
                    technical limitations of AI in software engineering
                  </ListItem>
                  <ListItem>
                    <InlineBold>Create</InlineBold> a documented prototype using
                    AI-generated code, modified through iterative refinement
                  </ListItem>
                </ul>

                {/* Concept check after ILOs */}
                {conceptCheckILOs && (
                  <div className="mt-6">
                    <ConceptCheck
                      checkId={conceptCheckILOs.checkId}
                      title={conceptCheckILOs.title}
                      prompt={conceptCheckILOs.prompt}
                      checkType={conceptCheckILOs.checkType}
                      userId={userId}
                    />
                  </div>
                )}
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 2: Pre-Class Preparation                                 */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection id="preparation" title="Pre-Class Preparation">
                <div className="space-y-4">
                  <div>
                    <SubHeading>Video &amp; Reading</SubHeading>
                    <p className="text-slate-700">
                      Watch 10-minute TED-Ed video &ldquo;How AI is reshaping
                      programming&rdquo; + short article from IEEE Spectrum on
                      AI&apos;s impact on coding accessibility
                    </p>
                  </div>

                  <div>
                    <SubHeading>Pre-Test</SubHeading>
                    <p className="text-slate-700">
                      5-question quiz (via Canvas) on foundational concepts
                      (e.g., &ldquo;What percentage of code in 2025 will be
                      auto-generated according to Gartner?&rdquo;)
                    </p>
                  </div>

                  <div>
                    <SubHeading>Guiding Questions</SubHeading>
                    <ul className="space-y-2 mt-2">
                      <ListItem>
                        &ldquo;How might AI change the role of software
                        engineers in 10 years?&rdquo;
                      </ListItem>
                      <ListItem>
                        &ldquo;What are potential risks of over-reliance on AI
                        tools?&rdquo;
                      </ListItem>
                    </ul>

                    {/* Discussion component for guiding questions */}
                    {discussionData && (
                      <div className="mt-4">
                        <Discussion
                          discussionId={discussionData.discussionId}
                          title={discussionData.title}
                          description={discussionData.description}
                          posts={discussionData.posts}
                          userId={userId}
                        />
                      </div>
                    )}
                    {!discussionData && (
                      <CardSection className="mt-4 bg-slate-50">
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Discussion space will be available once the guiding
                          questions discussion is set up.
                        </p>
                      </CardSection>
                    )}
                  </div>
                </div>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 3: Teaching & Learning Activities                        */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection
                id="activities"
                title="Teaching & Learning Activities"
                badge="180 min"
              >
                {/* --- Introduction (20 min) --- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <SubHeading>Introduction</SubHeading>
                    <TimeBadge time="20 min" />
                  </div>
                  <ul className="space-y-2">
                    <ListItem>
                      <InlineBold>Hook:</InlineBold> 3-minute demo of GitHub
                      Copilot writing a basic sorting algorithm
                    </ListItem>
                    <ListItem>
                      <InlineBold>Poll:</InlineBold> &ldquo;How many of you have
                      used AI code assistants?&rdquo; using Poll Everywhere
                    </ListItem>
                    <ListItem>
                      <InlineBold>Discussion:</InlineBold> Link pre-test results
                      to lesson objectives, addressing misconceptions (e.g.,
                      &ldquo;AI replaces coders&rdquo; vs &ldquo;augments
                      productivity&rdquo;)
                    </ListItem>
                  </ul>
                </div>

                <Separator className="my-6" />

                {/* --- Development Activities (130 min) --- */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Development Activities{' '}
                    <TimeBadge time="130 min" />
                  </h3>

                  {/* Mod 1: Foundations of AI Development (30 min) */}
                  <CardSection className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-slate-800">
                        Mod 1: Foundations of AI Development
                      </h4>
                      <TimeBadge time="30 min" />
                    </div>
                    <ul className="space-y-2">
                      <ListItem>
                        Interactive lecture with MentiMeter word clouds: Map
                        traditional vs AI-powered workflow terms
                      </ListItem>
                      <ListItem>
                        Case Study Analysis: Analyze 2023 Microsoft study showing
                        55% productivity increase among Copilot users
                      </ListItem>
                      <ListItem>
                        Think-Pair-Share: &ldquo;What software engineering
                        principles remain unchanged?&rdquo;
                      </ListItem>
                    </ul>

                    {/* Concept check after Mod 1 */}
                    {conceptCheckMod1 && (
                      <div className="mt-4">
                        <ConceptCheck
                          checkId={conceptCheckMod1.checkId}
                          title={conceptCheckMod1.title}
                          prompt={conceptCheckMod1.prompt}
                          checkType={conceptCheckMod1.checkType}
                          userId={userId}
                        />
                      </div>
                    )}
                  </CardSection>

                  {/* Mod 2: Hands-On Practice (60 min) */}
                  <CardSection className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-slate-800">
                        Mod 2: Hands-On Practice
                      </h4>
                      <TimeBadge time="60 min" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-slate-700 font-medium">
                        Live Coding Workshop in pairs (using classroom laptops
                        with Copilot trial):
                      </p>
                      <ul className="space-y-2 ml-2">
                        <ListItem>
                          <InlineBold>Challenge 1:</InlineBold> Generate basic
                          API with OpenAPI and AI comments
                        </ListItem>
                        <ListItem>
                          <InlineBold>Challenge 2:</InlineBold> Implement a CRUD
                          system with minimal human input
                        </ListItem>
                        <ListItem>
                          <InlineBold>Scaffolded:</InlineBold> Provide starter
                          template and reference video
                        </ListItem>
                      </ul>
                      <p className="text-slate-700">
                        <InlineBold>Peer Teaching:</InlineBold> 5-minute speed
                        presentations on unique AI tools (selected from
                        pre-class research)
                      </p>
                    </div>
                  </CardSection>

                  {/* Mod 3: Critical Analysis (40 min) */}
                  <CardSection className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-slate-800">
                        Mod 3: Critical Analysis
                      </h4>
                      <TimeBadge time="40 min" />
                    </div>
                    <ul className="space-y-2">
                      <ListItem>
                        <InlineBold>Debate:</InlineBold> Randomly assign pro/con
                        positions for &ldquo;AI will democratize software
                        engineering by 2027&rdquo;
                      </ListItem>
                      <ListItem>
                        <InlineBold>Ethical Framework Exercise:</InlineBold>{' '}
                        Identify bias examples in training data using
                        IBM&apos;s AI Fairness 360 toolkit demo
                      </ListItem>
                      <ListItem>
                        <InlineBold>Poll:</InlineBold> &ldquo;Should AI-assisted
                        coding exams count as independent work?&rdquo;
                      </ListItem>
                    </ul>

                    {/* Concept check after Mod 3 */}
                    {conceptCheckMod3 && (
                      <div className="mt-4">
                        <ConceptCheck
                          checkId={conceptCheckMod3.checkId}
                          title={conceptCheckMod3.title}
                          prompt={conceptCheckMod3.prompt}
                          checkType={conceptCheckMod3.checkType}
                          userId={userId}
                        />
                      </div>
                    )}
                  </CardSection>
                </div>

                <Separator className="my-6" />

                {/* --- Synthesis & Closure (30 min) --- */}
                <div className="flex items-center gap-2">
                  <SubHeading>Synthesis &amp; Closure</SubHeading>
                  <TimeBadge time="30 min" />
                </div>
                <ul className="space-y-2">
                  <ListItem>
                    Post-Test comparison with pre-test results
                  </ListItem>
                  <ListItem>
                    One-Minute Paper: &ldquo;What surprised you most about
                    AI&apos;s capabilities?&rdquo;
                  </ListItem>
                  <ListItem>
                    Preview: Introduction to next module on prompt engineering
                    for developers
                  </ListItem>
                </ul>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 4: Assessment Methods                                    */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection id="assessment" title="Assessment Methods">
                <div className="space-y-6">
                  {/* Formative Assessment */}
                  <div>
                    <SubHeading>Formative Assessment</SubHeading>
                    <ul className="space-y-2">
                      <ListItem>
                        Real-time polling responses during debates
                      </ListItem>
                      <ListItem>
                        Workshop rubric evaluating code quality and documentation
                      </ListItem>
                      <ListItem>
                        Exit ticket self-assessment on ILO proficiency
                      </ListItem>
                    </ul>
                  </div>

                  {/* Summative Assessment */}
                  <div>
                    <SubHeading>Summative Assessment</SubHeading>
                    <p className="text-slate-700 mb-2">
                      <InlineBold>Prototype Presentation (20%):</InlineBold>
                    </p>
                    <ul className="space-y-2">
                      <ListItem>
                        Submit annotated code with GitHub commit history showing
                        iterative improvements
                      </ListItem>
                      <ListItem>
                        Graded on technical accuracy (40%), critical reflection
                        (30%), and human-AI collaboration demonstration (30%)
                      </ListItem>
                    </ul>
                  </div>

                  {/* Quiz component embedded in Assessment section */}
                  {quizData && (
                    <div className="mt-4">
                      <Quiz
                        quizId={quizData.quizId}
                        title={quizData.title}
                        questions={quizData.questions}
                        userId={userId}
                      />
                    </div>
                  )}
                  {!quizData && (
                    <CardSection className="bg-slate-50 mt-4">
                      <p className="text-sm text-muted-foreground text-center py-2">
                        The pre-test quiz will appear here once it is set up.
                      </p>
                    </CardSection>
                  )}
                </div>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 5: Constructive Alignment Matrix                         */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection
                id="alignment"
                title="Constructive Alignment Matrix"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">
                          Learning Outcome
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">
                          Teaching Activity
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">
                          Assessment Method
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-700">
                          Analyze evolution
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Interactive lecture &amp; case study
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Pre/post-test comparisons
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-700">
                          Apply AI tools
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Live coding workshop
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Prototype presentation
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-700">
                          Evaluate risks
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Debate &amp; ethical exercise
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Exit ticket reflections
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-700">
                          Create prototype
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Scaffolded implementation
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Graded code documentation
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 6: Required Resources & Technology                       */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection
                id="resources"
                title="Required Resources & Technology"
              >
                <ul className="space-y-2">
                  <ListItem>
                    Pre-installed AI extensions (GitHub Copilot, Amazon
                    CodeWhisperer)
                  </ListItem>
                  <ListItem>
                    LMS integration (Canvas/Moodle) for materials/polls
                  </ListItem>
                  <ListItem>
                    Projector for live demos and Mentimeter/Poll Everywhere
                  </ListItem>
                  <ListItem>
                    GitHub classroom for code submissions
                  </ListItem>
                  <ListItem>
                    Accessible PDF guides for screen readers
                  </ListItem>
                </ul>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 7: Differentiation & Inclusivity                         */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection
                id="inclusivity"
                title="Differentiation & Inclusivity"
              >
                <ul className="space-y-2">
                  <ListItem>
                    Provide closed captions for all videos
                  </ListItem>
                  <ListItem>
                    Offer text-based alternatives for live coding
                    (pre-generated GIF sequences)
                  </ListItem>
                  <ListItem>
                    <InlineBold>Advanced learners:</InlineBold> Challenge bonus
                    points for implementing accessibility checks
                  </ListItem>
                  <ListItem>
                    <InlineBold>Multilingual students:</InlineBold> Provide
                    glossaries in 8 languages + AI translation tools
                  </ListItem>
                </ul>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Section 8: Reflection & Improvement                              */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection id="reflection" title="Reflection & Improvement">
                <ul className="space-y-2">
                  <ListItem>
                    <InlineBold>Success Metrics:</InlineBold> 75% mastery in
                    post-test improvements + prototype code quality
                  </ListItem>
                  <ListItem>
                    <InlineBold>Feedback:</InlineBold> Anonymous LMS survey on
                    tool accessibility and pace
                  </ListItem>
                  <ListItem>
                    <InlineBold>Modifications:</InlineBold> Adjust workshop
                    scaffolding based on observed skill gaps
                  </ListItem>
                </ul>
              </LessonSection>

              {/* ---------------------------------------------------------------- */}
              {/* Materials Section                                                */}
              {/* ---------------------------------------------------------------- */}
              <LessonSection id="materials" title="Materials">
                <div className="space-y-6">
                  {/* Quiz material */}
                  <div>
                    <SubHeading>
                      Quiz: Foundations of AI in Software Engineering - 10 MCQ
                    </SubHeading>
                    <ol className="space-y-3 mt-3">
                      <NumberedItem index={1}>
                        What percentage of code in 2025 will be auto-generated
                        according to Gartner? &mdash;{' '}
                        <span className="font-medium text-blue-700">C) 50%</span>
                      </NumberedItem>
                      <NumberedItem index={2}>
                        Which of the following is an AI-powered code assistant?
                        &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) GitHub Copilot
                        </span>
                      </NumberedItem>
                      <NumberedItem index={3}>
                        What was the reported productivity increase in the 2023
                        Microsoft study on Copilot users? &mdash;{' '}
                        <span className="font-medium text-blue-700">C) 55%</span>
                      </NumberedItem>
                      <NumberedItem index={4}>
                        Which ethical concern is most associated with
                        AI-generated code? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) Bias in training data
                        </span>
                      </NumberedItem>
                      <NumberedItem index={5}>
                        What is the primary function of IBM&apos;s AI Fairness
                        360 toolkit? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) Detecting and mitigating bias
                        </span>
                      </NumberedItem>
                      <NumberedItem index={6}>
                        Which software engineering principle remains unchanged
                        despite AI tools? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) Understanding user requirements
                        </span>
                      </NumberedItem>
                      <NumberedItem index={7}>
                        What is a potential risk of over-reliance on AI coding
                        tools? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) Reduced critical thinking
                        </span>
                      </NumberedItem>
                      <NumberedItem index={8}>
                        In the AI-assisted workflow, what role does the
                        developer primarily play? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) Reviewing and guiding AI-generated code
                        </span>
                      </NumberedItem>
                      <NumberedItem index={9}>
                        What does &ldquo;democratization of software
                        engineering&rdquo; mean in the context of AI? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          B) Making coding accessible to more people
                        </span>
                      </NumberedItem>
                      <NumberedItem index={10}>
                        Which of the following best describes the relationship
                        between AI and software engineers? &mdash;{' '}
                        <span className="font-medium text-blue-700">
                          C) Augmentation
                        </span>
                      </NumberedItem>
                    </ol>
                  </div>

                  <Separator />

                  {/* Case Study material */}
                  <div>
                    <SubHeading>
                      Case Study: GitHub Copilot Impact on Team Productivity - 3
                      Scenarios with Discussion Questions
                    </SubHeading>

                    <CardSection className="mt-3 mb-4">
                      <p className="font-medium text-slate-800 mb-2">
                        Scenario 1: Startup Acceleration
                      </p>
                      <p className="text-slate-700 mb-2">
                        A 3-person startup uses GitHub Copilot to build their
                        MVP. They report completing the project in 6 weeks
                        instead of the estimated 10 weeks.
                      </p>
                      <p className="text-slate-600 text-sm italic">
                        Discussion: What factors beyond AI might have contributed
                        to this speed increase? How would you verify the
                        AI&apos;s actual contribution?
                      </p>
                    </CardSection>

                    <CardSection className="mb-4">
                      <p className="font-medium text-slate-800 mb-2">
                        Scenario 2: Enterprise Integration Challenges
                      </p>
                      <p className="text-slate-700 mb-2">
                        A large corporation rolls out Copilot to 500 developers.
                        60% report productivity gains, but 25% say the tool
                        slows them down due to incorrect suggestions.
                      </p>
                      <p className="text-slate-600 text-sm italic">
                        Discussion: Why might AI tools have mixed results in
                        enterprise settings? What support structures would help?
                      </p>
                    </CardSection>

                    <CardSection className="mb-4">
                      <p className="font-medium text-slate-800 mb-2">
                        Scenario 3: Learning and Skill Development
                      </p>
                      <p className="text-slate-700 mb-2">
                        A university course integrates Copilot into programming
                        assignments. Students complete tasks faster but score
                        lower on unassisted exams.
                      </p>
                      <p className="text-slate-600 text-sm italic">
                        Discussion: How should educators balance AI tool usage
                        with fundamental skill development?
                      </p>
                    </CardSection>
                  </div>

                  <Separator />

                  {/* Rubric material */}
                  <div>
                    <SubHeading>
                      Template: AI-assisted Code Submission Rubric - 5 Criteria
                      with Scoring Guide
                    </SubHeading>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-2 font-semibold text-slate-800">
                              Criteria
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-800">
                              Excellent (5)
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-800">
                              Proficient (4)
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-800">
                              Developing (3)
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-800">
                              Beginning (2)
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-800">
                              Inadequate (1)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 px-2 font-medium text-slate-800">
                              Technical Accuracy
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Code runs perfectly, handles edge cases
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Code runs with minor issues
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Code runs but lacks edge cases
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Code has significant bugs
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Code does not run
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 px-2 font-medium text-slate-800">
                              Critical Reflection
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Deep analysis of AI&apos;s role &amp; limitations
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Good analysis with minor gaps
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Surface-level reflection
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Minimal reflection
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              No reflection
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 px-2 font-medium text-slate-800">
                              Human-AI Collaboration
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Clear evidence of iterative refinement
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Some evidence of refinement
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Limited iteration
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Mostly unmodified AI output
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Pure AI output
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 px-2 font-medium text-slate-800">
                              Documentation
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Comprehensive comments &amp; explanations
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Good documentation
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Basic documentation
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Minimal documentation
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              No documentation
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 font-medium text-slate-800">
                              Code Quality
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Clean, efficient, follows best practices
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Mostly clean code
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Functional but messy
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Poor code structure
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              Unstructured code
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Separator />

                  {/* Interactive Demo material */}
                  <div>
                    <SubHeading>
                      Interactive Demo: Prompt Engineering for Better Code
                      Generation - Browser Simulation Tool
                    </SubHeading>
                    <ol className="space-y-2 mt-3">
                      <NumberedItem index={1}>
                        Compare vague vs. specific prompts for generating a REST
                        API endpoint
                      </NumberedItem>
                      <NumberedItem index={2}>
                        Refine a prompt iteratively to produce a sorting
                        algorithm with specific constraints
                      </NumberedItem>
                      <NumberedItem index={3}>
                        Generate unit tests using structured prompt templates
                      </NumberedItem>
                    </ol>
                  </div>
                </div>
              </LessonSection>

              {/* Footer spacer */}
              <div className="h-16" />
            </div>
          </main>
        </div>
      </ScrollRootProvider>
    </AuthGuard>
  );
}
