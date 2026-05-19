'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import VennDiagram from '@/components/interactive/VennDiagram';
import VideoPlayer from '@/components/media/VideoPlayer';
import { useUser } from '@/contexts/UserContext';
import { ScrollRootProvider, useScrollRoot } from '@/contexts/ScrollRootContext';
import { markSectionComplete } from '@/lib/actions/progress';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import {
  CheckCircle,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Users,
  ClipboardList,
  Target,
  Settings,
  Heart,
  BarChart3,
  ArrowRight,
  Clock,
} from 'lucide-react';

const sections = [
  { id: 'ilos', label: 'Learning Outcomes' },
  { id: 'preclass', label: 'Pre-Class' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'development', label: 'Activities' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'resources', label: 'Resources' },
];

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
}

function LessonContent() {
  const { user, isGuest } = useUser();
  const scrollRootRef = useScrollRoot();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConceptChecks().then((result) => {
      if (result.success && result.data) setConceptChecks(result.data);
      setLoading(false);
    });
  }, []);

  const getConceptCheck = (storageKey: string) => conceptChecks.find((c) => c.storageKey === storageKey);

  const handleMarkComplete = useCallback(
    async (sectionKey: string) => {
      if (!user || isGuest) return;
      await markSectionComplete(user.userId, sectionKey);
      setCompletedSections((prev) => new Set(prev).add(sectionKey));
    },
    [user, isGuest]
  );

  const renderMarkComplete = (sectionKey: string) => {
    if (!user || isGuest || user.role === 'TEACHER') return null;
    const isComplete = completedSections.has(sectionKey);
    return (
      <Button
        variant={isComplete ? 'ghost' : 'outline'}
        size="sm"
        className={`mt-3 ${isComplete ? 'text-emerald-600' : ''}`}
        onClick={() => handleMarkComplete(sectionKey)}
        disabled={isComplete}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        {isComplete ? 'Completed' : 'Mark Complete'}
      </Button>
    );
  };

  return (
    <div ref={scrollRootRef} className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
          <LessonSideMenu sections={sections} />

          <div className="flex-1 min-w-0 space-y-6 pb-16">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 sm:p-8 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Cognitive and Social Constructivism Theory
              </h1>
              <p className="text-indigo-100 text-lg mb-4">
                Introduction to Educational Psychology
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  <Clock className="h-3 w-3 mr-1" /> 180 minutes
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  <Users className="h-3 w-3 mr-1" /> 90 students
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  University Year 1
                </Badge>
              </div>
            </div>

            {/* Section 1: ILOs */}
            <section id="ilos" className="scroll-mt-20">
              <LessonSection id="ilos" title="1. Intended Learning Outcomes" badge="180 min">
                <p className="text-slate-700 mb-4">
                  By the end of this lesson, students will be able to:
                </p>
                <div className="space-y-3">
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
                      <div>
                        <EditableContent
                          storageKey="ilo:1"
                          initialValue="**Analyze** the core principles of cognitive constructivism (e.g., schema theory, Piaget's stages) and social constructivism (e.g., Vygotsky's ZPD, scaffolding)."
                          as="p"
                          className="text-slate-800"
                        />
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">2</div>
                      <div>
                        <EditableContent
                          storageKey="ilo:2"
                          initialValue="**Evaluate** the practical applications of constructivist theories in classroom scenarios through case study analysis."
                          as="p"
                          className="text-slate-800"
                        />
                      </div>
                    </div>
                  </CardSection>
                  <CardSection>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">3</div>
                      <div>
                        <EditableContent
                          storageKey="ilo:3"
                          initialValue="**Create** a lesson plan outline that integrates cognitive and social constructivist strategies for diverse learners."
                          as="p"
                          className="text-slate-800"
                        />
                      </div>
                    </div>
                  </CardSection>
                </div>
                {renderMarkComplete('ilos')}
              </LessonSection>
            </section>

            {/* Section 2: Pre-Class Preparation */}
            <section id="preclass" className="scroll-mt-20">
              <LessonSection id="preclass" title="2. Pre-Class Preparation" badge="30 min">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-indigo-600" /> Pre-Reading (20 minutes)
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <EditableContent
                          storageKey="preread:1"
                          initialValue="Cognitive Constructivism: Excerpt from Bruner's &quot;The Process of Education&quot; (focus on discovery learning)."
                        />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <EditableContent
                          storageKey="preread:2"
                          initialValue="Social Constructivism: Key sections from Vygotsky's &quot;Mind in Society&quot; (ZPD and scaffolding)."
                        />
                      </li>
                    </ul>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Video Resource
                    </h3>
                    <VideoPlayer
                      title="TED-Ed: What is constructivism?"
                      videoId="HcOc7P5YSqA"
                      description="A 5-minute introduction to constructivist learning theory"
                      duration="5:00"
                    />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <ClipboardList className="h-4 w-4 text-blue-600" /> Diagnostic Pre-Test (10 questions)
                    </h3>
                    <EditableContent
                      storageKey="pretest:sample"
                      initialValue='Sample Question: "Define Zone of Proximal Development and provide a real-world example."'
                      as="p"
                      className="text-slate-700 italic mb-3"
                    />
                    <p className="text-sm text-muted-foreground mb-3">Platforms: Google Forms or LMS quiz tool.</p>
                    <Link href={routes.quizzes}>
                      <Button variant="outline" size="sm" className="gap-1">
                        Go to Pre-Test <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-emerald-600" /> Guiding Questions
                    </h3>
                    <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                      <li>
                        <EditableContent
                          storageKey="guiding:1"
                          initialValue="How do cognitive and social constructivism differ in their approach to learning?"
                        />
                      </li>
                      <li>
                        <EditableContent
                          storageKey="guiding:2"
                          initialValue="What are the implications of these theories for modern teaching practices?"
                        />
                      </li>
                    </ol>
                    <Link href={routes.discussion} className="inline-block mt-3">
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageSquare className="h-3 w-3" /> Discuss These Questions
                      </Button>
                    </Link>
                  </CardSection>
                </div>
                {renderMarkComplete('preclass')}
              </LessonSection>
            </section>

            {/* Section 3: Introduction */}
            <section id="introduction" className="scroll-mt-20">
              <LessonSection id="introduction" title="3. Introduction" badge="25 min">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-indigo-600" /> Hook Activity
                    </h3>
                    <EditableContent
                      storageKey="intro:hook"
                      initialValue="[Mentimeter: Poll] &quot;What is your current understanding of constructivism? (Word cloud response)&quot;"
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-blue-600" /> Pre-Test Review
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">&#8226;</span>
                        <EditableContent
                          storageKey="intro:review:1"
                          initialValue="Display poll results, address common misconceptions (e.g., conflating cognitive/social theories)."
                        />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">&#8226;</span>
                        <EditableContent
                          storageKey="intro:review:2"
                          initialValue="Use a Venn diagram whiteboard activity to compare key terms from pre-reading."
                        />
                      </li>
                    </ul>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-600 mb-2">Cognitive vs. Social Constructivism</h4>
                      <VennDiagram />
                    </div>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Real-World Connection
                    </h3>
                    <EditableContent
                      storageKey="intro:realworld"
                      initialValue="Show a 2-minute clip from How Teachers Use Constructivism in Classrooms. Discuss parallels to K-12 settings."
                      as="p"
                      className="text-slate-700 mb-3"
                    />
                    <VideoPlayer
                      title="How Teachers Use Constructivism in Classrooms"
                      videoId="HcOc7P5YSqA"
                      description="Classroom examples of constructivist teaching approaches"
                      duration="2:00"
                      allowCustomUrl
                    />
                  </CardSection>

                  {/* Concept Check for Introduction */}
                  {!loading && (() => {
                    const cc = getConceptCheck('concept:intro');
                    return cc && user && !isGuest ? (
                      <ConceptCheck
                        checkId={cc.id}
                        title={cc.title}
                        prompt={cc.prompt}
                        checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                        userId={user.userId}
                        userRole={user.role}
                      />
                    ) : null;
                  })()}
                </div>
                {renderMarkComplete('introduction')}
              </LessonSection>
            </section>

            {/* Section 4: Development Activities */}
            <section id="development" className="scroll-mt-20">
              <LessonSection id="development" title="4. Development Activities" badge="130 min">
                <div className="space-y-6">
                  {/* Activity A */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">40 min</Badge>
                        <CardTitle className="text-lg">A. Interactive Lecture + Concept Mapping</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <EditableContent
                        storageKey="dev:a:intro"
                        initialValue="Segment: Differentiate cognitive and social constructivism using animations and infographics."
                        as="p"
                        className="text-slate-700"
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <CardSection className="bg-blue-50 border-blue-200">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">Cognitive Constructivism</h4>
                          <EditableContent
                            storageKey="dev:a:cognitive"
                            initialValue="Schema development through assimilation and accommodation. Piaget's stages of cognitive development."
                            as="p"
                            className="text-blue-700 text-sm"
                          />
                        </CardSection>
                        <CardSection className="bg-violet-50 border-violet-200">
                          <h4 className="font-semibold text-violet-800 text-sm mb-1">Social Constructivism</h4>
                          <EditableContent
                            storageKey="dev:a:social"
                            initialValue="Vygotsky's scaffolding model. Zone of Proximal Development. More Knowledgeable Other."
                            as="p"
                            className="text-violet-700 text-sm"
                          />
                        </CardSection>
                      </div>
                      <CardSection>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Think-Pair-Share</h4>
                        <EditableContent
                          storageKey="dev:a:tps"
                          initialValue="&quot;How would Piaget and Vygotsky approach a struggling math student differently?&quot;"
                          as="p"
                          className="text-slate-700 text-sm italic"
                        />
                      </CardSection>

                      {/* Concept Check for Schema */}
                      {!loading && (() => {
                        const cc = getConceptCheck('concept:schema');
                        return cc && user && !isGuest ? (
                          <ConceptCheck
                            checkId={cc.id}
                            title={cc.title}
                            prompt={cc.prompt}
                            checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                            userId={user.userId}
                            userRole={user.role}
                          />
                        ) : null;
                      })()}

                      {/* Concept Check for ZPD */}
                      {!loading && (() => {
                        const cc = getConceptCheck('concept:zpd');
                        return cc && user && !isGuest ? (
                          <ConceptCheck
                            checkId={cc.id}
                            title={cc.title}
                            prompt={cc.prompt}
                            checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                            userId={user.userId}
                            userRole={user.role}
                          />
                        ) : null;
                      })()}
                    </CardContent>
                  </Card>

                  {/* Activity B */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">45 min</Badge>
                        <CardTitle className="text-lg">B. Case Study Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <EditableContent
                        storageKey="dev:b:intro"
                        initialValue="Group Work: Assign 15 groups of 6 students a scenario (e.g., &quot;A student struggles to grasp algebra concepts.&quot;)"
                        as="p"
                        className="text-slate-700"
                      />
                      <CardSection>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Task</h4>
                        <ul className="space-y-1 text-slate-700 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 mt-0.5">&#8226;</span>
                            <span>Propose solutions using <strong>cognitive constructivism</strong> (individual schema-building)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 mt-0.5">&#8226;</span>
                            <span>Propose solutions using <strong>social constructivism</strong> (collaborative scaffolding)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 mt-0.5">&#8226;</span>
                            <span>Groups present findings via Padlet boards with visuals and strategy rationales</span>
                          </li>
                        </ul>
                      </CardSection>
                    </CardContent>
                  </Card>

                  {/* Activity C */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">30 min</Badge>
                        <CardTitle className="text-lg">C. Application Exercise</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <EditableContent
                        storageKey="dev:c:intro"
                        initialValue="Create a sample lesson plan outline using a Constructivist Template."
                        as="p"
                        className="text-slate-700"
                      />
                      <CardSection>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Scaffold Example</h4>
                        <EditableContent
                          storageKey="dev:c:scaffold"
                          initialValue="A completed example for a biology topic (e.g., photosynthesis) is provided as reference."
                          as="p"
                          className="text-slate-700 text-sm"
                        />
                      </CardSection>
                      <EditableContent
                        storageKey="dev:c:task"
                        initialValue="Students adapt the template for a K-12 subject of their choice, ensuring alignment with both theories."
                        as="p"
                        className="text-slate-700 text-sm"
                      />

                      {/* Concept Check for Application */}
                      {!loading && (() => {
                        const cc = getConceptCheck('concept:application');
                        return cc && user && !isGuest ? (
                          <ConceptCheck
                            checkId={cc.id}
                            title={cc.title}
                            prompt={cc.prompt}
                            checkType={cc.checkType as 'thumbs' | 'scale' | 'text'}
                            userId={user.userId}
                            userRole={user.role}
                          />
                        ) : null;
                      })()}
                    </CardContent>
                  </Card>

                  {/* Break */}
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <span className="text-lg">&#9749;</span>
                        <span className="font-medium">Break (10 minutes)</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity D */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">15 min</Badge>
                        <CardTitle className="text-lg">D. Formative Assessment</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <EditableContent
                        storageKey="dev:d:intro"
                        initialValue="Kahoot! Quiz: 5 questions on core concepts (e.g., &quot;Which theorist emphasized peer collaboration?&quot;). Immediate feedback with explanations for incorrect answers."
                        as="p"
                        className="text-slate-700"
                      />
                      <Link href={routes.quizzes}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ClipboardList className="h-3 w-3" /> Take Formative Quiz
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
                {renderMarkComplete('development')}
              </LessonSection>
            </section>

            {/* Section 5: Synthesis & Closure */}
            <section id="synthesis" className="scroll-mt-20">
              <LessonSection id="synthesis" title="5. Synthesis & Closure" badge="25 min">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-blue-600" /> Post-Test
                    </h3>
                    <EditableContent
                      storageKey="synth:posttest"
                      initialValue="Compare results to pre-test; highlight learning gains."
                      as="p"
                      className="text-slate-700"
                    />
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-indigo-600" /> Reflective Discussion
                    </h3>
                    <EditableContent
                      storageKey="synth:exit"
                      initialValue="Exit Ticket: &quot;Write one takeaway and one question you still have about constructivism.&quot;"
                      as="p"
                      className="text-slate-700"
                    />
                    <Link href={routes.discussion} className="inline-block mt-3">
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageSquare className="h-3 w-3" /> Share on Discussion Board
                      </Button>
                    </Link>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <ArrowRight className="h-4 w-4 text-emerald-600" /> Next Class Preview
                    </h3>
                    <EditableContent
                      storageKey="synth:next"
                      initialValue="&quot;We'll explore how to apply these theories to lesson design for neurodiverse classrooms.&quot;"
                      as="p"
                      className="text-slate-700 italic"
                    />
                  </CardSection>
                </div>
                {renderMarkComplete('synthesis')}
              </LessonSection>
            </section>

            {/* Section 6: Assessment Methods */}
            <section id="assessment" className="scroll-mt-20">
              <LessonSection id="assessment" title="6. Assessment Methods">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-slate-800 mb-3">Formative Assessment</h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <span>Mentimeter polls, case study group feedback, Padlet exit tickets.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <span>Kahoot! quiz results used to address lingering misconceptions.</span>
                      </li>
                    </ul>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 mb-3">Summative Assessment</h3>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="font-medium text-slate-800 mb-2">
                        Essay (due next week):
                      </p>
                      <EditableContent
                        storageKey="assessment:essay"
                        initialValue="&quot;Analyze cognitive and social constructivism's impact on modern pedagogy.&quot;"
                        as="p"
                        className="text-slate-700 italic mb-3"
                      />
                      <p className="text-sm font-medium text-slate-600 mb-1">Rubric:</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-blue-50 rounded p-2 text-center">
                          <p className="font-semibold text-blue-800">Content Accuracy</p>
                          <p className="text-blue-600">40%</p>
                        </div>
                        <div className="bg-violet-50 rounded p-2 text-center">
                          <p className="font-semibold text-violet-800">Application Examples</p>
                          <p className="text-violet-600">30%</p>
                        </div>
                        <div className="bg-emerald-50 rounded p-2 text-center">
                          <p className="font-semibold text-emerald-800">Critical Evaluation</p>
                          <p className="text-emerald-600">30%</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Aligned with ILOs 1-2.</p>
                    </div>
                  </CardSection>
                </div>
                {renderMarkComplete('assessment')}
              </LessonSection>
            </section>

            {/* Section 7: Constructive Alignment */}
            <section id="alignment" className="scroll-mt-20">
              <LessonSection id="alignment" title="7. Constructive Alignment Matrix">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left py-3 px-4 font-semibold text-slate-800 border-b">Learning Outcome</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800 border-b">Teaching Activity</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800 border-b">Assessment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">ILO 1</Badge>
                          <p className="mt-1 font-medium">Analyze</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700">Interactive lecture, animated visuals</td>
                        <td className="py-3 px-4 text-slate-700">Post-test questions on theory components</td>
                      </tr>
                      <tr className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">ILO 2</Badge>
                          <p className="mt-1 font-medium">Evaluate</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700">Case study analysis, group presentations</td>
                        <td className="py-3 px-4 text-slate-700">Summative essay rubric criterion: Application Examples</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">ILO 3</Badge>
                          <p className="mt-1 font-medium">Create</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700">Lesson plan template completion</td>
                        <td className="py-3 px-4 text-slate-700">Formative peer feedback on group work</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {renderMarkComplete('alignment')}
              </LessonSection>
            </section>

            {/* Section 8: Resources & Differentiation */}
            <section id="resources" className="scroll-mt-20">
              <LessonSection id="resources" title="8. Resources, Differentiation & Reflection">
                <div className="space-y-4">
                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <Settings className="h-4 w-4 text-slate-600" /> Required Resources & Technology
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <span><strong>LMS:</strong> Canvas or Moodle for pre-class materials.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <span><strong>Polling Tools:</strong> Mentimeter, Kahoot!.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <span><strong>Collaboration Platforms:</strong> Padlet boards, Google Jamboard for concept maps.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">&#8226;</span>
                        <span><strong>Handouts:</strong> Constructivist lesson plan templates, case study scenarios.</span>
                      </li>
                    </ul>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <Heart className="h-4 w-4 text-red-500" /> Differentiation & Inclusivity
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="font-semibold text-blue-800 text-sm mb-1">Visual Learners</p>
                        <p className="text-blue-700 text-sm">Animated illustrations and infographics.</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="font-semibold text-amber-800 text-sm mb-1">Auditory Learners</p>
                        <p className="text-amber-700 text-sm">Video clips and discussion-based activities.</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <p className="font-semibold text-emerald-800 text-sm mb-1">Advanced Learners</p>
                        <p className="text-emerald-700 text-sm">Optional extension reading on Bruner vs. Vygotsky debates.</p>
                      </div>
                      <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                        <p className="font-semibold text-violet-800 text-sm mb-1">Multilingual Support</p>
                        <p className="text-violet-700 text-sm">Subtitles for videos and translated glossary terms.</p>
                      </div>
                    </div>
                  </CardSection>

                  <CardSection>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-indigo-600" /> Reflection & Improvement
                    </h3>
                    <div className="space-y-2 text-slate-700">
                      <p><strong>Success Indicators:</strong> 80% of students score &ge;70% on the quiz; 90% participation in group work.</p>
                      <p><strong>Feedback Mechanisms:</strong> Course evaluation surveys + Padlet exit tickets.</p>
                      <p><strong>Future Modifications:</strong> Add multilingual support for 20% of students who speak English as a second language.</p>
                    </div>
                  </CardSection>

                  <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-indigo-800">
                        <strong>Final Note:</strong> This lesson prioritizes active learning, ensuring scalability for large cohorts through low-tech (group roles) and high-tech (polls) engagement strategies.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {renderMarkComplete('resources')}
              </LessonSection>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <ScrollRootProvider>
      <LessonContent />
    </ScrollRootProvider>
  );
}
