import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext';
import { ActiveTab } from '../../components/layout/Sidebar';
import { AdminStatUpdateModal } from '../../components/admin/AdminStatUpdateModal';
import { AdminProfileSettingsModal } from '../../components/admin/AdminProfileSettingsModal';
import { SuperAdminAttendance } from '../../components/admin/SuperAdminAttendance';
import { SuperAdminFunds } from '../../components/admin/SuperAdminFunds';
import { SuperAdminRoutine } from '../../components/admin/SuperAdminRoutine';
import { SuperAdminNotices } from '../../components/admin/SuperAdminNotices';
import { SuperAdminFiles } from '../../components/admin/SuperAdminFiles';
import { SuperAdminMessaging } from '../../components/admin/SuperAdminMessaging';
import { SuperAdminMarksPortal } from '../../components/admin/SuperAdminMarksPortal';
import { SuperAdminWebsiteBuilder } from '../../components/admin/SuperAdminWebsiteBuilder';
import {
  Shield,
  Users,
  CheckCircle,
  Edit3,
  Bell,
  Wallet,
  CalendarDays,
  FolderOpen,
  MessageSquare,
  GraduationCap,
  Globe,
  ExternalLink,
  Key,
  Database,
  CloudUpload,
  CloudDownload
} from 'lucide-react';

interface AdminCommandCenterProps {
  onNavigate: (tab: ActiveTab) => void;
  onPreviewPublicSite?: () => void;
}

export type AdminSubTab =
  | 'overview'
  | 'website_builder'
  | 'marks'
  | 'messaging'
  | 'attendance'
  | 'funds'
  | 'routine'
  | 'notices'
  | 'files';

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  onNavigate,
  onPreviewPublicSite
}) => {
  const { playChime } = useNotifications();
  const { stats, notices, classFiles, routines, cloudSyncStatus, forcePushAllToFirebase, forcePullAllFromFirebase } = useInstitution();
  const { forceSyncToFirebase, forcePullFromFirebase, lastCloudSyncedAt } = useWebsiteBuilder();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handlePushAllToCloud = async () => {
    setIsSyncing(true);
    playChime('click');
    try {
      await Promise.all([
        forcePushAllToFirebase(),
        forceSyncToFirebase()
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullAllFromCloud = async () => {
    setIsSyncing(true);
    playChime('click');
    try {
      await Promise.all([
        forcePullAllFromFirebase(),
        forcePullFromFirebase()
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  const subTabs = [
    { id: 'overview', label: 'Command Hub', icon: <Shield size={16} /> },
    { id: 'website_builder', label: 'Public Website Builder (No-Code)', icon: <Globe size={16} /> },
    { id: 'marks', label: 'Student Marks Portal', icon: <GraduationCap size={16} /> },
    { id: 'messaging', label: 'Real-Time Class Chat', icon: <MessageSquare size={16} /> },
    { id: 'attendance', label: 'Take Attendance', icon: <CheckCircle size={16} /> },
    { id: 'funds', label: 'Class Funds & Graph', icon: <Wallet size={16} /> },
    { id: 'routine', label: 'Routine Builder', icon: <CalendarDays size={16} /> },
    { id: 'notices', label: 'Notice Board', icon: <Bell size={16} /> },
    { id: 'files', label: 'Upload Files', icon: <FolderOpen size={16} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>AL-USWAH UNION • SUPER ADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AL-USWAH UNION ADMIN DASHBOARD
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Develop and customize the public AL-USWAH UNION website without coding: change the Hero photo & heading, manage Class President, Leaders, Treasurer & Cashiers, update Class Wings & Wing Members, upload Class Tour photos, and manage class records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setActiveSubTab('website_builder');
              playChime('click');
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
          >
            <Globe size={16} />
            <span>Customize Public Website</span>
          </button>

          {onPreviewPublicSite && (
            <button
              onClick={onPreviewPublicSite}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <ExternalLink size={15} />
              <span>View Live Website</span>
            </button>
          )}

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Key size={14} className="text-rose-400" />
            <span>Change Login & Password</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('marks');
              playChime('click');
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
          >
            <GraduationCap size={16} />
            <span>Marks Portal</span>
          </button>

          <button
            onClick={() => onNavigate('admin_users')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
          >
            <Users size={16} />
            <span>Manage Roster</span>
          </button>
        </div>
      </div>

      {/* Universal Cloud Sync Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Database size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white">Firebase Firestore Multi-Device Sync</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                cloudSyncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                cloudSyncStatus === 'syncing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`} />
                {cloudSyncStatus === 'synced' ? 'Live Cloud Connected' : cloudSyncStatus === 'syncing' ? 'Syncing to Firebase...' : 'Local Cache Active'}
              </span>
              {lastCloudSyncedAt && (
                <span className="text-[11px] text-slate-500">Last sync: {lastCloudSyncedAt}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Persistent Database: <span className="font-mono text-indigo-300 font-semibold">ai-studio-smartclasspro-b4a481cf-32ad-4958-b9e3-a2ca059abc2c</span> • Changes made on any device automatically sync across all devices via Firestore.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={handlePushAllToCloud}
            disabled={isSyncing}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95"
            title="Upload this device's current website and class data to Firebase Firestore"
          >
            <CloudUpload size={16} className={isSyncing ? 'animate-bounce' : ''} />
            <span>☁️ Push Device Data to Cloud</span>
          </button>

          <button
            onClick={handlePullAllFromCloud}
            disabled={isSyncing}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            title="Download the latest cloud database records to this device"
          >
            <CloudDownload size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span>📥 Pull Latest from Cloud</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as AdminSubTab);
              playChime('click');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Render Sub Tabs */}
      {activeSubTab === 'website_builder' && (
        <SuperAdminWebsiteBuilder onPreviewPublicSite={onPreviewPublicSite} />
      )}
      {activeSubTab === 'marks' && <SuperAdminMarksPortal />}
      {activeSubTab === 'messaging' && <SuperAdminMessaging />}
      {activeSubTab === 'attendance' && <SuperAdminAttendance />}
      {activeSubTab === 'funds' && <SuperAdminFunds />}
      {activeSubTab === 'routine' && <SuperAdminRoutine />}
      {activeSubTab === 'notices' && <SuperAdminNotices />}
      {activeSubTab === 'files' && <SuperAdminFiles />}

      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Synchronized KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dynamic Total Students */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md relative group">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Our Class Students</span>
                <Users size={16} className="text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">
                {stats.totalStudents} Students
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  {stats.boysCount} Boys • {stats.girlsCount} Girls
                </span>
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Today's Attendance</span>
                <CheckCircle size={16} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                {stats.todayAttendance} / {stats.totalStudents}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">{stats.todayAttendanceRate}% Present</span>
                <button
                  onClick={() => setActiveSubTab('attendance')}
                  className="text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  Take Today
                </button>
              </div>
            </div>

            {/* Cashier Fund */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Class Cashier Fund</span>
                <Wallet size={16} className="text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-2">
                ${stats.classFundBalance}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Union Treasury</span>
                <button
                  onClick={() => setActiveSubTab('funds')}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  View Graph
                </button>
              </div>
            </div>

            {/* Scheduled Periods & Files */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Routine & Materials</span>
                <CalendarDays size={16} className="text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">
                {routines.length} Periods
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">{classFiles.length} Shared Files</span>
                <button
                  onClick={() => setActiveSubTab('routine')}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Edit Routine
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Public Website Builder CMS Card */}
            <div
              onClick={() => setActiveSubTab('website_builder')}
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 transition cursor-pointer shadow-lg space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition">
                <Globe size={22} />
              </div>
              <h3 className="font-extrabold text-white text-base">
                Public Website Builder (No-Code)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Change AL-USWAH UNION hero photo, edit About Class, update President, Leader, Second Leader, Treasurer, Cashier & Second Cashier, manage Class Wings & Members, and upload Tour Photos.
              </p>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Open Website Builder Studio →</span>
              </div>
            </div>

            {/* Student Marks Portal Card */}
            <div
              onClick={() => setActiveSubTab('marks')}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer shadow-lg space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition">
                <GraduationCap size={22} />
              </div>
              <h3 className="font-extrabold text-white text-base">Student Marks Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select subject to load all admission numbers & students. Input marks, calculate GPA, and publish marksheets.
              </p>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Enter Marks & Grades →</span>
              </div>
            </div>

            {/* Take Attendance Card */}
            <div
              onClick={() => setActiveSubTab('attendance')}
              className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition cursor-pointer shadow-lg space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition">
                <CheckCircle size={22} />
              </div>
              <h3 className="font-extrabold text-white text-base">Take Class Attendance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose any date and month, mark presence for each student or batch mark all, and save to official records.
              </p>
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Open Attendance Register →</span>
              </div>
            </div>
          </div>

          {/* Quick Notices and Recent Files Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Class Notices */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Bell size={16} className="text-rose-400" />
                  <span>Recent Class Notices ({notices.length})</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('notices')}
                  className="text-xs text-rose-400 hover:underline font-bold cursor-pointer"
                >
                  + Post Notice
                </button>
              </div>

              <div className="space-y-3">
                {notices.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No notices posted yet.
                  </div>
                ) : (
                  notices.slice(0, 3).map(n => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-rose-400 uppercase">
                          {n.noticeType === 'URGENT' ? '🚨 URGENT' : n.noticeType || n.category}
                        </span>
                        <span className="text-slate-400">{n.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Uploaded Class Documents */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <FolderOpen size={16} className="text-cyan-400" />
                  <span>Shared Class Documents ({classFiles.length})</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('files')}
                  className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  + Upload File
                </button>
              </div>

              <div className="space-y-3">
                {classFiles.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No files uploaded yet.
                  </div>
                ) : (
                  classFiles.slice(0, 3).map(f => (
                    <div
                      key={f.id}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{f.name}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {f.category} • {f.subject} • {f.size}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                        {f.fileType}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Update Student Count & General Stats */}
      {isUpdateModalOpen && (
        <AdminStatUpdateModal onClose={() => setIsUpdateModalOpen(false)} />
      )}

      {/* Modal to Change Admin Username, Password & Profile Picture */}
      <AdminProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
