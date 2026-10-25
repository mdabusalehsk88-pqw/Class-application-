import React, { useState } from 'react';
import { UserRole } from '../../types';
import { mockInstitutionStats, mockNotices, mockUsers } from '../../data/mockData';
import { useNotifications } from '../../context/NotificationContext';
import {
  GraduationCap,
  Users,
  Shield,
  Briefcase,
  HeartHandshake,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Bus,
  ArrowRight,
  Sparkles,
  Lock,
  LogIn,
  X,
  Building2,
  TrendingUp,
  Flame,
  FileText,
  AlertCircle
} from 'lucide-react';

interface PublicDashboardProps {
  onLoginAsRole: (role: UserRole) => void;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({ onLoginAsRole }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const { playChime, addNotification } = useNotifications();

  const stats = mockInstitutionStats;

  const roleDefinitions: {
    role: UserRole;
    title: string;
    description: string;
    demoUser: string;
    icon: React.ReactNode;
    color: string;
    bgGlow: string;
  }[] = [
    {
      role: 'STUDENT',
      title: 'Student Portal',
      description: 'Daily schedule, assignments, attendance analytics, grades & quizzes',
      demoUser: mockUsers.STUDENT.name,
      icon: <GraduationCap size={22} className="text-indigo-400" />,
      color: 'border-indigo-500/40 hover:border-indigo-500 hover:bg-indigo-950/30',
      bgGlow: 'bg-indigo-600'
    },
    {
      role: 'TEACHER',
      title: 'Teacher Portal',
      description: 'Dynamic QR attendance, gradebook, live whiteboard class & roster',
      demoUser: mockUsers.TEACHER.name,
      icon: <Briefcase size={22} className="text-emerald-400" />,
      color: 'border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-950/30',
      bgGlow: 'bg-emerald-600'
    },
    {
      role: 'ADMIN',
      title: 'Super Admin',
      description: 'Command center, institutional KPIs, user management & finance',
      demoUser: mockUsers.ADMIN.name,
      icon: <Shield size={22} className="text-rose-400" />,
      color: 'border-rose-500/40 hover:border-rose-500 hover:bg-rose-950/30',
      bgGlow: 'bg-rose-600'
    },
    {
      role: 'SUB_ADMIN',
      title: 'Sub Admin (Academic)',
      description: 'Curriculum coordination, examination scheduling & department controls',
      demoUser: mockUsers.SUB_ADMIN.name,
      icon: <Award size={22} className="text-purple-400" />,
      color: 'border-purple-500/40 hover:border-purple-500 hover:bg-purple-950/30',
      bgGlow: 'bg-purple-600'
    },
    {
      role: 'PARENT',
      title: 'Parent Portal',
      description: "Monitor child's academic report card, attendance, fees & live bus GPS",
      demoUser: mockUsers.PARENT.name,
      icon: <HeartHandshake size={22} className="text-amber-400" />,
      color: 'border-amber-500/40 hover:border-amber-500 hover:bg-amber-950/30',
      bgGlow: 'bg-amber-600'
    },
    {
      role: 'CLASS_REP',
      title: 'Class Representative (CR)',
      description: 'Class fund accounting ledger, student opinion polls & announcements',
      demoUser: mockUsers.CLASS_REP.name,
      icon: <Users size={22} className="text-cyan-400" />,
      color: 'border-cyan-500/40 hover:border-cyan-500 hover:bg-cyan-950/30',
      bgGlow: 'bg-cyan-600'
    }
  ];

  const handleOpenLogin = (role: UserRole) => {
    setSelectedRole(role);
    setEmailInput(mockUsers[role]?.email || '');
    setShowLoginModal(true);
    playChime('click');
  };

  const handleExecuteLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoginModal(false);
    playChime('success');
    addNotification({
      title: `Logged in successfully as ${selectedRole}`,
      message: `Welcome to the ${selectedRole.replace('_', ' ')} workspace.`,
      type: 'success'
    });
    onLoginAsRole(selectedRole);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Institutional Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-indigo-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 -mb-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{stats.institutionName} • Session {stats.academicYear}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Institutional Public Dashboard &amp;{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Smart Campus Portal
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Official live dashboard reflecting real-time enrollment, academic attendance, notices, and centralized role-based gateway for students, teachers, parents, and administrative staff.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenLogin('STUDENT')}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xl shadow-indigo-600/30 flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95"
              >
                <LogIn size={16} />
                <span>Sign In to Portal</span>
              </button>
              <a
                href="#roles-section"
                className="px-6 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2"
              >
                <span>Select Your Role</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Quick Snapshot Card on Right */}
          <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Building2 size={16} className="text-indigo-400" />
                <span>Campus Status</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Enrolled:</span>
                <span className="font-bold text-white font-mono">{stats.totalStudents.toLocaleString()} Students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Faculty:</span>
                <span className="font-bold text-emerald-400 font-mono">{stats.activeTeachers} Certified Teachers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today's Attendance:</span>
                <span className="font-bold text-indigo-400 font-mono">{stats.todayAttendanceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Smart Labs:</span>
                <span className="font-bold text-white font-mono">{stats.smartLabs} STEM Labs</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Verified and synced with Administration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Key Metrics Grid (Synced with Admin Updates) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white">
              Institutional Live Metrics
            </h2>
            <p className="text-xs text-slate-400">
              Real-time campus counts managed directly by the administration
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
            <CheckCircle2 size={14} />
            <span>Synced Live • Today</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Students</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {stats.totalStudents.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                ↑ Enrolled across 28 sections
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800">
              Admin verified headcount
            </div>
          </div>

          {/* Active Faculty */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Faculty &amp; Teachers</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Briefcase size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
                {stats.activeTeachers}
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-1">
                Student-Teacher Ratio 1:19
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800">
              Full-time certified educators
            </div>
          </div>

          {/* Today's Attendance Rate */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Today's Attendance</span>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {stats.todayAttendanceRate}%
              </div>
              <div className="text-xs text-teal-400 font-semibold mt-1">
                Above institutional target 90%
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800">
              QR &amp; Biometric check-in verified
            </div>
          </div>

          {/* Board Exam Pass Rate */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Academic Success Rate</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
                {stats.boardPassRate}
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-1">
                Exemplary Board distinction
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800">
              National accreditation standard
            </div>
          </div>
        </div>
      </section>

      {/* Select Role to Login Section (The Core User Request) */}
      <section id="roles-section" className="space-y-6 pt-4">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <LogIn size={13} />
            <span>Select Login Identity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Access Your Dedicated Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select what you are logging in as: Student, Teacher, Super Admin, Sub Admin, Parent, or Class Rep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleDefinitions.map(r => (
            <div
              key={r.role}
              onClick={() => handleOpenLogin(r.role)}
              className={`p-6 rounded-3xl bg-slate-900/80 border transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg ${r.color} hover:shadow-2xl hover:-translate-y-1`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 group-hover:scale-110 transition duration-200">
                    {r.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    {r.role}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Account: </span>
                  <span className="font-semibold text-slate-300">{r.demoUser}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Notices & Academic Timeline Snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Notice Board */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Official Institutional Notices</h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
              Latest
            </span>
          </div>

          <div className="space-y-3">
            {mockNotices.map(ntc => (
              <div
                key={ntc.id}
                className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider">
                    {ntc.category}
                  </span>
                  <span className="text-slate-500">{ntc.date}</span>
                </div>
                <div className="font-bold text-xs text-white">{ntc.title}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {ntc.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities and Infrastructure Snapshot */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Campus Infrastructure &amp; Amenities</h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full">
              Available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <BookOpen size={15} className="text-indigo-400" />
                <span>Digital Library</span>
              </div>
              <div className="text-[11px] text-slate-400">18,500+ physical &amp; e-books cataloged</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles size={15} className="text-cyan-400" />
                <span>12 STEM Labs</span>
              </div>
              <div className="text-[11px] text-slate-400">Robotics, Physics, Chem &amp; Computer AI</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Bus size={15} className="text-amber-400" />
                <span>16 GPS Bus Routes</span>
              </div>
              <div className="text-[11px] text-slate-400">Live guardian tracking enabled</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Smart Attendance</span>
              </div>
              <div className="text-[11px] text-slate-400">Dynamic rotating QR validation</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-xs text-indigo-200">
            <div className="font-bold text-white">Robo Sir (AI) Assistant Active</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Available across all student, teacher, and administrator workspaces for real-time guidance.
            </div>
          </div>
        </div>
      </section>

      {/* Role Login Modal with Quick-Fill & Authentication */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <LogIn size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Campus Portal Authentication</h3>
                  <div className="text-[11px] text-slate-400">Sign in to your authorized account</div>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Role Switcher Pill Bar inside Modal */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Role:
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {(['STUDENT', 'TEACHER', 'ADMIN', 'SUB_ADMIN', 'PARENT', 'CLASS_REP'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      setEmailInput(mockUsers[r]?.email || '');
                      playChime('click');
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition truncate ${
                      selectedRole === r
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 'ADMIN' ? 'Super Admin' : r === 'SUB_ADMIN' ? 'Sub Admin' : r === 'CLASS_REP' ? 'Class Rep' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected User Quick Preview */}
            <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
              <img
                src={mockUsers[selectedRole]?.avatar}
                alt={mockUsers[selectedRole]?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {mockUsers[selectedRole]?.name}
                </div>
                <div className="text-[10px] text-indigo-400 font-medium">
                  {mockUsers[selectedRole]?.role} • {mockUsers[selectedRole]?.email}
                </div>
              </div>
            </div>

            <form onSubmit={handleExecuteLogin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 text-xs transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogIn size={15} />
                  <span>Enter {selectedRole.replace('_', ' ')} Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
