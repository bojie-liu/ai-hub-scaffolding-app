'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditableContent } from '@/components/lesson/content/EditableContent';
import { LessonSection } from '@/components/lesson/content/LessonSection';
import { ConceptCheckInline } from '@/components/lesson/interactive/ConceptCheck';
import {
  BookOpen, ClipboardList, Presentation, Users, Lightbulb, Cpu,
  Shield, Award, ExternalLink, Clock, Target, BarChart3,
  ChevronDown, ChevronUp, GraduationCap, MessageSquare, CheckCircle2,
  Wrench, Globe, TrendingUp, Video, FileText
} from 'lucide-react';
import Link from 'next/link';

interface LessonData {
  sections: Record<string, string | null>;
  preTestQuiz: any;
  postTestQuiz: any;
  conceptChecks: any[];
  slides: any[];
}

export function LessonClient({ data }: { data: LessonData }) {
  const { user, isGuest } = useUser();
  const isTeacher = user?.role === 'TEACHER';
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ilos: true,
    preClass: true,
    introduction: true,
    activities: true,
    synthesis: true,
    assessment: true,
    alignment: true,
    resources: true,
    differentiation: true,
    reflection: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              University Year 1
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              <EditableContent storageKey="lesson:title" fallback="The Modern Software Developer" isTeacher={isTeacher} />
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Exploring the evolution of software development in the age of AI
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 160 mins</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 90 students</span>
              <span className="flex items-center gap-1"><Target className="h-4 w-4" /> 4 ILOs</span>
            </div>
            {data.slides.length > 0 && (
              <Link href="/slides">
                <Button className="gap-2">
                  <Presentation className="h-4 w-4" />
                  View Presentation Slides
                </Button>
              </Link>
            )}
          </div>

          <Separator />

          {/* Section 1: ILOs */}
          <LessonSection
            icon={<Target className="h-5 w-5" />}
            title="1. Intended Learning Outcomes (ILOs)"
            storageKey="section:ilos"
            defaultContent={data.sections.ilos}
            isTeacher={isTeacher}
            expanded={expandedSections.ilos}
            onToggle={() => toggleSection('ilos')}
          >
            <p className="text-slate-600 mb-4">By the end of this session, students will be able to:</p>
            <div className="grid gap-3">
              {[
                { bloom: 'Analyze', text: 'Analyze the evolution of software development workflows using AI tools compared to traditional methods', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                { bloom: 'Evaluate', text: 'Evaluate the ethical, technical, and accessibility implications of AI-driven software engineering', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                { bloom: 'Apply', text: 'Apply AI-powered tools (e.g., GitHub Copilot, low-code platforms) to solve a basic programming challenge', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                { bloom: 'Create', text: 'Create a prototype of a simple application using iterative plan-generate-modify cycles', color: 'bg-green-100 text-green-800 border-green-200' },
              ].map((ilo, i) => (
                <Card key={i} className="border-l-4 border-l-blue-500">
                  <CardContent className="flex items-start gap-3 p-4">
                    <Badge className={`shrink-0 ${ilo.color}`}>Bloom: {ilo.bloom}</Badge>
                    <p className="text-slate-700">{ilo.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </LessonSection>

          {/* Section 2: Pre-Class Preparation */}
          <LessonSection
            icon={<BookOpen className="h-5 w-5" />}
            title="2. Pre-Class Preparation"
            storageKey="section:pre-class"
            defaultContent={data.sections.preClass}
            isTeacher={isTeacher}
            expanded={expandedSections.preClass}
            onToggle={() => toggleSection('preClass')}
          >
            <Tabs defaultValue="reading" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reading">Pre-Reading</TabsTrigger>
                <TabsTrigger value="pretest">Pre-Test</TabsTrigger>
                <TabsTrigger value="guiding">Guiding Questions</TabsTrigger>
              </TabsList>
              <TabsContent value="reading" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Video className="h-4 w-4 text-red-500" />
                      Pre-Reading/Video (15 mins)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <Video className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">Watch &quot;The State of Software Development in 2024&quot;</p>
                        <p className="text-sm text-slate-500">YouTube, ~10 mins</p>
                        <a href="https://www.youtube.com/playlist?list=PLxyz123456789" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                          Microsoft MVP AI Toolkit Demo Playlist <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">Skim article: &quot;Democratizing Code: How AI is Reshaping the Developer Workforce&quot;</p>
                        <p className="text-sm text-slate-500">Medium, ~5 mins</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pretest" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-500" />
                      Pre-Test (5 Questions)
                    </CardTitle>
                    <CardDescription>Test your knowledge before the lesson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.preTestQuiz ? (
                      <Link href="/quizzes?quiz=1">
                        <Button className="gap-2 w-full">
                          <ClipboardList className="h-4 w-4" />
                          Start Pre-Test Quiz
                        </Button>
                      </Link>
                    ) : (
                      <div className="space-y-3">
                        {[
                          'What is the primary difference between traditional "0-1" coding and AI-augmented workflows?',
                          'Name two ethical risks of AI-generated code.',
                          'True/False: GitHub Copilot guarantees secure, bug-free code.',
                          'Provide an example of a low-code/no-code tool.',
                          'How might AI tools increase diversity in software development?',
                        ].map((q, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                            <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                            <p className="text-sm text-slate-700">{q}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="guiding" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Guiding Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-slate-700 italic">&quot;How would you explain AI&apos;s role in reducing technical barriers to programming?&quot;</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-slate-700 italic">&quot;Should developers always trust AI-generated code? Why or why not?&quot;</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </LessonSection>

          {/* Section 3: Teaching & Learning Activities */}
          <LessonSection
            icon={<Presentation className="h-5 w-5" />}
            title="3. Teaching & Learning Activities"
            storageKey="section:activities-intro"
            defaultContent={null}
            isTeacher={isTeacher}
            expanded={expandedSections.introduction}
            onToggle={() => toggleSection('introduction')}
          >
            {/* Introduction (20 mins) */}
            <Card className="border-blue-200 bg-blue-50/30 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Introduction (20 mins)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className="bg-blue-600 shrink-0">5 min</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Hook: &quot;Will AI replace developers?&quot;</p>
                      <p className="text-sm text-slate-500 mt-1">Live Mentimeter poll: Agree/Disagree with results displayed anonymously</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className="bg-blue-600 shrink-0">10 min</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Pre-Test Discussion</p>
                      <p className="text-sm text-slate-500 mt-1">Review common misconceptions (e.g., AI replacing humans; tooling accessibility). Show aggregate pre-test results to address gaps.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className="bg-blue-600 shrink-0">5 min</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Real-World Connection</p>
                      <p className="text-sm text-slate-500 mt-1">Case study: Netflix&apos;s use of AI for scalable testing frameworks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* Development Activities (120 mins) */}
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Cpu className="h-5 w-5" />
              Development Activities (120 mins)
            </h3>

            {/* Activity 1 */}
            <LessonSection
              icon={<TrendingUp className="h-5 w-5" />}
              title="Activity 1: Interactive Lecture + Think-Pair-Share (30 mins)"
              storageKey="section:activity-1"
              defaultContent={data.sections.activity1}
              isTeacher={isTeacher}
              expanded={true}
              onToggle={() => {}}
              variant="inline"
            >
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="font-medium text-slate-800">Topic:</p>
                  <p className="text-slate-600">Evolution of workflows (0-1 vs. iterative plan/generate/modify)</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="font-medium text-slate-800 mb-2">Compare using animated flowcharts:</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Handwritten code (1990s-2010s)</li>
                    <li>AI-assisted code (2024)</li>
                  </ul>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-800 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Think-Pair-Share Prompt:
                  </p>
                  <p className="text-amber-700 italic mt-1">&quot;How might iterative workflows impact project timelines for startups vs. enterprises?&quot;</p>
                </div>
                {data.conceptChecks.find((c: any) => c.storageKey === 'concept:activity1') && (
                  <ConceptCheckInline
                    check={data.conceptChecks.find((c: any) => c.storageKey === 'concept:activity1')}
                    userId={user?.userId}
                  />
                )}
              </div>
            </LessonSection>

            {/* Activity 2 */}
            <LessonSection
              icon={<MessageSquare className="h-5 w-5" />}
              title="Activity 2: Group Case Study + Padlet Discussion (30 mins)"
              storageKey="section:activity-2"
              defaultContent={data.sections.activity2}
              isTeacher={isTeacher}
              expanded={true}
              onToggle={() => {}}
              variant="inline"
            >
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-700">Divide students into <strong>18 groups of 5</strong>.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="font-medium text-slate-800 mb-2">Instructions: Use the Padlet link to collaborate:</p>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1">
                    <li>Analyze a scenario (e.g., &quot;A non-technical entrepreneur builds an MVP with no-code tools&quot;)</li>
                    <li>Identify pros/cons (e.g., speed vs. security risks)</li>
                  </ol>
                  <p className="text-sm text-slate-500 mt-2">Groups post summaries to Padlet for peer review.</p>
                </div>
                <Link href="/discussion">
                  <Button variant="outline" className="gap-2 w-full">
                    <MessageSquare className="h-4 w-4" />
                    Go to Discussion Forum
                  </Button>
                </Link>
                <a href="https://padlet.com/bojieliu711/agile-nnwo314w5anmx0ep" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 w-full mt-2">
                    <ExternalLink className="h-4 w-4" />
                    Open Padlet Board
                  </Button>
                </a>
              </div>
            </LessonSection>

            {/* Activity 3 */}
            <LessonSection
              icon={<Wrench className="h-5 w-5" />}
              title="Activity 3: AI Tool Demo + Guided Practice (30 mins)"
              storageKey="section:activity-3"
              defaultContent={data.sections.activity3}
              isTeacher={isTeacher}
              expanded={true}
              onToggle={() => {}}
              variant="inline"
            >
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-slate-700">Live demo of GitHub Copilot for Python script optimization</p>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Scaffolded Task</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline">Step 1</Badge>
                        <p className="text-sm text-slate-600">Instructor shows basic code completion</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline">Step 2</Badge>
                        <p className="text-sm text-slate-600">Students adapt demo code to generate a Fibonacci sequence</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline">Step 3</Badge>
                        <p className="text-sm text-slate-600">Peer pair-check code for logical errors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 w-full">
                    <ExternalLink className="h-4 w-4" />
                    Access GitHub Copilot Free Trial
                  </Button>
                </a>
              </div>
            </LessonSection>

            {/* Activity 4 */}
            <LessonSection
              icon={<Shield className="h-5 w-5" />}
              title="Activity 4: Ethics Role-Play + Poll (30 mins)"
              storageKey="section:activity-4"
              defaultContent={data.sections.activity4}
              isTeacher={isTeacher}
              expanded={true}
              onToggle={() => {}}
              variant="inline"
            >
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="font-medium text-red-800">Assign roles:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Developer', 'End-User', 'Company Manager', 'Cybersecurity Expert'].map((role) => (
                      <Badge key={role} variant="outline" className="bg-white">{role}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="font-medium text-slate-800 mb-1">Scenario:</p>
                  <p className="text-slate-600">AI-generated code introduces a privacy violation.</p>
                  <p className="text-sm text-slate-500 mt-2">Debate responsibilities and mitigation strategies.</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-slate-700">Close with a Mentimeter multiple-choice poll on &quot;Who owns AI-generated code?&quot;</p>
                </div>
                <Link href="/discussion">
                  <Button variant="outline" className="gap-2 w-full">
                    <MessageSquare className="h-4 w-4" />
                    Discuss in Forum
                  </Button>
                </Link>
              </div>
            </LessonSection>

            <Separator className="my-6" />

            {/* Synthesis & Closure (20 mins) */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Synthesis & Closure (20 mins)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className="bg-green-600 shrink-0">5 min</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Post-Test</p>
                      <p className="text-sm text-slate-500 mt-1">Identify key changes in software engineering workflows since 2010. Explain 1 ethical concern to discuss with a client advocating full AI reliance.</p>
                      {data.postTestQuiz ? (
                        <Link href="/quizzes?quiz=2">
                          <Button size="sm" className="mt-2 gap-1">
                            <ClipboardList className="h-3 w-3" />
                            Take Post-Test
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className="bg-green-600 shrink-0">10 min</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Reflective Discussion</p>
                      <p className="text-sm text-slate-500 mt-1 italic">&quot;How will AI-augmented tools align or conflict with your career goals?&quot;</p>
                      <p className="text-sm text-slate-500">Display Padlet group summaries for whole-class analysis.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className="bg-green-600 shrink-0">5 min</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Preview Next Session</p>
                      <p className="text-sm text-slate-500 mt-1">Introduction to prompt engineering for code generation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </LessonSection>

          {/* Section 4: Assessment Methods */}
          <LessonSection
            icon={<BarChart3 className="h-5 w-5" />}
            title="4. Assessment Methods"
            storageKey="section:assessment"
            defaultContent={data.sections.assessment}
            isTeacher={isTeacher}
            expanded={expandedSections.assessment}
            onToggle={() => toggleSection('assessment')}
          >
            <Tabs defaultValue="formative" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formative">Formative Assessment</TabsTrigger>
                <TabsTrigger value="summative">Summative Assessment</TabsTrigger>
              </TabsList>
              <TabsContent value="formative" className="space-y-3 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">Mentimeter Polls</p>
                        <p className="text-sm text-slate-500">Track real-time understanding of ethical debates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">Padlet Submissions</p>
                        <p className="text-sm text-slate-500">Quality of case study analysis (e.g., depth of pros/cons)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">Exit Ticket (1-Minute Paper)</p>
                        <p className="text-sm text-slate-500 italic">&quot;The most surprising thing I learned about AI&apos;s impact on developers today&quot;</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="summative" className="space-y-3 mt-4">
                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Take-Home Assignment (Due in 1 Week)</CardTitle>
                    <CardDescription>Use AI tools to build a simple web app (e.g., a personal portfolio)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Rubric:</p>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-blue-100 text-blue-800 text-center py-1 rounded text-sm font-medium">30%</div>
                          <p className="text-sm text-slate-600">Functionality</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-green-100 text-green-800 text-center py-1 rounded text-sm font-medium">30%</div>
                          <p className="text-sm text-slate-600">Code quality/revisions</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-purple-100 text-purple-800 text-center py-1 rounded text-sm font-medium">40%</div>
                          <p className="text-sm text-slate-600">Reflection on ethical considerations</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </LessonSection>

          {/* Section 5: Constructive Alignment Matrix */}
          <LessonSection
            icon={<Award className="h-5 w-5" />}
            title="5. Constructive Alignment Matrix"
            storageKey="section:alignment"
            defaultContent={data.sections.alignment}
            isTeacher={isTeacher}
            expanded={expandedSections.alignment}
            onToggle={() => toggleSection('alignment')}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-3 border font-medium">Learning Outcome</th>
                    <th className="text-left p-3 border font-medium">Teaching Activity</th>
                    <th className="text-left p-3 border font-medium">Assessment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Analyze workflow evolution', 'Animated flowcharts, interactive lecture', 'Post-test response'],
                    ['Evaluate ethical implications', 'Ethics role-play, Poll', 'Padlet case study, Exit ticket'],
                    ['Apply AI tools', 'Guided practice + GitHub demo', 'Take-home assignment (code/testimony)'],
                    ['Create prototype', 'Scaffolded coding task', 'Take-home assignment (web app)'],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 border"><Badge variant="outline" className="text-xs">{row[0]}</Badge></td>
                      <td className="p-3 border text-slate-600">{row[1]}</td>
                      <td className="p-3 border text-slate-600">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LessonSection>

          {/* Section 6: Required Resources & Technology */}
          <LessonSection
            icon={<Wrench className="h-5 w-5" />}
            title="6. Required Resources & Technology"
            storageKey="section:resources"
            defaultContent={data.sections.resources}
            isTeacher={isTeacher}
            expanded={expandedSections.resources}
            onToggle={() => toggleSection('resources')}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Cpu className="h-4 w-4" /> Digital Tools</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-1">
                  <p>Padlet link [provided in External Link Module]</p>
                  <p>Mentimeter for polls</p>
                  <p>GitHub accounts (for Copilot trial)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4" /> Hardware</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>Shared IDE on projector</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Readings</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>Pre-class materials and sample code templates</p>
                </CardContent>
              </Card>
            </div>
          </LessonSection>

          {/* Section 7: Differentiation & Inclusivity */}
          <LessonSection
            icon={<Globe className="h-5 w-5" />}
            title="7. Differentiation & Inclusivity"
            storageKey="section:differentiation"
            defaultContent={data.sections.differentiation}
            isTeacher={isTeacher}
            expanded={expandedSections.differentiation}
            onToggle={() => toggleSection('differentiation')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <p className="font-medium text-green-800 mb-2">For Advanced Learners</p>
                  <p className="text-sm text-slate-600">Optional exploration of Google&apos;s AutoML for machine learning pipelines</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-4">
                  <p className="font-medium text-blue-800 mb-2">For Beginners</p>
                  <p className="text-sm text-slate-600">Provide scaffolded code templates and a glossary of AI jargon</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50/30">
                <CardContent className="p-4">
                  <p className="font-medium text-purple-800 mb-2">Accessibility</p>
                  <p className="text-sm text-slate-600">Transcripts for video, screen readers for Padlet</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/30">
                <CardContent className="p-4">
                  <p className="font-medium text-amber-800 mb-2">Multilingual Support</p>
                  <p className="text-sm text-slate-600">Provide readings in Spanish/French (LMS link)</p>
                </CardContent>
              </Card>
            </div>
          </LessonSection>

          {/* Section 8: Reflection & Improvement */}
          <LessonSection
            icon={<TrendingUp className="h-5 w-5" />}
            title="8. Reflection & Improvement"
            storageKey="section:reflection"
            defaultContent={data.sections.reflection}
            isTeacher={isTeacher}
            expanded={expandedSections.reflection}
            onToggle={() => toggleSection('reflection')}
          >
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700">Success Indicators</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-1">
                  <p>High participation in Padlet and polls</p>
                  <p>Mastery of core concepts in post-test (&ge;70% accuracy)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-700">Feedback Mechanisms</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-1">
                  <p>LMS survey on activity clarity and pace</p>
                  <p>TA monitoring of Padlet contributions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-700">Future Modifications</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-1">
                  <p>Add industry guest speakers for real-world context</p>
                  <p>Shorten lecture segments if students struggle with tool setup</p>
                </CardContent>
              </Card>
            </div>
          </LessonSection>

          {/* Section 9: External Link Module */}
          <LessonSection
            icon={<ExternalLink className="h-5 w-5" />}
            title="9. External Link Module"
            storageKey="section:external-links"
            defaultContent={data.sections.externalLinks}
            isTeacher={isTeacher}
            expanded={true}
            onToggle={() => {}}
          >
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="p-4">
                <p className="font-medium text-slate-800 mb-2">Padlet link for group discussion:</p>
                <a
                  href="https://padlet.com/bojieliu711/agile-nnwo314w5anmx0ep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  https://padlet.com/bojieliu711/agile-nnwo314w5anmx0ep
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          </LessonSection>
        </div>
      </div>
    </AuthGuard>
  );
}
