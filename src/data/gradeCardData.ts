import { StudentGradeCard, GradeCardSubjectRow } from '../types';

export const darulHudaSubjectDefinitions: Array<{
  code: string;
  name: string;
  saMax: number;
  faMax: number;
  defaultAvg: number;
}> = [
  { code: 'S428', name: 'Islamic History', saMax: 70, faMax: 30, defaultAvg: 69 },
  { code: 'S404', name: 'Hadith', saMax: 70, faMax: 30, defaultAvg: 62 },
  { code: 'S408', name: 'Aqida', saMax: 70, faMax: 30, defaultAvg: 65 },
  { code: 'S413', name: 'Arabic Grammar', saMax: 70, faMax: 30, defaultAvg: 53 },
  { code: 'S418', name: 'Translation and Composition', saMax: 70, faMax: 30, defaultAvg: 84 },
  { code: 'S435', name: 'IT and Computer', saMax: 70, faMax: 30, defaultAvg: 92 },
  { code: 'S406', name: 'Fiqh al-Islami', saMax: 70, faMax: 30, defaultAvg: 76 },
  { code: 'S420', name: 'Language: Arabic', saMax: 70, faMax: 30, defaultAvg: 84 },
  { code: 'S433', name: 'Mathematics', saMax: 70, faMax: 30, defaultAvg: 62 },
  { code: 'S421', name: 'Regional Language', saMax: 70, faMax: 30, defaultAvg: 74 },
  { code: 'S424', name: 'Language: Urdu', saMax: 70, faMax: 30, defaultAvg: 78 },
  { code: '',     name: 'Hifz and Tajwid', saMax: 0, faMax: 100, defaultAvg: 82 },
  { code: 'S422', name: 'Language: English', saMax: 70, faMax: 30, defaultAvg: 72 },
  { code: 'S410', name: 'Tasawwuf', saMax: 70, faMax: 30, defaultAvg: 72 },
  { code: 'S432', name: 'Science', saMax: 70, faMax: 30, defaultAvg: 69 },
  { code: 'S426', name: 'Language: Hindi', saMax: 70, faMax: 30, defaultAvg: 73 },
  { code: 'S430', name: 'Social Science', saMax: 70, faMax: 30, defaultAvg: 58 },
];

export const calculateGradeFromTotal = (total: number, max: number = 100): string => {
  if (total <= 0) return '-';
  const pct = Math.round((total / max) * 100);
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 61) return 'B';
  if (pct >= 51) return 'C+';
  if (pct >= 40) return 'C';
  return 'D';
};

export const calculatePerformanceLevel = (grandTotalScored: number, overallPercentage: number): string => {
  if (grandTotalScored <= 0) return '-';
  if (overallPercentage >= 80) return 'OPL'; // Optimum Proficiency Level
  if (overallPercentage >= 60) return 'BPL'; // Basic Proficiency Level
  return 'MPL'; // Minimum Proficiency Level
};

// Creates a 100% blank student grade card with all marks empty for user to input
export const createStudentGradeCard = (
  studentId: string,
  studentName: string,
  admissionNo: string,
  roll: string,
  photo?: string
): StudentGradeCard => {
  const subjects: GradeCardSubjectRow[] = darulHudaSubjectDefinitions.map((def, idx) => ({
    slNo: idx + 1,
    subjectCode: def.code,
    subjectName: def.name,
    saScored: null,
    saMax: def.saMax,
    faScored: null,
    faMax: def.faMax,
    totalScored: null,
    totalMax: 100,
    grade: '-',
    average: def.defaultAvg
  }));

  return {
    id: `gc_${studentId}`,
    studentId,
    academicYear: '2026-2027',
    issuedDate: new Date().toLocaleDateString(),
    examTitle: 'SEC. FOURTH YEAR HALF YEARLY EXAMINATION - AUG-2026',
    admissionNo: admissionNo || '',
    enrollmentNo: '0',
    studentName,
    dateOfBirth: '27-May-2011',
    standard: 'Secondary Fourth Year',
    division: 'A',
    photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    subjects,
    totalSaScored: 0,
    totalSaMax: 1120,
    totalFaScored: 0,
    totalFaMax: 580,
    grandTotalScored: 0,
    grandTotalMax: 1700,
    overallPercentage: 0,
    noOfSubjectsFailed: 0,
    overallGrade: '-',
    overallRank: 0,
    totalRankStudents: 0,
    performanceLevel: '-',
    averagePercentage: 0,
    gpa: 0,
    classAttendancePresent: 0,
    classAttendanceTotal: 0
  };
};

// Initial template for Abu Saleh with blank marks
export const initialAbuSalehGradeCard: StudentGradeCard = createStudentGradeCard(
  'u_1',
  'Md Abu Saleh SK',
  '806',
  '00',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
);
