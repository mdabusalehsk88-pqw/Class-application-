import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Globe,
  CheckCircle2,
  GraduationCap,
  Key
} from 'lucide-react';

interface AdminLoginGatewayProps {
  onBackToPublicWebsite?: () => void;
  initialMode?: 'student' | 'admin';
}

export const AdminLoginGateway: React.FC<AdminLoginGatewayProps> = ({
  onBackToPublicWebsite,
  initialMode = 'student'
}) => {
  const { login, loginStudent } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const { studentsList } = useInstitution();

  // Mode: 'student' (Default!) | 'admin' (shown only when clicking small 'admin login' text below)
  const [gatewayMode, setGatewayMode] = useState<'student' | 'admin'>(initialMode);

  // Student Login Fields - Blank by default
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Admin Login Fields - Blank by default
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Student Login
  const handleStudentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentUsername.trim() || !studentPassword.trim()) {
      setErrorMsg('Please enter both student username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const trimmedUser = studentUsername.trim().toLowerCase();
      const trimmedPass = studentPassword.trim();

      const matchedStudent = studentsList.find(s => {
        const u = s.username?.toLowerCase() || s.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
        const adm = s.admissionNumber?.toLowerCase();
        const em = s.email?.toLowerCase();
        const p = s.password || 'student123';

        const matchesUser = trimmedUser === u || trimmedUser === adm || trimmedUser === em;
        const matchesPass = trimmedPass === p;
        return matchesUser && matchesPass;
      });

      if (matchedStudent) {
        playChime('success');
        addNotification({
          title: 'Student Authenticated',
          message: `Welcome, ${matchedStudent.name}! Your AL-USWAH marksheet & student portal is ready.`,
          type: 'success'
        });
        loginStudent(matchedStudent);
      } else {
        playChime('alert');
        setErrorMsg('Invalid student username or password. Please verify the credentials assigned on the admin roster.');
        setIsLoading(false);
      }
    }, 350);
  };

  // Handle Admin Login (supports both custom changed credentials and defaults)
  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const u = adminUsername.trim().toLowerCase();
      const p = adminPassword.trim();

      // Check for user-customized admin credentials in localStorage
      let customMatch = false;
      try {
        const stored = localStorage.getItem('smartclass_admin_custom_credentials');
        if (stored) {
          const creds = JSON.parse(stored);
          const customU = creds.username?.trim().toLowerCase();
          const customE = creds.email?.trim().toLowerCase();
          const customP = creds.password?.trim();
          if ((u === customU || u === customE) && p === customP) {
            customMatch = true;
          }
        }
      } catch {
        // ignore
      }

      const defaultMatch =
        (u === 'superadminabu@smartclass.pro' || u === 'admin' || u === 'superadmin') &&
        (p === 'superadminabuforsmartclass.pro' || p === 'admin');

      if (customMatch || defaultMatch) {
        playChime('success');
        addNotification({
          title: 'Super Admin Authenticated',
          message: 'Welcome back! Full administrative control and Website Builder CMS are active.',
          type: 'success'
        });
        login('SUPER_ADMIN');
      } else {
        playChime('alert');
        setErrorMsg('Invalid administrator username or password. Please verify your officer credentials.');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Decorative Glow */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          gatewayMode === 'student' ? 'bg-indigo-500/10' : 'bg-rose-500/10'
        }`}
      />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Top Back to Public Website Button */}
        {onBackToPublicWebsite && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onBackToPublicWebsite}
              className="px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowLeft size={14} className="text-amber-400" />
              <Globe size={14} className="text-emerald-400" />
              <span>← Back to AL-USWAH UNION Public Website</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STUDENT LOGIN VIEW (DEFAULT AS REQUESTED)                     */}
        {/* ============================================================== */}
        {gatewayMode === 'student' && (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <GraduationCap size={14} className="text-indigo-400" />
                <span>AL-USWAH STUDENT PORTAL</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white">
                Student Sign In
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sign in with the username and password provided by AL-USWAH Administration to access your personal student portal.
              </p>
            </div>

            {/* Student Login Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Key size={15} className="text-indigo-400" />
                  <span>Student Credentials</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  AL-USWAH
                </span>
              </div>

              {/* Secure Form */}
              <form onSubmit={handleStudentLogin} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Username (or Admission #)
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={studentUsername}
                      onChange={e => setStudentUsername(e.target.value)}
                      placeholder="Enter student username or admission number"
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showStudentPassword ? 'text' : 'password'}
                      value={studentPassword}
                      onChange={e => setStudentPassword(e.target.value)}
                      placeholder="Enter student password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      title={showStudentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showStudentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert size={15} className="shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Authenticating Student...</span>
                  ) : (
                    <>
                      <GraduationCap size={16} />
                      <span>Sign In to Student Console</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Security Banner */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Protected Student Data Access • End-to-End Secure</span>
              </div>

              {/* EXACT USER SPECIFICATION: "students' login page will be below the admin login small text, same as before, exactly the same login page" */}
              <div className="pt-3 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayMode('admin');
                    setErrorMsg('');
                    playChime('click');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors tracking-wide hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto group"
                >
                  <Lock size={12} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                  <span>admin login</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* ADMIN LOGIN VIEW (SHOWN ONLY WHEN CLICKING 'admin login')     */}
        {/* ============================================================== */}
        {gatewayMode === 'admin' && (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <ShieldCheck size={14} className="text-rose-400" />
                <span>SUPER ADMIN</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white">
                AL-USWAH SUPER ADMIN
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Super Admin system. Only authorized officers can manage the public website, attendance, funds, routines, and marksheets.
              </p>
            </div>

            {/* Officer Login Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Lock size={15} className="text-rose-400" />
                  <span>Officer Sign In</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  AL-USWAH
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminLogin} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Officer Username
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="Enter administrator username"
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Officer Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert size={15} className="shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-98 transition text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Sign In as Class IT Officer (Super Admin)</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Back to Student Login Option */}
              <div className="pt-3 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayMode('student');
                    setErrorMsg('');
                    playChime('click');
                  }}
                  className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors tracking-wide hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto group"
                >
                  <ArrowLeft size={12} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span>← Back to Student Login</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500">
          AL-USWAH Educational Portal • Authorized Student & Officer Access
        </div>
      </div>
    </div>
  );
};
