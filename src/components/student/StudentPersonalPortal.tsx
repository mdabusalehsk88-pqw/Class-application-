import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import { useChat } from '../../context/ChatContext';
import { SubjectMarksheet, StudentMarkEntry, StudentGradeCard } from '../../types';
import { initialMockMarksheets } from '../../data/mockMarksheets';
import { GradeCardTemplate } from '../common/GradeCardTemplate';
import {
  initialAbuSalehGradeCard,
  createStudentGradeCard
} from '../../data/gradeCardData';
import { StudentMessagingSystem } from './StudentMessagingSystem';
import { SuperAdminFunds } from '../admin/SuperAdminFunds';
import { SuperAdminAttendance } from '../admin/SuperAdminAttendance';
import { SuperAdminMarksPortal } from '../admin/SuperAdminMarksPortal';
import { SuperAdminRoutine } from '../admin/SuperAdminRoutine';
import { SuperAdminNotices } from '../admin/SuperAdminNotices';
import { SuperAdminFiles } from '../admin/SuperAdminFiles';
import { SuperAdminWebsiteBuilder } from '../admin/SuperAdminWebsiteBuilder';
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  Wallet,
  Receipt,
  MessageSquare,
  Send,
  FileText,
  Download,
  BookOpen,
  Bell,
  Search,
  Filter,
  LogOut,
  Sparkles,
  AlertCircle,
  Award,
  TrendingUp,
  User,
  Shield,
  Eye,
  Check,
  ChevronRight,
  ExternalLink,
  Printer,
  Sparkle,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';

export type StudentTab =
  | 'overview'
  | 'balance'
  | 'attendance'
  | 'messages'
  | 'routine'
  | 'notices'
  | 'files'
  | 'marksheet'
  | 'manage_funds'
  | 'manage_attendance'
  | 'manage_marks'
  | 'manage_routine'
  | 'manage_notices'
  | 'manage_files'
  | 'manage_website';

export const StudentPersonalPortal: React.FC = () => {
  const { currentUser, authenticatedStudent, logout } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const {
    studentsList,
    studentDues,
    attendanceHistory,
    routines,
    notices,
    classFiles,
    stats
  } = useInstitution();
  const { messages, sendMessage } = useChat();

  const [activeTab, setActiveTab] = useState<StudentTab>('overview');

  // Find exact active student record
  const currentStudent = useMemo(() => {
    return (
      studentsList.find(
        s =>
          s.id === currentUser.id ||
          (currentUser.admissionNumber && s.admissionNumber === currentUser.admissionNumber) ||
          s.name.toLowerCase() === currentUser.name.toLowerCase()
      ) ||
      authenticatedStudent || {
        id: currentUser.id || 'u_5',
        name: currentUser.name || 'Sadia Jahan',
        email: currentUser.email || 'sadia@smartclass.edu',
        admissionNumber: currentUser.admissionNumber || 'ADM-2026-015',
        role: 'STUDENT' as const,
        roll: currentUser.roll || '03',
        photo: currentUser.avatar,
        status: 'ACTIVE' as const,
        gender: 'Girl' as const,
        attendanceRate: 96.0,
        gpa: 3.88
      }
    );
  }, [studentsList, currentUser, authenticatedStudent]);

  // ==================== DELEGATED MANAGEMENT PERMISSIONS ====================
  const canManageFunds = Boolean(currentStudent.permissions?.funds || currentStudent.isCashier || currentStudent.role === 'CASHIER');
  const canManageAttendance = Boolean(currentStudent.permissions?.attendance);
  const canManageMarks = Boolean(currentStudent.permissions?.marks);
  const canManageRoutine = Boolean(currentStudent.permissions?.routine);
  const canManageNotices = Boolean(currentStudent.permissions?.notices);
  const canManageFiles = Boolean(currentStudent.permissions?.files);
  const canManageWebsite = Boolean(currentStudent.permissions?.website_builder);

  const hasAnyDelegatedAccess =
    canManageFunds ||
    canManageAttendance ||
    canManageMarks ||
    canManageRoutine ||
    canManageNotices ||
    canManageFiles ||
    canManageWebsite;

  // ==================== 1. BALANCE & DUES (ONLY THEIR OWN) ====================
  const myDues = useMemo(() => {
    return studentDues.filter(
      d =>
        d.studentId === currentStudent.id ||
        (currentStudent.admissionNumber && d.admissionNumber === currentStudent.admissionNumber) ||
        d.studentName.toLowerCase() === currentStudent.name.toLowerCase()
    );
  }, [studentDues, currentStudent]);

  const totalDuesBilled = myDues.reduce((sum, d) => sum + d.totalDue, 0);
  const totalDuesPaid = myDues.reduce((sum, d) => sum + d.paidAmount, 0);
  const currentBalanceRemaining = Math.max(0, totalDuesBilled - totalDuesPaid);

  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // ==================== 2. ATTENDANCE (ONLY THEIR OWN) ====================
  const myAttendanceRecords = useMemo(() => {
    const records: { date: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; dayName: string }[] = [];
    const dateKeys = Object.keys(attendanceHistory).sort().reverse();

    dateKeys.forEach(dateStr => {
      const dayMap = attendanceHistory[dateStr];
      if (dayMap && dayMap[currentStudent.id]) {
        const d = new Date(dateStr);
        const dayName = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'short' });
        records.push({
          date: dateStr,
          status: dayMap[currentStudent.id],
          dayName
        });
      }
    });

    // Strictly authentic admin records only - no default or synthetic dates
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceHistory, currentStudent]);

  const totalAttendanceDays = myAttendanceRecords.length;
  const presentDays = myAttendanceRecords.filter(r => r.status === 'PRESENT').length;
  const lateDays = myAttendanceRecords.filter(r => r.status === 'LATE').length;
  const absentDays = myAttendanceRecords.filter(r => r.status === 'ABSENT').length;
  const calculatedAttendanceRate =
    totalAttendanceDays > 0
      ? Math.round(((presentDays + lateDays) / totalAttendanceDays) * 100)
      : 0;

  // ==================== 3. MESSAGES (ONLY BROADCASTS & TARGETED TO THIS STUDENT) ====================
  const myMessages = useMemo(() => {
    return messages.filter(m => {
      if (m.targetAudience === 'ALL' || m.conversationId === 'all_students') return true;
      if (m.recipientIds && m.recipientIds.includes(currentStudent.id)) return true;
      if (m.senderId === currentStudent.id) return true;
      return false;
    });
  }, [messages, currentStudent]);

  const [studentReplyText, setStudentReplyText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSendStudentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentReplyText.trim()) return;

    setIsSendingMessage(true);
    sendMessage({
      conversationId: 'all_students',
      message: studentReplyText.trim(),
      targetAudience: 'ALL'
    });

    const sentText = studentReplyText.trim();
    setStudentReplyText('');
    playChime('click');
    addNotification({
      title: 'Message Sent to IT Office',
      message: 'Your message has been posted to AL-USWAH stream.',
      type: 'success'
    });

    setTimeout(() => {
      setIsSendingMessage(false);
    }, 400);
  };

  // ==================== 4. ROUTINE (CLASS 10-A TIMETABLE) ====================
  const [selectedRoutineDay, setSelectedRoutineDay] = useState<string>('Sunday');
  const dayRoutineList = useMemo(() => {
    return routines.filter(r => r.day.toLowerCase() === selectedRoutineDay.toLowerCase());
  }, [routines, selectedRoutineDay]);

  // ==================== 5. NOTICES ====================
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>('ALL');
  const filteredNotices = useMemo(() => {
    if (noticeCategoryFilter === 'ALL') return notices;
    return notices.filter(n => n.category === noticeCategoryFilter || n.noticeType === noticeCategoryFilter);
  }, [notices, noticeCategoryFilter]);

  // ==================== 6. CLASS FILES ====================
  const [fileSearch, setFileSearch] = useState('');
  const [fileSubjectFilter, setFileSubjectFilter] = useState('ALL');
  const [previewingFile, setPreviewingFile] = useState<any | null>(null);

  const filteredFiles = useMemo(() => {
    return classFiles.filter(f => {
      const matchSearch =
        f.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
        f.subject.toLowerCase().includes(fileSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(fileSearch.toLowerCase());
      const matchSub = fileSubjectFilter === 'ALL' || f.subject.toLowerCase() === fileSubjectFilter.toLowerCase();
      return matchSearch && matchSub;
    });
  }, [classFiles, fileSearch, fileSubjectFilter]);

  // ==================== 7. MARKSHEET (ONLY THIS STUDENT'S OWN MARKS) ====================
  const allStoredMarksheets = useMemo(() => {
    try {
      const stored = localStorage.getItem('smartclass_marksheets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as SubjectMarksheet[];
      }
    } catch {
      // fallback
    }
    return initialMockMarksheets;
  }, []);

  // Real-time Grade Cards from localStorage (matching the university PDF)
  const [gradeCards, setGradeCards] = useState<StudentGradeCard[]>(() => {
    try {
      const stored = localStorage.getItem('smartclass_grade_cards');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('smartclass_grade_cards');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setGradeCards(parsed);
        }
      } catch {
        // fallback
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('al_uswah_grade_cards_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('al_uswah_grade_cards_updated', handleSync);
    };
  }, []);

  // Compute this student's official PDF grade card
  const myGradeCard = useMemo<StudentGradeCard>(() => {
    const match = gradeCards.find(
      c =>
        c.studentId === currentStudent.id ||
        (currentStudent.admissionNumber && c.admissionNo === currentStudent.admissionNumber) ||
        c.studentName.toLowerCase() === currentStudent.name.toLowerCase()
    );
    if (match) {
      return {
        ...match,
        studentName: currentStudent.name,
        admissionNo: currentStudent.admissionNumber || match.admissionNo,
        photo: currentStudent.photo || match.photo
      };
    }
    return createStudentGradeCard(
      currentStudent.id,
      currentStudent.name,
      currentStudent.admissionNumber || '806',
      currentStudent.roll || '03',
      currentStudent.photo
    );
  }, [gradeCards, currentStudent]);

  const [selectedExamTerm, setSelectedExamTerm] = useState<string>('Half Yearly Examination');

  // Extract marks for THIS student across all subjects for selected exam term
  const mySubjectMarks = useMemo(() => {
    const results: {
      marksheetId: string;
      subject: string;
      maxMarks: number;
      passMarks: number;
      examDate: string;
      entry: StudentMarkEntry;
    }[] = [];

    allStoredMarksheets.forEach(sheet => {
      const isMatch =
        sheet.examTerm === selectedExamTerm ||
        (selectedExamTerm === 'Half Yearly Examination' &&
          (sheet.examTerm?.includes('Half') || sheet.examTerm?.includes('First') || sheet.examTerm?.includes('Midterm'))) ||
        (selectedExamTerm === 'Annual Examination' &&
          (sheet.examTerm?.includes('Annual') || sheet.examTerm?.includes('Final')));

      if (isMatch) {
        // Find this student's row
        const entry = sheet.entries.find(
          e =>
            e.studentId === currentStudent.id ||
            (currentStudent.admissionNumber && e.admissionNumber === currentStudent.admissionNumber) ||
            e.studentName.toLowerCase() === currentStudent.name.toLowerCase() ||
            (currentStudent.roll && e.roll === currentStudent.roll)
        );

        if (entry && entry.marksObtained !== null) {
          results.push({
            marksheetId: sheet.id,
            subject: sheet.subject,
            maxMarks: sheet.maxMarks,
            passMarks: sheet.passMarks,
            examDate: sheet.examDate,
            entry
          });
        }
      }
    });

    return results;
  }, [allStoredMarksheets, selectedExamTerm, currentStudent]);

  // Summary statistics for this student's marksheet
  const totalMarksObtained = mySubjectMarks.reduce((sum, s) => sum + (s.entry.marksObtained || 0), 0);
  const totalMaxMarks = mySubjectMarks.reduce((sum, s) => sum + s.maxMarks, 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

  const averageGpa = useMemo(() => {
    if (mySubjectMarks.length === 0) return currentStudent.gpa || 3.9;
    const totalGpa = mySubjectMarks.reduce((sum, s) => sum + (s.entry.gpa || 4.0), 0);
    return +(totalGpa / mySubjectMarks.length).toFixed(2);
  }, [mySubjectMarks, currentStudent]);

  const overallGrade = useMemo(() => {
    if (averageGpa >= 4.8) return 'A+';
    if (averageGpa >= 4.0) return 'A';
    if (averageGpa >= 3.5) return 'A-';
    if (averageGpa >= 3.0) return 'B';
    if (averageGpa >= 2.0) return 'C';
    return 'D';
  }, [averageGpa]);

  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-y-auto overflow-x-hidden scroll-smooth">
      {/* Top Student Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  AL-USWAH STUDENT PORTAL
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Online
                </span>
                {hasAnyDelegatedAccess && (
                  <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    Officer Privileges
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                AL-USWAH • Student Console
              </h1>
            </div>
          </div>

          {/* Student Profile & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Student Card Summary */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <img
                src={
                  currentStudent.photo ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentStudent.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-600"
              />
              <div className="text-left text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{currentStudent.name}</span>
                  {currentStudent.roll && (
                    <span className="text-[10px] text-indigo-300 font-mono">
                      (Roll #{currentStudent.roll})
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-cyan-300">
                  {currentStudent.admissionNumber || 'ADM-2026-015'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Log Out of Student Portal"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs with Scroll Support */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto pb-1 scroll-smooth touch-pan-x">
          <nav className="flex space-x-1 sm:space-x-2 py-2">
            {[
              { id: 'overview', label: 'My Overview', icon: User },
              { id: 'balance', label: 'My Balance & Fees', icon: Wallet, badge: currentBalanceRemaining > 0 ? `$${currentBalanceRemaining}` : undefined },
              { id: 'attendance', label: 'My Attendance', icon: CheckCircle, badge: `${calculatedAttendanceRate}%` },
              { id: 'messages', label: 'My Messages', icon: MessageSquare, badge: myMessages.length },
              { id: 'routine', label: 'Class Routine', icon: Calendar },
              { id: 'notices', label: 'Class Notices', icon: Bell },
              { id: 'files', label: 'Class Files', icon: BookOpen },
              { id: 'marksheet', label: 'My Marksheet', icon: Award, highlight: true },
              ...(canManageFunds
                ? [{ id: 'manage_funds', label: 'Class Funds & Dues', icon: Wallet, isOfficerTab: true, badge: 'Cashier' }]
                : []),
              ...(canManageAttendance
                ? [{ id: 'manage_attendance', label: 'Attendance Register', icon: CheckCircle, isOfficerTab: true, badge: 'Register' }]
                : []),
              ...(canManageMarks
                ? [{ id: 'manage_marks', label: 'Marks & Ledger', icon: Award, isOfficerTab: true, badge: 'Marks Portal' }]
                : []),
              ...(canManageRoutine
                ? [{ id: 'manage_routine', label: 'Routine Builder', icon: Calendar, isOfficerTab: true, badge: 'Routine' }]
                : []),
              ...(canManageNotices
                ? [{ id: 'manage_notices', label: 'Notices Manager', icon: Bell, isOfficerTab: true, badge: 'Notices' }]
                : []),
              ...(canManageFiles
                ? [{ id: 'manage_files', label: 'Files Manager', icon: BookOpen, isOfficerTab: true, badge: 'Files' }]
                : []),
              ...(canManageWebsite
                ? [{ id: 'manage_website', label: 'Website Builder', icon: Sparkles, isOfficerTab: true, badge: 'CMS' }]
                : [])
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isOfficer = (tab as any).isOfficerTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as StudentTab);
                    playChime('click');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? tab.highlight
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                        : isOfficer
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : isOfficer
                      ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-black/20 text-white'
                          : isOfficer
                          ? 'bg-amber-500/20 text-amber-200'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Persistent Sub-page Close & Return Navigation Bar */}
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm animate-in fade-in">
            <button
              onClick={() => {
                setActiveTab('overview');
                playChime('click');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm border border-slate-700"
            >
              <span>← Back to My Overview</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('overview');
                playChime('click');
              }}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Close section and return to Overview"
            >
              <X size={14} />
              <span>Close View [✕]</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Student Welcome Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      currentStudent.photo ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={currentStudent.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-indigo-400/80 shadow-xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Welcome Back Student
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        AL-USWAH Science
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                      {currentStudent.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-300">
                      <span className="font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-800/50">
                        Admission #{currentStudent.admissionNumber || 'ADM-2026-015'}
                      </span>
                      <span>•</span>
                      <span>Roll: <strong>{currentStudent.roll || '03'}</strong></span>
                      <span>•</span>
                      <span>Status: <strong className="text-emerald-400">ACTIVE</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('marksheet')}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award size={15} />
                    <span>View My Marksheet</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('balance')}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wallet size={15} />
                    <span>Check My Balance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Delegated Management Responsibilities Banner */}
            {hasAnyDelegatedAccess && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-slate-900 border border-amber-500/30 shadow-xl space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                        <span>Authorized Management Portals</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                          Delegated Access
                        </span>
                      </h3>
                      <p className="text-[11px] text-amber-200/80">
                        You have been granted official permissions by the administration to manage the following portals:
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Direct Officer Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {canManageFunds && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_funds');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                          <Wallet size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                            💰 Class Funds & Dues
                          </div>
                          <div className="text-[10px] text-slate-400">Cashier ledger, dues & collections</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-amber-400 transition" />
                    </button>
                  )}

                  {canManageAttendance && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_attendance');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                          <CheckCircle size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                            📋 Attendance Register
                          </div>
                          <div className="text-[10px] text-slate-400">Mark & update daily attendance</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-cyan-400 transition" />
                    </button>
                  )}

                  {canManageMarks && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_marks');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                          <Award size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-rose-300 transition">
                            📝 Marks & Evaluation Ledger
                          </div>
                          <div className="text-[10px] text-slate-400">Enter scores, add subjects & cards</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-rose-400 transition" />
                    </button>
                  )}

                  {canManageRoutine && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_routine');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                            📅 Class Routine Builder
                          </div>
                          <div className="text-[10px] text-slate-400">Manage periods & subjects</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-indigo-400 transition" />
                    </button>
                  )}

                  {canManageNotices && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_notices');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                          <Bell size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                            📢 Class Notices Manager
                          </div>
                          <div className="text-[10px] text-slate-400">Publish class announcements</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-amber-400 transition" />
                    </button>
                  )}

                  {canManageFiles && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_files');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                            📁 Class Files Management
                          </div>
                          <div className="text-[10px] text-slate-400">Upload & manage shared docs</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-blue-400 transition" />
                    </button>
                  )}

                  {canManageWebsite && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_website');
                        playChime('click');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-850 transition text-left flex items-center justify-between group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                            🌐 Public Website Builder
                          </div>
                          <div className="text-[10px] text-slate-400">Modify CMS, pages & theme</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-emerald-400 transition" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: My Balance */}
              <div
                onClick={() => setActiveTab('balance')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold">My Fee Balance</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                    <Wallet size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  ${currentBalanceRemaining.toLocaleString()}
                </div>
                <div className="mt-2 text-xs flex items-center gap-1.5">
                  {currentBalanceRemaining === 0 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={13} /> All dues settled
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock size={13} /> Due this month
                    </span>
                  )}
                  <span className="text-slate-500">• Billed ${totalDuesBilled}</span>
                </div>
              </div>

              {/* Card 2: My Attendance Rate */}
              <div
                onClick={() => setActiveTab('attendance')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold">My Attendance</span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
                    <CheckCircle size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {calculatedAttendanceRate}%
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="text-emerald-400 font-bold">{presentDays} days present</span> out of {totalAttendanceDays} recorded
                </div>
              </div>

              {/* Card 3: My GPA / Academic Grade */}
              <div
                onClick={() => setActiveTab('marksheet')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold">Current GPA & Grade</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                    <Award size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
                  <span>{averageGpa.toFixed(2)}</span>
                  <span className="text-sm px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Grade {overallGrade}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <span>{mySubjectMarks.length} subjects recorded in 1st Term</span>
                </div>
              </div>

              {/* Card 4: Messages from IT Office */}
              <div
                onClick={() => setActiveTab('messages')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold">IT Office Messages</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
                    <MessageSquare size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {myMessages.length} Messages
                </div>
                <div className="mt-2 text-xs text-purple-400 flex items-center gap-1">
                  <Sparkles size={13} />
                  <span>Real-time channel active</span>
                </div>
              </div>
            </div>

            {/* Two-column Layout: Today's Routine & Latest Class Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-400" />
                    <h3 className="font-extrabold text-white text-base">
                      Today's Class Schedule ({selectedRoutineDay})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('routine')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Week</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {dayRoutineList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl">
                      No scheduled periods found for {selectedRoutineDay}. Check the routine tab.
                    </div>
                  ) : (
                    dayRoutineList.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            P{item.period}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">
                              {item.subject}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {item.teacher} • Room {item.room}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs text-cyan-300 font-semibold">
                            {item.startTime}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Latest Class Notices */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-rose-400" />
                    <h3 className="font-extrabold text-white text-base">
                      Recent Class Announcements
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('notices')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>All Notices</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {notices.slice(0, 3).map(notice => (
                    <div
                      key={notice.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            notice.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {notice.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {notice.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white">{notice.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {notice.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MY BALANCE & FEES (ONLY THEIR OWN) */}
        {/* ============================================================== */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Wallet size={14} />
                  <span>Student Financial Account (Private to {currentStudent.name})</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  My Balance, Tuition & Dues
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified records of your tuition, laboratory fees, and activity contributions. Only your personal ledger is shown.
                </p>
              </div>

              <div className="text-right p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Current Outstanding Due
                </span>
                <span
                  className={`text-2xl font-black font-mono ${
                    currentBalanceRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  ${currentBalanceRemaining.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow">
                <span className="text-xs text-slate-400 font-medium">Total Billed to Date</span>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  ${totalDuesBilled.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  AL-USWAH Academic Year 2026
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow">
                <span className="text-xs text-slate-400 font-medium">Total Paid by You</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                  ${totalDuesPaid.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400/80 mt-1 block flex items-center gap-1">
                  <CheckCircle size={12} /> Verified by Cashier & IT Lead
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow">
                <span className="text-xs text-slate-400 font-medium">Payment Clearance</span>
                <div className="text-2xl font-bold text-cyan-400 mt-1">
                  {totalDuesBilled > 0 ? `${Math.round((totalDuesPaid / totalDuesBilled) * 100)}%` : '100%'}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {currentBalanceRemaining === 0 ? 'Fully Cleared' : 'Pending balance remaining'}
                </span>
              </div>
            </div>

            {/* My Detailed Invoices & Dues List */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Receipt size={17} className="text-indigo-400" />
                <span>My Invoice & Fee Items</span>
              </h3>

              {myDues.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                  <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">All Clear! No Dues Pending</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You have zero outstanding dues recorded. If you made a recent deposit, the Cashier receipt will be reflected here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pl-2">Fee Description</th>
                        <th className="pb-3">Due Date</th>
                        <th className="pb-3">Total Amount</th>
                        <th className="pb-3">Amount Paid</th>
                        <th className="pb-3">Remaining</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-2 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {myDues.map(item => {
                        const remaining = Math.max(0, item.totalDue - item.paidAmount);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 pl-2 font-bold text-white">
                              {item.title}
                              {item.notes && (
                                <span className="block text-[11px] text-slate-400 font-normal">
                                  {item.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 font-mono text-slate-300">{item.dueDate}</td>
                            <td className="py-3.5 font-mono font-bold text-white">${item.totalDue}</td>
                            <td className="py-3.5 font-mono text-emerald-400 font-bold">${item.paidAmount}</td>
                            <td className="py-3.5 font-mono font-bold text-amber-300">
                              ${remaining}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'PAID'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : item.status === 'PARTIAL'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3.5 pr-2 text-right">
                              <button
                                onClick={() => setSelectedReceipt(item)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition cursor-pointer"
                              >
                                View Voucher
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Receipt Modal */}
            {selectedReceipt && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Receipt size={18} className="text-emerald-400" />
                      <h4 className="font-extrabold text-white text-sm">
                        AL-USWAH Official Money Voucher
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedReceipt(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student Name:</span>
                      <strong className="text-white">{currentStudent.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Admission No:</span>
                      <strong className="text-cyan-300 font-mono">{currentStudent.admissionNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee Title:</span>
                      <strong className="text-white">{selectedReceipt.title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <strong className="text-emerald-400 font-mono font-bold">${selectedReceipt.paidAmount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balance Remaining:</span>
                      <strong className="text-amber-400 font-mono font-bold">
                        ${Math.max(0, selectedReceipt.totalDue - selectedReceipt.paidAmount)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <strong className="text-white">{selectedReceipt.status}</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 text-center">
                    Signed & verified digitally by Class IT Officer (Abu Saleh) & Cashier.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedReceipt(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Printer size={13} />
                      <span>Print Voucher</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MY ATTENDANCE (ONLY THEIR OWN) */}
        {/* ============================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <CheckCircle size={14} />
                  <span>Personal Attendance Profile</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  My Attendance History ({calculatedAttendanceRate}%)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed day-by-day logs for {currentStudent.name}. Only your presence records are displayed.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold border ${
                    calculatedAttendanceRate >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : calculatedAttendanceRate >= 80
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {calculatedAttendanceRate >= 90
                    ? '✨ Excellent Standing'
                    : calculatedAttendanceRate >= 80
                    ? 'Good Standing'
                    : 'Attendance Warning'}
                </span>
              </div>
            </div>

            {/* Attendance Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Working Days</span>
                <div className="text-2xl font-black text-white mt-0.5">{totalAttendanceDays}</div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400">Days Present</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{presentDays}</div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400">Days Late</span>
                <div className="text-2xl font-black text-amber-400 mt-0.5">{lateDays}</div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400">Days Absent</span>
                <div className="text-2xl font-black text-rose-400 mt-0.5">{absentDays}</div>
              </div>
            </div>

            {/* Daily Attendance Logs */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-extrabold text-white text-base">
                Daily Attendance Logs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myAttendanceRecords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-white">
                        {item.date}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.dayName || 'School Day'}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'PRESENT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'LATE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MY MESSAGES (SAME AS ADMIN MESSAGING SYSTEM) */}
        {/* ============================================================== */}
        {activeTab === 'messages' && <StudentMessagingSystem />}

        {/* ============================================================== */}
        {/* TAB 5: CLASS ROUTINE */}
        {/* ============================================================== */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Calendar size={14} />
                  <span>Academic Timetable</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  AL-USWAH Weekly Routine
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full timetable across all 6 days. Periods, subject teachers, and smart laboratory allocations.
                </p>
              </div>

              {/* Day Selector Buttons */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedRoutineDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedRoutineDay.toLowerCase() === day.toLowerCase()
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Routine Schedule Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayRoutineList.map(period => (
                <div
                  key={period.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                      Period #{period.period}
                    </span>
                    <span className="font-mono text-xs text-cyan-300 font-bold">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white">{period.subject}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">Teacher: {period.teacher}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Room: <strong>{period.room}</strong></span>
                    <span>AL-USWAH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: CLASS NOTICES */}
        {/* ============================================================== */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <Bell size={14} />
                  <span>Official Class Notices</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Announcements & Exam Bulletins
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified updates posted by Head Teacher Dr. Nusrat Jahan and Class IT Officer Abu Saleh.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                {['ALL', 'URGENT', 'EXAM', 'FUND', 'SCHEDULE'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNoticeCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      noticeCategoryFilter === cat
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Notices List */}
            <div className="space-y-4">
              {filteredNotices.map(notice => (
                <div
                  key={notice.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          notice.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {notice.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        By {notice.author}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500">{notice.date}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-white">{notice.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: CLASS FILES & STUDY MATERIALS */}
        {/* ============================================================== */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <BookOpen size={14} />
                  <span>Study Notes & Lecture Slides</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  AL-USWAH Document Vault
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Download syllabus PDFs, physics derivations, mathematics handouts, and routine copies.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={e => setFileSearch(e.target.value)}
                    placeholder="Search files..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {file.category}
                      </span>
                      <span className="font-mono text-[11px] text-cyan-300 font-bold">
                        {file.size}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-white line-clamp-2">
                      {file.name}
                    </h3>

                    {file.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{file.uploadedAt}</span>
                    <button
                      onClick={() => setPreviewingFile(file)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* File Preview Modal */}
            {previewingFile && (
              <div
                onClick={e => {
                  if (e.target === e.currentTarget) setPreviewingFile(null);
                }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
              >
                <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-indigo-400" />
                      <h4 className="font-extrabold text-white text-sm">Download Verified Study Material</h4>
                    </div>
                    <button
                      onClick={() => setPreviewingFile(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-white text-sm">{previewingFile.name}</div>
                    <div className="text-slate-400">Subject: <strong className="text-slate-200">{previewingFile.subject}</strong></div>
                    <div className="text-slate-400">File Size: <strong className="text-cyan-300 font-mono">{previewingFile.size}</strong></div>
                    <div className="text-slate-400">Uploaded by: <strong className="text-slate-200">{previewingFile.uploader}</strong></div>
                    {previewingFile.description && (
                      <div className="text-slate-300 pt-2 border-t border-slate-800/80">{previewingFile.description}</div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setPreviewingFile(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        addNotification({
                          title: 'Download Started',
                          message: `${previewingFile.name} is downloading to your device.`,
                          type: 'success'
                        });
                        setPreviewingFile(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>Save / Download File</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: MY MARKSHEET (ONLY THIS STUDENT'S ROW!) */}
        {/* ============================================================== */}
        {activeTab === 'marksheet' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Award size={14} />
                  <span>Student Academic Marksheet</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  My Marksheet & Subject Evaluation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official report card for <strong>{currentStudent.name}</strong> (Roll #{currentStudent.roll || '03'} • Admission #{currentStudent.admissionNumber}).
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Exam Term Selector */}
                <select
                  value={selectedExamTerm}
                  onChange={e => setSelectedExamTerm(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
                >
                  <option value="Half Yearly Examination">Half Yearly Examination</option>
                  <option value="Annual Examination">Annual Examination</option>
                </select>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Award size={14} />
                  <span>View & Print Grade Card (PDF Template)</span>
                </button>
              </div>
            </div>

            {/* Overall Marksheet Highlights Card */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow">
                <span className="text-xs text-slate-400">Total Marks Obtained</span>
                <div className="text-2xl font-black text-white mt-1 font-mono">
                  {totalMarksObtained} <span className="text-sm text-slate-500">/ {totalMaxMarks}</span>
                </div>
                <span className="text-[11px] text-cyan-300 mt-1 block font-mono">
                  Score: {overallPercentage}%
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow">
                <span className="text-xs text-slate-400">Overall Grade</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  Grade {overallGrade}
                </div>
                <span className="text-[11px] text-amber-300/80 mt-1 block">
                  Grade Point Average: {averageGpa.toFixed(2)}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow">
                <span className="text-xs text-slate-400">Evaluation Result</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  PASSED
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  All subjects passed
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow">
                <span className="text-xs text-slate-400">Subjects Recorded</span>
                <div className="text-2xl font-black text-indigo-400 mt-1">
                  {mySubjectMarks.length} Subjects
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  AL-USWAH Science Group
                </span>
              </div>
            </div>

            {/* Subject-Wise Marksheet Table */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  <span>Subject-Wise Marks Breakdown</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Exam Term: <strong className="text-white">{selectedExamTerm}</strong>
                </span>
              </div>

              {mySubjectMarks.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <AlertCircle size={30} className="text-amber-400 mx-auto" />
                  <div className="text-sm font-bold text-white">No Marks Submitted for {selectedExamTerm}</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    The Class IT Officer has not submitted marks for this exam session yet. Switch to "First Term Examination 2026" to view published records.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pl-3">Subject Name</th>
                        <th className="pb-3">Max Marks</th>
                        <th className="pb-3">Pass Marks</th>
                        <th className="pb-3">Marks Obtained</th>
                        <th className="pb-3">Percentage</th>
                        <th className="pb-3">Grade</th>
                        <th className="pb-3">GPA</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-3">Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {mySubjectMarks.map(item => (
                        <tr key={item.marksheetId} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 pl-3 font-bold text-white">
                            {item.subject}
                          </td>
                          <td className="py-3.5 font-mono text-slate-400">{item.maxMarks}</td>
                          <td className="py-3.5 font-mono text-slate-400">{item.passMarks}</td>
                          <td className="py-3.5 font-mono font-bold text-emerald-400 text-sm">
                            {item.entry.marksObtained}
                          </td>
                          <td className="py-3.5 font-mono font-semibold text-cyan-300">
                            {item.entry.percentage || Math.round(((item.entry.marksObtained || 0) / item.maxMarks) * 100)}%
                          </td>
                          <td className="py-3.5 font-bold text-amber-300">
                            {item.entry.grade || 'A+'}
                          </td>
                          <td className="py-3.5 font-mono font-bold text-white">
                            {item.entry.gpa ? item.entry.gpa.toFixed(1) : '5.0'}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.entry.status === 'PASSED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {item.entry.status || 'PASSED'}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3 text-[11px] text-slate-300 italic max-w-xs truncate">
                            {item.entry.remarks || 'Commendable performance and attention to detail.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Official University Grade Card Modal (PDF Template Replica) */}
            {showPrintModal && (
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowPrintModal(false);
                }}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed-none"
              >
                {/* Floating Sticky Close Button that NEVER scrolls away */}
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="fixed top-4 right-4 z-[70] px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition cursor-pointer print:hidden border border-rose-400"
                >
                  <X size={15} />
                  <span>Close Window [✕]</span>
                </button>

                <div className="w-full max-w-4xl my-8 relative animate-in fade-in zoom-in-95 print:my-0 print:max-w-none">
                  <GradeCardTemplate
                    card={myGradeCard}
                    onClose={() => setShowPrintModal(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* DELEGATED MANAGEMENT TABS (ACCESSIBLE ONLY IF PERMITTED)       */}
        {/* ============================================================== */}
        {activeTab === 'manage_funds' && canManageFunds && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Class Funds, Ledger & Student Dues</span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">Authorized as Cashier / Manager for {currentStudent.name}</span>
            </div>
            <SuperAdminFunds />
          </div>
        )}

        {activeTab === 'manage_attendance' && canManageAttendance && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Class Attendance Management</span>
              </div>
              <span className="text-[11px] text-cyan-400 font-medium">Authorized Attendance Officer</span>
            </div>
            <SuperAdminAttendance />
          </div>
        )}

        {activeTab === 'manage_marks' && canManageMarks && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Student Marks Portal & Evaluation Ledger</span>
              </div>
              <span className="text-[11px] text-rose-400 font-medium">Authorized Evaluation Officer</span>
            </div>
            <SuperAdminMarksPortal />
          </div>
        )}

        {activeTab === 'manage_routine' && canManageRoutine && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Class Routine Builder</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-medium">Authorized Routine Coordinator</span>
            </div>
            <SuperAdminRoutine />
          </div>
        )}

        {activeTab === 'manage_notices' && canManageNotices && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Class Notices Management</span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">Authorized Announcements Officer</span>
            </div>
            <SuperAdminNotices />
          </div>
        )}

        {activeTab === 'manage_files' && canManageFiles && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-blue-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Class Files Management</span>
              </div>
              <span className="text-[11px] text-blue-400 font-medium">Authorized Content Officer</span>
            </div>
            <SuperAdminFiles />
          </div>
        )}

        {activeTab === 'manage_website' && canManageWebsite && (
          <div className="space-y-4">
            <div className="p-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Shield size={16} />
                <span>Delegated Access: Public Website Builder & CMS</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Authorized Webmaster</span>
            </div>
            <SuperAdminWebsiteBuilder />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500 space-y-1">
        <div>
          AL-USWAH Student Portal • AL-USWAH Smart Management System
        </div>
        <div className="text-[11px] text-slate-600">
          Logged in as {currentStudent.name} (Admission #{currentStudent.admissionNumber || 'ADM-2026-015'})
        </div>
      </footer>
    </div>
  );
};
