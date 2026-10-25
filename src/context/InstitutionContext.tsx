import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockClassStats, ClassStats, mockRoutines } from '../data/mockData';
import { useNotifications } from './NotificationContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserRole,
  UserPermissions,
  ClassRoutineItem,
  StudentDueRecord,
  FundTransactionItem,
  ClassFileItem
} from '../types';

export interface ManagedClassMember {
  id: string;
  name: string;
  email: string;
  admissionNumber: string;
  role: UserRole;
  roll?: string;
  phone?: string;
  photo?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  gender?: 'Boy' | 'Girl';
  attendanceRate?: number;
  gpa?: number;
  username?: string;
  password?: string;
  isCashier?: boolean;
  permissions?: UserPermissions;
}

export interface ClassNotice {
  id: string;
  title: string;
  category: 'URGENT' | 'EXAM' | 'FUND' | 'SCHEDULE' | 'EVENT' | 'GENERAL' | 'Academic';
  noticeType: 'URGENT' | 'EXAM' | 'FUND' | 'SCHEDULE' | 'EVENT' | 'GENERAL';
  date: string;
  author: string;
  content: string;
  priority: 'high' | 'normal';
}

export interface ClassAchievementItem {
  id: string;
  title: string;
  student: string;
  award: string;
  category: string;
}

interface ClassContextType {
  stats: ClassStats;
  studentsList: ManagedClassMember[];
  notices: ClassNotice[];
  achievements: ClassAchievementItem[];
  routines: ClassRoutineItem[];
  fundTransactions: FundTransactionItem[];
  studentDues: StudentDueRecord[];
  classFiles: ClassFileItem[];
  attendanceHistory: Record<string, Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>;
  
  // Stats & Sync
  updateStudentCount: (newCount: number, updatedBy?: string) => void;
  updateStats: (fields: Partial<ClassStats>, updatedBy?: string) => void;
  resetToDefaults: () => void;
  
  // User Management (Photo, Admission No, Email, Edit, Delete)
  addUser: (user: Omit<ManagedClassMember, 'id'>) => ManagedClassMember;
  updateUser: (id: string, user: Partial<ManagedClassMember>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  toggleCashierRole: (userId: string) => void;
  updateUserPermissions: (userId: string, perms: Partial<UserPermissions>) => void;

  // Attendance Taking by Date & Month
  saveAttendance: (date: string, records: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>) => void;
  getAttendanceForDate: (date: string) => Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>;

  // Funds, Income, Expense, Dues & Student Payments
  addIncome: (title: string, amount: number, category: string, date?: string, studentId?: string, receiptNumber?: string) => void;
  addExpense: (title: string, amount: number, category: string, date?: string, receiptNumber?: string) => void;
  addStudentDue: (studentId: string, title: string, amount: number, dueDate: string, notes?: string) => void;
  recordStudentPayment: (dueId: string, amount: number, paymentMethod?: string, date?: string) => void;
  updateCashierBalance: (newBalance: number) => void;

  // Routine Management
  addRoutineSlot: (slot: Omit<ClassRoutineItem, 'id'>) => void;
  updateRoutineSlot: (id: string, slot: Partial<ClassRoutineItem>) => void;
  deleteRoutineSlot: (id: string) => void;
  resetRoutine: () => void;

  // Notice Management with Notice Types (Urgent, Exam, Fund, etc.)
  addNotice: (notice: {
    title: string;
    content: string;
    noticeType: 'URGENT' | 'EXAM' | 'FUND' | 'SCHEDULE' | 'EVENT' | 'GENERAL';
    priority?: 'high' | 'normal';
    author?: string;
  }) => void;
  deleteNotice: (id: string) => void;

  // Class Files Management (Upload by name, view/download, delete)
  addClassFile: (file: {
    name: string;
    category: string;
    subject: string;
    size?: string;
    fileType?: string;
    url?: string;
    description?: string;
  }) => void;
  deleteClassFile: (id: string) => void;

  // Backward compatibility
  gradeEnrollments: { grade: string; count: number; sections: string; classTeacher: string }[];

  // Cloud Firestore Sync
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  saveAllClassDataToFirebase: () => Promise<void>;
}

const defaultMembers: ManagedClassMember[] = [
  {
    id: 'u_1',
    name: 'Abu Saleh',
    email: 'superadminabu@smartclass.pro',
    admissionNumber: 'ADM-001',
    role: 'SUPER_ADMIN',
    roll: 'IT',
    phone: '+1 (555) 700-1122',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    gender: 'Boy',
    attendanceRate: 100,
    gpa: 4.0,
    username: 'superadminabu@smartclass.pro',
    password: 'superadminabuforsmartclass.pro'
  }
];

const defaultNotices: ClassNotice[] = [];

const defaultInitialTransactions: FundTransactionItem[] = [];

const defaultInitialDues: StudentDueRecord[] = [];

const defaultInitialFiles: ClassFileItem[] = [];

const defaultAchievements: ClassAchievementItem[] = [];

// Clean blank app initialization version (Pure Blank Application & Clean Attendance)
const BLANK_APP_VERSION = 'smartclass_blank_v7_clean_attendance';
if (typeof window !== 'undefined' && localStorage.getItem(BLANK_APP_VERSION) !== 'true') {
  localStorage.removeItem('smartclass_ourclass_stats');
  localStorage.removeItem('smartclass_ourclass_members');
  localStorage.removeItem('smartclass_ourclass_notices');
  localStorage.removeItem('smartclass_ourclass_routines');
  localStorage.removeItem('smartclass_ourclass_transactions');
  localStorage.removeItem('smartclass_ourclass_dues');
  localStorage.removeItem('smartclass_ourclass_files');
  localStorage.removeItem('smartclass_ourclass_attendance');
  localStorage.removeItem('smartclass_grade_cards');
  localStorage.removeItem('smartclass_marksheets');
  localStorage.removeItem('smartclass_chat_messages');
  localStorage.removeItem('smartclass_chat_conversations');
  localStorage.removeItem('smartclass_notifications');
  localStorage.removeItem('smartclass_student_data');
  localStorage.removeItem('smartclass_student_id');
  localStorage.removeItem('smartclass_role');
  localStorage.setItem(BLANK_APP_VERSION, 'true');
}

const InstitutionContext = createContext<ClassContextType | undefined>(undefined);

export const InstitutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playChime, addNotification } = useNotifications();

  // Stats
  const [stats, setStats] = useState<ClassStats>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_stats');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockClassStats;
  });

  // Users / Members
  const [studentsList, setStudentsList] = useState<ManagedClassMember[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: ManagedClassMember) => {
            const def = defaultMembers.find(d => d.id === m.id);
            return {
              ...m,
              username: m.username || def?.username || m.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'student',
              password: m.password || def?.password || 'student123'
            };
          });
        }
      }
    } catch {
      // fallback
    }
    return defaultMembers;
  });

  // Notices
  const [notices, setNotices] = useState<ClassNotice[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_notices');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultNotices;
  });

  // Routines
  const [routines, setRoutines] = useState<ClassRoutineItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_routines');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockRoutines;
  });

  // Fund Transactions
  const [fundTransactions, setFundTransactions] = useState<FundTransactionItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultInitialTransactions;
  });

  // Student Dues
  const [studentDues, setStudentDues] = useState<StudentDueRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_dues');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultInitialDues;
  });

  // Class Files
  const [classFiles, setClassFiles] = useState<ClassFileItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_files');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultInitialFiles;
  });

  // Attendance History: date string -> { [memberId]: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [attendanceHistory, setAttendanceHistory] = useState<
    Record<string, Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>
  >(() => {
    try {
      const saved = localStorage.getItem('smartclass_ourclass_attendance');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const [achievements] = useState<ClassAchievementItem[]>(defaultAchievements);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_members', JSON.stringify(studentsList));
  }, [studentsList]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_transactions', JSON.stringify(fundTransactions));
  }, [fundTransactions]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_dues', JSON.stringify(studentDues));
  }, [studentDues]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_files', JSON.stringify(classFiles));
  }, [classFiles]);

  useEffect(() => {
    localStorage.setItem('smartclass_ourclass_attendance', JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubStats = onSnapshot(doc(db, 'class_settings', 'current'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats(prev => ({ ...prev, ...data }));
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubMembers = onSnapshot(doc(db, 'members', 'roster_list'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.members) && data.members.length > 0) {
          setStudentsList(data.members);
        }
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubNotices = onSnapshot(doc(db, 'notices', 'all_notices'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.notices)) setNotices(data.notices);
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubRoutines = onSnapshot(doc(db, 'routines', 'weekly_timetable'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.routines)) setRoutines(data.routines);
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubTx = onSnapshot(doc(db, 'transactions', 'all_transactions'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.transactions)) setFundTransactions(data.transactions);
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubDues = onSnapshot(doc(db, 'dues', 'all_dues'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.dues)) setStudentDues(data.dues);
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubFiles = onSnapshot(doc(db, 'files', 'all_files'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.files)) setClassFiles(data.files);
      }
    }, () => setCloudSyncStatus('offline'));

    const unsubAttendance = onSnapshot(doc(db, 'attendance', 'all_records'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.history) setAttendanceHistory(data.history);
      }
    }, () => setCloudSyncStatus('offline'));

    return () => {
      unsubStats();
      unsubMembers();
      unsubNotices();
      unsubRoutines();
      unsubTx();
      unsubDues();
      unsubFiles();
      unsubAttendance();
    };
  }, []);

  // Save all class records to Firestore
  const saveAllClassDataToFirebase = async () => {
    setCloudSyncStatus('syncing');
    try {
      await Promise.all([
        setDoc(doc(db, 'class_settings', 'current'), { ...stats, updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'members', 'roster_list'), { members: studentsList, name: 'AL-USWAH Roster', updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'notices', 'all_notices'), { notices, title: 'Class Notices', updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'routines', 'weekly_timetable'), { routines, subject: 'Weekly Schedule', updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'transactions', 'all_transactions'), { transactions: fundTransactions, title: 'Ledger Records', updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'dues', 'all_dues'), { dues: studentDues, title: 'Class Dues', updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'files', 'all_files'), { files: classFiles, name: 'Course Materials', updatedAt: new Date().toISOString() }, { merge: true }),
        setDoc(doc(db, 'attendance', 'all_records'), { history: attendanceHistory, updatedAt: new Date().toISOString() }, { merge: true })
      ]);
      setCloudSyncStatus('synced');
      playChime('success');
      addNotification({
        title: 'All Data Saved in Firebase',
        message: 'Members, attendance, funds, routines & notices are saved in Firestore.',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to sync to Firestore:', err);
      setCloudSyncStatus('error');
    }
  };

  // Debounced auto-save to Firestore whenever data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDoc(doc(db, 'class_settings', 'current'), { ...stats, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'members', 'roster_list'), { members: studentsList, name: 'AL-USWAH Roster', updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'notices', 'all_notices'), { notices, title: 'Class Notices', updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'routines', 'weekly_timetable'), { routines, subject: 'Weekly Schedule', updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'transactions', 'all_transactions'), { transactions: fundTransactions, title: 'Ledger Records', updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'dues', 'all_dues'), { dues: studentDues, title: 'Class Dues', updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'files', 'all_files'), { files: classFiles, name: 'Course Materials', updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'attendance', 'all_records'), { history: attendanceHistory, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [stats, studentsList, notices, routines, fundTransactions, studentDues, classFiles, attendanceHistory]);

  // Keep fund balance in sync
  useEffect(() => {
    const totalInc = fundTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExp = fundTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);
    const calculatedBalance = Math.max(0, totalInc - totalExp);
    if (stats.classFundBalance !== calculatedBalance) {
      setStats(prev => ({ ...prev, classFundBalance: calculatedBalance }));
    }
  }, [fundTransactions]);

  const updateStudentCount = (newCount: number, updatedBy: string = 'Abu Saleh (Class IT Officer)') => {
    setStats(prev => ({
      ...prev,
      totalStudents: newCount,
      lastUpdatedBy: updatedBy,
      lastUpdatedAt: 'Just now'
    }));

    playChime('success');
    addNotification({
      title: 'Class Student Count Updated',
      message: `Total students in AL-USWAH updated to ${newCount} by ${updatedBy}.`,
      type: 'success'
    });
  };

  const updateStats = (fields: Partial<ClassStats>, updatedBy: string = 'Abu Saleh (Class IT Officer)') => {
    setStats(prev => ({
      ...prev,
      ...fields,
      lastUpdatedBy: updatedBy,
      lastUpdatedAt: 'Just now'
    }));

    playChime('success');
    addNotification({
      title: 'Class Metrics Updated',
      message: `AL-USWAH data synchronized by ${updatedBy}.`,
      type: 'info'
    });
  };

  const updateCashierBalance = (newBalance: number) => {
    setStats(prev => ({
      ...prev,
      classFundBalance: newBalance
    }));
    playChime('success');
    addNotification({
      title: 'Class Cashier Fund Updated',
      message: `Current class fund balance is now $${newBalance.toLocaleString()}.`,
      type: 'info'
    });
  };

  // User Management
  const addUser = (userData: Omit<ManagedClassMember, 'id'>) => {
    const generatedUsername =
      userData.username?.trim().toLowerCase() ||
      userData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) ||
      (userData.admissionNumber ? userData.admissionNumber.toLowerCase() : `student${Date.now().toString().slice(-4)}`);
    const generatedPassword = userData.password?.trim() || 'student123';

    const newUser: ManagedClassMember = {
      ...userData,
      username: generatedUsername,
      password: generatedPassword,
      id: `u_${Date.now()}`
    };
    setStudentsList(prev => [newUser, ...prev]);

    if (newUser.role === 'STUDENT') {
      const isGirl = newUser.gender === 'Girl';
      setStats(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + 1,
        boysCount: isGirl ? prev.boysCount : prev.boysCount + 1,
        girlsCount: isGirl ? prev.girlsCount + 1 : prev.girlsCount,
        lastUpdatedBy: 'Abu Saleh (Super Admin)',
        lastUpdatedAt: 'Just now'
      }));
    }

    playChime('success');
    addNotification({
      title: 'Class Member Added',
      message: `${newUser.name} (Admission #${newUser.admissionNumber}) enrolled as ${newUser.role}.`,
      type: 'success'
    });
    return newUser;
  };

  const updateUser = (id: string, updated: Partial<ManagedClassMember>) => {
    setStudentsList(prev =>
      prev.map(member => (member.id === id ? { ...member, ...updated } : member))
    );
    playChime('success');
    addNotification({
      title: 'User Updated',
      message: `Member profile #${id} successfully updated.`,
      type: 'success'
    });
  };

  const deleteUser = (id: string) => {
    const toDelete = studentsList.find(m => m.id === id);
    setStudentsList(prev => prev.filter(m => m.id !== id));
    if (toDelete && toDelete.role === 'STUDENT') {
      setStats(prev => ({
        ...prev,
        totalStudents: Math.max(0, prev.totalStudents - 1),
        lastUpdatedBy: 'Abu Saleh (Super Admin)'
      }));
    }
    playChime('alert');
    addNotification({
      title: 'Member Removed',
      message: `${toDelete?.name || 'User'} has been removed from the class roster.`,
      type: 'warning'
    });
  };

  const toggleUserStatus = (id: string) => {
    setStudentsList(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : m
      )
    );
    playChime('click');
  };

  const toggleCashierRole = (userId: string) => {
    setStudentsList(prev =>
      prev.map(m => {
        if (m.id === userId) {
          const newIsCashier = !m.isCashier;
          return {
            ...m,
            isCashier: newIsCashier,
            role: newIsCashier ? 'CASHIER' : (m.role === 'CASHIER' ? 'STUDENT' : m.role),
            permissions: {
              ...(m.permissions || {}),
              funds: newIsCashier
            }
          };
        }
        return m;
      })
    );
    playChime('success');
    addNotification({
      title: 'Cashier Role Updated',
      message: 'Class funds management permissions updated for this user.',
      type: 'success'
    });
  };

  const updateUserPermissions = (userId: string, perms: Partial<UserPermissions>) => {
    setStudentsList(prev =>
      prev.map(m => {
        if (m.id === userId) {
          const updatedPermissions: UserPermissions = {
            ...(m.permissions || {}),
            ...perms
          };
          return {
            ...m,
            permissions: updatedPermissions,
            isCashier: updatedPermissions.funds ?? m.isCashier
          };
        }
        return m;
      })
    );
    playChime('click');
    addNotification({
      title: 'Permissions Synchronized',
      message: 'Admin section permissions updated successfully.',
      type: 'info'
    });
  };

  // Attendance Taking
  const saveAttendance = (date: string, records: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>) => {
    setAttendanceHistory(prev => ({
      ...prev,
      [date]: records
    }));

    // Update today's attendance stats if date is today
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const studentIds = studentsList.filter(m => m.role === 'STUDENT').map(m => m.id);
      const presentCount = studentIds.filter(id => records[id] === 'PRESENT').length;
      const total = studentIds.length || 1;
      const rate = Math.round((presentCount / total) * 100);

      setStats(prev => ({
        ...prev,
        todayAttendance: presentCount,
        todayAttendanceRate: rate,
        lastUpdatedAt: 'Just now'
      }));
    }

    playChime('success');
    addNotification({
      title: 'Attendance Saved!',
      message: `Attendance for ${date} has been recorded and saved for AL-USWAH.`,
      type: 'success'
    });
  };

  const getAttendanceForDate = (date: string): Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> => {
    if (attendanceHistory[date]) {
      return attendanceHistory[date];
    }
    // Default: return all students as PRESENT
    const def: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    studentsList.forEach(m => {
      def[m.id] = 'PRESENT';
    });
    return def;
  };

  // Financials & Funds
  const addIncome = (
    title: string,
    amount: number,
    category: string,
    date?: string,
    studentId?: string,
    receiptNumber?: string
  ) => {
    const matchedStudent = studentsList.find(s => s.id === studentId);
    const newTx: FundTransactionItem = {
      id: `tx_${Date.now()}`,
      type: 'INCOME',
      title,
      amount,
      category,
      date: date || new Date().toISOString().split('T')[0],
      recordedBy: 'Abu Saleh (Super Admin)',
      receiptNumber: receiptNumber || `RCP-${Date.now().toString().slice(-4)}`,
      studentId,
      studentName: matchedStudent?.name
    };

    setFundTransactions(prev => [newTx, ...prev]);
    playChime('success');
    addNotification({
      title: 'Income Added to Class Fund',
      message: `+$${amount.toLocaleString()} for "${title}" deposited into AL-USWAH fund.`,
      type: 'success'
    });
  };

  const addExpense = (
    title: string,
    amount: number,
    category: string,
    date?: string,
    receiptNumber?: string
  ) => {
    const newTx: FundTransactionItem = {
      id: `tx_${Date.now()}`,
      type: 'EXPENSE',
      title,
      amount,
      category,
      date: date || new Date().toISOString().split('T')[0],
      recordedBy: 'Abu Saleh (Super Admin)',
      receiptNumber: receiptNumber || `VOU-${Date.now().toString().slice(-4)}`
    };

    setFundTransactions(prev => [newTx, ...prev]);
    playChime('alert');
    addNotification({
      title: 'Expense Deducted from Class Fund',
      message: `-$${amount.toLocaleString()} for "${title}" recorded from AL-USWAH fund.`,
      type: 'warning'
    });
  };

  const addStudentDue = (
    studentId: string,
    title: string,
    amount: number,
    dueDate: string,
    notes?: string
  ) => {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return;

    const newDue: StudentDueRecord = {
      id: `due_${Date.now()}`,
      studentId,
      studentName: student.name,
      roll: student.roll || 'N/A',
      admissionNumber: student.admissionNumber || 'N/A',
      title,
      totalDue: amount,
      paidAmount: 0,
      status: 'UNPAID',
      dueDate,
      notes
    };

    setStudentDues(prev => [newDue, ...prev]);
    playChime('click');
    addNotification({
      title: 'Student Due Assigned',
      message: `$${amount} due assigned to ${student.name} for "${title}".`,
      type: 'info'
    });
  };

  const recordStudentPayment = (
    dueId: string,
    amount: number,
    paymentMethod: string = 'Cash to Class Cashier',
    date?: string
  ) => {
    const targetDue = studentDues.find(d => d.id === dueId);
    if (!targetDue) return;

    const newPaidAmount = targetDue.paidAmount + amount;
    const isPaidInFull = newPaidAmount >= targetDue.totalDue;
    const paymentDate = date || new Date().toISOString().split('T')[0];

    setStudentDues(prev =>
      prev.map(d =>
        d.id === dueId
          ? {
              ...d,
              paidAmount: newPaidAmount,
              status: isPaidInFull ? 'PAID' : 'PARTIAL',
              lastPaymentDate: paymentDate
            }
          : d
      )
    );

    // Also automatically log into Fund Transactions as Income
    addIncome(
      `Student Fee Payment: ${targetDue.title} (${targetDue.studentName})`,
      amount,
      'Student Dues',
      paymentDate,
      targetDue.studentId,
      `REC-${Date.now().toString().slice(-5)}`
    );

    playChime('success');
    addNotification({
      title: 'Payment Recorded! 💰',
      message: `$${amount} received from ${targetDue.studentName}. Status: ${
        isPaidInFull ? 'Paid in Full' : 'Partial'
      } (${paymentMethod}).`,
      type: 'success'
    });
  };

  // Routine
  const addRoutineSlot = (slot: Omit<ClassRoutineItem, 'id'>) => {
    const newSlot: ClassRoutineItem = {
      ...slot,
      id: `rt_${Date.now()}`
    };
    setRoutines(prev => [...prev, newSlot]);
    playChime('success');
    addNotification({
      title: 'Class Routine Period Added',
      message: `${slot.subject} added to ${slot.day} (Period ${slot.period}).`,
      type: 'success'
    });
  };

  const updateRoutineSlot = (id: string, slot: Partial<ClassRoutineItem>) => {
    setRoutines(prev => prev.map(r => (r.id === id ? { ...r, ...slot } : r)));
    playChime('success');
    addNotification({
      title: 'Class Routine Period Updated',
      message: 'Routine slot updated and synchronized.',
      type: 'info'
    });
  };

  const deleteRoutineSlot = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    playChime('alert');
    addNotification({
      title: 'Routine Slot Removed',
      message: 'Period removed from AL-USWAH timetable.',
      type: 'warning'
    });
  };

  const resetRoutine = () => {
    setRoutines(mockRoutines);
    localStorage.removeItem('smartclass_ourclass_routines');
    playChime('click');
  };

  // Notices with Notice Types
  const addNotice = (noticeData: {
    title: string;
    content: string;
    noticeType: 'URGENT' | 'EXAM' | 'FUND' | 'SCHEDULE' | 'EVENT' | 'GENERAL';
    priority?: 'high' | 'normal';
    author?: string;
  }) => {
    const newNotice: ClassNotice = {
      id: `not_${Date.now()}`,
      title: noticeData.title,
      content: noticeData.content,
      category: noticeData.noticeType,
      noticeType: noticeData.noticeType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: noticeData.author || 'Abu Saleh (Class IT Officer - Super Admin)',
      priority: noticeData.noticeType === 'URGENT' ? 'high' : noticeData.priority || 'normal'
    };
    setNotices(prev => [newNotice, ...prev]);
    playChime('success');
    addNotification({
      title: `${noticeData.noticeType === 'URGENT' ? '🚨 URGENT NOTICE' : 'New Class Notice'} Posted`,
      message: newNotice.title,
      type: noticeData.noticeType === 'URGENT' ? 'warning' : 'info'
    });
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    playChime('alert');
  };

  // Class Files
  const addClassFile = (fileData: {
    name: string;
    category: string;
    subject: string;
    size?: string;
    fileType?: string;
    url?: string;
    description?: string;
  }) => {
    const newFile: ClassFileItem = {
      id: `f_${Date.now()}`,
      name: fileData.name,
      category: fileData.category,
      subject: fileData.subject,
      size: fileData.size || '1.5 MB',
      fileType: fileData.fileType || 'PDF',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      uploader: 'Abu Saleh (Class IT Officer)',
      url: fileData.url,
      description: fileData.description || 'Uploaded by Class IT Officer for AL-USWAH.'
    };
    setClassFiles(prev => [newFile, ...prev]);
    playChime('success');
    addNotification({
      title: 'Class File Uploaded',
      message: `"${fileData.name}" is now accessible to all class members.`,
      type: 'success'
    });
  };

  const deleteClassFile = (id: string) => {
    setClassFiles(prev => prev.filter(f => f.id !== id));
    playChime('alert');
    addNotification({
      title: 'Class File Removed',
      message: 'Document deleted from class repository.',
      type: 'warning'
    });
  };

  const resetToDefaults = () => {
    setStats(mockClassStats);
    setStudentsList(defaultMembers);
    setNotices(defaultNotices);
    setRoutines(mockRoutines);
    setFundTransactions(defaultInitialTransactions);
    setStudentDues(defaultInitialDues);
    setClassFiles(defaultInitialFiles);
    localStorage.removeItem('smartclass_ourclass_stats');
    localStorage.removeItem('smartclass_ourclass_members');
    localStorage.removeItem('smartclass_ourclass_notices');
    localStorage.removeItem('smartclass_ourclass_routines');
    localStorage.removeItem('smartclass_ourclass_transactions');
    localStorage.removeItem('smartclass_ourclass_dues');
    localStorage.removeItem('smartclass_ourclass_files');
    localStorage.removeItem('smartclass_ourclass_attendance');
    playChime('click');
  };

  const gradeEnrollments = [
    { grade: 'Boys', count: stats.boysCount, sections: 'Section A', classTeacher: 'AL-USWAH' },
    { grade: 'Girls', count: stats.girlsCount, sections: 'Section A', classTeacher: 'AL-USWAH' }
  ];

  return (
    <InstitutionContext.Provider
      value={{
        stats,
        studentsList,
        notices,
        achievements,
        routines,
        fundTransactions,
        studentDues,
        classFiles,
        attendanceHistory,
        updateStudentCount,
        updateStats,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        toggleCashierRole,
        updateUserPermissions,
        saveAttendance,
        getAttendanceForDate,
        addIncome,
        addExpense,
        addStudentDue,
        recordStudentPayment,
        updateCashierBalance,
        addRoutineSlot,
        updateRoutineSlot,
        deleteRoutineSlot,
        resetRoutine,
        addNotice,
        deleteNotice,
        addClassFile,
        deleteClassFile,
        resetToDefaults,
        gradeEnrollments,
        cloudSyncStatus,
        saveAllClassDataToFirebase
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (!context) throw new Error('useInstitution must be used within InstitutionProvider');
  return context;
};
