import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'SmartClass Pro',
    tagline: 'Learn Smarter. Teach Better. Live Brighter.',
    role: 'Role',
    switchRole: 'Switch Role',
    welcomeBack: 'Welcome Back',
    searchPlaceholder: 'Search anything (Ctrl + K)...',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Log Out',
    login: 'Portal Login',
    register: 'Register',
    dashboard: 'Dashboard',

    STUDENT: 'Student',
    TEACHER: 'Teacher',
    ADMIN: 'Super Admin',
    SUB_ADMIN: 'Academic Head (Sub Admin)',
    PARENT: 'Parent',
    CLASS_REP: 'Class Representative (CR)',
    GUEST: 'Guest Visitor',

    navHome: 'Dashboard Home',
    navRoutine: 'Class Routine',
    navAttendance: 'My Attendance',
    navAssignments: 'Assignments & Homework',
    navExams: 'Exams & Results',
    navMaterials: 'Study Materials',
    navQuiz: 'Online Quizzes',
    navFlashcards: 'Interactive Flashcards',
    navDoubtForum: 'Doubt & Help Forum',
    navGroupChat: 'Class Chat Channels',
    navFocus: 'Pomodoro Focus Timer',
    navGamification: 'Leaderboard & Badges',
    navFees: 'Fees & Invoicing',
    navTransport: 'Live Bus Tracking',
    navLibrary: 'Library Catalog',
    navLiveClass: 'Live Virtual Classroom',
    navClassRoster: 'Class Roster',
    navGradebook: 'Gradebook & Evaluation',
    navAdminUsers: 'User Management',
    navAdminAnalytics: 'Institutional Analytics',
    navSettings: 'System Settings',
    navCRFund: 'Class Fund Tracker',
    navChildOverview: 'Child Progress',

    todaySchedule: "Today's Schedule",
    nextClassIn: 'Next Class In',
    currentClass: 'Live Now',
    attendanceRate: 'Overall Attendance',
    currentGpa: 'Current CGPA',
    level: 'Level',
    streak: 'Day Streak',
    xpPoints: 'Total XP Points',
    pendingTasks: 'Pending Assignments',
    urgentNotice: 'Urgent Notice',
    askRoboSir: 'Ask Robo Sir (AI)',

    viewAll: 'View All',
    submit: 'Submit',
    download: 'Download',
    startQuiz: 'Start Quiz',
    markPresent: 'Mark Present',
    markAllPresent: 'Mark All Present',
    generateQR: 'Generate Attendance QR',
    payNow: 'Pay Now',
    startLiveSession: 'Launch Live Class',
    clearAll: 'Clear All',
    saveChanges: 'Save Changes',
    cancel: 'Cancel'
  },
  bn: {
    appName: 'SmartClass Pro',
    tagline: 'Learn Smarter. Teach Better.',
    role: 'Role',
    switchRole: 'Switch Role',
    welcomeBack: 'Welcome',
    searchPlaceholder: 'Search (Ctrl + K)...',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Register',
    dashboard: 'Dashboard',

    STUDENT: 'Student',
    TEACHER: 'Teacher',
    ADMIN: 'Super Admin',
    SUB_ADMIN: 'Sub Admin',
    PARENT: 'Parent',
    CLASS_REP: 'Class Rep',
    GUEST: 'Guest',

    navHome: 'Dashboard Home',
    navRoutine: 'Class Routine',
    navAttendance: 'Attendance Tracker',
    navAssignments: 'Assignments',
    navExams: 'Exams & Results',
    navMaterials: 'Study Materials',
    navQuiz: 'Online Quiz',
    navFlashcards: 'Flashcards',
    navDoubtForum: 'Doubt Forum',
    navGroupChat: 'Group Chat',
    navFocus: 'Pomodoro Focus',
    navGamification: 'Leaderboard & Badges',
    navFees: 'Fees & Payments',
    navTransport: 'Bus Tracking',
    navLibrary: 'Library Catalog',
    navLiveClass: 'Live Class & Whiteboard',
    navClassRoster: 'Class Roster',
    navGradebook: 'Gradebook',
    navAdminUsers: 'User Management',
    navAdminAnalytics: 'Analytics',
    navSettings: 'Settings',
    navCRFund: 'Class Fund Tracker',
    navChildOverview: 'Child Progress',

    todaySchedule: "Today's Schedule",
    nextClassIn: 'Next Class Starts In',
    currentClass: 'Current Class',
    attendanceRate: 'Attendance Rate',
    currentGpa: 'Current CGPA',
    level: 'Level',
    streak: 'Streak',
    xpPoints: 'XP Points',
    pendingTasks: 'Pending Tasks',
    urgentNotice: 'Urgent Notice',
    askRoboSir: 'Ask Robo Sir',

    viewAll: 'View All',
    submit: 'Submit',
    download: 'Download',
    startQuiz: 'Start Quiz',
    markPresent: 'Mark Present',
    markAllPresent: 'Mark All Present',
    generateQR: 'Generate QR Code',
    payNow: 'Pay Now',
    startLiveSession: 'Launch Live Class',
    clearAll: 'Clear All',
    saveChanges: 'Save Changes',
    cancel: 'Cancel'
  },
  hi: {
    appName: 'SmartClass Pro',
    tagline: 'Learn Smarter. Teach Better.',
    role: 'Role',
    switchRole: 'Switch Role',
    welcomeBack: 'Welcome',
    searchPlaceholder: 'Search (Ctrl + K)...',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Register',
    dashboard: 'Dashboard',

    STUDENT: 'Student',
    TEACHER: 'Teacher',
    ADMIN: 'Super Admin',
    SUB_ADMIN: 'Sub Admin',
    PARENT: 'Parent',
    CLASS_REP: 'Class Rep',
    GUEST: 'Guest',

    navHome: 'Dashboard Home',
    navRoutine: 'Class Routine',
    navAttendance: 'Attendance Tracker',
    navAssignments: 'Assignments',
    navExams: 'Exams & Results',
    navMaterials: 'Study Materials',
    navQuiz: 'Online Quiz',
    navFlashcards: 'Flashcards',
    navDoubtForum: 'Doubt Forum',
    navGroupChat: 'Group Chat',
    navFocus: 'Pomodoro Focus',
    navGamification: 'Leaderboard',
    navFees: 'Fees & Payments',
    navTransport: 'Bus Tracking',
    navLibrary: 'Library',
    navLiveClass: 'Live Class',
    navClassRoster: 'Class Roster',
    navGradebook: 'Gradebook',
    navAdminUsers: 'User Management',
    navAdminAnalytics: 'Analytics',
    navSettings: 'Settings',
    navCRFund: 'Class Fund',
    navChildOverview: 'Child Progress',

    todaySchedule: "Today's Schedule",
    nextClassIn: 'Next Class In',
    currentClass: 'Current Class',
    attendanceRate: 'Attendance Rate',
    currentGpa: 'Current GPA',
    level: 'Level',
    streak: 'Streak',
    xpPoints: 'XP Points',
    pendingTasks: 'Pending Tasks',
    urgentNotice: 'Urgent Notice',
    askRoboSir: 'Ask Robo Sir',

    viewAll: 'View All',
    submit: 'Submit',
    download: 'Download',
    startQuiz: 'Start Quiz',
    markPresent: 'Mark Present',
    markAllPresent: 'Mark All Present',
    generateQR: 'Generate QR Code',
    payNow: 'Pay Now',
    startLiveSession: 'Launch Live Class',
    clearAll: 'Clear All',
    saveChanges: 'Save Changes',
    cancel: 'Cancel'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState('en');
    localStorage.setItem('smartclass_lang', 'en');
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations['en'];
    if (langDict && langDict[key]) return langDict[key];
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
