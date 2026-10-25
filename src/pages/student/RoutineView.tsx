import React, { useState } from 'react';
import { useInstitution } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Download
} from 'lucide-react';

export const RoutineView: React.FC = () => {
  const { routines } = useInstitution();
  const [viewMode, setViewMode] = useState<'WEEKLY' | 'DAILY'>('WEEKLY');
  const [selectedDay, setSelectedDay] = useState<string>('Sunday');
  const { playChime, addNotification } = useNotifications();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];

  const handleExport = () => {
    playChime('success');
    addNotification({
      title: 'Routine Download Complete',
      message: 'Your 2026-2027 academic class routine has been exported as PDF.',
      type: 'success'
    });
  };

  const filteredRoutines = (routines || []).filter(r =>
    viewMode === 'DAILY' ? r.day === selectedDay : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Calendar size={14} />
            <span>Weekly Class Timetable</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Grade 10 (Section A) Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            08:30 AM to 02:00 PM • Room and STEM Lab Allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-800 rounded-2xl border border-slate-700">
            <button
              onClick={() => {
                setViewMode('WEEKLY');
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'WEEKLY' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => {
                setViewMode('DAILY');
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'DAILY' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Timeline
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Day Selector (for Daily mode) */}
      {viewMode === 'DAILY' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {days.map(d => (
            <button
              key={d}
              onClick={() => {
                setSelectedDay(d);
                playChime('click');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                selectedDay === d
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutines.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/40 transition shadow-lg relative overflow-hidden group"
          >
            {/* Top Period Badge & Day */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 text-[11px] font-bold border border-slate-700">
                Period #{item.period} • {item.day}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold font-mono">
                <Clock size={12} className="text-slate-500" />
                <span>{item.startTime} - {item.endTime}</span>
              </div>
            </div>

            {/* Subject Title */}
            <div className="mb-3">
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                {item.subject}
              </h3>
              <div className="text-xs text-slate-400 font-medium">{item.class} ({item.section})</div>
            </div>

            {/* Teacher and Room info */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <User size={13} className="text-indigo-400" />
                <span>{item.teacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-pink-400" />
                <span>{item.room}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
