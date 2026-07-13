'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  BookOpen,
  CheckCircle,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from 'lucide-react';
import { getAllStudentProgress } from '@/lib/actions/progress';
import { getAllQuizzes, getQuizResults } from '@/lib/actions/quiz';
import { getConceptCheckResults } from '@/lib/actions/concept-check';

// --- Type definitions ---

interface StudentInfo {
  id: number;
  username: string;
  displayName: string | null;
  email: string;
  role: string;
}

interface ProgressRecord {
  id: number;
  userId: number;
  sectionKey: string;
  completed: boolean;
  completedAt: Date | null;
}

interface StudentWithProgress {
  student: StudentInfo;
  progress: ProgressRecord[];
}

interface QuizResult {
  attempt: {
    id: number;
    userId: number;
    quizId: number;
    score: number;
    totalQuestions: number;
    completedAt: Date | null;
  };
  user: StudentInfo | null;
}

interface ConceptCheckResult {
  check: {
    id: number;
    storageKey: string;
    title: string;
    prompt: string;
    checkType: string;
    sectionKey: string | null;
    createdAt: Date | null;
  };
  responses: {
    id: number;
    checkId: number;
    userId: number;
    responseValue: string;
    createdAt: Date | null;
    username: string | null;
    displayName: string | null;
  }[];
  responseCounts: Record<string, number>;
  totalResponses: number;
}

const SECTION_LABELS: Record<string, string> = {
  ilos: 'Learning Outcomes',
  preclass: 'Pre-Class',
  activities: 'Activities',
  assessment: 'Assessment',
  alignment: 'Alignment',
  resources: 'Resources',
  differentiation: 'Differentiation',
  reflection: 'Reflection',
};

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [quizResults, setQuizResults] = useState<
    { quizId: number; quizTitle: string; results: QuizResult[] }[]
  >([]);
  const [conceptResults, setConceptResults] = useState<ConceptCheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch student progress
      const progressResult = await getAllStudentProgress();
      if (!progressResult.success || !progressResult.data) {
        throw new Error(progressResult.error ?? 'Failed to load student progress');
      }
      setStudents(progressResult.data);

      // Fetch quizzes and their results
      const quizzesResult = await getAllQuizzes();
      if (quizzesResult.success && quizzesResult.data) {
        const quizResultsPromises = quizzesResult.data.map(async (quiz) => {
          const resultsResult = await getQuizResults(quiz.id);
          return {
            quizId: quiz.id,
            quizTitle: quiz.title,
            results: resultsResult.success && resultsResult.data ? resultsResult.data : [],
          };
        });

        const allQuizResults = await Promise.all(quizResultsPromises);
        setQuizResults(allQuizResults);
      }

      // Fetch concept check results
      const conceptResult = await getConceptCheckResults();
      if (conceptResult.success && conceptResult.data) {
        setConceptResults(conceptResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Computed summary stats ---

  const totalStudents = students.length;

  const avgCompletion =
    totalStudents > 0
      ? Math.round(
          students.reduce((sum, s) => {
            const sections = Object.keys(SECTION_LABELS);
            const completedCount = sections.filter((key) =>
              s.progress.some((p) => p.sectionKey === key && p.completed)
            ).length;
            return sum + (completedCount / sections.length) * 100;
          }, 0) / totalStudents
        )
      : 0;

  const totalQuizAttempts = quizResults.reduce(
    (sum, qr) => sum + qr.results.length,
    0
  );

  const activeDiscussions = 0; // Could be fetched separately if needed

  // --- Loading skeleton ---

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 ml-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Error state ---

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // --- Render helpers ---

  const renderProgressTable = () => {
    const sectionKeys = Object.keys(SECTION_LABELS);

    if (students.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No students found.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                Student
              </th>
              {sectionKeys.map((key) => (
                <th
                  key={key}
                  className="text-center py-3 px-2 font-medium text-muted-foreground whitespace-nowrap"
                >
                  {SECTION_LABELS[key]}
                </th>
              ))}
              <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                Overall
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map(({ student, progress }) => {
              const completedSections = sectionKeys.filter((key) =>
                progress.some((p) => p.sectionKey === key && p.completed)
              ).length;
              const completionPct = Math.round(
                (completedSections / sectionKeys.length) * 100
              );

              return (
                <tr key={student.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-muted">
                          {(
                            student.displayName ?? student.username
                          )
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium truncate max-w-[120px]">
                        {student.displayName ?? student.username}
                      </span>
                    </div>
                  </td>
                  {sectionKeys.map((key) => {
                    const isComplete = progress.some(
                      (p) => p.sectionKey === key && p.completed
                    );
                    return (
                      <td key={key} className="text-center py-3 px-2">
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={completionPct} className="h-1.5 w-16" />
                      <span className="text-xs font-medium w-8 text-right">
                        {completionPct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderQuizResults = () => {
    if (quizResults.length === 0) {
      return (
        <div className="text-center py-8">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No quiz results available.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {quizResults.map(({ quizId, quizTitle, results }) => {
          const avgScore =
            results.length > 0
              ? Math.round(
                  (results.reduce(
                    (sum, r) => sum + r.attempt.score / r.attempt.totalQuestions,
                    0
                  ) /
                    results.length) *
                    100
                )
              : 0;

          return (
            <Card key={quizId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{quizTitle}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {results.length} {results.length === 1 ? 'attempt' : 'attempts'}
                    </Badge>
                    {results.length > 0 && (
                      <Badge
                        variant={
                          avgScore >= 75
                            ? 'default'
                            : avgScore >= 50
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        Avg: {avgScore}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No attempts yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                            Student
                          </th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                            Score
                          </th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                            Percentage
                          </th>
                          <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                            Completed
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(({ attempt, user }, idx) => {
                          const pct = Math.round(
                            (attempt.score / attempt.totalQuestions) * 100
                          );
                          return (
                            <tr
                              key={attempt.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-muted">
                                      {(user?.displayName ?? user?.username ?? '??')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate max-w-[120px]">
                                    {user?.displayName ?? user?.username ?? `User ${attempt.userId}`}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-2 px-2 font-mono">
                                {attempt.score}/{attempt.totalQuestions}
                              </td>
                              <td className="text-center py-2 px-2">
                                <Badge
                                  variant={
                                    pct >= 75
                                      ? 'default'
                                      : pct >= 50
                                        ? 'secondary'
                                        : 'destructive'
                                  }
                                >
                                  {pct}%
                                </Badge>
                              </td>
                              <td className="text-right py-2 px-2 text-muted-foreground text-xs">
                                {attempt.completedAt
                                  ? new Date(attempt.completedAt).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderConceptChecks = () => {
    if (conceptResults.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No concept check results available.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {conceptResults.map((result) => {
          const { check, responseCounts, totalResponses } = result;

          return (
            <Card key={check.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{check.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {check.prompt}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {totalResponses === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No responses yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(responseCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([value, count]) => {
                        const pct = Math.round((count / totalResponses) * 100);

                        // Map common response values to icons
                        const getResponseIcon = (val: string) => {
                          const lower = val.toLowerCase();
                          if (lower === 'thumbs_up' || lower === 'up' || lower === 'yes')
                            return <ThumbsUp className="h-4 w-4 text-emerald-600" />;
                          if (lower === 'thumbs_down' || lower === 'down' || lower === 'no')
                            return <ThumbsDown className="h-4 w-4 text-red-500" />;
                          if (lower === 'neutral' || lower === 'maybe')
                            return <Minus className="h-4 w-4 text-amber-500" />;
                          return null;
                        };

                        return (
                          <div key={value} className="flex items-center gap-3">
                            {getResponseIcon(value)}
                            <span className="text-sm font-medium min-w-[100px] capitalize">
                              {value.replace(/_/g, ' ')}
                            </span>
                            <div className="flex-1">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              {count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // --- Main render ---

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{avgCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                <p className="text-2xl font-bold">{totalQuizAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concept Checks</p>
                <p className="text-2xl font-bold">{conceptResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabbed Content */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress" className="gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Student Progress</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Quiz Results</span>
            <span className="sm:hidden">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="concepts" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Concept Checks</span>
            <span className="sm:hidden">Concepts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Progress by Section</CardTitle>
            </CardHeader>
            <CardContent>{renderProgressTable()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4">
          {renderQuizResults()}
        </TabsContent>

        <TabsContent value="concepts" className="mt-4">
          {renderConceptChecks()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
