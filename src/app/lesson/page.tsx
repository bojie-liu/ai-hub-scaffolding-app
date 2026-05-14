import { Suspense } from 'react';
import { LessonClient } from './LessonClient';
import { getEditableContent } from '@/lib/actions/editable-content';
import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getSlides } from '@/lib/actions/slides';

async function getLessonData() {
  const [
    ilosContent,
    preClassContent,
    introContent,
    activity1Content,
    activity2Content,
    activity3Content,
    activity4Content,
    synthesisContent,
    assessmentContent,
    alignmentContent,
    resourcesContent,
    differentiationContent,
    reflectionContent,
    externalLinksContent,
    preTestQuiz,
    postTestQuiz,
    conceptChecks,
    slides,
  ] = await Promise.all([
    getEditableContent('section:ilos'),
    getEditableContent('section:pre-class'),
    getEditableContent('section:introduction'),
    getEditableContent('section:activity-1'),
    getEditableContent('section:activity-2'),
    getEditableContent('section:activity-3'),
    getEditableContent('section:activity-4'),
    getEditableContent('section:synthesis'),
    getEditableContent('section:assessment'),
    getEditableContent('section:alignment'),
    getEditableContent('section:resources'),
    getEditableContent('section:differentiation'),
    getEditableContent('section:reflection'),
    getEditableContent('section:external-links'),
    getQuiz(1).catch(() => ({ success: false, data: null })),
    getQuiz(2).catch(() => ({ success: false, data: null })),
    getConceptChecks().catch(() => ({ success: false, data: [] })),
    getSlides().catch(() => ({ success: false, data: [] })),
  ]);

  return {
    sections: {
      ilos: ilosContent,
      preClass: preClassContent,
      introduction: introContent,
      activity1: activity1Content,
      activity2: activity2Content,
      activity3: activity3Content,
      activity4: activity4Content,
      synthesis: synthesisContent,
      assessment: assessmentContent,
      alignment: alignmentContent,
      resources: resourcesContent,
      differentiation: differentiationContent,
      reflection: reflectionContent,
      externalLinks: externalLinksContent,
    },
    preTestQuiz: preTestQuiz.success ? preTestQuiz.data : null,
    postTestQuiz: postTestQuiz.success ? postTestQuiz.data : null,
    conceptChecks: (conceptChecks as any).success ? (conceptChecks as any).data ?? [] : [],
    slides: (slides as any).success ? (slides as any).data ?? [] : [],
  };
}

export default async function LessonPage() {
  const data = await getLessonData();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <LessonClient data={data} />
    </Suspense>
  );
}
