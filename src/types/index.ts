export type UserRole = 
  | 'STUDENT'
  | 'TEACHER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SUB_ADMIN'
  | 'CASHIER'
  | 'PARENT'
  | 'CLASS_REP'
  | 'GUEST';

export interface UserPermissions {
  attendance?: boolean;
  marks?: boolean;
  routine?: boolean;
  funds?: boolean; // Cashier permission: add, edit, modify entries
  notices?: boolean;
  files?: boolean;
  website_builder?: boolean;
  messaging?: boolean;
}

export type Language = 'bn' | 'en' | 'hi';

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  role: UserRole;
  avatar: string;
  username?: string;
  password?: string;
  admissionNumber?: string;
  phone?: string;
  class?: string;
  section?: string;
  roll?: string;
  department?: string;
  bloodGroup?: string;
  guardianName?: string;
  guardianPhone?: string;
  xp: number;
  level: number;
  streak: number;
  coins: number;
  badges: string[];
  cgpa?: number;
  attendancePercentage?: number;
  children?: { id: string; name: string; class: string; section: string; roll: string }[];
}

export interface StudentDueRecord {
  id: string;
  studentId: string;
  studentName: string;
  roll: string;
  admissionNumber: string;
  title: string;
  totalDue: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  dueDate: string;
  lastPaymentDate?: string;
  notes?: string;
}

export interface FundTransactionItem {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  category: string;
  date: string;
  recordedBy: string;
  receiptNumber?: string;
  studentId?: string;
  studentName?: string;
}

export interface ClassFileItem {
  id: string;
  name: string;
  category: string;
  subject: string;
  size: string;
  fileType: string;
  uploadedAt: string;
  uploader: string;
  url?: string;
  description?: string;
}

export interface StudentMarkEntry {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  roll: string;
  photo?: string;
  marksObtained: number | null;
  saScored?: number | null;
  saMax?: number;
  faScored?: number | null;
  faMax?: number;
  subjectAverage?: number;
  isAbsent?: boolean;
  grade?: string;
  gpa?: number;
  percentage?: number;
  status?: 'PASSED' | 'FAILED' | 'ABSENT' | 'PENDING';
  remarks?: string;
}

export interface GradeCardSubjectRow {
  slNo: number;
  subjectCode: string;
  subjectName: string;
  saScored: number | null;
  saMax: number;
  faScored: number | null;
  faMax: number;
  totalScored: number | null;
  totalMax: number;
  grade: string;
  average: number;
}

export interface StudentGradeCard {
  id: string;
  studentId: string;
  academicYear: string;
  issuedDate: string;
  examTitle: string;
  admissionNo: string;
  enrollmentNo: string;
  studentName: string;
  dateOfBirth: string;
  standard: string;
  division: string;
  photo?: string;
  subjects: GradeCardSubjectRow[];
  totalSaScored: number;
  totalSaMax: number;
  totalFaScored: number;
  totalFaMax: number;
  grandTotalScored: number;
  grandTotalMax: number;
  overallPercentage: number;
  noOfSubjectsFailed: number;
  overallGrade: string;
  overallRank: number;
  totalRankStudents: number;
  performanceLevel: 'OPL' | 'BPL' | 'MPL' | 'APL' | 'F' | '-' | string;
  averagePercentage: number;
  gpa: number;
  classAttendancePresent: number;
  classAttendanceTotal: number;
}

export interface SubjectMarksheet {
  id: string;
  subject: string;
  examTerm: string;
  examDate: string;
  maxMarks: number;
  passMarks: number;
  totalStudents: number;
  submittedStudents: number;
  highestMarks: number;
  lowestMarks: number;
  averageMarks: number;
  passPercentage: number;
  entries: StudentMarkEntry[];
  submittedAt: string;
  submittedBy: string;
  status: 'SUBMITTED' | 'DRAFT';
}

export interface ClassRoutineItem {
  id: string;
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayBn: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  subjectBn: string;
  teacher: string;
  room: string;
  color: string;
  class: string;
  section: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  roll: string;
  class: string;
  section: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY';
  subject?: string;
  remarks?: string;
}

export interface Assignment {
  id: string;
  title: string;
  titleBn: string;
  subject: string;
  subjectBn: string;
  class: string;
  section: string;
  teacherName: string;
  dueDate: string;
  totalMarks: number;
  description: string;
  attachedFile?: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  grade?: string;
  marksObtained?: number;
  feedback?: string;
  submittedAt?: string;
  submissionFile?: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  examNameBn: string;
  term: string;
  date: string;
  subject: string;
  subjectBn: string;
  marks: number;
  totalMarks: number;
  grade: string;
  gpa: number;
  highestMarks: number;
  classAverage: number;
  studentRoll: string;
  studentName: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  titleBn: string;
  subject: string;
  subjectBn: string;
  chapter: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'SLIDES' | 'LINK';
  uploader: string;
  uploadedAt: string;
  fileSize?: string;
  duration?: string;
  downloadCount: number;
  bookmarked: boolean;
  url?: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionBn: string;
  options: string[];
  optionsBn?: string[];
  correctIndex: number;
  explanation: string;
  explanationBn: string;
}

export interface Quiz {
  id: string;
  title: string;
  titleBn: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  questionsCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questions: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  deck: string;
  subject: string;
  front: string;
  frontBn: string;
  back: string;
  backBn: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface DoubtQuestion {
  id: string;
  title: string;
  body: string;
  subject: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  createdAt: string;
  upvotes: number;
  answersCount: number;
  isSolved: boolean;
  acceptedAnswer?: string;
  tags: string[];
}

export interface Notice {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  category: 'EXAM' | 'HOLIDAY' | 'EVENT' | 'URGENT' | 'GENERAL';
  publishedBy: string;
  date: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS';
  isPinned: boolean;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  type: 'ALL_STUDENTS' | 'GROUP' | 'DIRECT_MESSAGE';
  name: string;
  description?: string;
  avatar?: string;
  color?: string;
  createdBy?: string;
  memberIds: string[];
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  message: string;
  timestamp: string;
  conversationId: string;
  channel?: 'CLASS_GROUP' | 'SCIENCE_CLUB' | 'EXAM_PREP' | string;
  targetAudience?: 'ALL' | 'SELECTED_STUDENTS' | 'GROUP';
  recipientIds?: string[];
  recipientNames?: string[];
  attachments?: { name: string; url?: string; type: string; size?: string }[];
  reactions?: Record<string, number>;
  isAnnouncement?: boolean;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  titleBn: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  paidDate?: string;
  month: string;
  studentId: string;
  studentName: string;
  paymentMethod?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  coverImage?: string;
  borrowedByMe?: boolean;
  returnDueDate?: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  currentStop: string;
  nextStop: string;
  eta: string;
  status: 'ON_ROUTE' | 'DELAYED' | 'COMPLETED';
  coordinates: { lat: number; lng: number };
}

export interface AchievementBadge {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
  category: 'ACADEMIC' | 'ATTENDANCE' | 'GAMING' | 'SOCIAL';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}
