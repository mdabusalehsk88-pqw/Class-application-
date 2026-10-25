import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext';
import { AdminProfileSettingsModal } from '../admin/AdminProfileSettingsModal';
import {
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ChevronDown,
  Menu,
  LogOut,
  LogIn,
  ShieldCheck,
  MessageSquare,
  Globe,
  User
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenLoginModal?: () => void;
  onNavigateToMessaging?: () => void;
  onPreviewPublicSite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  onOpenLoginModal,
  onNavigateToMessaging,
  onPreviewPublicSite
}) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, soundEnabled, toggleSound } = useNotifications();
  const { cloudSyncStatus, forcePullAllFromFirebase } = useInstitution();
  const { forcePullFromFirebase } = useWebsiteBuilder();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle + Logo */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
                aria-label="Toggle Navigation"
              >
                <Menu size={20} />
              </button>
            )}

            <div className="cursor-pointer flex items-center gap-2">
              <Logo size="md" />
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold tracking-wider uppercase">
                <ShieldCheck size={12} className="text-rose-400" />
                <span>SUPER ADMIN</span>
              </span>
            </div>
          </div>

          {/* Center: Brand or Space */}
          <div className="flex-1" />

          {/* Right Action Icons & Profile / Login Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Public Website Button */}
            {isAuthenticated && onPreviewPublicSite && (
              <button
                onClick={onPreviewPublicSite}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-xs font-extrabold text-amber-300 hover:text-slate-950 border border-amber-500/30 transition cursor-pointer"
                title="Preview Live Public Website"
              >
                <Globe size={15} />
                <span className="hidden md:inline">Public Website</span>
              </button>
            )}

            {/* Quick Messaging Button */}
            {isAuthenticated && onNavigateToMessaging && (
              <button
                onClick={onNavigateToMessaging}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                title="Open Real-Time Messaging"
              >
                <MessageSquare size={15} className="text-indigo-400" />
                <span>Live Chat</span>
              </button>
            )}

            {/* Cloud Sync Status Indicator */}
            {isAuthenticated && (
              <button
                onClick={async () => {
                  await Promise.all([forcePullAllFromFirebase(), forcePullFromFirebase()]);
                }}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  cloudSyncStatus === 'synced'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
                }`}
                title="Click to pull latest cloud records from Firebase Firestore"
              >
                <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-bold">{cloudSyncStatus === 'synced' ? 'Cloud Synced' : 'Syncing Cloud...'}</span>
              </button>
            )}

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Sound Effects Enabled' : 'Muted'}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={18} className="text-rose-400" /> : <VolumeX size={18} />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
                aria-label="Open notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Officer Login Button or Officer Profile Menu */}
            {!isAuthenticated ? (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
              >
                <LogIn size={15} />
                <span>Officer Sign In</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-rose-500/40"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-bold text-slate-100 max-w-[120px] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                      Super Admin (IT)
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 border-b border-slate-800 mb-1">
                      <div className="font-bold text-sm text-white">{currentUser.name}</div>
                      <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                        <ShieldCheck size={12} />
                        <span>Class IT Officer (Super Admin)</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <User size={14} className="text-rose-400" />
                        <span>Edit Profile & Password</span>
                      </button>

                      {onPreviewPublicSite && (
                        <button
                          onClick={() => {
                            onPreviewPublicSite();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-xl transition flex items-center gap-2 cursor-pointer"
                        >
                          <Globe size={14} />
                          <span>View Public Website</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Log Out from Admin Console</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Admin Profile Settings Modal (Change Username, Password & Picture) */}
      <AdminProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
