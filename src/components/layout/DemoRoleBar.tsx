import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from './Sidebar';
import {
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Wallet,
  CalendarDays,
  FolderOpen,
  Users,
  Bell,
  Sparkles,
  Lock,
  LogIn
} from 'lucide-react';

interface DemoRoleBarProps {
  onOpenLogin?: () => void;
  onNavigate?: (tab: ActiveTab) => void;
  activeTab?: ActiveTab;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = ({
  onOpenLogin,
  onNavigate,
  activeTab
}) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-900/95 border-b border-rose-500/20 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto gap-3 backdrop-blur-md select-none sticky top-0 z-40">
        <div className="flex items-center gap-2 text-slate-300 font-medium whitespace-nowrap">
          <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
            <Lock size={13} />
          </span>
          <span className="font-semibold text-white">Class IT Officer Portal:</span>
          <span className="text-slate-400 hidden sm:inline">
            Administrative access protected (Demo login: username <strong>admin</strong> / password <strong>admin</strong>)
          </span>
        </div>

        <button
          onClick={onOpenLogin}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/30 whitespace-nowrap cursor-pointer text-xs"
        >
          <LogIn size={13} />
          <span>Sign In as Class IT Officer</span>
        </button>
      </div>
    );
  }

  const quickTools = [
    { id: 'overview' as ActiveTab, label: 'Command Hub', icon: <ShieldCheck size={13} /> },
    { id: 'chat' as ActiveTab, label: 'Real-Time Messaging', icon: <MessageSquare size={13} />, highlight: true },
    { id: 'attendance' as ActiveTab, label: 'Take Attendance', icon: <CheckCircle size={13} /> },
    { id: 'cr_fund' as ActiveTab, label: 'Class Funds & Dues', icon: <Wallet size={13} /> },
    { id: 'routine' as ActiveTab, label: 'Routine Builder', icon: <CalendarDays size={13} /> },
    { id: 'materials' as ActiveTab, label: 'Files Vault', icon: <FolderOpen size={13} /> },
    { id: 'admin_users' as ActiveTab, label: 'User Roster', icon: <Users size={13} /> }
  ];

  return (
    <div className="bg-slate-900/90 border-b border-rose-500/20 px-3 py-1.5 flex items-center justify-between text-xs overflow-x-auto gap-2 backdrop-blur-md select-none sticky top-0 z-40">
      <div className="flex items-center gap-2 text-slate-300 font-medium whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-semibold text-white">Class IT Lead:</span>
        <span className="text-rose-400 font-bold">{currentUser.name} (Super Admin)</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        {quickTools.map(tool => {
          const isActive = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onNavigate && onNavigate(tool.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition whitespace-nowrap text-[11px] cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm'
                  : tool.highlight
                  ? 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
