'use client';

import EditableContent from '@/components/lesson/content/EditableContent';

interface MatrixRow {
  outcome: string;
  activity: string;
  assessment: string;
}

const matrixData: MatrixRow[] = [
  {
    outcome: 'Analyze IT\'s impact on KM',
    activity: 'Interactive lecture + think-pair-share',
    assessment: 'Pre/post-test',
  },
  {
    outcome: 'Evaluate KM strategies',
    activity: 'Case study analysis in groups',
    assessment: 'Discussion postings + quiz responses',
  },
  {
    outcome: 'Create KM strategy',
    activity: 'Peer teaching strategy creation',
    assessment: 'Case study assignment rubric',
  },
  {
    outcome: 'Apply knowledge audit techniques',
    activity: 'Audit simulation + flashcards',
    assessment: 'Audit deliverable + summative quiz',
  },
];

export default function AlignmentMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="text-left py-3 px-4 font-semibold">Learning Outcome</th>
            <th className="text-left py-3 px-4 font-semibold">Teaching Activity</th>
            <th className="text-left py-3 px-4 font-semibold">Assessment Method</th>
          </tr>
        </thead>
        <tbody>
          {matrixData.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-3 px-4 border-b border-slate-100">
                <EditableContent
                  storageKey={`alignment:outcome:${i}`}
                  initialValue={row.outcome}
                  as="span"
                  className="font-medium text-slate-800"
                />
              </td>
              <td className="py-3 px-4 border-b border-slate-100">
                <EditableContent
                  storageKey={`alignment:activity:${i}`}
                  initialValue={row.activity}
                  as="span"
                  className="text-slate-600"
                />
              </td>
              <td className="py-3 px-4 border-b border-slate-100">
                <EditableContent
                  storageKey={`alignment:assessment:${i}`}
                  initialValue={row.assessment}
                  as="span"
                  className="text-slate-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
