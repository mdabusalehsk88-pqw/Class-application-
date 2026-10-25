import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminProfileSettingsModal } from '../admin/AdminProfileSettingsModal';
import {
  CalendarDays,
  CheckCircle,
  MessageSquare,
  Users,
  ShieldCheck,
  Wallet,
  Bell,
  FolderOpen,
  GraduationCap,
  Globe,
  ExternalLink,
  Edit2
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'website_builder'
  | 'marks'
  | 'chat'
  | 'attendance'
  | 'cr_fund'
  | 'routine'
  | 'notices'
  | 'materials'
  | 'admin_users'
  | 'admin_analytics'
  | 'exams'
  | 'fees'
  | 'transport'
  | 'gamification'
  | 'assignments'
  | 'quiz'
  | 'flashcards'
  | 'doubts'
  | 'focus'
  | 'library'
  | 'live_class'
  | 'class_roster'
  | 'attendance_mgr'
  | 'gradebook'
  | 'admin_settings'
  | 'parent_child'
  | 'landing';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onPreviewPublicSite?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
  onPreviewPublicSite
}) => {
  const { currentUser } = useAuth();

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }

  // Super Admin Navigation with Website Builder CMS at the top
  const navItems: NavItem[] = [
    { id: 'overview', label: 'AL-USWAH Command Hub', icon: <ShieldCheck size={18} /> },
    { id: 'website_builder', label: 'Public Website Builder', icon: <Globe size={18} />, badge: 'No-Code' },
    { id: 'marks', label: 'Student Marks Portal', icon: <GraduationCap size={18} />, badge: 'Marks' },
    { id: 'chat', label: 'Real-Time Messaging', icon: <MessageSquare size={18} />, badge: 'Live' },
    { id: 'attendance', label: 'Take Attendance (Date/Month)', icon: <CheckCircle size={18} />, badge: 'Register' },
    { id: 'cr_fund', label: 'Class Funds & Dues', icon: <Wallet size={18} />, badge: 'Graph' },
    { id: 'routine', label: 'Class Routine Builder', icon: <CalendarDays size={18} />, badge: 'Boxes' },
    { id: 'notices', label: 'Class Notices (Urgent)', icon: <Bell size={18} />, badge: 'Urgent' },
    { id: 'materials', label: 'Class Files Vault', icon: <FolderOpen size={18} />, badge: 'Upload' },
    { id: 'admin_users', label: 'Student & User Roster', icon: <Users size={18} />, badge: 'Admin' }
  ];

  // Filter navigation items if current user has delegated permissions or cashier role
  const displayedNavItems = navItems.filter(item => {
    if (!currentUser || currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'CASHIER') {
      return item.id === 'cr_fund' || item.id === 'chat' || item.id === 'overview';
    }
    const perms = (currentUser as any)?.permissions;
    if (perms) {
      if (item.id === 'overview' || item.id === 'chat') return true;
      if (item.id === 'attendance' && perms.attendance) return true;
      if (item.id === 'marks' && perms.marks) return true;
      if (item.id === 'routine' && perms.routine) return true;
      if (item.id === 'cr_fund' && (perms.funds || (currentUser as any)?.isCashier)) return true;
      if (item.id === 'notices' && perms.notices) return true;
      if (item.id === 'materials' && perms.files) return true;
      if (item.id === 'website_builder' && perms.website_builder) return true;
      if (item.id === 'admin_users' && perms.roster) return true;
      return false;
    }
    return true;
  });

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full lg:h-[calc(100vh-4rem)] w-72 bg-slate-950/95 lg:bg-slate-950/50 border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Header Badge */}
          <div className="px-3 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                SUPER ADMIN
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-slate-900 px-2 py-0.5 rounded-md">
              AL-USWAH UNION
            </span>
          </div>

          {/* Live Public Website Preview Button */}
          {onPreviewPublicSite && (
            <button
              onClick={() => {
                onPreviewPublicSite();
                onCloseMobile();
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-between shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Globe size={16} />
                <span>View Public Website</span>
              </span>
              <ExternalLink size={14} />
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {displayedNavItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition group cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-rose-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'No-Code'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.badge === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Officer Profile Card (Clickable to change Username, Password & Picture) */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer mt-4 group"
          title="Click to edit your username, password, or profile picture"
        >
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-500/40 group-hover:scale-105 transition"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                <span>{currentUser.name}</span>
                <Edit2 size={12} className="text-slate-500 group-hover:text-rose-400 transition" />
              </div>
              <div className="text-[11px] text-rose-400 font-medium">Union Super Admin</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Edit Credentials & Photo</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Profile & Credentials Settings Modal */}
      <AdminProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
