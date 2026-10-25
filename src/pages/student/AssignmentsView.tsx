import React, { useState } from 'react';
import { mockAssignments } from '../../data/mockData';
import { Assignment } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useGamification } from '../../context/GamificationContext';
import {
  FileText,
  UploadCloud,
  Send,
  X
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const { playChime, addNotification } = useNotifications();
  const { addXP } = useGamification();

  const handleOpenSubmit = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setSubmissionFileName(`${asg.subject.toLowerCase()}_solution_tanvir.pdf`);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setAssignments(prev =>
      prev.map(a =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              status: 'SUBMITTED',
              submittedAt: 'Just now',
              submissionFile: submissionFileName
            }
          : a
      )
    );

    setSelectedAssignment(null);
    playChime('success');
    addXP(40, 'Homework submitted on time');
    addNotification({
      title: 'Assignment Submitted Successfully! 🎉',
      message: `${selectedAssignment.title} submitted to instructor for evaluation. +40 XP earned!`,
      type: 'success'
    });
  };

  const filtered = assignments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <FileText size={14} />
            <span>Assignments &amp; Homework Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            My Coursework &amp; Submissions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit coursework online • Automated plagiarism screening • Bonus XP on early delivery
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-2xl border border-slate-700">
          {['ALL', 'PENDING', 'SUBMITTED', 'GRADED'].map(st => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'PENDING'
                ? 'Pending'
                : st === 'SUBMITTED'
                ? 'Submitted'
                : 'Graded'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(asg => (
          <div
            key={asg.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 text-[11px] font-bold border border-slate-700">
                  {asg.subject}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    asg.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : asg.status === 'GRADED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {asg.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1.5">{asg.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                {asg.description}
              </p>

              <div className="text-xs text-slate-400 space-y-1 mb-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Instructor:</span>
                  <span className="font-semibold text-slate-300">{asg.teacherName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Points:</span>
                  <span className="font-semibold text-slate-300">{asg.totalMarks} Marks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Due Date:</span>
                  <span className="font-semibold text-amber-400 font-mono">{asg.dueDate}</span>
                </div>
              </div>

              {/* Feedback if graded */}
              {asg.feedback && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl mb-4 text-xs">
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>Score: {asg.marksObtained}/{asg.totalMarks} ({asg.grade})</span>
                    <span>✓ Evaluated</span>
                  </div>
                  <p className="text-emerald-200/90 text-[11px] mt-1">{asg.feedback}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div>
              {asg.status === 'PENDING' && (
                <button
                  onClick={() => handleOpenSubmit(asg)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  <UploadCloud size={16} />
                  <span>Upload &amp; Submit Homework</span>
                </button>
              )}
              {asg.status === 'SUBMITTED' && (
                <div className="py-2.5 px-3 bg-slate-800 rounded-2xl text-xs text-slate-300 text-center font-semibold">
                  File Submitted ({asg.submissionFile || 'uploaded.pdf'})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Upload Homework Submission</h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-2xl">
                <div className="font-bold text-slate-200">{selectedAssignment.title}</div>
                <div className="text-slate-400 mt-0.5">{selectedAssignment.subject} • Deadline: {selectedAssignment.dueDate}</div>
              </div>

              {/* Drag Drop Simulator Area */}
              <div className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-3xl p-6 text-center bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer transition">
                <UploadCloud size={36} className="text-indigo-400 mb-2 animate-bounce" />
                <div className="font-bold text-sm text-white">Drag &amp; Drop PDF or Solution Image here</div>
                <div className="text-[11px] text-slate-400 mt-1">Maximum file size: 25 MB (PDF, DOCX, JPG)</div>
                <div className="mt-3 px-3 py-1 rounded-full bg-slate-800 text-indigo-300 font-mono text-[11px]">
                  {submissionFileName}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Confirm Submission</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
