import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  GraduationCap,
  Save,
  Send,
  Download,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface GradeRow {
  roll: string;
  name: string;
  theory: number;
  practical: number;
  mcq: number;
}

const initialGrades: GradeRow[] = [
  { roll: '01', name: 'Rafiul Islam', theory: 48, practical: 24, mcq: 23 },
  { roll: '02', name: 'Sadia Jahan', theory: 42, practical: 22, mcq: 20 },
  { roll: '03', name: 'Zubair Hossain', theory: 38, practical: 20, mcq: 18 },
  { roll: '04', name: 'Samiha Islam', theory: 47, practical: 25, mcq: 24 },
  { roll: '07', name: 'Tanvir Ahmed', theory: 49, practical: 25, mcq: 24 }
];

export const TeacherGradebook: React.FC = () => {
  const [grades, setGrades] = useState<GradeRow[]>(initialGrades);
  const { playChime, addNotification } = useNotifications();

  const handleMarkChange = (roll: string, field: 'theory' | 'practical' | 'mcq', val: number) => {
    setGrades(prev =>
      prev.map(g => (g.roll === roll ? { ...g, [field]: val } : g))
    );
  };

  const calculateTotal = (g: GradeRow) => g.theory + g.practical + g.mcq;

  const calculateGPA = (total: number) => {
    if (total >= 80) return { grade: 'A+', gpa: 5.0 };
    if (total >= 70) return { grade: 'A', gpa: 4.0 };
    if (total >= 60) return { grade: 'A-', gpa: 3.5 };
    if (total >= 50) return { grade: 'B', gpa: 3.0 };
    return { grade: 'C', gpa: 2.0 };
  };

  const handlePublishResults = () => {
    playChime('levelUp');
    addNotification({
      title: 'ফলাফল প্রকাশিত হয়েছে! 📢',
      message: 'পদার্থবিজ্ঞান অর্ধবার্ষিক পরীক্ষার ফলাফল সফলভাবে পাবলিশ হয়েছে। শিক্ষার্থী ও অভিভাবকদের পোর্টালে দৃশ্যমান।',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <GraduationCap size={14} />
            <span>ডিজিটাল গ্রেডবুক ও ফলাফল প্রস্তুতকরণ (Gradebook)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            দশম শ্রেণি (১০-এ) পদার্থবিজ্ঞান মূল্যায়ন
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            সৃজনশীল (৫০) + ব্যবহারিক (২৫) + বহুনির্বাচনী (২৫) = মোট ১০০ মার্কস
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePublishResults}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Send size={14} />
            <span>ফলাফল প্রকাশ করুন</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Roster Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-3">রোল</th>
                <th className="pb-3">শিক্ষার্থীর নাম</th>
                <th className="pb-3 text-center">সৃজনশীল (৫০)</th>
                <th className="pb-3 text-center">ব্যবহারিক (২৫)</th>
                <th className="pb-3 text-center">MCQ (২৫)</th>
                <th className="pb-3 text-center">মোট নম্বর (১০০)</th>
                <th className="pb-3 text-center">লেটার গ্রেড</th>
                <th className="pb-3 text-center">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {grades.map(g => {
                const total = calculateTotal(g);
                const { grade, gpa } = calculateGPA(total);

                return (
                  <tr key={g.roll} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 font-mono font-bold text-indigo-400">{g.roll}</td>
                    <td className="py-3 font-bold text-white">{g.name}</td>
                    <td className="py-3 text-center">
                      <input
                        type="number"
                        value={g.theory}
                        onChange={e => handleMarkChange(g.roll, 'theory', Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="number"
                        value={g.practical}
                        onChange={e => handleMarkChange(g.roll, 'practical', Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="number"
                        value={g.mcq}
                        onChange={e => handleMarkChange(g.roll, 'mcq', Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 text-center font-extrabold text-white text-sm font-mono">
                      {total}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold font-mono">
                        {grade}
                      </span>
                    </td>
                    <td className="py-3 text-center font-extrabold text-emerald-400 font-mono">
                      {gpa.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
