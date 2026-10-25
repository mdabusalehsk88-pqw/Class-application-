import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  CheckCircle,
  QrCode,
  Users,
  CheckCheck,
  Download,
  X,
  Sparkles,
  Calendar
} from 'lucide-react';

interface StudentRoster {
  roll: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

const initialRoster: StudentRoster[] = [
  { roll: '01', name: 'Rafiul Islam (CR)', status: 'PRESENT' },
  { roll: '02', name: 'Sadia Jahan', status: 'PRESENT' },
  { roll: '03', name: 'Zubair Hossain', status: 'PRESENT' },
  { roll: '04', name: 'Samiha Islam', status: 'PRESENT' },
  { roll: '05', name: 'Tahmid Hasan', status: 'LATE' },
  { roll: '06', name: 'Nabila Chowdhury', status: 'PRESENT' },
  { roll: '07', name: 'Tanvir Ahmed', status: 'PRESENT' },
  { roll: '08', name: 'Farhan Kabir', status: 'ABSENT' },
  { roll: '09', name: 'Tasnim Akhter', status: 'PRESENT' },
  { roll: '10', name: 'Shakib Al Hasan', status: 'LEAVE' }
];

export const TeacherAttendanceManager: React.FC = () => {
  const [roster, setRoster] = useState<StudentRoster[]>(initialRoster);
  const [selectedClass, setSelectedClass] = useState('Grade 10 (Section A)');
  const [showQRModal, setShowQRModal] = useState(false);
  const { playChime, addNotification } = useNotifications();

  const handleStatusChange = (roll: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE') => {
    setRoster(prev =>
      prev.map(st => (st.roll === roll ? { ...st, status: newStatus } : st))
    );
    playChime('click');
  };

  const handleMarkAllPresent = () => {
    setRoster(prev => prev.map(st => ({ ...st, status: 'PRESENT' })));
    playChime('success');
    addNotification({
      title: 'All Marked Present',
      message: `All students in ${selectedClass} marked present with one click.`,
      type: 'info'
    });
  };

  const handleSaveAttendance = () => {
    playChime('levelUp');
    addNotification({
      title: 'Attendance Saved to Database! ✅',
      message: `Today's attendance record for ${selectedClass} has been finalized. Absent alerts dispatched to parents.`,
      type: 'success'
    });
  };

  const presentCount = roster.filter(s => s.status === 'PRESENT').length;
  const absentCount = roster.filter(s => s.status === 'ABSENT').length;
  const lateCount = roster.filter(s => s.status === 'LATE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle size={14} />
            <span>Teacher Attendance Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Digital Attendance Roster & Dynamic QR
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Session Date: Today • Period 1 (Physics Lecture) • {selectedClass}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <QrCode size={15} />
            <span>Generate Live QR</span>
          </button>
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-200 hover:text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck size={15} />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleSaveAttendance}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow cursor-pointer"
          >
            Finalize & Save
          </button>
        </div>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <div className="text-slate-400">Total Enrolled</div>
          <div className="text-xl font-extrabold text-white mt-1">{roster.length} Students</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <div className="text-emerald-400">Present</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{presentCount}</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <div className="text-rose-400">Absent</div>
          <div className="text-xl font-extrabold text-rose-400 mt-1">{absentCount}</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <div className="text-amber-400">Late</div>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{lateCount}</div>
        </div>
      </div>

      {/* Interactive Roster Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Student Attendance Roster ({selectedClass})</h3>
          <span className="text-xs text-slate-400">Click pill buttons to toggle attendance state</span>
        </div>

        <div className="divide-y divide-slate-800">
          {roster.map(st => (
            <div
              key={st.roll}
              className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-850/50 px-2 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 font-mono font-bold flex items-center justify-center text-xs">
                  {st.roll}
                </span>
                <div>
                  <div className="font-bold text-xs text-white">{st.name}</div>
                  <div className="text-[10px] text-slate-400">Roll: {st.roll}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.roll, 'PRESENT')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    st.status === 'PRESENT'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.roll, 'ABSENT')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    st.status === 'ABSENT'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Absent
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.roll, 'LATE')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    st.status === 'LATE'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Late
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.roll, 'LEAVE')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    st.status === 'LEAVE'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Classroom Live QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-white rounded-2xl mx-auto w-fit shadow-xl">
              {/* Simulated QR Code SVG */}
              <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center rounded-xl p-3 relative">
                <div className="absolute inset-2 border-2 border-dashed border-indigo-400/50 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <QrCode size={64} className="text-white mx-auto" />
                    <span className="text-[10px] text-indigo-300 font-mono font-bold block">
                      SMARTCLASS-ATT-10A
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-bold text-white">Dynamic Session Security</p>
              <p>Students must scan this code using their SmartClass student mobile app within 60 seconds.</p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Close QR Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
