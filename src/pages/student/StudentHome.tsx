import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { useAI } from '../../context/AIContext';
import { mockAssignments, mockExamResults, mockNotices } from '../../data/mockData';
import { ActiveTab } from '../../components/layout/Sidebar';
import {
  Clock,
  Calendar,
  CheckCircle,
  GraduationCap,
  Flame,
  Sparkles,
  ArrowRight,
  FileText,
  AlertTriangle,
  Heart,
  BookOpen,
  Coffee,
  HelpCircle,
  MessageSquare,
  Bus,
  Layers
} from 'lucide-react';

interface StudentHomeProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { xp, streak, addXP } = useGamification();
  const { toggleOpen: openRoboSir } = useAI();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moods = [
    { emoji: '🚀', label: 'Motivated' },
    { emoji: '😊', label: 'Energetic' },
    { emoji: '😐', label: 'Focused' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🤯', label: 'Challenged' }
  ];

  const handleMoodSelect = (label: string) => {
    setSelectedMood(label);
    addXP(15, 'Daily wellness reflection logged');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Academic Year 2026 • {currentUser.class} ({currentUser.section}) • Roll: {currentUser.roll}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good Morning, {currentUser.name}! ☀️
            </h1>
            <p className="text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              You have 3 scheduled classes and 1 physics lab session today. Robo Sir has prepared your study plan and equation practice set.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('routine')}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <Calendar size={15} />
              <span>View Today's Routine</span>
            </button>
            <button
              onClick={openRoboSir}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-2 active:scale-95"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>Ask Robo Sir (AI)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Sticky Status Bar: Next Class Countdown & Live Period */}
      <div className="bg-gradient-to-r from-violet-950/80 via-slate-900 to-indigo-950/80 border border-violet-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-violet-300">
            <Clock size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                Next Class
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                Starts in 12 mins
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              Physics (Wave Mechanics) • Dr. Nusrat Jahan • Lab-301 (Science Block)
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('routine')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
        >
          <span>Full Weekly Schedule</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Bento Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {currentUser.attendancePercentage || 94.5}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">↑ 2.1% this month</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Comfortably above 75% target</div>
        </div>

        {/* CGPA Card */}
        <div
          onClick={() => onNavigate('exams')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current CGPA</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">3.92</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
              Grade A+
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Top 5% class standing</div>
        </div>

        {/* Streak & XP Card */}
        <div
          onClick={() => onNavigate('gamification')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Day Streak &amp; Level</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame size={18} className="fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{streak} Days</span>
            <span className="text-xs font-semibold text-indigo-300">Level #{currentUser.level}</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">{xp} Total XP accumulated</div>
        </div>

        {/* Pending Assignments */}
        <div
          onClick={() => onNavigate('assignments')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">2 Due</span>
            <span className="text-xs font-semibold text-rose-400">Upcoming deadlines</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Physics &amp; Advanced Math</div>
        </div>
      </div>

      {/* Daily Mood Check-In Widget */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400">
            <Heart size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">How are you feeling about your studies today?</div>
            <div className="text-xs text-slate-400">Check in daily to build learning mindfulness (+15 XP)</div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {moods.map((m, idx) => (
            <button
              key={idx}
              onClick={() => handleMoodSelect(m.label)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
                selectedMood === m.label
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Quick Navigation Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'Schedule', icon: <Calendar className="text-indigo-400" size={20} />, tab: 'routine' as ActiveTab },
            { label: 'Attendance', icon: <CheckCircle className="text-emerald-400" size={20} />, tab: 'attendance' as ActiveTab },
            { label: 'Assignments', icon: <FileText className="text-amber-400" size={20} />, tab: 'assignments' as ActiveTab },
            { label: 'Speed Quiz', icon: <Layers className="text-pink-400" size={20} />, tab: 'quiz' as ActiveTab },
            { label: 'Study Notes', icon: <BookOpen className="text-cyan-400" size={20} />, tab: 'materials' as ActiveTab },
            { label: 'Flashcards', icon: <Sparkles className="text-purple-400" size={20} />, tab: 'flashcards' as ActiveTab },
            { label: 'Doubt Forum', icon: <HelpCircle className="text-rose-400" size={20} />, tab: 'doubts' as ActiveTab },
            { label: 'Class Chat', icon: <MessageSquare className="text-blue-400" size={20} />, tab: 'chat' as ActiveTab },
            { label: 'Focus Timer', icon: <Coffee className="text-teal-400" size={20} />, tab: 'focus' as ActiveTab },
            { label: 'Bus Tracking', icon: <Bus className="text-yellow-400" size={20} />, tab: 'transport' as ActiveTab }
          ].map((act, i) => (
            <button
              key={i}
              onClick={() => onNavigate(act.tab)}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 flex flex-col items-center justify-center gap-2 transition group shadow-sm"
            >
              <div className="p-2 rounded-xl bg-slate-800/80 group-hover:scale-110 transition duration-200">
                {act.icon}
              </div>
              <span className="text-xs font-semibold text-slate-200">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Columns: Upcoming Assignments & Campus Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <span>Upcoming Assignment Deadlines</span>
            </h3>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {mockAssignments.slice(0, 3).map(asg => (
              <div
                key={asg.id}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{asg.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {asg.subject} • Faculty: {asg.teacherName}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    asg.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {asg.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Due: {asg.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span>Official Institutional Notices</span>
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              3 New
            </span>
          </div>

          <div className="space-y-3">
            {mockNotices.map(ntc => (
              <div
                key={ntc.id}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                    {ntc.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{ntc.date}</span>
                </div>
                <div className="text-xs font-bold text-white">{ntc.title}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{ntc.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
