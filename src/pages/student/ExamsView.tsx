import React, { useState } from 'react';
import { mockExamResults } from '../../data/mockData';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Download,
  QrCode,
  X
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const [showAdmitCard, setShowAdmitCard] = useState(false);

  const totalObtained = mockExamResults.reduce((acc, curr) => acc + curr.marks, 0);
  const totalMax = mockExamResults.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const overallPercentage = ((totalObtained / totalMax) * 100).toFixed(1);

  const handleDownloadMarksheet = () => {
    playChime('success');
    addNotification({
      title: 'Marksheet Download Complete',
      message: 'Official Term Assessment PDF marksheet has been generated.',
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
            <span>Examinations &amp; Academic Report Card</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Mid-Term Assessment &amp; GPA Evaluation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Academic Session 2026-2027 • Official Standard 5.0 GPA Scale
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAdmitCard(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <QrCode size={14} />
            <span>Digital Admit Card</span>
          </button>
          <button
            onClick={handleDownloadMarksheet}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export Marksheet</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-extrabold text-xl font-mono">
            GPA 5.0
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Cumulative GPA</div>
            <div className="text-base font-extrabold text-white">Grade A+ (Exemplary)</div>
            <div className="text-[11px] text-purple-300 font-semibold font-mono">
              Total Score: {totalObtained}/{totalMax} ({overallPercentage}%)
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl font-mono">
            #03
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Class Rank</div>
            <div className="text-base font-extrabold text-white">3rd Place (Top 5%)</div>
            <div className="text-[11px] text-emerald-400 font-semibold">180 Registered candidates</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-xl font-mono">
            98
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Highest Subject Mark</div>
            <div className="text-base font-extrabold text-white">Advanced Mathematics</div>
            <div className="text-[11px] text-amber-400 font-semibold font-mono">Class Mean: 71.2</div>
          </div>
        </div>
      </div>

      {/* Result Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-4">Detailed Subject-wise Marksheet</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-3">Subject</th>
                <th className="pb-3 text-center">Max Marks</th>
                <th className="pb-3 text-center">Marks Obtained</th>
                <th className="pb-3 text-center">Letter Grade</th>
                <th className="pb-3 text-center">GPA</th>
                <th className="pb-3 text-center">Class Top</th>
                <th className="pb-3 text-center">Class Avg</th>
                <th className="pb-3 text-right">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockExamResults.map(res => (
                <tr key={res.id} className="hover:bg-slate-850/60 transition">
                  <td className="py-3.5 font-bold text-white">
                    {res.subject}
                  </td>
                  <td className="py-3.5 text-center text-slate-300 font-mono">{res.totalMarks}</td>
                  <td className="py-3.5 text-center font-extrabold text-indigo-400 font-mono text-sm">{res.marks}</td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold font-mono">
                      {res.grade}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-bold text-emerald-400 font-mono">{res.gpa.toFixed(1)}</td>
                  <td className="py-3.5 text-center text-slate-400 font-mono">{res.highestMarks}</td>
                  <td className="py-3.5 text-center text-slate-400 font-mono">{res.classAverage}</td>
                  <td className="py-3.5 text-right font-bold text-emerald-400 font-mono">
                    +{((res.marks - res.classAverage)).toFixed(1)} above mean
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Card Modal */}
      {showAdmitCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Digital Admit Card</h3>
              <button
                onClick={() => setShowAdmitCard(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 text-center space-y-4">
              <div className="text-sm font-extrabold text-white">
                Oakridge International Smart Academy
              </div>
              <div className="text-xs text-indigo-300 font-medium">
                Official Pre-Test Examination 2026 Verification Pass
              </div>

              {/* Avatar + QR simulation */}
              <div className="flex items-center justify-center gap-6 py-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-400"
                />
                <div className="w-20 h-20 bg-white p-1 rounded-xl flex items-center justify-center shadow">
                  <div className="w-full h-full bg-slate-900 rounded p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 bg-white"></div>
                      <div className="w-4 h-4 bg-white"></div>
                    </div>
                    <div className="text-[7px] text-indigo-400 text-center font-mono font-bold">VERIFIED</div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 bg-white"></div>
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Candidate Name:</span>
                  <span className="font-bold text-white">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll Number:</span>
                  <span className="font-bold text-indigo-400 font-mono">{currentUser.roll}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grade &amp; Section:</span>
                  <span className="font-bold text-white">{currentUser.class} ({currentUser.section})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Exam Hall:</span>
                  <span className="font-bold text-white">Hall-01 (Main Academic Wing)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAdmitCard(false);
                  playChime('success');
                  addNotification({
                    title: 'Admit Card Saved',
                    message: 'Digital Admit Card with QR token has been saved to device.',
                    type: 'success'
                  });
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Download size={14} />
                <span>Print / Save Admit Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
