import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ActiveTab } from '../../components/layout/Sidebar';
import {
  HeartHandshake,
  CheckCircle,
  GraduationCap,
  CreditCard,
  Bus,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';

interface ParentDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const { playChime, addNotification } = useNotifications();

  const children = currentUser.children || [
    { id: 'c_1', name: 'Tanvir Ahmed', class: 'Grade 10', section: 'A', roll: '07' },
    { id: 'c_2', name: 'Samiha Ahmed', class: 'Grade 7', section: 'B', roll: '14' }
  ];

  const currentChild = children[selectedChildIndex];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <HeartHandshake size={14} />
            <span>Guardian Portal & Progress Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {currentUser.name}! 👨‍👩‍👦
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Monitor daily school attendance, academic report cards, tuition fee status, and real-time school bus GPS location for your enrolled children.
          </p>
        </div>

        {/* Multi-Child Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-800 rounded-2xl border border-slate-700">
          {children.map((child, idx) => (
            <button
              key={child.id}
              onClick={() => {
                setSelectedChildIndex(idx);
                playChime('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedChildIndex === idx
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>{child.name} ({child.class})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Child Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Monthly Attendance</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">94.5%</div>
          <div className="text-xs text-slate-400 mt-1">Checked in on time today</div>
        </div>

        {/* CGPA */}
        <div
          onClick={() => onNavigate('exams')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Cumulative GPA</span>
            <GraduationCap size={16} className="text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">GPA 3.92</div>
          <div className="text-xs text-purple-300 mt-1">Ranked #3 in Grade 10-A</div>
        </div>

        {/* Fees */}
        <div
          onClick={() => onNavigate('fees')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Tuition Status</span>
            <CreditCard size={16} className="text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400 mt-2">Paid</div>
          <div className="text-xs text-slate-400 mt-1">Current term clearance active</div>
        </div>

        {/* Bus Tracking */}
        <div
          onClick={() => onNavigate('transport')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-yellow-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>School Bus GPS</span>
            <Bus size={16} className="text-yellow-400" />
          </div>
          <div className="text-lg font-extrabold text-yellow-400 mt-2">In Transit • ETA 14m</div>
          <div className="text-xs text-slate-400 mt-1">Route 4 • Driver Rafiq</div>
        </div>
      </div>

      {/* Teacher Communication shortcut */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Direct Faculty Communication</div>
            <div className="text-xs text-slate-400">
              Schedule a 1-on-1 meeting or message {currentChild.name}'s lead teacher Dr. Nusrat Jahan.
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('chat')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
        >
          <span>Message Class Teacher</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
