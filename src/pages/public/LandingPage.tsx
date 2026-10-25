import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import { UserRole } from '../../types';
import { LoginModal } from '../../components/auth/LoginModal';
import { AdminStatUpdateModal } from '../../components/admin/AdminStatUpdateModal';
import { mockRoutines } from '../../data/mockData';
import {
  Sparkles,
  GraduationCap,
  Users,
  Shield,
  ShieldCheck,
  HeartHandshake,
  DollarSign,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  FileText,
  BarChart3,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  School,
  Activity,
  Layers,
  BookOpen,
  Edit3,
  AlertCircle,
  LogIn,
  KeyRound,
  Lock,
  Wallet
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { currentRole } = useAuth();
  const { playChime } = useNotifications();
  const { stats, studentsList, notices, achievements } = useInstitution();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedModalRole, setSelectedModalRole] = useState<UserRole>('SUPER_ADMIN');
  const [isAdminStatModalOpen, setIsAdminStatModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleOpenLogin = (role: UserRole = 'SUPER_ADMIN') => {
    setSelectedModalRole(role);
    setIsLoginModalOpen(true);
    playChime('click');
  };

  const todayClasses = mockRoutines.filter(r => r.day === 'Sunday').slice(0, 5);

  const faqs = [
    {
      q: 'Who manages the updates for this Class 10-A portal?',
      a: 'The Class IT Officer (Super Admin - Abu Saleh) manages digital systems and student enrollment counts. The Class Head Teacher manages academics and attendance, and the Class Cashier (CR) manages petty fund records.'
    },
    {
      q: 'How do I log into my role dashboard?',
      a: 'Click any "Login to Portal" button and enter the demo username "admin" and password "admin". You can choose whether to log in as a Student, Class Head Teacher, Class IT Officer (Super Admin), Class Leader (Sub Admin), Parent, or Class Cashier.'
    },
    {
      q: 'Can parents monitor attendance and report cards here?',
      a: 'Yes. Once logged in through the Parent portal, guardians have complete access to daily attendance check-ins, subject GPAs, and school transport tracking.'
    },
    {
      q: 'How does the Class Cashier (CR) track our class funds?',
      a: 'The Class Cashier maintains a transparent digital petty cash ledger showing all collections (picnics, science fair kits) and disbursed expenses with timestamps.'
    }
  ];

  return (
    <div className="space-y-12 py-4 max-w-7xl mx-auto">
      {/* Top Class Banner & Quick Login Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-2.5 text-indigo-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold text-white">Class 10-A (Science & Technology)</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">Room 301 • Maintained by Class IT Officer</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Class Strength: <strong className="text-emerald-400">{stats.totalStudents} Students</strong>
          </span>
          <button
            onClick={() => handleOpenLogin('SUPER_ADMIN')}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogIn size={13} />
            <span>Login (admin / admin)</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/30 p-8 sm:p-14 text-center space-y-7 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <School size={15} />
          <span>Class 10-A Smart Portal • Session 2026–2027</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Welcome to <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
            Our Class 10-A Smart Dashboard
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Dedicated digital workspace for our class. Real-time student attendance, daily timetable, homework submissions, class cashier ledger, and official notices managed by our class leadership.
        </p>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleOpenLogin('STUDENT')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <LogIn size={18} />
            <span>Login to Class Portal</span>
          </button>
          
          <button
            onClick={() => handleOpenLogin('SUPER_ADMIN')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield size={18} className="text-rose-400" />
            <span>IT Admin Login (Me)</span>
          </button>
        </div>

        {/* Demo Fast Hint Box */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <KeyRound size={15} className="text-amber-400" />
          <span>Demo Credentials for All Pages: <strong>Username: admin</strong> | <strong>Password: admin</strong></span>
        </div>

        {/* Role Portal Entry Strip - Gated via LoginModal */}
        <div className="pt-4 space-y-2.5">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center justify-center gap-1.5">
            <Lock size={13} className="text-indigo-400" />
            <span>Select Your Class Role to Sign In</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            <button
              onClick={() => handleOpenLogin('STUDENT')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <GraduationCap size={16} className="text-indigo-400" />
              <span>Student (Our Class)</span>
            </button>
            <button
              onClick={() => handleOpenLogin('TEACHER')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Users size={16} className="text-emerald-400" />
              <span>Class Head Teacher</span>
            </button>
            <button
              onClick={() => handleOpenLogin('SUPER_ADMIN')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-600/20 border border-slate-800 hover:border-rose-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Shield size={16} className="text-rose-400" />
              <span>Super Admin (IT Officer - Me)</span>
            </button>
            <button
              onClick={() => handleOpenLogin('SUB_ADMIN')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <ShieldCheck size={16} className="text-purple-400" />
              <span>Sub Admin (Class Leader)</span>
            </button>
            <button
              onClick={() => handleOpenLogin('PARENT')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-600/20 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <HeartHandshake size={16} className="text-amber-400" />
              <span>Parent (Our Parents)</span>
            </button>
            <button
              onClick={() => handleOpenLogin('CLASS_REP')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <DollarSign size={16} className="text-cyan-400" />
              <span>Class Rep (Cashier)</span>
            </button>
          </div>
        </div>

        {/* Live Class KPI Cards (Updated by IT Admin) */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" />
              Class 10-A Real-Time Key Indicators
            </span>
            <span className="text-[11px] text-slate-400">
              Updated by: {stats.lastUpdatedBy}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {/* Total Class Students */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-300 font-semibold">Total Students</span>
                <Users size={16} className="text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {stats.totalStudents} Students
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.boysCount} Boys • {stats.girlsCount} Girls
              </div>
            </div>

            {/* Today's Attendance */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-semibold">Today's Attendance</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {stats.todayAttendance} / {stats.totalStudents}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.todayAttendanceRate}% Present Today
              </div>
            </div>

            {/* Class Cashier Fund */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-semibold">Class Cashier Fund</span>
                <Wallet size={16} className="text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1">
                ${stats.classFundBalance}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Managed by Samiul Karim (CR)
              </div>
            </div>

            {/* Class Room & Routine */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300 font-semibold">Classroom</span>
                <School size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                Room 301
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                8 Active Academic Subjects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Leadership & Officials */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-indigo-400" />
              Class 10-A Key Officials & Coordinators
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The designated leadership team handling academics, IT infrastructure, and student activities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Head Teacher */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              👨‍🏫
            </div>
            <div>
              <div className="text-xs font-bold text-white">Dr. Nusrat Jahan</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Class Head Teacher</div>
              <div className="text-[10px] text-slate-400">Physics & General Science</div>
            </div>
          </div>

          {/* Super Admin / IT Officer */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              👑
            </div>
            <div>
              <div className="text-xs font-bold text-white">Abu Saleh</div>
              <div className="text-[11px] text-rose-400 font-semibold">Class IT Officer (Super Admin)</div>
              <div className="text-[10px] text-slate-400">Class Portal & Tech Updates</div>
            </div>
          </div>

          {/* Sub Admin / Class Leader */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              🛡️
            </div>
            <div>
              <div className="text-xs font-bold text-white">Rafiul Islam (Roll 01)</div>
              <div className="text-[11px] text-purple-400 font-semibold">Class Leader (Sub Admin)</div>
              <div className="text-[10px] text-slate-400">Class Discipline & Routines</div>
            </div>
          </div>

          {/* Cashier / CR */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              💰
            </div>
            <div>
              <div className="text-xs font-bold text-white">Samiul Karim (Roll 02)</div>
              <div className="text-[11px] text-cyan-400 font-semibold">Class Cashier (CR)</div>
              <div className="text-[10px] text-slate-400">Class Petty Cash & Funds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Timetable Preview & Active Notices */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Class Notice Board */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-rose-400" />
              Class 10-A Notice Board & Homework
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Live Updates</span>
          </div>

          <div className="space-y-3">
            {notices.map(notice => (
              <div
                key={notice.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      notice.category === 'URGENT'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : notice.category === 'EXAM'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : notice.category === 'FUND'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : notice.category === 'SCHEDULE'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {notice.category}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-white">{notice.title}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">{notice.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notice.content}</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800/60">
                  <span>Issued by: <strong className="text-slate-300">{notice.author}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Class Timetable Preview */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              Today's Class Schedule
            </h2>
            <span className="text-xs text-indigo-300 font-semibold">Sunday Routine</span>
          </div>

          <div className="space-y-2.5">
            {todayClasses.map(period => (
              <div
                key={period.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[11px]">
                    P{period.period}
                  </span>
                  <div>
                    <div className="font-bold text-white">{period.subject}</div>
                    <div className="text-[10px] text-slate-400">{period.teacher} • {period.room}</div>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-slate-300">
                  {period.startTime}
                </div>
              </div>
            ))}
          </div>

          {/* Class Cashier Summary Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <DollarSign size={14} className="text-cyan-400" />
                Class Cashier Status
              </span>
              <span className="text-cyan-400 font-bold font-mono">${stats.classFundBalance} Balance</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Science Fair project kits & classroom supplies. Receipts audited by Class IT Officer and Class Leader.
            </p>
          </div>
        </div>
      </section>

      {/* Class Star Students & Laureates */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            Class 10-A Student Honor Roll
          </h2>
          <span className="text-xs text-amber-400 font-semibold">Academic Excellence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{ach.student}</span>
                <span className="text-amber-400 font-semibold">{ach.category}</span>
              </div>
              <div className="text-xs text-slate-300">{ach.title}</div>
              <div className="text-[11px] text-indigo-400 font-semibold">{ach.award}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white text-center mb-6">
          Frequently Asked Questions (Class Portal)
        </h2>

        {faqs.map((f, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs transition"
          >
            <button
              onClick={() => {
                setOpenFaq(openFaq === idx ? null : idx);
                playChime('click');
              }}
              className="w-full flex items-center justify-between text-left font-bold text-white text-sm cursor-pointer"
            >
              <span>{f.q}</span>
              {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openFaq === idx && (
              <p className="mt-3 text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                {f.a}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultRole={selectedModalRole}
        onSuccess={role => {
          onEnterApp(role);
        }}
      />

      {/* Admin Stat Update Modal */}
      <AdminStatUpdateModal
        isOpen={isAdminStatModalOpen}
        onClose={() => setIsAdminStatModalOpen(false)}
      />
    </div>
  );
};
