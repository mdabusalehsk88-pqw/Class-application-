import React, { useState } from 'react';
import { useInstitution } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import { ClassRoutineItem } from '../../types';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Clock,
  User,
  MapPin,
  Save,
  RotateCcw,
  Sparkles,
  BookOpen,
  X,
  Check
} from 'lucide-react';

export const SuperAdminRoutine: React.FC = () => {
  const { routines, addRoutineSlot, updateRoutineSlot, deleteRoutineSlot, resetRoutine } = useInstitution();
  const { playChime, addNotification } = useNotifications();

  const days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Saturday')[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Saturday'
  ];

  // Modal State
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form Fields
  const [slotDay, setSlotDay] = useState<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Saturday'>('Sunday');
  const [slotPeriod, setSlotPeriod] = useState<number>(1);
  const [slotSubject, setSlotSubject] = useState('');
  const [slotTeacher, setSlotTeacher] = useState('');
  const [slotRoom, setSlotRoom] = useState('Room-301');
  const [slotStartTime, setSlotStartTime] = useState('08:30 AM');
  const [slotEndTime, setSlotEndTime] = useState('09:20 AM');
  const [slotColor, setSlotColor] = useState('#6366f1');

  const openAddModal = (day: typeof slotDay) => {
    setEditingSlotId(null);
    setSlotDay(day);
    const daySlots = routines.filter(r => r.day === day);
    const nextPeriod = daySlots.length > 0 ? Math.max(...daySlots.map(s => s.period)) + 1 : 1;
    setSlotPeriod(nextPeriod);
    setSlotSubject('');
    setSlotTeacher('Dr. Nusrat Jahan');
    setSlotRoom('Room-301');
    setSlotStartTime('08:30 AM');
    setSlotEndTime('09:20 AM');
    setSlotColor('#6366f1');
    setShowSlotModal(true);
    playChime('click');
  };

  const openEditModal = (slot: ClassRoutineItem) => {
    setEditingSlotId(slot.id);
    setSlotDay(slot.day as any);
    setSlotPeriod(slot.period);
    setSlotSubject(slot.subject);
    setSlotTeacher(slot.teacher);
    setSlotRoom(slot.room);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotColor(slot.color || '#6366f1');
    setShowSlotModal(true);
    playChime('click');
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubject.trim()) return;

    if (editingSlotId) {
      updateRoutineSlot(editingSlotId, {
        day: slotDay as any,
        period: Number(slotPeriod),
        subject: slotSubject.trim(),
        subjectBn: slotSubject.trim(),
        teacher: slotTeacher.trim(),
        room: slotRoom.trim(),
        startTime: slotStartTime.trim(),
        endTime: slotEndTime.trim(),
        color: slotColor
      });
    } else {
      addRoutineSlot({
        day: slotDay as any,
        dayBn: slotDay,
        period: Number(slotPeriod),
        startTime: slotStartTime.trim(),
        endTime: slotEndTime.trim(),
        subject: slotSubject.trim(),
        subjectBn: slotSubject.trim(),
        teacher: slotTeacher.trim(),
        room: slotRoom.trim(),
        color: slotColor,
        class: 'Grade 10',
        section: 'A'
      });
    }

    setShowSlotModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <CalendarDays size={14} />
            <span>AL-USWAH Weekly Routine Builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Build & Customize Routine with Days (Box by Box)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize periods into day boxes (Sunday - Thursday & Saturday). Add, edit, or remove time slots and synchronize with all class students.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetRoutine();
              addNotification({
                title: 'Routine Reset',
                message: 'Class routine reset to standard academic default.',
                type: 'info'
              });
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700/80 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Default</span>
          </button>
          <button
            onClick={() => openAddModal('Sunday')}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Add New Slot</span>
          </button>
        </div>
      </div>

      {/* Days in Box-by-Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map(dayName => {
          const daySlots = routines
            .filter(r => r.day === dayName)
            .sort((a, b) => a.period - b.period);

          return (
            <div
              key={dayName}
              className="rounded-3xl bg-slate-900/85 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Day Box Header */}
              <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-extrabold text-xs">
                    {dayName.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{dayName}</h3>
                    <p className="text-[10px] text-slate-400">{daySlots.length} Scheduled Periods</p>
                  </div>
                </div>

                <button
                  onClick={() => openAddModal(dayName)}
                  className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-[11px] font-bold border border-indigo-500/30 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add Period</span>
                </button>
              </div>

              {/* Day Box Periods Content */}
              <div className="p-4 space-y-3 flex-1">
                {daySlots.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No periods assigned for {dayName}.
                    <button
                      onClick={() => openAddModal(dayName)}
                      className="block mx-auto mt-2 text-indigo-400 hover:underline font-bold"
                    >
                      + Add Period 1
                    </button>
                  </div>
                ) : (
                  daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Period {slot.period}
                            </span>
                            <span className="text-xs font-bold text-white">{slot.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-cyan-400" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <User size={11} className="text-slate-500" />
                              <span>{slot.teacher}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-500" />
                              <span>{slot.room}</span>
                            </span>
                          </div>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
                            title="Edit Period"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteRoutineSlot(slot.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                            title="Delete Period"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Day Box Footer Quick Add */}
              <div className="p-3 bg-slate-950/40 border-t border-slate-800/80">
                <button
                  onClick={() => openAddModal(dayName)}
                  className="w-full py-1.5 text-center text-xs font-bold text-slate-400 hover:text-indigo-300 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Next Period to {dayName}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== ADD / EDIT PERIOD MODAL ===================== */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingSlotId ? 'Edit Routine Period' : 'Add Period to Routine Box'}
                  </h3>
                  <p className="text-xs text-slate-400">AL-USWAH Weekly Timetable</p>
                </div>
              </div>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              {/* Day & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={slotDay}
                    onChange={e => setSlotDay(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Period Number</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={slotPeriod}
                    onChange={e => setSlotPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Advanced Math, ICT"
                  value={slotSubject}
                  onChange={e => setSlotSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Teacher & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Teacher</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Nusrat Jahan"
                    value={slotTeacher}
                    onChange={e => setSlotTeacher(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab-301 or Hall-402"
                    value={slotRoom}
                    onChange={e => setSlotRoom(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="08:30 AM"
                    value={slotStartTime}
                    onChange={e => setSlotStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="09:20 AM"
                    value={slotEndTime}
                    onChange={e => setSlotEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{editingSlotId ? 'Save Changes' : 'Save to Routine Box'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
