'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useScrollRoot } from '@/contexts';
import LessonSection from './content/LessonSection';
import CardSection from './content/CardSection';
import EditableContent from './content/EditableContent';
import LessonSideMenu from './LessonSideMenu';
import Quiz from './interactive/Quiz';
import Discussion from './interactive/Discussion';
import ConceptCheck from './interactive/ConceptCheck';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import { getQuiz } from '@/lib/actions/quiz';
import { getDiscussion } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'ilos', label: '1. Learning Outcomes' },
  { id: 'preclass', label: '2. Pre-Class Prep' },
  { id: 'introduction', label: '3. Introduction' },
  { id: 'development', label: '4. Activities' },
  { id: 'synthesis', label: '5. Synthesis' },
  { id: 'assessment', label: '6. Assessment' },
  { id: 'alignment', label: '7. Alignment' },
  { id: 'resources', label: '8. Resources' },
];

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
  questions: Array<{
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: Array<{ id: number; answerText: string; isCorrect: boolean }>;
  }>;
}

function castQuizQuestions(questions: QuizData['questions']) {
  return questions.map(q => ({
    ...q,
    questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
  }));
}

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null };
  creator: { id: number; username: string; displayName: string | null; role: string } | null;
  posts: Array<{
    id: number;
    discussionId: number;
    parentPostId: number | null;
    authorId: number;
    authorUsername: string | null;
    authorDisplayName: string | null;
    authorRole: string | null;
    content: string;
    createdAt: Date | null;
    updatedAt: Date | null;
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

export default function LessonContent() {
  const { user, isGuest } = useUser();
  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';

  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [preQuiz, setPreQuiz] = useState<QuizData | null>(null);
  const [postQuiz, setPostQuiz] = useState<QuizData | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussions, setDiscussions] = useState<Map<number, DiscussionData>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!isGuest && userId > 0) {
        const progResult = await getStudentProgress(userId);
        if (progResult.success && progResult.data) {
          setProgress(new Set(progResult.data.filter(p => p.completed).map(p => p.sectionKey)));
        }
      }

      const preQuizResult = await getQuiz(1);
      if (preQuizResult.success && preQuizResult.data) setPreQuiz(preQuizResult.data);

      const postQuizResult = await getQuiz(2);
      if (postQuizResult.success && postQuizResult.data) setPostQuiz(postQuizResult.data);

      const ccResult = await getConceptChecks();
      if (ccResult.success && ccResult.data) setConceptChecks(ccResult.data);

      // Fetch pinned discussions (guiding questions)
      const discIds = [1, 2, 3];
      const discMap = new Map<number, DiscussionData>();
      for (const id of discIds) {
        const discResult = await getDiscussion(id);
        if (discResult.success && discResult.data) discMap.set(id, discResult.data);
      }
      setDiscussions(discMap);
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isGuest]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleMarkComplete(sectionKey: string) {
    if (isGuest || userId <= 0) {
      toast.error('Please sign in to track your progress');
      return;
    }
    const result = await markSectionComplete(userId, sectionKey);
    if (result.success) {
      setProgress(prev => new Set([...prev, sectionKey]));
      toast.success('Section marked as complete');
    }
  }

  function getConceptChecksForSection(sectionKey: string): ConceptCheckData[] {
    return conceptChecks.filter(cc => cc.sectionKey === sectionKey);
  }

  function formatDiscussionPosts(discData: DiscussionData) {
    return discData.posts.map(p => ({
      id: p.id,
      parentId: p.parentPostId,
      authorId: p.authorId,
      authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
      content: p.content,
      createdAt: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt)) : new Date().toISOString(),
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 py-6">
      <LessonSideMenu sections={SECTIONS} />
      <main className="flex-1 min-w-0 space-y-8">
        {/* Section 1: ILOs */}
        <LessonSection id="ilos" title="Intended Learning Outcomes (ILOs)" badge="Bloom's Taxonomy">
          <EditableContent storageKey="ilos:description" initialValue="Aligned with Bloom's Taxonomy and the three pedagogies: Flipped Learning, Project-Based Learning (PBL), and Critical Inquiry Seminar." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">ILO</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Outcome</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Bloom's Level</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Pedagogy Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO1</td>
                    <td className="py-2 px-2"><EditableContent storageKey="ilos:ilo1" initialValue="Analyze the limitations of traditional software development workflows and compare them with AI-assisted approaches." /></td>
                    <td className="py-2 px-2"><Badge variant="outline">Analyze</Badge></td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry Seminar</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO2</td>
                    <td className="py-2 px-2"><EditableContent storageKey="ilos:ilo2" initialValue="Apply an iterative AI-assisted workflow (Plan → Generate with AI → Modify → Repeat) to solve a small software problem in a team." /></td>
                    <td className="py-2 px-2"><Badge variant="outline">Apply</Badge></td>
                    <td className="py-2 px-2 text-xs">PBL</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO3</td>
                    <td className="py-2 px-2"><EditableContent storageKey="ilos:ilo3" initialValue="Evaluate the impact of AI tools on developer productivity and software democratization, considering ethical, social, and quality implications." /></td>
                    <td className="py-2 px-2"><Badge variant="outline">Evaluate</Badge></td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry Seminar</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO4</td>
                    <td className="py-2 px-2"><EditableContent storageKey="ilos:ilo4" initialValue="Create a documented workflow that demonstrates the effective use of an AI tool for code generation, including modifications and testing." /></td>
                    <td className="py-2 px-2"><Badge variant="outline">Create</Badge></td>
                    <td className="py-2 px-2 text-xs">PBL</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO5</td>
                    <td className="py-2 px-2"><EditableContent storageKey="ilos:ilo5" initialValue="Critique a team's AI-generated code using principles of software engineering (correctness, security, maintainability)." /></td>
                    <td className="py-2 px-2"><Badge variant="outline">Evaluate</Badge></td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry + Peer Assessment</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          {getConceptChecksForSection('ilos').map(cc => (
            <ConceptCheck key={cc.id} checkId={cc.id} title={cc.title} prompt={cc.prompt} checkType={cc.checkType as 'thumbs' | 'scale' | 'text'} userId={userId} userRole={userRole} />
          ))}

          <div className="flex items-center gap-2 mt-4">
            {progress.has('ilos') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('ilos')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 2: Pre-Class Preparation */}
        <LessonSection id="preclass" title="Pre-Class Preparation" badge="Flipped Learning">
          <EditableContent storageKey="preclass:description" initialValue="Distributed 48 hours before class via LMS (e.g., Moodle). Complete these materials before attending the session." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Required Materials</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="shrink-0">Video</Badge>
                <div>
                  <EditableContent storageKey="preclass:video-title" initialValue="The Evolution of Software Development: From Waterfall to AI-Assisted" as="p" className="font-medium" />
                  <EditableContent storageKey="preclass:video-desc" initialValue="10-minute video created by instructor (hosted on Vimeo)" as="p" className="text-sm text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="shrink-0">Reading</Badge>
                <div>
                  <EditableContent storageKey="preclass:reading-title" initialValue="AI Code Generation: Promises, Pitfalls, and the New Developer Role" as="p" className="font-medium" />
                  <EditableContent storageKey="preclass:reading-desc" initialValue="6-page reading adapted from Martin Fowler's blog and GitHub Copilot documentation (PDF in LMS)" as="p" className="text-sm text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Guiding Questions</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <EditableContent storageKey="preclass:q1" initialValue="What are the key differences between a developer in 2010 and a developer in 2025 in terms of daily tasks?" multiline as="p" className="pl-4 border-l-2 border-blue-400" />
              <EditableContent storageKey="preclass:q2" initialValue="If AI generates 80% of the code, what is left for the human developer to do? Where is the value?" multiline as="p" className="pl-4 border-l-2 border-blue-400" />
              <EditableContent storageKey="preclass:q3" initialValue="Think of one real-world application you have used. How might its development have changed with AI tools?" multiline as="p" className="pl-4 border-l-2 border-blue-400" />
            </div>
          </CardSection>

          {preQuiz && (
            <div className="mb-4">
              <Quiz quizId={preQuiz.quiz.id} title={preQuiz.quiz.title} questions={castQuizQuestions(preQuiz.questions)} userId={userId} />
            </div>
          )}

          {getConceptChecksForSection('preclass').map(cc => (
            <ConceptCheck key={cc.id} checkId={cc.id} title={cc.title} prompt={cc.prompt} checkType={cc.checkType as 'thumbs' | 'scale' | 'text'} userId={userId} userRole={userRole} />
          ))}

          <div className="flex items-center gap-2 mt-4">
            {progress.has('preclass') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('preclass')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 3: Introduction */}
        <LessonSection id="introduction" title="Teaching & Learning Activities — Introduction" badge="12 min">
          <EditableContent storageKey="intro:description" initialValue="The introduction sets the stage for the lesson with a real-world hook, misconception analysis, and ILO preview." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">3.1 Hook & Real-World Connection (5 min)</h3>
            <EditableContent storageKey="intro:hook" initialValue="Side-by-side comparison: classic FizzBuzz written manually (30 lines, 10 minutes) vs. generated by ChatGPT in 2 seconds. Poll: How many of you have used AI to write code? Microsoft reports that Copilot users complete tasks 55% faster. But is faster always better?" multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">3.2 Pre-Test Review & Misconception Analysis (5 min)</h3>
            <EditableContent storageKey="intro:misconception" initialValue="Highlight most missed quiz question (likely on security). Critical Inquiry prompt: Why do you think many chose the wrong answer? Address misconception: AI code is not automatically secure. Studies show it can introduce subtle bugs because the model doesn't understand context." multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">3.3 Agenda & ILOs Preview (2 min)</h3>
            <EditableContent storageKey="intro:agenda" initialValue="By the end of this session, you will be able to: (ILO1) analyze traditional vs. AI workflows, (ILO2) apply an iterative AI-assisted process, (ILO3) evaluate the impact, and (ILO4) produce a documented workflow. These mirror what modern software teams do daily." multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          {getConceptChecksForSection('introduction').map(cc => (
            <ConceptCheck key={cc.id} checkId={cc.id} title={cc.title} prompt={cc.prompt} checkType={cc.checkType as 'thumbs' | 'scale' | 'text'} userId={userId} userRole={userRole} />
          ))}

          <div className="flex items-center gap-2 mt-4">
            {progress.has('introduction') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('introduction')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 4: Development Activities */}
        <LessonSection id="development" title="Development Activities" badge="66 min — PBL + Critical Inquiry">
          <EditableContent storageKey="dev:description" initialValue="Project-Based Learning with Critical Inquiry. Teams work through an iterative AI-assisted workflow while critically examining the process and its implications." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Phase 1: Team Formation & Challenge Briefing (5 min)</h3>
            <div className="text-sm text-slate-700 space-y-2">
              <EditableContent storageKey="dev:roles" initialValue="Roles: Project Lead (manages timeline), AI Prompt Engineer (formulates prompts), Code Reviewer (checks output), Tester (verifies functionality), Documenter (records workflow)" multiline as="p" />
              <EditableContent storageKey="dev:scenario" initialValue="Scenario: Your team is a startup that needs a simple REST API endpoint for user registration (username and email, return welcome message). Use AI code generation, then modify for best practices (error handling, input validation, documentation). Final deliverable: 2-minute presentation + critical reflection." multiline as="p" />
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Phase 2: Critical Inquiry Roundtable (10 min)</h3>
            <div className="text-sm text-slate-700 space-y-2 mb-3">
              <EditableContent storageKey="dev:roundtable-q1" initialValue="What potential risks does AI-generated code introduce? (security, licensing, correctness)" multiline as="p" className="pl-4 border-l-2 border-blue-400" />
              <EditableContent storageKey="dev:roundtable-q2" initialValue="How does AI code generation change the role of the junior developer? Does it make them more or less valuable?" multiline as="p" className="pl-4 border-l-2 border-blue-400" />
              <EditableContent storageKey="dev:roundtable-q3" initialValue="What is democratization in this context? Does availability of AI tools truly level the playing field?" multiline as="p" className="pl-4 border-l-2 border-blue-400" />
            </div>
            {/* Discussion forums embedded */}
            {discussions.size > 0 && (
              <div className="space-y-4">
                {Array.from(discussions.entries()).slice(0, 3).map(([id, discData]) => (
                  !isGuest && userId > 0 ? (
                    <Discussion
                      key={id}
                      discussionId={discData.discussion.id}
                      title={discData.discussion.title}
                      description={discData.discussion.description}
                      posts={formatDiscussionPosts(discData)}
                      userId={userId}
                      userRole={userRole}
                    />
                  ) : (
                    <CardSection key={id}>
                      <p className="font-medium text-slate-800">{discData.discussion.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{discData.discussion.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">Sign in to participate in this discussion.</p>
                    </CardSection>
                  )
                ))}
              </div>
            )}
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Phase 3: Iterative Workflow Application (35 min)</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">Step 1</Badge>
                <EditableContent storageKey="dev:step1" initialValue="Plan (5 min): Teams outline desired endpoint, inputs, outputs, error cases. Write a prompt draft." multiline />
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">Step 2</Badge>
                <EditableContent storageKey="dev:step2" initialValue="Generate with AI (8 min): Use ChatGPT or Copilot to generate code. Prompt: Write a Python Flask endpoint that accepts POST request with JSON {username, email} and returns a welcome message." multiline />
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">Step 3</Badge>
                <EditableContent storageKey="dev:step3" initialValue="Modify & Review (15 min): Run code or manually review. Make at least two modifications: add input validation, add try-except block. Document each change and reason." multiline />
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">Step 4</Badge>
                <EditableContent storageKey="dev:step4" initialValue="Test & Repeat (7 min): Simulate test cases. If bugs found, repeat cycle. Document iterations." multiline />
              </div>
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Phase 4: Peer-Critique & Gallery Walk (10 min)</h3>
            <EditableContent storageKey="dev:gallery" initialValue="Teams post documented workflow and final code. Rotate to another team's poster and provide structured feedback. Focus on: completeness of workflow, quality of modifications, depth of critical reflection. Note one strength and one area for improvement." multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Phase 5: Cross-Team Discussion (6 min)</h3>
            <EditableContent storageKey="dev:cross-team" initialValue="Quick share-out: What was the most surprising issue you encountered? Which team's workflow was most effective and why? Synthesizes learning and reinforces PBL and critical inquiry goals." multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          {getConceptChecksForSection('development').map(cc => (
            <ConceptCheck key={cc.id} checkId={cc.id} title={cc.title} prompt={cc.prompt} checkType={cc.checkType as 'thumbs' | 'scale' | 'text'} userId={userId} userRole={userRole} />
          ))}

          <div className="flex items-center gap-2 mt-4">
            {progress.has('development') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('development')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 5: Synthesis & Closure */}
        <LessonSection id="synthesis" title="Synthesis & Closure" badge="12 min">
          <EditableContent storageKey="synthesis:description" initialValue="Post-test, team reflection, peer teaching, and preview of next session." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Post-Test (5 min)</h3>
            <EditableContent storageKey="synthesis:post-test" initialValue="Same 10-question quiz administered via LMS. Compare with pre-test to gauge growth. Celebrate class average improvement." multiline as="p" className="text-sm text-slate-700" />
            {postQuiz && (
              <div className="mt-3">
                <Quiz quizId={postQuiz.quiz.id} title={postQuiz.quiz.title} questions={castQuizQuestions(postQuiz.questions)} userId={userId} />
              </div>
            )}
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Team Reflection & Peer Teaching (5 min)</h3>
            <EditableContent storageKey="synthesis:reflection" initialValue="Each team chooses one takeaway to share: a lesson learned about AI code, a modification strategy, or a critical insight. Instructor records on shared whiteboard — creates a collective knowledge artifact." multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Preview of Next Session (2 min)</h3>
            <EditableContent storageKey="synthesis:preview" initialValue="Next week: Prompt Engineering — how to craft prompts that produce secure, efficient code. Bring your documented workflows to refine. Optional: refine mini-project at home using a different AI tool (GitHub Copilot vs. Claude) and prepare a comparison." multiline as="p" className="text-sm text-slate-700" />
          </CardSection>

          {getConceptChecksForSection('synthesis').map(cc => (
            <ConceptCheck key={cc.id} checkId={cc.id} title={cc.title} prompt={cc.prompt} checkType={cc.checkType as 'thumbs' | 'scale' | 'text'} userId={userId} userRole={userRole} />
          ))}

          <div className="flex items-center gap-2 mt-4">
            {progress.has('synthesis') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('synthesis')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 6: Assessment Methods */}
        <LessonSection id="assessment" title="Assessment Methods">
          <EditableContent storageKey="assessment:description" initialValue="Formative and summative assessments aligned with ILOs and pedagogies." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Formative Assessment (During Class)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Method</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Focus</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Pedagogy Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:method1" initialValue="Real-time polling (Mentimeter)" /></td>
                    <td className="py-2 px-2">Pre/post quiz, hook poll</td>
                    <td className="py-2 px-2 text-xs">Flipped Learning</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:method2" initialValue="Instructor observation" /></td>
                    <td className="py-2 px-2">Team collaboration, critical questioning</td>
                    <td className="py-2 px-2 text-xs">PBL + Critical Inquiry</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:method3" initialValue="Peer-critique rubric" /></td>
                    <td className="py-2 px-2">Quality of workflow and reflection</td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry + PBL</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:method4" initialValue="Exit ticket" /></td>
                    <td className="py-2 px-2">One new understanding about AI-assisted dev</td>
                    <td className="py-2 px-2 text-xs">Formative check for all</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Peer-Critique Rubric (5-point scale)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Criterion</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">1 — Emerging</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">3 — Developing</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">5 — Mastery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Workflow Documentation</td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:wf-emerging" initialValue="Missing steps; no iteration shown" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:wf-developing" initialValue="Basic steps but limited detail" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:wf-mastery" initialValue="Clear plan-generate-modify-test cycle with reflections" /></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Modification Quality</td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:mod-emerging" initialValue="No changes made or only cosmetic" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:mod-developing" initialValue="One functional improvement" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:mod-mastery" initialValue="Multiple meaningful fixes (validation, error handling)" /></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Critical Reflection</td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:ref-emerging" initialValue="No mention of risks or trade-offs" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:ref-developing" initialValue="Mentions one risk generically" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:ref-mastery" initialValue="Deep analysis of security, ethics, or reliability; connects to democratization" /></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Collaboration</td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:collab-emerging" initialValue="Roles unclear; one person works" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:collab-developing" initialValue="Some roles but uneven work" /></td>
                    <td className="py-2 px-2"><EditableContent storageKey="assessment:collab-mastery" initialValue="All roles actively contribute; team supports each other" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Summative Assessment — Grading Rubric</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">ILO</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Criterion</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO1 (Analyze)</td>
                    <td className="py-2 px-2">Contrast of traditional vs. AI workflow in reflection</td>
                    <td className="py-2 px-2"><Badge variant="outline">20%</Badge></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO2 (Apply)</td>
                    <td className="py-2 px-2">Demonstration of iterative workflow (documented)</td>
                    <td className="py-2 px-2"><Badge variant="outline">25%</Badge></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO3 (Evaluate)</td>
                    <td className="py-2 px-2">Depth of evaluation in reflection (risks, democratization)</td>
                    <td className="py-2 px-2"><Badge variant="outline">25%</Badge></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-blue-600">ILO4 (Create)</td>
                    <td className="py-2 px-2">Quality of final code (correctness, modifications)</td>
                    <td className="py-2 px-2"><Badge variant="outline">20%</Badge></td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 text-slate-600">Collaboration</td>
                    <td className="py-2 px-2">From observation and peer-critique rubric</td>
                    <td className="py-2 px-2"><Badge variant="outline">10%</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          <div className="flex items-center gap-2 mt-4">
            {progress.has('assessment') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('assessment')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 7: Constructive Alignment Matrix */}
        <LessonSection id="alignment" title="Constructive Alignment Matrix">
          <EditableContent storageKey="alignment:description" initialValue="Ensures every learning outcome has a matching teaching activity and assessment method." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Outcome</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Teaching Activity</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Assessment</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Pedagogy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">ILO1: Analyze</td>
                    <td className="py-2 px-2">Pre-class reading & video; Roundtable; Gallery Walk</td>
                    <td className="py-2 px-2">Pre-test quiz; Reflection</td>
                    <td className="py-2 px-2 text-xs">Flipped Learning; Critical Inquiry</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">ILO2: Apply</td>
                    <td className="py-2 px-2">Phase 3 — Hands-on coding cycle</td>
                    <td className="py-2 px-2">Observation; Workflow documentation</td>
                    <td className="py-2 px-2 text-xs">PBL</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">ILO3: Evaluate</td>
                    <td className="py-2 px-2">Roundtable; Modifications; Post-test</td>
                    <td className="py-2 px-2">Peer-critique rubric; Reflection</td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">ILO4: Create</td>
                    <td className="py-2 px-2">Phase 3 — complete cycle; Gallery Walk</td>
                    <td className="py-2 px-2">Portfolio submission</td>
                    <td className="py-2 px-2 text-xs">PBL</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">ILO5: Critique</td>
                    <td className="py-2 px-2">Peer-critique during Gallery Walk</td>
                    <td className="py-2 px-2">Peer-critique rubric</td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry + Peer Assessment</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          <div className="flex items-center gap-2 mt-4">
            {progress.has('alignment') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('alignment')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Section 8: Required Resources & Technology */}
        <LessonSection id="resources" title="Required Resources & Technology">
          <EditableContent storageKey="resources:description" initialValue="Tools and resources needed for this lesson, organized by pedagogy relevance." multiline as="p" className="text-muted-foreground mb-4" />

          <CardSection className="mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Resource</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Purpose</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Pedagogy Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:1" initialValue="LMS (Moodle)" /></td>
                    <td className="py-2 px-2">Pre-class materials, quizzes, submissions</td>
                    <td className="py-2 px-2 text-xs">Flipped Learning</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:2" initialValue="ChatGPT (browser), GitHub Copilot (IDE)" /></td>
                    <td className="py-2 px-2">Hands-on code generation</td>
                    <td className="py-2 px-2 text-xs">PBL</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:3" initialValue="Mentimeter" /></td>
                    <td className="py-2 px-2">Polls, word clouds</td>
                    <td className="py-2 px-2 text-xs">Formative assessment</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:4" initialValue="Google Docs (shared per team)" /></td>
                    <td className="py-2 px-2">Workflow documentation, reflection</td>
                    <td className="py-2 px-2 text-xs">PBL Collaboration</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:5" initialValue="Padlet or Jamboard" /></td>
                    <td className="py-2 px-2">Gallery Walk — peer review</td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry, Peer Assessment</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:6" initialValue="Online Python Interpreter (Replit)" /></td>
                    <td className="py-2 px-2">Code testing</td>
                    <td className="py-2 px-2 text-xs">PBL Iterative testing</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:7" initialValue="Projector/Screen" /></td>
                    <td className="py-2 px-2">Hook demo, results display</td>
                    <td className="py-2 px-2 text-xs">All</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2"><EditableContent storageKey="resources:8" initialValue="Timer (on screen)" /></td>
                    <td className="py-2 px-2">Phase management</td>
                    <td className="py-2 px-2 text-xs">PBL Project management</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Differentiation & Inclusivity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Need</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Strategy</th>
                    <th className="py-2 px-2 text-left font-medium text-muted-foreground">Pedagogy Alignment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Novice coders</td>
                    <td className="py-2 px-2"><EditableContent storageKey="resources:diff-novice" initialValue="Starter template (Flask skeleton), prompt examples list. Rotate roles — Documenter or Tester initially." /></td>
                    <td className="py-2 px-2 text-xs">PBL (scaffolded entry)</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Advanced coders</td>
                    <td className="py-2 px-2"><EditableContent storageKey="resources:diff-advanced" initialValue="Extend task: add authentication, database integration, refactor AI code. Lead ethical discussion." /></td>
                    <td className="py-2 px-2 text-xs">Critical Inquiry</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">English language learners</td>
                    <td className="py-2 px-2"><EditableContent storageKey="resources:diff-ell" initialValue="Caption videos; glossary of terms; simple sentence structures in handouts." /></td>
                    <td className="py-2 px-2 text-xs">Flipped Learning</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Visual learners</td>
                    <td className="py-2 px-2"><EditableContent storageKey="resources:diff-visual" initialValue="Diagram of iterative workflow as graphic organizer." /></td>
                    <td className="py-2 px-2 text-xs">Universal design</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">Students with disabilities</td>
                    <td className="py-2 px-2"><EditableContent storageKey="resources:diff-disability" initialValue="Screen-reader compatible materials; extended time; audio recordings of readings." /></td>
                    <td className="py-2 px-2 text-xs">Inclusive design</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardSection>

          <CardSection className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Reflection & Improvement</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-800 mb-1">Success Indicators</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><EditableContent storageKey="resources:success-flipped" initialValue="Flipped Learning: At least 85% complete pre-class materials. Post-test improvement >20%." /></li>
                  <li><EditableContent storageKey="resources:success-pbl" initialValue="PBL: All teams produce documented workflow with at least two meaningful modifications." /></li>
                  <li><EditableContent storageKey="resources:success-ci" initialValue="Critical Inquiry: Students spontaneously raise ethical or quality concerns during Roundtable." /></li>
                </ul>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-slate-800 mb-1">Modification Strategies</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><EditableContent storageKey="resources:mod-struggle" initialValue="If students struggle with AI tools: Pre-recorded prompt engineering demo during Phase 1. Add prompt doctor role." /></li>
                  <li><EditableContent storageKey="resources:mod-shallow" initialValue="If Critical Inquiry is shallow: Insert structured debate — Resolved: AI-generated code should not be used in production without human review." /></li>
                  <li><EditableContent storageKey="resources:mod-time" initialValue="If time runs short: Reduce Gallery Walk to 3-point feedback. Move iteration to homework." /></li>
                </ul>
              </div>
            </div>
          </CardSection>

          <div className="flex items-center gap-2 mt-4">
            {progress.has('resources') ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleMarkComplete('resources')}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </LessonSection>

        {/* Instructor Notes */}
        <LessonSection id="instructor-notes" title="Instructor Notes">
          <CardSection>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-800 mb-1">Equipment Check</p>
                <EditableContent storageKey="instructor:equipment" initialValue="Ensure Wi-Fi supports 30 devices using ChatGPT simultaneously. Have a fallback (offline VSCode with Copilot if possible)." multiline as="p" />
              </div>
              <div>
                <p className="font-medium text-slate-800 mb-1">Classroom Management</p>
                <EditableContent storageKey="instructor:management" initialValue="Use clear timers; assign a timekeeper per team. Circulate actively to prompt critical thinking: Why did you choose that prompt? What assumptions does it make?" multiline as="p" />
              </div>
              <div>
                <p className="font-medium text-slate-800 mb-1">Grading</p>
                <EditableContent storageKey="instructor:grading" initialValue="Summative portfolio due within 48 hours. Use peer evaluation to adjust individual scores within teams (e.g., CATME)." multiline as="p" />
              </div>
            </div>
          </CardSection>
        </LessonSection>
      </main>
    </div>
  );
}
