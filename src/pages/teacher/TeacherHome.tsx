import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ActiveTab } from '../../components/layout/Sidebar';
import {
  Briefcase,
  Users,
  CheckCircle,
  FileText,
  Video,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface TeacherHomeProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <span>Faculty Lead • {currentUser.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {currentUser.name}! 👨‍🏫
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            You have 3 scheduled classroom sessions today. Period 2 includes Grade 10-A Physics Laboratory attendance & coursework evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('live_class')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
          >
            <Video size={16} />
            <span>Start Live Whiteboard Class</span>
          </button>
          <button
            onClick={() => onNavigate('attendance_mgr')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle size={16} />
            <span>Take Attendance (QR)</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Today's Sessions</span>
            <Clock size={16} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">3 Classes</div>
          <div className="text-xs text-slate-400 mt-1">08:30 AM to 01:50 PM</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Pending Submissions</span>
            <FileText size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">14 Submissions</div>
          <div className="text-xs text-slate-400 mt-1">Physics Problem Set 4</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Enrolled Students</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">78 Students</div>
          <div className="text-xs text-slate-400 mt-1">Grade 10 (Sections A & B)</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Student Rating</span>
            <Sparkles size={16} className="text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-pink-400 mt-2">4.9 / 5.0</div>
          <div className="text-xs text-slate-400 mt-1">Based on student feedback</div>
        </div>
      </div>

      {/* Teaching Schedule for Today */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Today's Class Timetable</h3>
          <button
            onClick={() => onNavigate('live_class')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Launch Live Class</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { period: 'Period 1', time: '08:30 - 09:20', subject: 'Physics Lecture', class: 'Grade 10 (A)', room: 'Room 301', status: 'LIVE NOW' },
            { period: 'Period 3', time: '10:30 - 11:20', subject: 'Thermodynamics Tutorial', class: 'Grade 9 (B)', room: 'Room 204', status: 'UPCOMING' },
            { period: 'Period 5', time: '01:00 - 01:50', subject: 'Optics Laboratory', class: 'Grade 10 (A)', room: 'Physics Lab', status: 'UPCOMING' }
          ].map((sc, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-800 px-2.5 py-1 rounded-xl">
                  {sc.time}
                </span>
                <div>
                  <div className="font-bold text-xs text-white">{sc.subject} ({sc.class})</div>
                  <div className="text-[11px] text-slate-400">{sc.room}</div>
                </div>
              </div>

              <div>
                {sc.status === 'LIVE NOW' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold animate-pulse">
                    Live Now
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
