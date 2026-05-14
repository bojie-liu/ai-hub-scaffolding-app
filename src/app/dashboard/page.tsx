'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, BarChart3, ClipboardList, ThumbsUp, ThumbsDown, Minus,
  TrendingUp, Award, CheckCircle2, Clock
} from 'lucide-react';

interface StudentWithProgress {
  student: { id: number; username: string; displayName: string | null; email: string; role: string };
  progress: { id: number; userId: number; sectionKey: string; completed: boolean; completedAt: Date | null }[];
}

interface ConceptCheckResult {
  check: { id: number; storageKey: string; title: string; prompt: string; checkType: string };
  responses: { id: number; checkId: number; userId: number; responseValue: string; createdAt: Date | null; username: string | null; displayName: string | null }[];
  responseCounts: Record<string, number>;
  totalResponses: number;
}

const SECTION_LABELS: Record<string, string> = {
  'section:ilos': 'ILOs',
  'section:pre-class': 'Pre-Class',
  'section:introduction': 'Introduction',
  'section:activity-1': 'Activity 1',
  'section:activity-2': 'Activity 2',
  'section:activity-3': 'Activity 3',
  'section:activity-4': 'Activity 4',
  'section:synthesis': 'Synthesis',
  'section:assessment': 'Assessment',
  'quiz:pre-test': 'Pre-Test Quiz',
  'quiz:post-test': 'Post-Test Quiz',
  'concept:activity1': 'Concept Check 1',
};

export default function DashboardPage() {
  const { user } = useUser();
  const [studentProgress, setStudentProgress] = useState<StudentWithProgress[]>([]);
  const [conceptCheckResults, setConceptCheckResults] = useState<ConceptCheckResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [progressResult, conceptResult] = await Promise.all([
          import('@/lib/actions/progress').then(m => m.getAllStudentProgress()),
          import('@/lib/actions/concept-check').then(m => m.getConceptCheckResults()),
        ]);
        if (progressResult.success && progressResult.data) {
          setStudentProgress(progressResult.data as StudentWithProgress[]);
        }
        if (conceptResult.success && conceptResult.data) {
          setConceptCheckResults(conceptResult.data as ConceptCheckResult[]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <AuthGuard requiredRole="TEACHER">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AuthGuard>
    );
  }

  const totalStudents = studentProgress.length;
  const allSectionKeys = [...new Set(studentProgress.flatMap(s => s.progress.map(p => p.sectionKey)))];
  const completionRate = totalStudents > 0
    ? Math.round((studentProgress.filter(s => s.progress.length > 0).length / totalStudents) * 100)
    : 0;

  return (
    <AuthGuard requiredRole="TEACHER">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Monitor student progress and engagement</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Active Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allSectionKeys.length}</p>
                <p className="text-sm text-muted-foreground">Sections Tracked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conceptCheckResults.reduce((sum, c) => sum + c.totalResponses, 0)}</p>
                <p className="text-sm text-muted-foreground">Concept Responses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students">
          <TabsList>
            <TabsTrigger value="students">Student Progress</TabsTrigger>
            <TabsTrigger value="concepts">Concept Checks</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-4">
            {studentProgress.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No student data available yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {studentProgress.map(({ student, progress }) => {
                  const completedSections = progress.filter(p => p.completed).length;
                  const totalSections = Math.max(allSectionKeys.length, 1);
                  const pct = Math.round((completedSections / totalSections) * 100);
                  return (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                              {(student.displayName || student.username)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{student.displayName || student.username}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{pct}%</p>
                            <p className="text-xs text-muted-foreground">{completedSections}/{totalSections} sections</p>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2" />
                        {progress.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {progress.filter(p => p.completed).map(p => (
                              <Badge key={p.id} variant="outline" className="text-xs">
                                {SECTION_LABELS[p.sectionKey] || p.sectionKey}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="concepts" className="mt-4">
            {conceptCheckResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No concept check responses yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {conceptCheckResults.map((result) => (
                  <Card key={result.check.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{result.check.title}</CardTitle>
                      <CardDescription>{result.check.prompt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>{result.totalResponses} responses</Badge>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(result.responseCounts).map(([value, count]) => {
                          const pct = result.totalResponses > 0 ? Math.round((count / result.totalResponses) * 100) : 0;
                          return (
                            <div key={value} className="flex items-center gap-3">
                              <div className="w-24 text-sm font-medium flex items-center gap-1">
                                {value === 'up' ? <ThumbsUp className="h-4 w-4 text-green-600" /> :
                                 value === 'down' ? <ThumbsDown className="h-4 w-4 text-red-600" /> :
                                 <Minus className="h-4 w-4 text-amber-600" />}
                                {value}
                              </div>
                              <div className="flex-1">
                                <Progress value={pct} className="h-3" />
                              </div>
                              <span className="text-sm text-muted-foreground w-16 text-right">{count} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
