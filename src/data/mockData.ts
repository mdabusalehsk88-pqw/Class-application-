import {
  UserProfile,
  ClassRoutineItem,
  AttendanceRecord,
  Assignment,
  ExamResult,
  StudyMaterial,
  Quiz,
  Flashcard,
  DoubtQuestion,
  Notice,
  ChatMessage,
  FeeInvoice,
  LibraryBook,
  BusRoute,
  AchievementBadge
} from '../types';

export interface ClassStats {
  className: string;
  section: string;
  academicYear: string;
  totalStudents: number;
  boysCount: number;
  girlsCount: number;
  headTeacher: string;
  itOfficer: string;
  classLeader: string;
  cashier: string;
  todayAttendance: number;
  todayAttendanceRate: number;
  classFundBalance: number;
  activeSubjects: number;
  classroomNumber: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  institutionName?: string;
  activeTeachers?: number;
  totalClasses?: number;
  totalSections?: number;
  boardPassRate?: string;
  smartLabs?: number;
  busRoutes?: number;
  libraryVolumes?: number;
  pendingAdmissions?: number;
}

export type InstitutionStats = ClassStats;

export const mockClassStats: ClassStats = {
  className: 'AL-USWAH (Science & Technology)',
  section: 'Section A',
  academicYear: '2026 - 2027 Academic Session',
  totalStudents: 0,
  boysCount: 0,
  girlsCount: 0,
  headTeacher: 'Dr. Nusrat Jahan',
  itOfficer: 'Abu Saleh (Super Admin)',
  classLeader: 'Unassigned',
  cashier: 'Unassigned',
  todayAttendance: 0,
  todayAttendanceRate: 0,
  classFundBalance: 0,
  activeSubjects: 0,
  classroomNumber: 'Room 301',
  lastUpdatedBy: 'Abu Saleh',
  lastUpdatedAt: 'Just now',
  institutionName: 'AL-USWAH Smart Portal',
  activeTeachers: 1,
  totalClasses: 1,
  totalSections: 1,
  boardPassRate: '100% Target',
  smartLabs: 0,
  busRoutes: 0,
  libraryVolumes: 0,
  pendingAdmissions: 0
};

export const mockInstitutionStats = mockClassStats;

export const mockUsers: Record<string, UserProfile> = {
  SUPER_ADMIN: {
    id: 'u_1',
    name: 'Abu Saleh (Super Admin)',
    email: 'superadminabu@smartclass.pro',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 700-1122',
    department: 'Class IT Operations & Digital Portal Lead',
    xp: 0,
    level: 1,
    streak: 0,
    coins: 0,
    badges: ['bdg_super_admin']
  },
  ADMIN: {
    id: 'u_1',
    name: 'Abu Saleh (Super Admin)',
    email: 'superadminabu@smartclass.pro',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 700-1122',
    department: 'Class IT Operations & Digital Portal Lead',
    xp: 0,
    level: 1,
    streak: 0,
    coins: 0,
    badges: ['bdg_super_admin']
  },
  STUDENT: {
    id: 'usr_std_default',
    name: 'Student Account',
    email: 'student@smartclass.pro',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 000-0000',
    class: 'AL-USWAH',
    section: 'A',
    roll: '01',
    department: 'Science & Technology',
    xp: 0,
    level: 1,
    streak: 0,
    coins: 0,
    badges: [],
    cgpa: 0,
    attendancePercentage: 0
  },
  GUEST: {
    id: 'usr_gst_01',
    name: 'Guest Visitor',
    email: 'visitor@smartclass.pro',
    role: 'GUEST',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    xp: 0,
    level: 1,
    streak: 0,
    coins: 0,
    badges: []
  }
};

export const mockRoutines: ClassRoutineItem[] = [];

export const mockAssignments: Assignment[] = [];

export const mockExamResults: ExamResult[] = [];

export const mockStudyMaterials: StudyMaterial[] = [];

export const mockQuizzes: Quiz[] = [];

export const mockFlashcards: Flashcard[] = [];

export const mockDoubtQuestions: DoubtQuestion[] = [];
export const mockDoubts: DoubtQuestion[] = [];

export const mockNotices: Notice[] = [];

export const mockChatMessages: ChatMessage[] = [];

export const mockInvoices: FeeInvoice[] = [];

export const mockBusRoutes: BusRoute[] = [];

export const mockBadges: AchievementBadge[] = [
  {
    id: 'bdg_super_admin',
    title: 'Portal Administrator',
    titleBn: 'Portal Administrator',
    description: 'Verified Super Administrator of AL-USWAH',
    descriptionBn: 'Verified Super Administrator of AL-USWAH',
    icon: '👑',
    category: 'ACADEMIC',
    unlocked: true,
    unlockedAt: '2026-10-20'
  }
];

export const mockLeaderboard: Array<{
  rank: number;
  name: string;
  roll: string;
  xp: number;
  level: number;
  streak: number;
  avatar: string;
  badge: string;
}> = [];
