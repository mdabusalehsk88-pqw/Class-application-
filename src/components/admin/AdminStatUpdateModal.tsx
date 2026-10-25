import React, { useState } from 'react';
import { useInstitution } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  X,
  Users,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  School,
  FileText
} from 'lucide-react';

interface AdminStatUpdateModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const AdminStatUpdateModal: React.FC<AdminStatUpdateModalProps> = ({
  isOpen = true,
  onClose
}) => {
  const { stats, updateStudentCount, updateStats, addNotice, updateCashierBalance } = useInstitution();
  const { playChime } = useNotifications();

  const [studentCount, setStudentCount] = useState<number>(stats.totalStudents);
  const [boysCount, setBoysCount] = useState<number>(stats.boysCount);
  const [girlsCount, setGirlsCount] = useState<number>(stats.girlsCount);

  if (!isOpen) return null;
  const [todayAttendance, setTodayAttendance] = useState<number>(stats.todayAttendance);
  const [cashierFund, setCashierFund] = useState<number>(stats.classFundBalance);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'funds' | 'notice'>('students');

  if (!isOpen) return null;

  const handleSaveStudentCount = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentCount(studentCount, 'Abu Saleh (Class IT Officer)');
    const attRate = Math.round((todayAttendance / (studentCount || 1)) * 1000) / 10;
    updateStats({
      boysCount,
      girlsCount,
      todayAttendance,
      todayAttendanceRate: attRate,
      classFundBalance: cashierFund
    }, 'Abu Saleh (Class IT Officer)');
    playChime('success');
    onClose();
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;
    addNotice({
      title: newNoticeTitle,
      content: newNoticeContent || 'Official AL-USWAH notice.',
      noticeType: 'GENERAL',
      author: 'Abu Saleh (Class IT Officer)',
      priority: 'high'
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Class IT Officer Live Update Hub
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  AL-USWAH
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Update total student count, attendance, and notices displayed on the AL-USWAH portal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'students'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Class Strength & Attendance
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'funds'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Class Cashier Fund
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'notice'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Post Class Notice
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'students' && (
            <form onSubmit={handleSaveStudentCount} className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs text-indigo-300 font-semibold">Current AL-USWAH Students</div>
                  <div className="text-2xl font-extrabold text-white mt-0.5">
                    {stats.totalStudents} Students
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Managed by Class IT Officer (Abu Saleh)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <School size={28} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Update Total Students in Our Class
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={studentCount}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setStudentCount(val);
                      // keep rough ratio
                      setBoysCount(Math.round(val * 0.54));
                      setGirlsCount(val - Math.round(val * 0.54));
                    }}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setStudentCount(prev => prev + 1);
                      setBoysCount(b => b + 1);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    +1 Student
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Boys Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={boysCount}
                    onChange={e => setBoysCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Girls Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={girlsCount}
                    onChange={e => setGirlsCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Today's Present Students ({todayAttendance} / {studentCount})
                </label>
                <input
                  type="number"
                  min="0"
                  max={studentCount}
                  value={todayAttendance}
                  onChange={e => setTodayAttendance(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Save size={16} />
                  <span>Publish Update to AL-USWAH Portal</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'funds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                <div className="text-xs text-cyan-300 font-semibold">Class Cashier Fund Balance</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">
                  ${cashierFund}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Cashier: Samiul Karim (CR)
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Update Cashier Balance ($)
                </label>
                <input
                  type="number"
                  value={cashierFund}
                  onChange={e => setCashierFund(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  updateCashierBalance(cashierFund);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Fund Balance
              </button>
            </div>
          )}

          {activeTab === 'notice' && (
            <form onSubmit={handlePostNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Class Notice Headline
                </label>
                <input
                  type="text"
                  required
                  value={newNoticeTitle}
                  onChange={e => setNewNoticeTitle(e.target.value)}
                  placeholder="e.g. Physics practical notebook submission notice"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notice Details for AL-USWAH
                </label>
                <textarea
                  rows={3}
                  value={newNoticeContent}
                  onChange={e => setNewNoticeContent(e.target.value)}
                  placeholder="Details, timings, deadlines..."
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <FileText size={16} />
                <span>Post Notice to Class Board</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
