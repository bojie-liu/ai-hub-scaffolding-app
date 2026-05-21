'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import LessonSection from '@/components/lesson/content/LessonSection';
import CardSection from '@/components/lesson/content/CardSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import { useUser } from '@/contexts/UserContext';
import { markSectionComplete } from '@/lib/actions/progress';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions } from '@/lib/actions/discussion';
import QuizComponent from '@/components/lesson/interactive/Quiz';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BookOpen, Video, ClipboardList, MessageSquare, Target, Lightbulb, Settings, BarChart3, FileText, Users, Clock, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface QuizQuestionData {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
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
  isPinned: boolean;
}

const SECTIONS = [
  { id: 'ilos', label: '預期學習成果' },
  { id: 'preclass', label: '課前準備' },
  { id: 'introduction', label: '引言' },
  { id: 'activity1', label: '活動一：理論解構' },
  { id: 'activity2', label: '活動二：知識審計' },
  { id: 'activity3', label: '活動三：平台設計' },
  { id: 'activity4', label: '活動四：策略制定' },
  { id: 'summary', label: '總結與延伸' },
  { id: 'assessment', label: '評估方式' },
  { id: 'alignment', label: '建構主義對應' },
  { id: 'resources', label: '資源與工具' },
  { id: 'differentiation', label: '差異化策略' },
  { id: 'reflection', label: '教學反思' },
  { id: 'supplementary', label: '補充教材' },
];

export default function LessonPage() {
  const { user } = useUser();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [preQuiz, setPreQuiz] = useState<{ id: number; title: string; questions: QuizQuestionData[] } | null>(null);
  const [postQuiz, setPostQuiz] = useState<{ id: number; title: string; questions: QuizQuestionData[] } | null>(null);
  const [conceptChecks, setConceptChecks] = useState<ConceptCheckData[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);

  const loadData = useCallback(async () => {
    // Load quizzes
    const preResult = await getQuiz(1);
    if (preResult.success && preResult.data) {
      setPreQuiz({
        id: preResult.data.quiz.id,
        title: preResult.data.quiz.title,
        questions: preResult.data.questions.map((q: { id: number; questionText: string; questionType: string; explanation: string | null; answers: { id: number; answerText: string; isCorrect: boolean }[] }) => ({
          ...q,
          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
        })),
      });
    }

    const postResult = await getQuiz(2);
    if (postResult.success && postResult.data) {
      setPostQuiz({
        id: postResult.data.quiz.id,
        title: postResult.data.quiz.title,
        questions: postResult.data.questions.map((q: { id: number; questionText: string; questionType: string; explanation: string | null; answers: { id: number; answerText: string; isCorrect: boolean }[] }) => ({
          ...q,
          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
        })),
      });
    }

    // Load concept checks
    const ccResult = await getConceptChecks();
    if (ccResult.success && ccResult.data) {
      setConceptChecks(ccResult.data as ConceptCheckData[]);
    }

    // Load discussions
    const discResult = await getDiscussions();
    if (discResult.success && discResult.data) {
      setDiscussions(discResult.data as DiscussionSummary[]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleMarkComplete(sectionKey: string) {
    if (!user || user.userId < 0) return;
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompletedSections((prev) => new Set(prev).add(sectionKey));
    }
  }

  function getConceptCheckForSection(sectionKey: string): ConceptCheckData | undefined {
    return conceptChecks.find((cc) => cc.sectionKey === sectionKey);
  }

  function SectionCompleteButton({ sectionKey }: { sectionKey: string }) {
    if (!user || user.userId < 0) return null;
    const isComplete = completedSections.has(sectionKey);
    return (
      <Button
        variant={isComplete ? 'ghost' : 'outline'}
        size="sm"
        className={`gap-1.5 ${isComplete ? 'text-emerald-600' : ''}`}
        onClick={() => !isComplete && handleMarkComplete(sectionKey)}
        disabled={isComplete}
      >
        <CheckCircle className="h-4 w-4" />
        {isComplete ? '已完成' : '標記完成'}
      </Button>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          <LessonSideMenu sections={SECTIONS} />

          <main className="flex-1 min-w-0 space-y-6">
            {/* ===================== Header ===================== */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white shadow-lg">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="bg-white/20 text-white border-white/30">知識管理與學校發展</Badge>
                <Badge className="bg-white/20 text-white border-white/30">180分鐘</Badge>
                <Badge className="bg-white/20 text-white border-white/30">90人</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                <EditableContent storageKey="lesson:title" initialValue="資訊科技發展下的學校知識管理挑戰與策略" as="span" />
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                <EditableContent storageKey="lesson:subtitle" initialValue="科目：知識管理與學校發展 | 大學程度 | 繁體中文" as="span" />
              </p>
            </div>

            {/* ===================== 一、預期學習成果 ===================== */}
            <LessonSection id="ilos" title="一、預期學習成果 (ILOs)" badge="學習目標">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <EditableContent storageKey="ilos:1" initialValue="能分析資訊科技發展對學校知識管理的影響（應用層級）" as="p" className="text-slate-800" />
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <EditableContent storageKey="ilos:2" initialValue="能評估三種知識管理理論在教育場景的適用性（評鑑層級）" as="p" className="text-slate-800" />
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <EditableContent storageKey="ilos:3" initialValue="能設計包含知識審計與策略制定的行動計劃（創造層級）" as="p" className="text-slate-800" />
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <EditableContent storageKey="ilos:4" initialValue="能應用知識共享機制工具（如數位平台）優化校內知識流（應用層級）" as="p" className="text-slate-800" />
                  </div>
                </div>
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
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="ilos" />
              </div>
            </LessonSection>

            {/* ===================== 二、課前準備 ===================== */}
            <LessonSection id="preclass" title="二、課前準備（翻轉課堂）" badge="課前">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" /> 預讀材料
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="preclass:reading1" initialValue="文章《數位時代下的學校知識管理挑戰與機遇》（15分鐘閱讀）" as="span" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="preclass:reading2" initialValue="案例影片《智慧學校知識管理實踐》（8分鐘）" as="span" />
                    </li>
                  </ul>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-amber-600" /> 前測問卷
                  </h3>
                  <div className="text-sm text-slate-700 space-y-2">
                    <p><strong>測驗名稱：</strong>知識管理與學校發展 — 基礎觀念前測</p>
                    <p><strong>計分方式：</strong>每答對1題得1分，總分10分</p>
                    <p><strong>題型：</strong>是非題（4題）、選擇題（4題）、簡答題（2題）</p>
                  </div>
                  {preQuiz && user && user.userId > 0 && (
                    <div className="mt-4">
                      <QuizComponent
                        quizId={preQuiz.id}
                        title={preQuiz.title}
                        questions={preQuiz.questions}
                        userId={user.userId}
                      />
                    </div>
                  )}
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" /> 引導問題
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="preclass:guide1" initialValue="請舉例說明您所在學校的知識流失現象" as="span" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="preclass:guide2" initialValue="數位工具如何改善知識傳承效率？" as="span" />
                    </li>
                  </ul>
                </CardSection>
              </div>
              {getConceptCheckForSection('preclass') && user && user.userId > 0 && (
                <div className="mt-4">
                  <ConceptCheck
                    checkId={getConceptCheckForSection('preclass')!.id}
                    title={getConceptCheckForSection('preclass')!.title}
                    prompt={getConceptCheckForSection('preclass')!.prompt}
                    checkType={getConceptCheckForSection('preclass')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="preclass" />
              </div>
            </LessonSection>

            {/* ===================== 三、引言 ===================== */}
            <LessonSection id="introduction" title="三、引言（25分鐘）" badge="25分鐘">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" /> 導入活動：情境式問答
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-slate-700">
                    <EditableContent storageKey="intro:scenario" initialValue="提出挑戰情境：「某中學教師平均年資5年，知識斷層嚴重，請提出初步應對方案」" multiline as="p" />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    <EditableContent storageKey="intro:padlet" initialValue="使用Padlet即時互動讓小組提交初步構想（5分鐘）" as="span" />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" /> 前測結果分析
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="intro:pretest-analysis" initialValue="展示問卷數據統計圖表，針對前三項常見錯誤觀念深入探討（8分鐘）" as="span" />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" /> 真實應用連結
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="intro:video" initialValue="放送國際學校知識管理實務影片（7分鐘）" as="span" />
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    <EditableContent storageKey="intro:compare" initialValue="引導學生對比自身機構現況（5分鐘）" as="span" />
                  </p>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="introduction" />
              </div>
            </LessonSection>

            {/* ===================== 活動一：知識管理理論解構 ===================== */}
            <LessonSection id="activity1" title="活動一：知識管理理論解構（30分鐘）" badge="30分鐘">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600" /> 互動講授
                  </h3>
                  <p className="text-sm text-slate-700 mb-2">
                    以KWL表格（已知/欲知/學到）引導學習，穿插以下內容：
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-800 text-sm mb-2">Nonaka知識轉化螺旋模型</h4>
                      <EditableContent storageKey="activity1:seci" initialValue="社會化（隱性→隱性）→ 外化（隱性→顯性）→ 組合（顯性→顯性）→ 內化（顯性→隱性）" multiline as="p" className="text-sm text-indigo-700" />
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-800 text-sm mb-2">社群實踐（CoP）理論</h4>
                      <EditableContent storageKey="activity1:cop" initialValue="透過共同興趣和實踐活動，促進成員間的知識分享與學習的學校應用案例" multiline as="p" className="text-sm text-indigo-700" />
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-600" /> 結構化練習
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="activity1:practice" initialValue="發放「KM理論比較矩陣」工作表，小組完成理論差異分析（15分鐘）" as="span" />
                  </p>
                </CardSection>
              </div>
              {getConceptCheckForSection('activity1') && user && user.userId > 0 && (
                <div className="mt-4">
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
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="activity1" />
              </div>
            </LessonSection>

            {/* ===================== 活動二：知識審計實作 ===================== */}
            <LessonSection id="activity2" title="活動二：知識審計實作（40分鐘）" badge="40分鐘">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" /> 情境模擬
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="activity2:simulation" initialValue="分組診斷虛擬中學的知識管理問題（角色分配：校長、教務主任、新進教師）" as="span" />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-emerald-600" /> 工具應用：知識審計模板
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <EditableContent storageKey="activity2:tool1" initialValue="知識資產清單建立" as="span" className="text-sm text-slate-700" />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <EditableContent storageKey="activity2:tool2" initialValue="知識斷點分析" as="span" className="text-sm text-slate-700" />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <EditableContent storageKey="activity2:tool3" initialValue="隱性知識顯性化策略" as="span" className="text-sm text-slate-700" />
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> 成果檢視
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="activity2:arcu" initialValue="每組使用ARCU模型（Appropriate, Relevant, Connected, Useful）評估計畫可行性" as="span" />
                  </p>
                </CardSection>
              </div>
              {getConceptCheckForSection('activity2') && user && user.userId > 0 && (
                <div className="mt-4">
                  <ConceptCheck
                    checkId={getConceptCheckForSection('activity2')!.id}
                    title={getConceptCheckForSection('activity2')!.title}
                    prompt={getConceptCheckForSection('activity2')!.prompt}
                    checkType={getConceptCheckForSection('activity2')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="activity2" />
              </div>
            </LessonSection>

            {/* ===================== 活動三：數位知識共享平台設計 ===================== */}
            <LessonSection id="activity3" title="活動三：數位知識共享平台設計（40分鐘）" badge="40分鐘">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-600" /> 案例研究
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="activity3:case" initialValue="分析「台北市智慧教育雲端平台」功能模組圖" as="span" />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-violet-600" /> 平台搭建（虛擬白板設計）
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
                      <h4 className="font-medium text-violet-800 text-sm mb-1">知識庫架構</h4>
                      <EditableContent storageKey="activity3:kb" initialValue="文件中心 / 影音教學 / 問答區" as="p" className="text-xs text-violet-700" />
                    </div>
                    <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
                      <h4 className="font-medium text-violet-800 text-sm mb-1">權限管理機制</h4>
                      <EditableContent storageKey="activity3:perm" initialValue="階梯式權限管理" as="p" className="text-xs text-violet-700" />
                    </div>
                    <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
                      <h4 className="font-medium text-violet-800 text-sm mb-1">獎勵制度</h4>
                      <EditableContent storageKey="activity3:reward" initialValue="教師知識回報獎勵制度設計" as="p" className="text-xs text-violet-700" />
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-violet-600" /> 小組簡報
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="activity3:presentation" initialValue="每組5分鐘演示，接受同儕提問與建議" as="span" />
                  </p>
                </CardSection>
              </div>
              {getConceptCheckForSection('activity3') && user && user.userId > 0 && (
                <div className="mt-4">
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
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="activity3" />
              </div>
            </LessonSection>

            {/* ===================== 活動四：策略制定工作坊 ===================== */}
            <LessonSection id="activity4" title="活動四：策略制定工作坊（20分鐘）" badge="20分鐘">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-600" /> 策略卡片遊戲
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">
                    <EditableContent storageKey="activity4:cards-intro" initialValue="派發包含10種策略卡，要求小組按「急迫性」與「可行度」二維度分級" as="span" />
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['導師制改革', '數位化教案平台', '跨科知識論壇', '教學觀摩制度', '知識庫建置', '新進教師培訓', '退休教師顧問制', '校際知識交流', '知識管理委員會', '獎勵知識分享機制'].map((strategy, i) => (
                      <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-orange-300 text-orange-800 bg-orange-50">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" /> 行動計畫草案
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="activity4:gantt" initialValue="使用Gantt圖模板規劃知識管理推行步驟（含資源分配欄位）" as="span" />
                  </p>
                </CardSection>
              </div>
              {getConceptCheckForSection('activity4') && user && user.userId > 0 && (
                <div className="mt-4">
                  <ConceptCheck
                    checkId={getConceptCheckForSection('activity4')!.id}
                    title={getConceptCheckForSection('activity4')!.title}
                    prompt={getConceptCheckForSection('activity4')!.prompt}
                    checkType={getConceptCheckForSection('activity4')!.checkType as 'thumbs' | 'scale' | 'text'}
                    userId={user.userId}
                    userRole={user.role}
                  />
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="activity4" />
              </div>
            </LessonSection>

            {/* ===================== 總結與延伸 ===================== */}
            <LessonSection id="summary" title="三、總結與延伸（25分鐘）" badge="25分鐘">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" /> 後測測驗
                  </h3>
                  <div className="text-sm text-slate-700 space-y-2">
                    <p><strong>測驗名稱：</strong>知識管理與學校發展 — 學習成效後測</p>
                    <p><strong>題型：</strong>與前測一致，比較學習進步曲線（10分鐘）</p>
                  </div>
                  {postQuiz && user && user.userId > 0 && (
                    <div className="mt-4">
                      <QuizComponent
                        quizId={postQuiz.id}
                        title={postQuiz.title}
                        questions={postQuiz.questions}
                        userId={user.userId}
                      />
                    </div>
                  )}
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" /> 反思討論
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="summary:reflection" initialValue="使用「六字說說」：「我學到...」每人一句，由工作助理紀錄關鍵語句（5分鐘）" as="span" />
                  </p>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" /> 預告與銜接
                  </h3>
                  <p className="text-sm text-slate-700">
                    <EditableContent storageKey="summary:preview" initialValue="下堂課主題「跨校知識聯盟的建立與維護」，預告需要準備的案例報告（10分鐘）" as="span" />
                  </p>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="summary" />
              </div>
            </LessonSection>

            {/* ===================== 四、評估方式 ===================== */}
            <LessonSection id="assessment" title="四、評估方式" badge="評估">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3">形成性評估</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:formative1" initialValue="前後測比較分析" as="span" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:formative2" initialValue="小組互動表現觀察指標表（含：批判思考、協作能力、概念應用）" as="span" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:formative3" initialValue="即時問卷數據分析（Mentimeter關鍵指標）" as="span" />
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">&#8226;</span>
                      <EditableContent storageKey="assessment:formative4" initialValue="課後兩分鐘紙條（學生自評學習達成度）" as="span" />
                    </li>
                  </ul>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-3">總結性評估</h3>
                  <p className="text-sm text-slate-700 mb-3">
                    <strong>期末專題報告：</strong>需完成「校園知識管理診斷與改善計畫書」
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="text-left py-2 px-3 font-medium text-slate-600">標準</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-600">準則</th>
                          <th className="text-center py-2 px-3 font-medium text-slate-600">配分</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium text-slate-800">分析完整性</td>
                          <td className="py-2 px-3 text-slate-600">包含審計、問題診斷、策略三層級</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">30%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium text-slate-800">創新性</td>
                          <td className="py-2 px-3 text-slate-600">提出三項創新實踐方法</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">25%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium text-slate-800">可行性</td>
                          <td className="py-2 px-3 text-slate-600">存在明確落後時程與資源配置</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">20%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium text-slate-800">理論連結</td>
                          <td className="py-2 px-3 text-slate-600">恰當應用至少兩種KM理論</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">15%</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-800">排版與表達</td>
                          <td className="py-2 px-3 text-slate-600">結構清晰、圖文並茂</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">10%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="assessment" />
              </div>
            </LessonSection>

            {/* ===================== 五、建構主義對應表 ===================== */}
            <LessonSection id="alignment" title="五、建構主義對應表" badge="對應">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-2 px-3 font-medium text-slate-600">學習成果</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-600">教學活動</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-600">評估方法</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3 text-slate-700">分析資訊科技對KM的影響</td>
                      <td className="py-2 px-3 text-slate-600">虛擬案例診斷、動畫解構理論</td>
                      <td className="py-2 px-3 text-slate-600">前測後測、專題報告理論連結</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 text-slate-700">評估KM理論的教育適用性</td>
                      <td className="py-2 px-3 text-slate-600">KWL表格分析、策略卡片遊戲</td>
                      <td className="py-2 px-3 text-slate-600">觀察指標表、期末專題報告</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 text-slate-700">設計知識審計行動計劃</td>
                      <td className="py-2 px-3 text-slate-600">情境模擬、模組化工作表實作</td>
                      <td className="py-2 px-3 text-slate-600">工作坊成果、Gantt圖規劃</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700">應用知識共享機制工具</td>
                      <td className="py-2 px-3 text-slate-600">數位平台設計、虛擬白板協作</td>
                      <td className="py-2 px-3 text-slate-600">平台設計演示、策略可行性評估</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="alignment" />
              </div>
            </LessonSection>

            {/* ===================== 六、所需資源與科技工具 ===================== */}
            <LessonSection id="resources" title="六、所需資源與科技工具" badge="資源">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" /> 數位平台
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>Padlet（意見互動）</li>
                    <li>Mentimeter（即時測驗）</li>
                  </ul>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" /> 實體教具
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>KM理論比較矩陣紙本</li>
                    <li>策略卡片實體套組</li>
                  </ul>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" /> 技術支援
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>Jamboard虛擬白板（每組1個）</li>
                    <li>ARCU評估電子評分表</li>
                  </ul>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" /> 參考文獻
                  </h3>
                  <p className="text-sm text-slate-700">
                    Nonaka & Takeuchi《知識創造公司》中譯本電子書
                  </p>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="resources" />
              </div>
            </LessonSection>

            {/* ===================== 七、差異化與包容策略 ===================== */}
            <LessonSection id="differentiation" title="七、差異化與包容策略" badge="包容">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" /> 學習風格支持
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li><strong>聽覺學習</strong> — 提供podcast複習資源</li>
                    <li><strong>視覺學習</strong> — 大量資訊視覺化圖表</li>
                    <li><strong>動覺學習</strong> — 實作工作表</li>
                  </ul>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-teal-600" /> 延伸活動
                  </h3>
                  <p className="text-sm text-slate-700">
                    學習速度較快三組可挑戰「跨校知識聯盟模組擴充設計」
                  </p>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-600" /> 融合措施
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>視障學生提供點字版工作表</li>
                    <li>聽障同學校友字幕同步系統</li>
                  </ul>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="differentiation" />
              </div>
            </LessonSection>

            {/* ===================== 八、教學反思與改進 ===================== */}
            <LessonSection id="reflection" title="八、教學反思與改進" badge="反思">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-rose-600" /> 成效指標
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>80%達成學習成果</li>
                    <li>專題報告平均分達優等</li>
                    <li>問卷反饋滿意度達4.5/5</li>
                  </ul>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-rose-600" /> 反饋機制
                  </h3>
                  <p className="text-sm text-slate-700">
                    課後發送Google Forms問卷（含開放意見欄位）
                  </p>
                </CardSection>
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-rose-600" /> 改進方向
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>增加虛實整合練習（如AR校園知識地圖設計）</li>
                    <li>增加與企業KM案例比較</li>
                  </ul>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="reflection" />
              </div>
            </LessonSection>

            {/* ===================== 九、補充教材準備 ===================== */}
            <LessonSection id="supplementary" title="九、補充教材準備" badge="補充">
              <div className="space-y-4">
                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-600" /> 動態示意圖
                  </h3>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 text-sm mb-2">Nonaka知識轉化四模式流動過程</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
                      <div className="bg-white rounded p-2 border border-purple-200">
                        <strong>社會化</strong><br />隱性 → 隱性
                      </div>
                      <div className="bg-white rounded p-2 border border-purple-200">
                        <strong>外化</strong><br />隱性 → 顯性
                      </div>
                      <div className="bg-white rounded p-2 border border-purple-200">
                        <strong>組合</strong><br />顯性 → 顯性
                      </div>
                      <div className="bg-white rounded p-2 border border-purple-200">
                        <strong>內化</strong><br />顯性 → 隱性
                      </div>
                    </div>
                  </div>
                </CardSection>

                <CardSection>
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" /> 數位卡牌
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">
                    KM理論關鍵詞與應用場景匹配練習 — 每組10張卡牌
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['SECI模型', '知識水池', '社群實踐', '知識螺旋', '隱性知識', '顯性知識', '知識審計', 'ARCU模型', '導師制度', '知識地圖'].map((term, i) => (
                      <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-purple-300 text-purple-800 bg-purple-50">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardSection>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionCompleteButton sectionKey="supplementary" />
              </div>
            </LessonSection>

            {/* ===================== Discussion Link ===================== */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">討論區</h3>
                  <p className="text-sm text-muted-foreground mt-1">參與課程相關的討論和交流</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{discussions.length} 個主題</Badge>
                    <Badge variant="outline">{discussions.reduce((sum, d) => sum + d.postCount, 0)} 則貼文</Badge>
                  </div>
                </div>
                <Link href="/discussion">
                  <Button className="gap-2">
                    <MessageSquare className="h-4 w-4" /> 前往討論區
                  </Button>
                </Link>
              </div>
            </div>

            {/* ===================== Quick Links ===================== */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/slides" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">教學投影片</p>
                      <p className="text-xs text-muted-foreground">10頁摘要簡報</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/quizzes" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">線上測驗</p>
                      <p className="text-xs text-muted-foreground">前測 / 後測</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              {user?.role === 'TEACHER' && (
                <Link href="/dashboard" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-4 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">教師儀表板</p>
                        <p className="text-xs text-muted-foreground">學習進度追蹤</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
