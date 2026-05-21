'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { markSectionComplete, getStudentProgress } from '@/lib/actions/progress';
import LessonSection from '@/components/lesson/content/LessonSection';
import EditableContent from '@/components/lesson/content/EditableContent';
import CardSection from '@/components/lesson/content/CardSection';
import LessonSideMenu from '@/components/lesson/LessonSideMenu';
import Quiz from '@/components/lesson/interactive/Quiz';
import Discussion from '@/components/lesson/interactive/Discussion';
import ConceptCheck from '@/components/lesson/interactive/ConceptCheck';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: string;
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
  questions: QuizQuestion[];
}

interface DiscussionData {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  isPinned: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
}

interface ConceptCheckData {
  id: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType: string;
  sectionKey: string | null;
  createdAt: Date | null;
}

interface LessonPageClientProps {
  quizData: QuizData | null;
  discussionsData: DiscussionData[];
  conceptChecksData: ConceptCheckData[];
}

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'ilos', label: '學習目標' },
  { id: 'preclass', label: '課前準備' },
  { id: 'development', label: '教學活動設計' },
  { id: 'assessment', label: '評估方式' },
  { id: 'alignment', label: '對齊矩陣' },
  { id: 'resources', label: '資源需求' },
  { id: 'differentiation', label: '差異化策略' },
  { id: 'quality', label: '品質管控' },
  { id: 'materials', label: '非現有材料設計' },
  { id: 'discussion', label: '討論區' },
];

const SECTION_KEYS = SECTIONS.map((s) => s.id);

// ---------------------------------------------------------------------------
// Section Complete Button
// ---------------------------------------------------------------------------

function SectionCompleteButton({ sectionKey }: { sectionKey: string }) {
  const { user } = useUser();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.role === 'GUEST') return null;

  async function handleClick() {
    if (completed || loading || !user) return;
    setLoading(true);
    const result = await markSectionComplete(user.userId, sectionKey);
    if (result.success) {
      setCompleted(true);
    }
    setLoading(false);
  }

  if (completed) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        <span>已完成</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={handleClick}
      disabled={loading}
    >
      <Circle className="h-4 w-4" />
      {loading ? '處理中...' : '標記完成'}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function LessonPageClient({
  quizData,
  discussionsData,
  conceptChecksData,
}: LessonPageClientProps) {
  const { user } = useUser();

  const isLoggedIn = !!user && user.role !== 'GUEST';
  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';

  // Find concept checks for specific sections
  const seciCheck = conceptChecksData.find(
    (c) => c.title?.includes('SECI') || c.storageKey?.includes('seci')
  );
  const auditCheck = conceptChecksData.find(
    (c) => c.title?.includes('審計') || c.storageKey?.includes('audit')
  );
  const reflectionCheck = conceptChecksData.find(
    (c) => c.title?.includes('反思') || c.storageKey?.includes('reflection')
  );

  return (
    <div className="flex gap-8">
      {/* Side menu — desktop only */}
      <LessonSideMenu sections={SECTIONS} />

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8 pb-16">
        {/* ----------------------------------------------------------------- */}
        {/* 學習目標 (ILOs) */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="ilos" title="學習目標" badge="ILOs">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="ilos" />
          </div>
          <ol className="space-y-3 list-decimal list-inside">
            <li>
              <EditableContent
                storageKey="lesson:ilo:1"
                initialValue="分析資訊科技發展對知識管理的挑戰與機遇 (分析)"
                as="span"
                className="text-slate-700"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:ilo:2"
                initialValue="設計適用於學校知識共享機制的初步方案 (創造)"
                as="span"
                className="text-slate-700"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:ilo:3"
                initialValue="評估知識資本管理對學校持續發展的影響 (評價)"
                as="span"
                className="text-slate-700"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:ilo:4"
                initialValue="應用知識審計工具進行校本案例分析 (應用)"
                as="span"
                className="text-slate-700"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:ilo:5"
                initialValue="探討知識轉移策略對教師專業發展的作用 (討論)"
                as="span"
                className="text-slate-700"
              />
            </li>
          </ol>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 課前準備 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="preclass" title="課前準備" badge="預習">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="preclass" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">必讀資料</h4>
              <ul className="space-y-1 list-disc list-inside text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:preclass:reading:1"
                    initialValue="Wikipedia知識管理條目中文版"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:preclass:reading:2"
                    initialValue="教育局《校本知識管理指南》(10頁摘錄)"
                    as="span"
                  />
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">診斷測驗</h4>
              <EditableContent
                storageKey="lesson:preclass:quiz-desc"
                initialValue="線上問卷：知識管理基礎知識與前測 8題"
                as="p"
                className="text-slate-700"
              />
              {isLoggedIn && quizData ? (
                <div className="mt-4">
                  <Quiz
                    quizId={quizData.quiz.id}
                    title={quizData.quiz.title}
                    questions={quizData.questions}
                    userId={userId}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  請登入後完成診斷測驗
                </p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">引導問題</h4>
              <ul className="space-y-1 list-disc list-inside text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:preclass:question:1"
                    initialValue="請描述您所在學校目前的知識分享流程"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:preclass:question:2"
                    initialValue="列出現有資訊工具對知識管理的三大限制"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:preclass:question:3"
                    initialValue="舉例說明未能有效傳承的校本實務經驗"
                    as="span"
                  />
                </li>
              </ul>
            </div>
          </div>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 教學活動設計 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="development" title="教學活動設計" badge="核心">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="development" />
          </div>
          <div className="space-y-6">
            {/* 開場 */}
            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-3">開場 (20分鐘)</h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:dev:opening:1"
                    initialValue="熱身活動：[互動投票: 哪種知識流失最嚴重?] 通過Mentimeter即時彙整"
                    as="span"
                    multiline
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:opening:2"
                    initialValue="共識建立：展示PISA 2025教育科技報告摘要"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:opening:3"
                    initialValue="案例導入：某中學教師離職造成校本教案斷層事件"
                    as="span"
                  />
                </li>
              </ul>
            </CardSection>

            {/* 區塊一：概念建構 */}
            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-3">
                區塊一：概念建構 (45分鐘)
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block1:1"
                    initialValue="動態講授結合[知識流動示意動畫]分組解構"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block1:2"
                    initialValue="概念拼圖：知識轉移SECI模型分組配對活動"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block1:3"
                    initialValue="即時問答：Padlet同步提交知識資本迷思概念"
                    as="span"
                  />
                </li>
              </ul>

              {/* Concept check for SECI */}
              {isLoggedIn && seciCheck ? (
                <div className="mt-4">
                  <ConceptCheck
                    checkId={seciCheck.id}
                    title={seciCheck.title}
                    prompt={seciCheck.prompt}
                    checkType={seciCheck.checkType}
                    userId={userId}
                    userRole={userRole}
                  />
                </div>
              ) : null}
            </CardSection>

            {/* 區塊二：案例研析 */}
            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-3">
                區塊二：案例研析 (60分鐘)
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block2:1"
                    initialValue="情境工作坊：小組輪轉分析4個校園知識斷裂案例 / 使用[知識審計模板工具]診斷問題 / 制定知識保存優先級矩陣"
                    as="span"
                    multiline
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block2:2"
                    initialValue="角色扮演：校長VS教師的知識共享辯論會"
                    as="span"
                  />
                </li>
              </ul>

              {/* Concept check for audit confidence */}
              {isLoggedIn && auditCheck ? (
                <div className="mt-4">
                  <ConceptCheck
                    checkId={auditCheck.id}
                    title={auditCheck.title}
                    prompt={auditCheck.prompt}
                    checkType={auditCheck.checkType}
                    userId={userId}
                    userRole={userRole}
                  />
                </div>
              ) : null}
            </CardSection>

            {/* 區塊三：方案設計 */}
            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-3">
                區塊三：方案設計 (45分鐘)
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block3:1"
                    initialValue="設計思維：運用[知識管理策略卡牌]建構解決方案"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block3:2"
                    initialValue="原型製作：以Canva模擬校本知識平台介面設計"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:block3:3"
                    initialValue="閃電演講：每組3分鐘精華版方案展示"
                    as="span"
                  />
                </li>
              </ul>
            </CardSection>

            {/* 總結 */}
            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-3">總結 (10分鐘)</h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:dev:closing:1"
                    initialValue="概念整合：KWL表格填寫「學到的新知識」"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:closing:2"
                    initialValue="評量回饋：[Google Forms即時反饋表單]測量進步"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:dev:closing:3"
                    initialValue="銜接預告：預告下周學校知識社群建構主題"
                    as="span"
                  />
                </li>
              </ul>
            </CardSection>
          </div>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 評估方式 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="assessment" title="評估方式" badge="評核">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="assessment" />
          </div>
          <div className="space-y-6">
            {/* 形成性評估 */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">形成性評估</h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:assessment:formative:1"
                    initialValue="課堂參與度指標 (討論貢獻、問答正確率)"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:assessment:formative:2"
                    initialValue="小組成果互評表 (5項評核標準)"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:assessment:formative:3"
                    initialValue="即時反饋問卷數據分析"
                    as="span"
                  />
                </li>
              </ul>
            </div>

            {/* 總結性評估 */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">總結性評估</h4>
              <EditableContent
                storageKey="lesson:assessment:summative:desc"
                initialValue="小組實作報告，標準參照評量規準："
                as="p"
                className="text-slate-700 mb-3"
              />

              {/* Rubric table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                        層面
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                        4星級
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                        3星級
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                        2星級
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                        1星級
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-800">
                        問題診斷深度
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        總結3+根本原因
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        2個主因
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        單一原因
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        表象描述
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-800">
                        策略可行性
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        含5S管理法與資訊工具整合
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        2種方法
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        1種方法
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        模糊建議
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-800">
                        創新性
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        跨領域知識遷移
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        1種遷移
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        複製案例
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        缺乏創意
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Concept check for reflection */}
            {isLoggedIn && reflectionCheck ? (
              <div className="mt-4">
                <ConceptCheck
                  checkId={reflectionCheck.id}
                  title={reflectionCheck.title}
                  prompt={reflectionCheck.prompt}
                  checkType={reflectionCheck.checkType}
                  userId={userId}
                  userRole={userRole}
                />
              </div>
            ) : null}
          </div>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 對齊矩陣 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="alignment" title="對齊矩陣" badge="ILO對齊">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="alignment" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                    學習成果
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                    教學活動
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800">
                    評估方法
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    分析挑戰與機遇
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    區塊一動態講授+案例研析
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    課堂問答分析
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    設計知識共享方案
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    策略卡牌設計+原型製作
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    小組報告評分
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    評估管理影響
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    知識審計實作
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    案例分析報告
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    應用審計工具
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    模擬平台操作
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-700">
                    實作任務完成度
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 資源需求 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="resources" title="資源需求" badge="資源">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="resources" />
          </div>
          <ul className="space-y-2 text-slate-700">
            <li>
              <EditableContent
                storageKey="lesson:resources:1"
                initialValue="教學平台：Moodle課前資源包"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:resources:2"
                initialValue="科技工具：Mentimeter即時投票、Padlet虛擬白板"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:resources:3"
                initialValue="物理材料：知識管理策略卡牌(列印4套)"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:resources:4"
                initialValue="支援影片：SECI模型動畫(5分鐘精華版)"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:resources:5"
                initialValue="書目資源：《學校知識管理實務》第3章重點摘錄"
                as="span"
              />
            </li>
          </ul>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 差異化策略 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="differentiation" title="差異化策略" badge="差異化">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="differentiation" />
          </div>
          <ul className="space-y-2 text-slate-700">
            <li>
              <EditableContent
                storageKey="lesson:diff:1"
                initialValue="多元表達：提供簡報與文字雙版本教材"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:diff:2"
                initialValue="深度支持：為資深教師設計延伸閱讀《知識拓撲理論》"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:diff:3"
                initialValue="適應介面：簡報同步上傳含英漢術語對照表"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:diff:4"
                initialValue="參與保障：小組配置特殊教育需求學生協助員"
                as="span"
              />
            </li>
          </ul>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 品質管控 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="quality" title="品質管控" badge="品質">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="quality" />
          </div>
          <ul className="space-y-2 text-slate-700">
            <li>
              <EditableContent
                storageKey="lesson:quality:1"
                initialValue="關鍵指標：課前-課後測試進步幅度 >60%"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:quality:2"
                initialValue="反饋機制：課後24小時內提交反思日記"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:quality:3"
                initialValue="改良依據：分析Top 3未掌握概念調整下週課程"
                as="span"
              />
            </li>
            <li>
              <EditableContent
                storageKey="lesson:quality:4"
                initialValue="效能追蹤：3個月後追蹤策略落實情況"
                as="span"
              />
            </li>
          </ul>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 非現有材料設計 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="materials" title="非現有材料設計" badge="材料">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="materials" />
          </div>
          <div className="space-y-6">
            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-2">
                1. 知識審計互動模板
              </h4>
              <ul className="space-y-1 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:materials:1:components"
                    initialValue="組成要素：知識類型矩陣、存取度量尺、流失風險指數"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:materials:1:usage"
                    initialValue="使用方式：拖放式介面，自動生成風險熱點分析"
                    as="span"
                  />
                </li>
              </ul>
            </CardSection>

            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-2">
                2. 知識管理策略卡牌套件
              </h4>
              <ul className="space-y-1 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:materials:2:contents"
                    initialValue="包含：48張雙面卡(24種策略+24個應用情境)"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:materials:2:features"
                    initialValue="特點：QR碼連結成功案例影片"
                    as="span"
                  />
                </li>
              </ul>
            </CardSection>

            <CardSection>
              <h4 className="font-semibold text-slate-800 mb-2">
                3. SECI模型動態解構
              </h4>
              <ul className="space-y-1 text-slate-700">
                <li>
                  <EditableContent
                    storageKey="lesson:materials:3:design"
                    initialValue="設計形式：分步驟互動式Illustration"
                    as="span"
                  />
                </li>
                <li>
                  <EditableContent
                    storageKey="lesson:materials:3:function"
                    initialValue="功能：各環節可點選顯示校本實例"
                    as="span"
                  />
                </li>
              </ul>
            </CardSection>
          </div>
        </LessonSection>

        {/* ----------------------------------------------------------------- */}
        {/* 討論區 */}
        {/* ----------------------------------------------------------------- */}
        <LessonSection id="discussion" title="討論區" badge="互動">
          <div className="flex justify-end mb-3">
            <SectionCompleteButton sectionKey="discussion" />
          </div>
          <div className="space-y-8">
            {isLoggedIn && discussionsData.length > 0 ? (
              discussionsData.map((disc) => (
                <Discussion
                  key={disc.id}
                  discussionId={disc.id}
                  title={disc.title}
                  description={disc.description}
                  posts={[]}
                  userId={userId}
                  userRole={userRole}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {isLoggedIn
                  ? '目前沒有討論主題'
                  : '請登入後參與討論'}
              </p>
            )}
          </div>
        </LessonSection>
      </div>
    </div>
  );
}
