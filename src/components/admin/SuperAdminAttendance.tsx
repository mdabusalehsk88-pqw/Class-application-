import React, { useState, useEffect } from 'react';
import { useInstitution } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Users,
  CheckCheck,
  CalendarDays,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export const SuperAdminAttendance: React.FC = () => {
  const { studentsList, saveAttendance, getAttendanceForDate, attendanceHistory } = useInstitution();
  const { playChime, addNotification } = useNotifications();

  // Current date initialization (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayStr.slice(0, 7)); // YYYY-MM
  const [search, setSearch] = useState('');

  // Local attendance status map: { [studentId]: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [records, setRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [isModified, setIsModified] = useState(false);

  // Load records whenever selectedDate changes
  useEffect(() => {
    const existing = getAttendanceForDate(selectedDate);
    setRecords(existing);
    setIsModified(false);
  }, [selectedDate, attendanceHistory]);

  // When selectedMonth changes, update selectedDate to first day or keep day if in month
  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    const day = selectedDate.split('-')[2] || '01';
    setSelectedDate(`${newMonth}-${day}`);
    playChime('click');
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedMonth(newDate.slice(0, 7));
    playChime('click');
  };

  const studentsOnly = studentsList.filter(s => s.role === 'STUDENT');

  const toggleStudentStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsModified(true);
    playChime('click');
  };

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    studentsOnly.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(prev => ({ ...prev, ...updated }));
    setIsModified(true);
    playChime('success');
  };

  const handleSave = () => {
    saveAttendance(selectedDate, records);
    setIsModified(false);
  };

  // Stats calculation
  const totalStudents = studentsOnly.length;
  const presentCount = studentsOnly.filter(s => records[s.id] === 'PRESENT').length;
  const absentCount = studentsOnly.filter(s => records[s.id] === 'ABSENT').length;
  const lateCount = studentsOnly.filter(s => records[s.id] === 'LATE').length;
  const attendanceRate = totalStudents ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filter students
  const filteredStudents = studentsOnly.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.roll && s.roll.includes(search)) ||
      (s.admissionNumber && s.admissionNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle size={14} />
            <span>AL-USWAH Daily Attendance Register</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Take & Manage Class Attendance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any month and date, record student presence, late arrivals, or absences, and save to official records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
              isModified
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Save size={16} />
            <span>{isModified ? 'Save Attendance *' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Date & Month Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
        {/* Month Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <CalendarDays size={14} className="text-indigo-400" />
            <span>Select Month</span>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => handleMonthChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          />
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar size={14} className="text-cyan-400" />
            <span>Select Specific Date</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => handleDateChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          />
        </div>

        {/* Search Box */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Search size={14} className="text-slate-400" />
            <span>Find Student</span>
          </label>
          <input
            type="text"
            placeholder="Search by name, roll, or admission #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* KPI Stats for Selected Date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Students</div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalStudents}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Enrolled in AL-USWAH</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50">
          <div className="text-[11px] font-bold text-emerald-400 uppercase">Present Today</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{presentCount}</div>
          <div className="text-[10px] text-emerald-300/70 mt-0.5">{attendanceRate}% attendance rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50">
          <div className="text-[11px] font-bold text-rose-400 uppercase">Absent</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{absentCount}</div>
          <div className="text-[10px] text-rose-300/70 mt-0.5">Unexcused or notified</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50">
          <div className="text-[11px] font-bold text-amber-400 uppercase">Late Arrivals</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{lateCount}</div>
          <div className="text-[10px] text-amber-300/70 mt-0.5">Arrived after 08:35 AM</div>
        </div>
      </div>

      {/* Batch Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span>Date:</span>
          <span className="px-2.5 py-1 bg-slate-800 text-cyan-300 rounded-lg font-mono font-bold">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('PRESENT')}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck size={14} />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <XCircle size={14} />
            <span>Mark All Absent</span>
          </button>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Roll</th>
                <th className="p-4">Student</th>
                <th className="p-4">Admission #</th>
                <th className="p-4">Gender</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Quick Mark Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map(student => {
                const currentStatus = records[student.id] || 'PRESENT';

                return (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition">
                    {/* Roll */}
                    <td className="p-4 font-mono font-bold text-white">
                      <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">
                        {student.roll || 'N/A'}
                      </span>
                    </td>

                    {/* Student Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            student.photo ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white">{student.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Admission Number */}
                    <td className="p-4 font-mono font-semibold text-cyan-300">
                      {student.admissionNumber || 'ADM-2026-000'}
                    </td>

                    {/* Gender */}
                    <td className="p-4 text-slate-400">{student.gender || 'Student'}</td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentStatus === 'ABSENT'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {currentStatus === 'PRESENT' && <CheckCircle size={12} />}
                        {currentStatus === 'ABSENT' && <XCircle size={12} />}
                        {currentStatus === 'LATE' && <Clock size={12} />}
                        <span>{currentStatus}</span>
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center p-1 bg-slate-800/90 rounded-2xl border border-slate-700/80 gap-1">
                        <button
                          onClick={() => toggleStudentStatus(student.id, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-slate-400 hover:text-emerald-300'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(student.id, 'LATE')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-600 text-white shadow'
                              : 'text-slate-400 hover:text-amber-300'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(student.id, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-slate-400 hover:text-rose-300'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
