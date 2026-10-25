import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { ActiveTab } from './Sidebar';
import {
  Search,
  X,
  Sparkles,
  Calendar,
  CheckCircle,
  FolderOpen,
  MessageSquare,
  Wallet,
  ShieldCheck,
  Users,
  Bell,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const { playChime } = useNotifications();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions: {
    label: string;
    tab?: ActiveTab;
    customAction?: () => void;
    icon: React.ReactNode;
    category: string;
  }[] = [
    {
      label: 'Class IT Command Center',
      tab: 'overview',
      icon: <ShieldCheck size={16} className="text-rose-400" />,
      category: 'Core'
    },
    {
      label: 'Student Marks Portal (Select Subject & Enter Marks)',
      tab: 'marks',
      icon: <GraduationCap size={16} className="text-emerald-400" />,
      category: 'Evaluation'
    },
    {
      label: 'Real-Time Messaging (Broadcast All / Select Students / Groups)',
      tab: 'chat',
      icon: <MessageSquare size={16} className="text-indigo-400" />,
      category: 'Communication'
    },
    {
      label: 'Take Attendance (Select Date & Month)',
      tab: 'attendance',
      icon: <CheckCircle size={16} className="text-emerald-400" />,
      category: 'Attendance'
    },
    {
      label: 'Class Funds & Dues (Income, Expense & Graph)',
      tab: 'cr_fund',
      icon: <Wallet size={16} className="text-amber-400" />,
      category: 'Finance'
    },
    {
      label: 'Class Routine Builder (Box Grid Schedules)',
      tab: 'routine',
      icon: <Calendar size={16} className="text-purple-400" />,
      category: 'Schedule'
    },
    {
      label: 'Class Notices (Urgent & General Circulars)',
      tab: 'notices',
      icon: <Bell size={16} className="text-rose-400" />,
      category: 'Circulars'
    },
    {
      label: 'Class Files Vault (Upload by Name & Category)',
      tab: 'materials',
      icon: <FolderOpen size={16} className="text-teal-400" />,
      category: 'Vault'
    },
    {
      label: 'Student Roster & User Management (Photo & Admission No)',
      tab: 'admin_users',
      icon: <Users size={16} className="text-sky-400" />,
      category: 'Roster'
    }
  ];

  const filteredActions = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or jump to tool (e.g. messaging, attendance, funds)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching officer commands found.
            </div>
          ) : (
            filteredActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playChime('click');
                  if (action.customAction) {
                    action.customAction();
                  } else if (action.tab) {
                    onSelectTab(action.tab);
                    onClose();
                  }
                }}
                className="w-full p-2.5 rounded-2xl hover:bg-slate-800/80 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {action.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{action.category}</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-rose-400 transition" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
