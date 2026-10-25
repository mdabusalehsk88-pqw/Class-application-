import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle,
  Calendar,
  Send,
  X,
  Download
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDays, setLeaveDays] = useState('1');
  const [leaveReason, setLeaveReason] = useState('');

  const subjectAttendance = [
    { subject: 'Physics', attended: 28, total: 30, pct: 93.3 },
    { subject: 'Advanced Mathematics', attended: 29, total: 30, pct: 96.6 },
    { subject: 'Chemistry', attended: 27, total: 30, pct: 90.0 },
    { subject: 'Biology & Genetics', attended: 26, total: 28, pct: 92.8 },
    { subject: 'Computer Science & AI', attended: 20, total: 20, pct: 100.0 },
    { subject: 'English Literature', attended: 33, total: 35, pct: 94.2 }
  ];

  // Calendar Heatmap Days (simulated for October 2026)
  const heatmapDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const isFriday = day % 7 === 6;
    const isAbsent = day === 8;
    const isLate = day === 14;
    return {
      day,
      status: isFriday ? 'HOLIDAY' : isAbsent ? 'ABSENT' : isLate ? 'LATE' : 'PRESENT'
    };
  });

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    setShowLeaveModal(false);
    setLeaveReason('');
    playChime('success');
    addNotification({
      title: 'Leave Application Submitted',
      message: `${leaveDays} day(s) official leave request sent to Class Teacher for approval.`,
      type: 'info'
    });
  };

  const handleDownloadCertificate = () => {
    playChime('success');
    addNotification({
      title: 'Attendance Certificate Exported',
      message: `${currentUser.name}'s verified 94.5% digital attendance certificate downloaded.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle size={14} />
            <span>Attendance Tracker &amp; Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            My Attendance Performance (October 2026)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Working Days: 24 | Present: 23 Days | Late: 1 Day | Unexcused Absences: 0
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Send size={14} />
            <span>Apply for Leave</span>
          </button>
          <button
            onClick={handleDownloadCertificate}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export Certificate</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-lg font-mono">
            94.5%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Overall Attendance</div>
            <div className="text-base font-extrabold text-white">Exemplary Standing</div>
            <div className="text-[11px] text-emerald-400 font-semibold">Exceeds 75% institutional bar</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-lg font-mono">
            1 Day
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Total Delayed Check-ins</div>
            <div className="text-base font-extrabold text-white">Excused Lateness</div>
            <div className="text-[11px] text-slate-400">Transit congestion delay (Oct 14)</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-lg font-mono">
            18
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Punctuality Streak</div>
            <div className="text-base font-extrabold text-white">18 Days Consecutive</div>
            <div className="text-[11px] text-indigo-400">Badge: Iron Discipline Active</div>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-indigo-400" />
          <span>Monthly Attendance Heatmap (October 2026)</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((w, idx) => (
            <div key={idx} className="font-bold text-slate-400 py-1">
              {w}
            </div>
          ))}

          {heatmapDays.map(item => {
            const bgClass =
              item.status === 'HOLIDAY'
                ? 'bg-slate-800/40 text-slate-500'
                : item.status === 'ABSENT'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : item.status === 'LATE'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';

            return (
              <div
                key={item.day}
                className={`h-12 rounded-2xl border flex flex-col items-center justify-center transition hover:scale-105 cursor-pointer ${bgClass}`}
                title={`Day ${item.day}: ${item.status}`}
              >
                <span className="font-bold font-mono">{item.day}</span>
                <span className="text-[9px] uppercase font-semibold">
                  {item.status === 'PRESENT'
                    ? '✓'
                    : item.status === 'HOLIDAY'
                    ? 'Off'
                    : item.status === 'LATE'
                    ? 'Late'
                    : 'Absent'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Late Check-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-700"></span>
            <span>Weekly Recess</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Progress Bars */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Subject-wise Attendance Distribution</h3>
        <div className="space-y-4">
          {subjectAttendance.map((sub, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{sub.subject}</span>
                <span className="font-bold text-slate-300 font-mono">
                  {sub.attended}/{sub.total} classes ({sub.pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${sub.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Leave Application Request</h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Leave Duration</label>
                <select
                  value={leaveDays}
                  onChange={e => setLeaveDays(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="5">1 Week (Medical / Emergency)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Absence</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="State medical or emergency reasons for absence..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
