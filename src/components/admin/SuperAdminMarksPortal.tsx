import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution, ManagedClassMember } from '../../context/InstitutionContext';
import { StudentMarkEntry, SubjectMarksheet } from '../../types';
import { initialMockMarksheets } from '../../data/mockMarksheets';
import {
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Award,
  TrendingUp,
  Search,
  Filter,
  Save,
  Download,
  Printer,
  RefreshCw,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  ArrowRight,
  Check,
  X,
  Clock,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  ChevronDown,
  Layers,
  Percent,
  UserX,
  Edit2
} from 'lucide-react';

import { GradeCardTemplate } from '../common/GradeCardTemplate';
import { StudentGradeCard, GradeCardSubjectRow } from '../../types';
import {
  initialAbuSalehGradeCard,
  createStudentGradeCard,
  darulHudaSubjectDefinitions,
  calculateGradeFromTotal,
  calculatePerformanceLevel
} from '../../data/gradeCardData';

const defaultSubjects = [
  'Islamic History',
  'Hadith',
  'Aqida',
  'Arabic Grammar',
  'Translation and Composition',
  'IT and Computer',
  'Fiqh al-Islami',
  'Language: Arabic',
  'Mathematics',
  'Regional Language',
  'Language: Urdu',
  'Hifz and Tajwid',
  'Language: English',
  'Tasawwuf',
  'Science',
  'Language: Hindi',
  'Social Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Higher Mathematics'
];

const defaultExamTerms = [
  'SEC. FOURTH YEAR HALF YEARLY EXAMINATION - AUG-2026',
  'First Term Examination 2026',
  'Midterm Examination 2026',
  'Final Term Examination 2026',
  'Monthly Class Assessment (Oct)',
  'Speed Evaluation Quiz',
  'Practical Lab Exam'
];

export const SuperAdminMarksPortal: React.FC = () => {
  const { playChime, addNotification } = useNotifications();
  const { studentsList, stats } = useInstitution();

  // Active Tab: 'grade_card' (PDF Template Portal) | 'entry' | 'history' | 'print'
  const [activePortalTab, setActivePortalTab] = useState<'grade_card' | 'entry' | 'history' | 'print'>('grade_card');

  // Grade Cards Collection matching the user's PDF template
  const [gradeCards, setGradeCards] = useState<StudentGradeCard[]>(() => {
    try {
      const stored = localStorage.getItem('smartclass_grade_cards');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedStudentForCard, setSelectedStudentForCard] = useState<string>('u_1');
  const [selectedGradeCardToView, setSelectedGradeCardToView] = useState<StudentGradeCard | null>(null);

  // Sync gradeCards to localStorage and broadcast
  useEffect(() => {
    localStorage.setItem('smartclass_grade_cards', JSON.stringify(gradeCards));
    window.dispatchEvent(new CustomEvent('al_uswah_grade_cards_updated'));
  }, [gradeCards]);

  // Exam Configuration
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedExamTerm, setSelectedExamTerm] = useState<string>('First Term Examination 2026');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [passMarks, setPassMarks] = useState<number>(33);
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Custom Subject Modal
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>(defaultSubjects);

  // Marks State: Map of studentId -> StudentMarkEntry
  const [marksMap, setMarksMap] = useState<Record<string, StudentMarkEntry>>({});

  // Filter & Search inside marks table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'FILLED' | 'FAILING' | 'ABSENT'>('ALL');

  // Previously Submitted Marksheets Storage
  const [savedMarksheets, setSavedMarksheets] = useState<SubjectMarksheet[]>(() => {
    try {
      const stored = localStorage.getItem('smartclass_marksheets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialMockMarksheets;
  });

  // Selected marksheet for print/view
  const [selectedMarksheetToView, setSelectedMarksheetToView] = useState<SubjectMarksheet | null>(null);

  // Input refs for automatic enter-to-next-row navigation
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Save to localStorage whenever savedMarksheets changes
  useEffect(() => {
    localStorage.setItem('smartclass_marksheets', JSON.stringify(savedMarksheets));
  }, [savedMarksheets]);

  // Synchronize studentsList into marksMap whenever studentsList changes or subject/term changes
  useEffect(() => {
    // Check if there is an existing saved marksheet for this subject & examTerm
    const existing = savedMarksheets.find(
      s => s.subject === selectedSubject && s.examTerm === selectedExamTerm
    );

    if (existing) {
      const initialMap: Record<string, StudentMarkEntry> = {};
      existing.entries.forEach(entry => {
        initialMap[entry.studentId] = entry;
      });
      // Also ensure any newly added students are included
      studentsList.forEach(student => {
        if (!initialMap[student.id]) {
          initialMap[student.id] = {
            studentId: student.id,
            studentName: student.name,
            admissionNumber: student.admissionNumber || `ADM-2025-${student.roll?.padStart(4, '0') || '1000'}`,
            roll: student.roll || '00',
            photo: student.photo,
            marksObtained: null,
            isAbsent: false,
            status: 'PENDING'
          };
        }
      });
      setMarksMap(initialMap);
      setMaxMarks(existing.maxMarks);
      setPassMarks(existing.passMarks);
      setExamDate(existing.examDate);
    } else {
      // Fresh map for this subject
      const freshMap: Record<string, StudentMarkEntry> = {};
      studentsList.forEach(student => {
        freshMap[student.id] = {
          studentId: student.id,
          studentName: student.name,
          admissionNumber: student.admissionNumber || `ADM-2025-${student.roll?.padStart(4, '0') || '1000'}`,
          roll: student.roll || '00',
          photo: student.photo,
          marksObtained: null,
          isAbsent: false,
          status: 'PENDING'
        };
      });
      setMarksMap(freshMap);
    }
  }, [selectedSubject, selectedExamTerm, studentsList]);

  // Helper: Calculate Grade & GPA based on marks & maxMarks
  const calculateGradeAndGpa = (marks: number | null, isAbsent: boolean, max: number, pass: number) => {
    if (isAbsent) {
      return { grade: 'F', gpa: 0.0, status: 'ABSENT' as const, percentage: 0 };
    }
    if (marks === null || isNaN(marks)) {
      return { grade: '-', gpa: 0.0, status: 'PENDING' as const, percentage: 0 };
    }

    const percentage = Math.round((marks / max) * 100);
    const isPassing = marks >= pass;

    if (!isPassing || percentage < 33) {
      return { grade: 'F', gpa: 0.0, status: 'FAILED' as const, percentage };
    }
    if (percentage >= 80) return { grade: 'A+', gpa: 5.0, status: 'PASSED' as const, percentage };
    if (percentage >= 70) return { grade: 'A', gpa: 4.0, status: 'PASSED' as const, percentage };
    if (percentage >= 60) return { grade: 'A-', gpa: 3.5, status: 'PASSED' as const, percentage };
    if (percentage >= 50) return { grade: 'B', gpa: 3.0, status: 'PASSED' as const, percentage };
    if (percentage >= 40) return { grade: 'C', gpa: 2.0, status: 'PASSED' as const, percentage };
    return { grade: 'D', gpa: 1.0, status: 'PASSED' as const, percentage };
  };

  // Update a student's marks
  const handleMarkChange = (studentId: string, valStr: string) => {
    const student = marksMap[studentId];
    if (!student) return;

    if (valStr === '') {
      setMarksMap(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          marksObtained: null,
          isAbsent: false,
          grade: undefined,
          gpa: undefined,
          percentage: undefined,
          status: 'PENDING'
        }
      }));
      return;
    }

    let numVal = parseFloat(valStr);
    if (isNaN(numVal)) return;
    if (numVal < 0) numVal = 0;
    if (numVal > maxMarks) numVal = maxMarks;

    const { grade, gpa, status, percentage } = calculateGradeAndGpa(numVal, false, maxMarks, passMarks);

    setMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: numVal,
        isAbsent: false,
        grade,
        gpa,
        percentage,
        status
      }
    }));
  };

  // Toggle Absent Status
  const handleToggleAbsent = (studentId: string) => {
    playChime('click');
    setMarksMap(prev => {
      const current = prev[studentId];
      if (!current) return prev;
      const willBeAbsent = !current.isAbsent;
      const { grade, gpa, status, percentage } = calculateGradeAndGpa(
        willBeAbsent ? 0 : current.marksObtained,
        willBeAbsent,
        maxMarks,
        passMarks
      );
      return {
        ...prev,
        [studentId]: {
          ...current,
          isAbsent: willBeAbsent,
          marksObtained: willBeAbsent ? 0 : current.marksObtained,
          grade,
          gpa,
          status,
          percentage
        }
      };
    });
  };

  // Update remarks
  const handleRemarksChange = (studentId: string, text: string) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: text
      }
    }));
  };

  // Power Tool: Fill Sample Marks for fast demonstration
  const handleFillSampleMarks = () => {
    playChime('click');
    setMarksMap(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        // Random score between 60 and maxMarks
        const score = Math.floor(Math.random() * (maxMarks - 45)) + 45;
        const { grade, gpa, status, percentage } = calculateGradeAndGpa(score, false, maxMarks, passMarks);
        updated[id] = {
          ...updated[id],
          marksObtained: score,
          isAbsent: false,
          grade,
          gpa,
          status,
          percentage
        };
      });
      return updated;
    });

    addNotification({
      title: 'Sample Evaluation Scores Filled',
      message: `Populated mock examination scores for all ${studentsList.length} students.`,
      type: 'info'
    });
  };

  // Power Tool: Fill Passing Marks to empty
  const handleFillPassingToEmpty = () => {
    playChime('click');
    setMarksMap(prev => {
      const updated = { ...prev };
      let filledCount = 0;
      Object.keys(updated).forEach(id => {
        if (updated[id].marksObtained === null && !updated[id].isAbsent) {
          const score = passMarks;
          const { grade, gpa, status, percentage } = calculateGradeAndGpa(score, false, maxMarks, passMarks);
          updated[id] = {
            ...updated[id],
            marksObtained: score,
            grade,
            gpa,
            status,
            percentage
          };
          filledCount++;
        }
      });
      addNotification({
        title: 'Filled Passing Scores',
        message: `Assigned passing score (${passMarks}) to ${filledCount} empty students.`,
        type: 'info'
      });
      return updated;
    });
  };

  // Power Tool: Clear All Marks
  const handleClearAllMarks = () => {
    playChime('alert');
    setMarksMap(prev => {
      const reset: Record<string, StudentMarkEntry> = {};
      Object.keys(prev).forEach(id => {
        reset[id] = {
          ...prev[id],
          marksObtained: null,
          isAbsent: false,
          grade: undefined,
          gpa: undefined,
          status: 'PENDING',
          percentage: undefined,
          remarks: ''
        };
      });
      return reset;
    });
    addNotification({
      title: 'Marks Reset',
      message: 'All marks entries cleared for the current subject.',
      type: 'info'
    });
  };

  // Add Custom Subject
  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    const trimmed = newSubjectInput.trim();
    if (!subjectList.includes(trimmed)) {
      setSubjectList(prev => [...prev, trimmed]);
    }
    setSelectedSubject(trimmed);
    setNewSubjectInput('');
    setShowAddSubjectModal(false);
    playChime('success');
  };

  // Calculate live statistics
  const marksEntriesArray = Object.values(marksMap);
  const totalStudentsCount = marksEntriesArray.length;
  const filledEntries = marksEntriesArray.filter(e => e.marksObtained !== null || e.isAbsent);
  const filledCount = filledEntries.length;
  const progressPercent = totalStudentsCount > 0 ? Math.round((filledCount / totalStudentsCount) * 100) : 0;

  const validScores = marksEntriesArray
    .filter(e => e.marksObtained !== null && !e.isAbsent)
    .map(e => e.marksObtained as number);

  const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const lowestScore = validScores.length > 0 ? Math.min(...validScores) : 0;
  const averageScore =
    validScores.length > 0
      ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
      : 0;

  const topperStudent = marksEntriesArray.find(e => e.marksObtained === highestScore && !e.isAbsent);

  const passedCount = marksEntriesArray.filter(e => e.status === 'PASSED').length;
  const failedCount = marksEntriesArray.filter(e => e.status === 'FAILED' || e.isAbsent).length;
  const passRate = filledCount > 0 ? Math.round((passedCount / filledCount) * 100) : 0;

  // Grade breakdown
  const gradeCounts = {
    'A+': marksEntriesArray.filter(e => e.grade === 'A+').length,
    'A': marksEntriesArray.filter(e => e.grade === 'A').length,
    'A-': marksEntriesArray.filter(e => e.grade === 'A-').length,
    'B': marksEntriesArray.filter(e => e.grade === 'B').length,
    'C': marksEntriesArray.filter(e => e.grade === 'C').length,
    'D': marksEntriesArray.filter(e => e.grade === 'D').length,
    'F': marksEntriesArray.filter(e => e.grade === 'F').length
  };

  // Filtered array of students for display in table
  const displayedStudents = marksEntriesArray
    .filter(entry => {
      const matchSearch =
        entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.roll.includes(searchQuery);

      if (!matchSearch) return false;

      if (filterMode === 'PENDING') return entry.marksObtained === null && !entry.isAbsent;
      if (filterMode === 'FILLED') return entry.marksObtained !== null || entry.isAbsent;
      if (filterMode === 'FAILING') return entry.status === 'FAILED';
      if (filterMode === 'ABSENT') return entry.isAbsent;
      return true;
    })
    .sort((a, b) => {
      // Sort numerically by roll
      const rollA = parseInt(a.roll, 10) || 0;
      const rollB = parseInt(b.roll, 10) || 0;
      return rollA - rollB;
    });

  // Submit and Finalize Marksheet
  const handleSubmitMarksheet = () => {
    // Check if any students have empty marks
    const unenteredCount = totalStudentsCount - filledCount;

    if (unenteredCount > 0) {
      const proceed = window.confirm(
        `There are still ${unenteredCount} students without marks entered.\nDo you want to mark remaining students as Absent and publish the marksheet?`
      );
      if (!proceed) return;

      // Mark unentered as absent
      setMarksMap(prev => {
        const autoFilled = { ...prev };
        Object.keys(autoFilled).forEach(id => {
          if (autoFilled[id].marksObtained === null) {
            autoFilled[id] = {
              ...autoFilled[id],
              isAbsent: true,
              marksObtained: 0,
              grade: 'F',
              gpa: 0.0,
              status: 'ABSENT',
              percentage: 0
            };
          }
        });
        return autoFilled;
      });
    }

    playChime('success');

    const marksheetRecord: SubjectMarksheet = {
      id: `ms_${Date.now()}`,
      subject: selectedSubject,
      examTerm: selectedExamTerm,
      examDate,
      maxMarks,
      passMarks,
      totalStudents: totalStudentsCount,
      submittedStudents: filledCount,
      highestMarks: highestScore,
      lowestMarks: lowestScore,
      averageMarks: averageScore,
      passPercentage: passRate,
      entries: Object.values(marksMap),
      submittedAt: new Date().toLocaleString(),
      submittedBy: 'Abu Saleh (Super Admin)',
      status: 'SUBMITTED'
    };

    // Upsert into savedMarksheets
    setSavedMarksheets(prev => {
      const filtered = prev.filter(
        item => !(item.subject === selectedSubject && item.examTerm === selectedExamTerm)
      );
      return [marksheetRecord, ...filtered];
    });

    addNotification({
      title: 'Marksheet Submitted & Published! 🎓',
      message: `Official marks for ${selectedSubject} (${selectedExamTerm}) saved with a ${passRate}% pass rate.`,
      type: 'success'
    });

    setSelectedMarksheetToView(marksheetRecord);
    setActivePortalTab('print');
  };

  // Print function
  const handlePrint = () => {
    playChime('click');
    window.print();
  };

  // CSV Export function
  const handleExportCSV = (marksheet: SubjectMarksheet) => {
    playChime('click');
    const headers = ['Roll', 'Admission Number', 'Student Name', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade', 'GPA', 'Status', 'Remarks'];
    const rows = marksheet.entries.map(e => [
      e.roll,
      e.admissionNumber,
      `"${e.studentName}"`,
      e.isAbsent ? 'ABSENT' : (e.marksObtained ?? 'N/A'),
      marksheet.maxMarks,
      `${e.percentage ?? 0}%`,
      e.grade ?? 'F',
      e.gpa ?? 0,
      e.status ?? 'PENDING',
      `"${e.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${marksheet.subject}_${marksheet.examTerm}_Marksheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active student's Grade Card
  const activeStudentObj = studentsList.find(s => s.id === selectedStudentForCard) || {
    id: 'u_1',
    name: 'Md Abu Saleh SK',
    admissionNumber: '806',
    roll: '00',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  };

  const activeGradeCard: StudentGradeCard = gradeCards.find(c => c.studentId === selectedStudentForCard) || {
    ...createStudentGradeCard(
      activeStudentObj.id,
      activeStudentObj.name,
      activeStudentObj.admissionNumber || '806',
      activeStudentObj.roll || '00',
      activeStudentObj.photo
    )
  };

  // Grade Card Subject Management (Add / Edit / Modify Codes)
  const [showSubjectManageModal, setShowSubjectManageModal] = useState(false);
  const [editingSubjectSlNo, setEditingSubjectSlNo] = useState<number | null>(null);
  const [subjFormCode, setSubjFormCode] = useState('');
  const [subjFormName, setSubjFormName] = useState('');
  const [subjFormSaMax, setSubjFormSaMax] = useState<number>(70);
  const [subjFormFaMax, setSubjFormFaMax] = useState<number>(30);
  const [subjFormAvg, setSubjFormAvg] = useState<number>(70);
  const [applySubjectToAllStudents, setApplySubjectToAllStudents] = useState(true);

  const handleOpenAddGradeCardSubject = () => {
    setEditingSubjectSlNo(null);
    setSubjFormCode(`S${420 + activeGradeCard.subjects.length}`);
    setSubjFormName('');
    setSubjFormSaMax(70);
    setSubjFormFaMax(30);
    setSubjFormAvg(70);
    setApplySubjectToAllStudents(true);
    setShowSubjectManageModal(true);
    playChime('click');
  };

  const handleOpenEditGradeCardSubject = (sub: GradeCardSubjectRow) => {
    setEditingSubjectSlNo(sub.slNo);
    setSubjFormCode(sub.subjectCode || '');
    setSubjFormName(sub.subjectName);
    setSubjFormSaMax(sub.saMax);
    setSubjFormFaMax(sub.faMax);
    setSubjFormAvg(sub.average || 70);
    setApplySubjectToAllStudents(true);
    setShowSubjectManageModal(true);
    playChime('click');
  };

  const handleSaveGradeCardSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjFormName.trim()) return;

    const trimmedName = subjFormName.trim();
    const trimmedCode = subjFormCode.trim();
    const totalMax = subjFormSaMax + subjFormFaMax;

    setGradeCards(prev => {
      const existingIdx = prev.findIndex(c => c.studentId === selectedStudentForCard);
      const baseCard = existingIdx >= 0 ? prev[existingIdx] : activeGradeCard;

      if (editingSubjectSlNo !== null) {
        // Edit existing subject
        const baseCards = prev.length > 0 ? prev : [baseCard];
        return baseCards.map(card => {
          if (!applySubjectToAllStudents && card.studentId !== selectedStudentForCard) return card;
          const updatedSubs = card.subjects.map(s => {
            if (s.slNo !== editingSubjectSlNo) return s;
            const sa = s.saScored !== null ? Math.min(s.saScored, subjFormSaMax) : null;
            const fa = s.faScored !== null ? Math.min(s.faScored, subjFormFaMax) : null;
            const tot = (sa || 0) + (fa || 0);
            return {
              ...s,
              subjectCode: trimmedCode,
              subjectName: trimmedName,
              saMax: subjFormSaMax,
              faMax: subjFormFaMax,
              totalMax,
              saScored: sa,
              faScored: fa,
              totalScored: (sa !== null || fa !== null) ? tot : null,
              grade: (sa !== null || fa !== null) ? calculateGradeFromTotal(tot, totalMax) : '-',
              average: subjFormAvg
            };
          });

          const totalSaScored = updatedSubs.reduce((sum, s) => sum + (s.saScored || 0), 0);
          const totalFaScored = updatedSubs.reduce((sum, s) => sum + (s.faScored || 0), 0);
          const totalSaMax = updatedSubs.reduce((sum, s) => sum + s.saMax, 0);
          const totalFaMax = updatedSubs.reduce((sum, s) => sum + s.faMax, 0);
          const grandTotalScored = totalSaScored + totalFaScored;
          const grandTotalMax = totalSaMax + totalFaMax || 1700;
          const overallPercentage = grandTotalMax > 0 ? parseFloat(((grandTotalScored / grandTotalMax) * 100).toFixed(2)) : 0;
          const overallGrade = grandTotalScored > 0 ? calculateGradeFromTotal(overallPercentage, 100) : '-';
          const gpa = grandTotalScored > 0 ? parseFloat((2.5 + (overallPercentage / 100) * 1.5).toFixed(2)) : 0;
          const failed = updatedSubs.filter(s => (s.totalScored || 0) < 40 && s.totalScored !== null).length;
          const performanceLevel = calculatePerformanceLevel(grandTotalScored, overallPercentage);

          return {
            ...card,
            subjects: updatedSubs,
            totalSaScored,
            totalFaScored,
            totalSaMax,
            totalFaMax,
            grandTotalScored,
            grandTotalMax,
            overallPercentage,
            overallGrade,
            noOfSubjectsFailed: failed,
            gpa,
            performanceLevel
          };
        });
      } else {
        // Add new subject
        const baseCards = prev.length > 0 ? prev : [baseCard];
        const newSubjectRow: GradeCardSubjectRow = {
          slNo: baseCard.subjects.length + 1,
          subjectCode: trimmedCode,
          subjectName: trimmedName,
          saScored: null,
          saMax: subjFormSaMax,
          faScored: null,
          faMax: subjFormFaMax,
          totalScored: null,
          totalMax,
          grade: '-',
          average: subjFormAvg
        };

        return baseCards.map(card => {
          if (!applySubjectToAllStudents && card.studentId !== selectedStudentForCard) return card;
          const updatedSubs = [...card.subjects, { ...newSubjectRow, slNo: card.subjects.length + 1 }];
          const totalSaMax = updatedSubs.reduce((sum, s) => sum + s.saMax, 0);
          const totalFaMax = updatedSubs.reduce((sum, s) => sum + s.faMax, 0);
          const grandTotalMax = totalSaMax + totalFaMax;
          return {
            ...card,
            subjects: updatedSubs,
            totalSaMax,
            totalFaMax,
            grandTotalMax
          };
        });
      }
    });

    playChime('success');
    addNotification({
      title: editingSubjectSlNo ? 'Subject Updated' : 'Subject Added to Grade Card',
      message: `"${trimmedName}" (Code: ${trimmedCode || 'None'}) has been saved.`,
      type: 'success'
    });
    setShowSubjectManageModal(false);
  };

  const handleDeleteGradeCardSubject = (slNo: number) => {
    const subToDelete = activeGradeCard.subjects.find(s => s.slNo === slNo);
    if (!subToDelete) return;
    const confirm = window.confirm(`Are you sure you want to remove "${subToDelete.subjectName}" from the grade card?`);
    if (!confirm) return;

    setGradeCards(prev => {
      const baseCards = prev.length > 0 ? prev : [activeGradeCard];
      return baseCards.map(card => {
        const remaining = card.subjects
          .filter(s => s.slNo !== slNo)
          .map((s, idx) => ({ ...s, slNo: idx + 1 }));

        const totalSaScored = remaining.reduce((sum, s) => sum + (s.saScored || 0), 0);
        const totalFaScored = remaining.reduce((sum, s) => sum + (s.faScored || 0), 0);
        const totalSaMax = remaining.reduce((sum, s) => sum + s.saMax, 0);
        const totalFaMax = remaining.reduce((sum, s) => sum + s.faMax, 0);
        const grandTotalScored = totalSaScored + totalFaScored;
        const grandTotalMax = totalSaMax + totalFaMax || 1;
        const overallPercentage = grandTotalMax > 0 ? parseFloat(((grandTotalScored / grandTotalMax) * 100).toFixed(2)) : 0;
        const overallGrade = grandTotalScored > 0 ? calculateGradeFromTotal(overallPercentage, 100) : '-';
        const gpa = grandTotalScored > 0 ? parseFloat((2.5 + (overallPercentage / 100) * 1.5).toFixed(2)) : 0;
        const failed = remaining.filter(s => (s.totalScored || 0) < 40 && s.totalScored !== null).length;
        const performanceLevel = calculatePerformanceLevel(grandTotalScored, overallPercentage);

        return {
          ...card,
          subjects: remaining,
          totalSaScored,
          totalFaScored,
          totalSaMax,
          totalFaMax,
          grandTotalScored,
          grandTotalMax,
          overallPercentage,
          overallGrade,
          noOfSubjectsFailed: failed,
          gpa,
          performanceLevel
        };
      });
    });

    playChime('alert');
    addNotification({
      title: 'Subject Removed',
      message: `Removed "${subToDelete.subjectName}" from the grade card.`,
      type: 'info'
    });
  };

  // Update a subject mark (SA or FA) on the active student's Grade Card
  const handleGradeCardMarkChange = (slNo: number, field: 'sa' | 'fa', value: string) => {
    const num = value === '' ? null : Math.max(0, parseInt(value, 10) || 0);

    setGradeCards(prev => {
      const existingIdx = prev.findIndex(c => c.studentId === selectedStudentForCard);
      const baseCard = existingIdx >= 0 ? prev[existingIdx] : activeGradeCard;

      const updatedSubjects = baseCard.subjects.map(s => {
        if (s.slNo !== slNo) return s;
        let newSa = field === 'sa' ? (num !== null && s.saMax > 0 && num > s.saMax ? s.saMax : num) : s.saScored;
        let newFa = field === 'fa' ? (num !== null && s.faMax > 0 && num > s.faMax ? s.faMax : num) : s.faScored;

        const total = (newSa || 0) + (newFa || 0);
        const hasScore = newSa !== null || newFa !== null;
        const grade = hasScore ? calculateGradeFromTotal(total, s.totalMax) : '-';
        return {
          ...s,
          saScored: newSa,
          faScored: newFa,
          totalScored: hasScore ? total : null,
          grade
        };
      });

      const totalSaScored = updatedSubjects.reduce((sum, s) => sum + (s.saScored || 0), 0);
      const totalFaScored = updatedSubjects.reduce((sum, s) => sum + (s.faScored || 0), 0);
      const totalSaMax = updatedSubjects.reduce((sum, s) => sum + s.saMax, 0);
      const totalFaMax = updatedSubjects.reduce((sum, s) => sum + s.faMax, 0);
      const grandTotalScored = totalSaScored + totalFaScored;
      const grandTotalMax = totalSaMax + totalFaMax || 1700;
      const overallPercentage = grandTotalMax > 0 ? parseFloat(((grandTotalScored / grandTotalMax) * 100).toFixed(2)) : 0;
      const overallGrade = grandTotalScored > 0 ? calculateGradeFromTotal(overallPercentage, 100) : '-';
      const gpa = grandTotalScored > 0 ? parseFloat((2.5 + (overallPercentage / 100) * 1.5).toFixed(2)) : 0;
      const failed = updatedSubjects.filter(s => (s.totalScored || 0) < 40 && s.totalScored !== null).length;
      const performanceLevel = calculatePerformanceLevel(grandTotalScored, overallPercentage);

      const updatedCard: StudentGradeCard = {
        ...baseCard,
        subjects: updatedSubjects,
        totalSaScored,
        totalFaScored,
        totalSaMax,
        totalFaMax,
        grandTotalScored,
        grandTotalMax,
        overallPercentage,
        overallGrade,
        noOfSubjectsFailed: failed,
        gpa,
        performanceLevel
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedCard;
        return copy;
      }
      return [...prev, updatedCard];
    });
  };

  // Clear all marks for active student so user writes their own marks
  const handleClearMarks = () => {
    playChime('click');
    const blankCard = createStudentGradeCard(
      activeStudentObj.id,
      activeStudentObj.name,
      activeStudentObj.admissionNumber || '',
      activeStudentObj.roll || '',
      activeStudentObj.photo
    );
    setGradeCards(prev => {
      const filtered = prev.filter(c => c.studentId !== selectedStudentForCard);
      return [...filtered, blankCard];
    });
    addNotification({
      title: 'Marks Reset to Blank',
      message: `All subject marks cleared for ${activeStudentObj.name}. Ready for you to input marks.`,
      type: 'info'
    });
  };

  // Save current student's card notification
  const handleSaveStudentCard = () => {
    playChime('success');
    addNotification({
      title: 'Grade Card Saved & Synchronized! 📄',
      message: `Updated official Grade Card for ${activeStudentObj.name} (${activeGradeCard.grandTotalScored}/1700, Grade ${activeGradeCard.overallGrade}).`,
      type: 'success'
    });
  };

  const handleUpdateGradeCardMeta = (fields: Partial<StudentGradeCard>) => {
    setGradeCards(prev => {
      const existingIdx = prev.findIndex(c => c.studentId === selectedStudentForCard);
      const baseCard = existingIdx >= 0 ? prev[existingIdx] : activeGradeCard;
      const updatedCard = { ...baseCard, ...fields };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedCard;
        return copy;
      }
      return [...prev, updatedCard];
    });
  };

  const handleApplyExamTitleToAll = (title: string, year?: string) => {
    setGradeCards(prev => {
      if (prev.length === 0) return prev;
      return prev.map(c => ({
        ...c,
        examTitle: title,
        academicYear: year || c.academicYear
      }));
    });
    playChime('success');
    addNotification({
      title: 'Exam Title Applied to All Students',
      message: `Updated all grade cards to "${title}".`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-indigo-950/90 border border-rose-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <GraduationCap size={14} className="text-rose-400" />
            <span>AL-USWAH SUPER ADMIN • STUDENT MARKS PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span>Student Marks & Evaluation Portal 📝</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Create mark entries according to the official examination template. Generate, edit, and export Grade Cards matching the university certificate layout with SA, FA, GPA, and rank analytics.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex-wrap">
          <button
            onClick={() => {
              setActivePortalTab('grade_card');
              playChime('click');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'grade_card'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award size={14} />
            <span>Grade Card Portal (PDF Template)</span>
          </button>

          <button
            onClick={() => {
              setActivePortalTab('entry');
              playChime('click');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'entry'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen size={14} />
            <span>Subject Marks Entry Grid</span>
          </button>

          <button
            onClick={() => {
              setActivePortalTab('history');
              playChime('click');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'history'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Saved Marksheets ({savedMarksheets.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW: OFFICIAL GRADE CARD PORTAL (ACCORDING TO USER PDF)                  */}
      {/* ========================================================================= */}
      {activePortalTab === 'grade_card' && (
        <div className="space-y-6">
          {/* Student Selector & Configuration Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Student Grade Card Portal & Evaluation Ledger</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#78c257]/20 text-[#78c257] border border-[#78c257]/40 text-[10px] font-bold">
                      PDF Template Format
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a student to edit marks across all 17 subjects with Summative (SA / 70) & Formative (FA / 30) breakdown.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleClearMarks}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  title="Clear all subject marks for this student to start blank"
                >
                  <RotateCcw size={13} className="text-amber-400" />
                  <span>Clear Marks (Blank)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStudentCard}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Save size={14} />
                  <span>Save Grade Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCardToView(activeGradeCard);
                    playChime('click');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Printer size={14} />
                  <span>View & Export PDF Template</span>
                </button>
              </div>
            </div>

            {/* Student Picker Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Student *
                </label>
                <div className="relative">
                  <select
                    value={selectedStudentForCard}
                    onChange={e => {
                      setSelectedStudentForCard(e.target.value);
                      playChime('click');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
                  >
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Adm #{s.admissionNumber || '806'} • Roll {s.roll || '00'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Exam Title * (Editable)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleApplyExamTitleToAll(activeGradeCard.examTitle, activeGradeCard.academicYear)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition cursor-pointer underline"
                    title="Copy this title to all student grade cards"
                  >
                    Apply All
                  </button>
                </div>
                <input
                  type="text"
                  value={activeGradeCard.examTitle}
                  onChange={e => handleUpdateGradeCardMeta({ examTitle: e.target.value })}
                  placeholder="e.g. SEC. FOURTH YEAR HALF YEARLY EXAMINATION - AUG-2026"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={activeGradeCard.academicYear}
                  onChange={e => handleUpdateGradeCardMeta({ academicYear: e.target.value })}
                  placeholder="2026-2027"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Standard & Division
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={activeGradeCard.standard}
                    onChange={e => handleUpdateGradeCardMeta({ standard: e.target.value })}
                    placeholder="Standard"
                    className="w-full px-2.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="text"
                    value={activeGradeCard.division}
                    onChange={e => handleUpdateGradeCardMeta({ division: e.target.value })}
                    placeholder="Div"
                    className="w-full px-2.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white text-center focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-slate-800/80 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Grand Total</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {activeGradeCard.grandTotalScored} <span className="text-[10px] text-slate-500">/ 1700</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Percentage</div>
                <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                  {activeGradeCard.overallPercentage}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Grade</div>
                <div className="text-base font-black text-amber-400 mt-0.5">
                  {activeGradeCard.overallGrade}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Overall Rank</div>
                <div className="text-base font-black text-purple-300 font-mono mt-0.5">
                  {activeGradeCard.overallRank} <span className="text-[10px] text-slate-500">/ {activeGradeCard.totalRankStudents || 44}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Proficiency Level</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  {activeGradeCard.grandTotalScored > 0
                    ? calculatePerformanceLevel(activeGradeCard.grandTotalScored, activeGradeCard.overallPercentage)
                    : (activeGradeCard.performanceLevel && activeGradeCard.performanceLevel !== 'MPL' ? activeGradeCard.performanceLevel : '-')}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">GPA</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {activeGradeCard.gpa.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</div>
                <div className="text-base font-black text-emerald-300 font-mono mt-0.5">
                  {activeGradeCard.classAttendancePresent} / {activeGradeCard.classAttendanceTotal}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 17 Subjects Mark Entry Ledger */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span>Subject Examination Ledger & Mark Sheet ({activeStudentObj.name})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Input or adjust SA and FA marks directly. Add new subjects, edit codes, and modify subject parameters anytime.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddGradeCardSubject}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Plus size={14} />
                  <span>+ Add Subject & Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCardToView(activeGradeCard);
                    playChime('click');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} className="text-[#78c257]" />
                  <span>Preview Print Card</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 text-[11px]">
                    <th className="py-3 px-3 text-center w-12 border-r border-slate-800">SI.NO</th>
                    <th className="py-3 px-3 text-center w-24 border-r border-slate-800">Code</th>
                    <th className="py-3 px-4 border-r border-slate-800">Subject Name</th>
                    <th className="py-3 px-3 text-center border-r border-slate-800 bg-rose-950/20 w-32">
                      SA (Max 70)
                    </th>
                    <th className="py-3 px-3 text-center border-r border-slate-800 bg-indigo-950/20 w-32">
                      FA (Max 30/100)
                    </th>
                    <th className="py-3 px-3 text-center border-r border-slate-800 w-24">Total / 100</th>
                    <th className="py-3 px-3 text-center border-r border-slate-800 w-20">Grade</th>
                    <th className="py-3 px-3 text-center border-r border-slate-800 w-20">Class Avg</th>
                    <th className="py-3 px-3 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {activeGradeCard.subjects.map(sub => (
                    <tr key={sub.slNo} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 border-r border-slate-800">
                        {sub.slNo}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-300 border-r border-slate-800">
                        {sub.subjectCode || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white border-r border-slate-800">
                        {sub.subjectName}
                      </td>

                      {/* SA Input */}
                      <td className="py-2 px-3 border-r border-slate-800 bg-rose-950/10 text-center">
                        {sub.saMax > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max={sub.saMax}
                              value={sub.saScored ?? ''}
                              onChange={e => handleGradeCardMarkChange(sub.slNo, 'sa', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-500 text-xs"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">/ {sub.saMax}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">N/A</span>
                        )}
                      </td>

                      {/* FA Input */}
                      <td className="py-2 px-3 border-r border-slate-800 bg-indigo-950/10 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={sub.faMax}
                            value={sub.faScored ?? ''}
                            onChange={e => handleGradeCardMarkChange(sub.slNo, 'fa', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 text-xs"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">/ {sub.faMax}</span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-center font-mono font-black text-emerald-400 border-r border-slate-800">
                        {sub.totalScored ?? 0}
                      </td>

                      {/* Grade */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-800">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            sub.grade === 'A+' || sub.grade === 'A'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : sub.grade === 'B+' || sub.grade === 'B'
                              ? 'bg-blue-500/20 text-blue-300'
                              : sub.grade === 'C+' || sub.grade === 'C'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>

                      {/* Class Average */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 border-r border-slate-800">
                        {sub.average}
                      </td>

                      {/* Actions: Edit Code & Subject / Delete */}
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGradeCardSubject(sub)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition cursor-pointer"
                            title="Edit Subject Code, Name & Marks"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGradeCardSubject(sub.slNo)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 transition cursor-pointer"
                            title="Remove Subject"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Summary Bottom Row */}
                  <tr className="bg-slate-950 font-black text-slate-100 border-t-2 border-slate-800">
                    <td colSpan={3} className="py-3 px-4 border-r border-slate-800 text-right uppercase tracking-wider text-xs">
                      Grand Totals:
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-rose-300 border-r border-slate-800">
                      {activeGradeCard.totalSaScored} / {activeGradeCard.totalSaMax}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-indigo-300 border-r border-slate-800">
                      {activeGradeCard.totalFaScored} / {activeGradeCard.totalFaMax}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400 text-sm border-r border-slate-800">
                      {activeGradeCard.grandTotalScored} / {activeGradeCard.grandTotalMax}
                    </td>
                    <td className="py-3 px-3 text-center text-amber-400 text-sm border-r border-slate-800">
                      {activeGradeCard.overallGrade}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400 border-r border-slate-800">
                      72.06
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] text-slate-500 font-mono">
                      {activeGradeCard.subjects.length} Subj
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-400" />
                <span>All {activeGradeCard.subjects.length} subjects saved in local state and synchronized across students & officers.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveStudentCard}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save size={15} />
                  <span>Save Student Record</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCardToView(activeGradeCard);
                    playChime('click');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Export Grade Card PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT & MODIFY CODE                                  */}
      {/* ========================================================================= */}
      {showSubjectManageModal && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowSubjectManageModal(false);
          }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                <h3 className="font-extrabold text-base text-white">
                  {editingSubjectSlNo ? 'Edit Subject & Subject Code' : 'Add New Subject & Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectManageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGradeCardSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Subject Code (e.g. S428, S404) <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={subjFormCode}
                  onChange={e => setSubjFormCode(e.target.value)}
                  placeholder="e.g. S428"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Subject Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjFormName}
                  onChange={e => setSubjFormName(e.target.value)}
                  placeholder="e.g. Islamic History, Mathematics"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">SA Max Mark (Default 70)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subjFormSaMax}
                    onChange={e => setSubjFormSaMax(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">FA Max Mark (Default 30)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subjFormFaMax}
                    onChange={e => setSubjFormFaMax(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Class Average Benchmark</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={subjFormAvg}
                  onChange={e => setSubjFormAvg(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applySubjectToAllStudents}
                  onChange={e => setApplySubjectToAllStudents(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 font-medium">
                  Apply this subject modification across all students' grade cards
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectManageModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  {editingSubjectSlNo ? 'Save Subject Changes' : 'Add Subject to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL PDF GRADE CARD PREVIEW & EXPORT                           */}
      {/* ========================================================================= */}
      {selectedGradeCardToView && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGradeCardToView(null);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed-none"
        >
          {/* Floating Sticky Close Button that NEVER scrolls away */}
          <button
            type="button"
            onClick={() => setSelectedGradeCardToView(null)}
            className="fixed top-4 right-4 z-[70] px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition cursor-pointer print:hidden border border-rose-400"
          >
            <X size={15} />
            <span>Close Window [✕]</span>
          </button>

          <div className="w-full max-w-4xl my-8 relative animate-in fade-in zoom-in-95 print:my-0 print:max-w-none">
            <GradeCardTemplate
              card={selectedGradeCardToView}
              onClose={() => setSelectedGradeCardToView(null)}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: MARKS ENTRY GRID                                                   */}
      {/* ========================================================================= */}
      {activePortalTab === 'entry' && (
        <div className="space-y-6">
          {/* Subject & Exam Configuration Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Subject & Examination Parameters</h3>
                  <p className="text-[11px] text-slate-400">
                    Configure syllabus subject, term, full marks, and pass requirements
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddSubjectModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Custom Subject</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class Subject *
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={e => {
                      setSelectedSubject(e.target.value);
                      playChime('click');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
                  >
                    {subjectList.map(subj => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Exam Term Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Examination Term *
                </label>
                <div className="relative">
                  <select
                    value={selectedExamTerm}
                    onChange={e => {
                      setSelectedExamTerm(e.target.value);
                      playChime('click');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
                  >
                    {defaultExamTerms.map(term => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Total / Full Marks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Full Marks
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={maxMarks}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10) || 100;
                    setMaxMarks(val);
                    setPassMarks(Math.round(val * 0.33));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Passing Marks & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxMarks}
                    value={passMarks}
                    onChange={e => setPassMarks(parseInt(e.target.value, 10) || 33)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Analytics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Progress Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Entered Progress</div>
              <div className="text-xl font-extrabold text-white mt-1">
                {filledCount} / {totalStudentsCount}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Class Average Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Class Average</div>
              <div className="text-xl font-extrabold text-indigo-400 mt-1">
                {averageScore} <span className="text-xs text-slate-500 font-normal">/ {maxMarks}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {Math.round((averageScore / maxMarks) * 100)}% Average
              </div>
            </div>

            {/* Highest Score Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Highest Score</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {highestScore} <span className="text-xs text-slate-500 font-normal">/ {maxMarks}</span>
              </div>
              <div className="text-[10px] text-emerald-400 truncate mt-1">
                {topperStudent ? topperStudent.studentName : 'None'}
              </div>
            </div>

            {/* Lowest Score Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Lowest Score</div>
              <div className="text-xl font-extrabold text-rose-400 mt-1">
                {lowestScore} <span className="text-xs text-slate-500 font-normal">/ {maxMarks}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Passing: {passMarks}
              </div>
            </div>

            {/* Pass Rate Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Pass Rate</div>
              <div className="text-xl font-extrabold text-teal-400 mt-1">
                {passRate}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {passedCount} Pass • {failedCount} Fail
              </div>
            </div>

            {/* Grade Breakdown Pill */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400 font-medium">Grade Counts</div>
              <div className="flex items-center gap-1 flex-wrap mt-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  A+: {gradeCounts['A+']}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                  A: {gradeCounts['A']}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                  F: {gradeCounts['F']}
                </span>
              </div>
            </div>
          </div>

          {/* Table Control Bar & Bulk Tools */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student or admission number..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 text-xs overflow-x-auto">
                {(['ALL', 'PENDING', 'FILLED', 'FAILING', 'ABSENT'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFilterMode(f);
                      playChime('click');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      filterMode === f
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleFillSampleMarks}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Fill realistic sample scores for instant testing"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>Sample Scores</span>
              </button>

              <button
                type="button"
                onClick={handleFillPassingToEmpty}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Fill pass marks to all empty boxes"
              >
                <CheckCircle size={13} className="text-emerald-400" />
                <span>Fill Pass Marks</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllMarks}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Student Marks Entry Grid Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold text-center w-16">Roll</th>
                    <th className="py-3 px-4 font-bold w-36">Admission No</th>
                    <th className="py-3 px-4 font-bold">Student Name</th>
                    <th className="py-3 px-4 font-bold text-center w-40">
                      Marks Input ({maxMarks})
                    </th>
                    <th className="py-3 px-4 font-bold text-center w-20">Absent?</th>
                    <th className="py-3 px-4 font-bold text-center w-24">Percentage</th>
                    <th className="py-3 px-4 font-bold text-center w-20">Grade</th>
                    <th className="py-3 px-4 font-bold text-center w-20">GPA</th>
                    <th className="py-3 px-4 font-bold text-center w-28">Result</th>
                    <th className="py-3 px-4 font-bold w-48">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                        No students found matching current filter or search query.
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((entry, index) => {
                      const isFilled = entry.marksObtained !== null || entry.isAbsent;
                      const hasFailed = entry.status === 'FAILED' || entry.isAbsent;

                      return (
                        <tr
                          key={entry.studentId}
                          className={`hover:bg-slate-850/50 transition ${
                            entry.isAbsent
                              ? 'bg-rose-950/10'
                              : isFilled
                              ? 'bg-transparent'
                              : 'bg-amber-500/5'
                          }`}
                        >
                          {/* Roll Number */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-300">
                            {entry.roll}
                          </td>

                          {/* Admission Number */}
                          <td className="py-3 px-4 font-mono font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-indigo-300">
                              {entry.admissionNumber}
                            </span>
                          </td>

                          {/* Student Name & Photo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  entry.photo ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                                }
                                alt={entry.studentName}
                                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                              />
                              <div className="font-bold text-white text-xs truncate max-w-[180px]">
                                {entry.studentName}
                              </div>
                            </div>
                          </td>

                          {/* Marks Input Box */}
                          <td className="py-3 px-4 text-center">
                            <div className="relative inline-block w-32">
                              <input
                                ref={el => {
                                  inputRefs.current[entry.studentId] = el;
                                }}
                                type="number"
                                min="0"
                                max={maxMarks}
                                step="any"
                                disabled={entry.isAbsent}
                                placeholder="Marks"
                                value={entry.marksObtained !== null ? entry.marksObtained : ''}
                                onChange={e => handleMarkChange(entry.studentId, e.target.value)}
                                onKeyDown={e => {
                                  // Jump to next row on Enter
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const nextIndex = index + 1;
                                    if (nextIndex < displayedStudents.length) {
                                      const nextStudentId = displayedStudents[nextIndex].studentId;
                                      inputRefs.current[nextStudentId]?.focus();
                                    }
                                  }
                                }}
                                className={`w-full text-center px-3 py-2 rounded-xl text-xs font-bold font-mono transition focus:outline-none ${
                                  entry.isAbsent
                                    ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                                    : entry.marksObtained !== null
                                    ? entry.marksObtained >= passMarks
                                      ? 'bg-slate-950 border border-emerald-500/50 text-emerald-300 focus:border-emerald-400'
                                      : 'bg-rose-950/30 border border-rose-500/60 text-rose-300 focus:border-rose-400'
                                    : 'bg-slate-950 border border-slate-800 text-white focus:border-rose-500'
                                }`}
                              />
                            </div>
                          </td>

                          {/* Absent Toggle Button */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAbsent(entry.studentId)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                                entry.isAbsent
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                              }`}
                            >
                              {entry.isAbsent ? 'ABS' : 'Present'}
                            </button>
                          </td>

                          {/* Percentage % */}
                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                            {entry.isAbsent
                              ? '0%'
                              : entry.percentage !== undefined
                              ? `${entry.percentage}%`
                              : '-'}
                          </td>

                          {/* Grade Badge */}
                          <td className="py-3 px-4 text-center">
                            {entry.grade ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                                  entry.grade === 'A+'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : entry.grade === 'A' || entry.grade === 'A-'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : entry.grade === 'B' || entry.grade === 'C'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {entry.grade}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* GPA Points */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                            {entry.gpa !== undefined ? entry.gpa.toFixed(2) : '-'}
                          </td>

                          {/* Result Status */}
                          <td className="py-3 px-4 text-center">
                            {entry.status === 'PASSED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                <Check size={11} strokeWidth={3} />
                                <span>Passed</span>
                              </span>
                            ) : entry.status === 'FAILED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                <X size={11} strokeWidth={3} />
                                <span>Failed</span>
                              </span>
                            ) : entry.status === 'ABSENT' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                                Absent
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-medium">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Remarks */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={entry.remarks || ''}
                              onChange={e => handleRemarksChange(entry.studentId, e.target.value)}
                              placeholder="e.g. Excellent / Revision"
                              className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Final Submit Bar */}
            <div className="p-5 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span>
                    {filledCount} of {totalStudentsCount} Student Boxes Entered
                  </span>
                </span>
                <span>•</span>
                <span>Subject: <strong className="text-white">{selectedSubject}</strong></span>
                <span>•</span>
                <span>Max Marks: <strong className="text-white">{maxMarks}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmitMarksheet}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-rose-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Submit & Publish Marksheet</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: SAVED MARKSHEETS ARCHIVE                                           */}
      {/* ========================================================================= */}
      {activePortalTab === 'history' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-indigo-400" />
                  <span>Published Class Marksheets & Archives</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Access previously published marksheets, print tabulation records, or download CSV files
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActivePortalTab('entry');
                  playChime('click');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20"
              >
                <Plus size={14} />
                <span>New Marksheet Entry</span>
              </button>
            </div>

            {savedMarksheets.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <GraduationCap size={40} className="mx-auto text-slate-600" />
                <h4 className="text-sm font-bold text-slate-300">No Marksheets Published Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Go to the Marks Entry Grid, enter student marks for any subject, and submit to create your first official marksheet.
                </p>
                <button
                  type="button"
                  onClick={() => setActivePortalTab('entry')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Open Marks Entry Grid
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedMarksheets.map(sheet => (
                  <div
                    key={sheet.id}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold uppercase">
                          <span>{sheet.subject}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mt-1.5">{sheet.examTerm}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Date: {sheet.examDate} • Max: {sheet.maxMarks}
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {sheet.passPercentage}% Pass
                      </span>
                    </div>

                    {/* Stats overview */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Average</div>
                        <div className="text-xs font-bold text-indigo-300">{sheet.averageMarks}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Highest</div>
                        <div className="text-xs font-bold text-emerald-300">{sheet.highestMarks}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Students</div>
                        <div className="text-xs font-bold text-slate-200">{sheet.entries.length}</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMarksheetToView(sheet);
                          setActivePortalTab('print');
                          playChime('click');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Printer size={13} className="text-indigo-400" />
                        <span>View / Print Sheet</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleExportCSV(sheet)}
                          title="Export CSV"
                          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                        >
                          <FileSpreadsheet size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const conf = window.confirm(`Delete marksheet for ${sheet.subject}?`);
                            if (conf) {
                              setSavedMarksheets(prev => prev.filter(s => s.id !== sheet.id));
                              playChime('alert');
                            }
                          }}
                          title="Delete Record"
                          className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: OFFICIAL TABULATION & PRINT SHEET                                  */}
      {/* ========================================================================= */}
      {activePortalTab === 'print' && selectedMarksheetToView && (
        <div className="space-y-6">
          {/* Print Controls Bar (Sticky Top) */}
          <div className="sticky top-2 z-40 p-4 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-slate-800 flex items-center justify-between gap-4 print:hidden shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setActivePortalTab('entry');
                playChime('click');
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
            >
              <X size={15} />
              <span>Close / Return to Marks Portal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportCSV(selectedMarksheetToView)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Printer size={15} />
                <span>Print Tabulation Sheet</span>
              </button>
            </div>
          </div>

          {/* Printable Official Tabulation Document */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl print:border-none print:shadow-none print:p-0 print:rounded-none">
            {/* Institution Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Official Academic Tabulation Sheet
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                AL-USWAH ACADEMY • CLASS 10-A
              </h2>
              <div className="text-xs text-slate-600 mt-1 font-semibold">
                Science & Technology Section • Session 2026 - 2027
              </div>
            </div>

            {/* Exam Details Sub-Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs mb-6">
              <div>
                <span className="text-slate-500 font-semibold">Subject:</span>
                <div className="font-bold text-slate-900 text-sm">{selectedMarksheetToView.subject}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Examination Term:</span>
                <div className="font-bold text-slate-900">{selectedMarksheetToView.examTerm}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Full / Pass Marks:</span>
                <div className="font-bold text-slate-900">
                  {selectedMarksheetToView.maxMarks} / {selectedMarksheetToView.passMarks}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Exam Date:</span>
                <div className="font-bold text-slate-900">{selectedMarksheetToView.examDate}</div>
              </div>
            </div>

            {/* Official Student Tabulation Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left border-collapse text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-12">Roll</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 w-36">Admission No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Student Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-28">
                      Marks ({selectedMarksheetToView.maxMarks})
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Percentage</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Grade</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">GPA</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Result</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {selectedMarksheetToView.entries.map((entry, idx) => (
                    <tr key={entry.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono font-bold">
                        {entry.roll}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-800">
                        {entry.admissionNumber}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-900">
                        {entry.studentName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono font-bold">
                        {entry.isAbsent ? (
                          <span className="text-rose-600 font-bold">ABSENT</span>
                        ) : (
                          entry.marksObtained ?? 'N/A'
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono">
                        {entry.percentage !== undefined ? `${entry.percentage}%` : '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                        {entry.grade ?? '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono font-bold">
                        {entry.gpa !== undefined ? entry.gpa.toFixed(2) : '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                        {entry.status === 'PASSED' ? (
                          <span className="text-emerald-700">PASS</span>
                        ) : entry.status === 'FAILED' ? (
                          <span className="text-rose-700">FAIL</span>
                        ) : (
                          <span className="text-slate-500">ABS</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600 italic">
                        {entry.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs mb-10">
              <div>
                <span className="text-slate-500">Total Enrolled:</span>
                <div className="font-bold text-slate-900">{selectedMarksheetToView.totalStudents} Students</div>
              </div>
              <div>
                <span className="text-slate-500">Class Average:</span>
                <div className="font-bold text-slate-900">{selectedMarksheetToView.averageMarks} Marks</div>
              </div>
              <div>
                <span className="text-slate-500">Highest Marks:</span>
                <div className="font-bold text-slate-900">{selectedMarksheetToView.highestMarks} Marks</div>
              </div>
              <div>
                <span className="text-slate-500">Passing Rate:</span>
                <div className="font-bold text-emerald-700 text-sm">{selectedMarksheetToView.passPercentage}%</div>
              </div>
            </div>

            {/* Official Signature Lines */}
            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-300 mt-12 text-center text-xs">
              <div>
                <div className="w-48 mx-auto border-b border-slate-800 pb-1 mb-2 font-bold text-slate-900">
                  Abu Saleh
                </div>
                <div className="text-slate-600 font-semibold">Super Admin / Class IT Officer</div>
                <div className="text-[10px] text-slate-500">AL-USWAH Class Command Center</div>
              </div>

              <div>
                <div className="w-48 mx-auto border-b border-slate-800 pb-1 mb-2 font-bold text-slate-900">
                  Dr. Nusrat Jahan
                </div>
                <div className="text-slate-600 font-semibold">Class Head Teacher</div>
                <div className="text-[10px] text-slate-500">AL-USWAH Academic Directorate</div>
              </div>
            </div>
          </div>

          {/* Bottom Return / Close Bar */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between text-white print:hidden">
            <span className="text-xs text-slate-400">
              Finished reviewing tabulation sheet?
            </span>
            <button
              type="button"
              onClick={() => {
                setActivePortalTab('entry');
                playChime('click');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <X size={15} className="text-rose-400" />
              <span>Close Print View & Return to Marks Entry</span>
            </button>
          </div>

          {/* Floating Exit Button */}
          <button
            type="button"
            onClick={() => {
              setActivePortalTab('entry');
              playChime('click');
            }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 cursor-pointer print:hidden border border-rose-400 hover:scale-105 transition-transform"
          >
            <X size={16} />
            <span>Close & Return [✕]</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM SUBJECT                                                */}
      {/* ========================================================================= */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-sm font-bold text-white">Add Custom Subject</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubjectInput}
                  onChange={e => setNewSubjectInput(e.target.value)}
                  placeholder="e.g. Accounting, Geography, Statistics..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSubjectInput.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
