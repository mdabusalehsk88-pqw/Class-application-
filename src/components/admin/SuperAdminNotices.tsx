import React, { useState } from 'react';
import { useInstitution, ClassNotice } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  Megaphone,
  Pin,
  X
} from 'lucide-react';

export const SuperAdminNotices: React.FC = () => {
  const { notices, addNotice, deleteNotice } = useInstitution();
  const { playChime, addNotification } = useNotifications();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noticeType, setNoticeType] = useState<'URGENT' | 'EXAM' | 'FUND' | 'SCHEDULE' | 'EVENT' | 'GENERAL'>('URGENT');
  const [priority, setPriority] = useState<'high' | 'normal'>('high');
  const [author, setAuthor] = useState('Abu Saleh (Class IT Officer - Super Admin)');

  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addNotice({
      title: title.trim(),
      content: content.trim(),
      noticeType,
      priority: noticeType === 'URGENT' ? 'high' : priority,
      author: author.trim()
    });

    setShowAddModal(false);
    setTitle('');
    setContent('');
    setNoticeType('URGENT');
  };

  const filteredNotices = notices.filter(n => {
    if (filterType === 'ALL') return true;
    return (n.noticeType || n.category) === filterType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'URGENT':
        return {
          label: '🚨 Urgent Notice',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
          icon: <AlertTriangle size={13} />
        };
      case 'EXAM':
        return {
          label: '📝 Examination',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <GraduationCap size={13} />
        };
      case 'FUND':
        return {
          label: '💰 Class Fund',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <DollarSign size={13} />
        };
      case 'SCHEDULE':
        return {
          label: '⏰ Schedule / Routine',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <Clock size={13} />
        };
      case 'EVENT':
        return {
          label: '🎪 Class Event',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Sparkles size={13} />
        };
      default:
        return {
          label: '📢 General Circular',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: <Megaphone size={13} />
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Bell size={14} />
            <span>AL-USWAH Official Notice Board</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Publish & Broadcast Class Notices
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Post urgent alerts, examination schedules, cashier fund updates, or routine circulars instantly to all students and parents.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            playChime('click');
          }}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Post New Notice (Select Type)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Circulars (${notices.length})` },
          { id: 'URGENT', label: '🚨 Urgent' },
          { id: 'EXAM', label: '📝 Exam' },
          { id: 'FUND', label: '💰 Fund' },
          { id: 'SCHEDULE', label: '⏰ Schedule' },
          { id: 'EVENT', label: '🎪 Events' },
          { id: 'GENERAL', label: '📢 General' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setFilterType(tab.id);
              playChime('click');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notices Cards List */}
      <div className="space-y-4">
        {filteredNotices.map(notice => {
          const typeInfo = getTypeBadge(notice.noticeType || notice.category);
          const isUrgent = (notice.noticeType || notice.category) === 'URGENT';

          return (
            <div
              key={notice.id}
              className={`p-6 rounded-3xl border transition shadow-xl relative ${
                isUrgent
                  ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/50 shadow-rose-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeInfo.color}`}
                  >
                    {typeInfo.icon}
                    <span>{typeInfo.label}</span>
                  </span>

                  {notice.priority === 'high' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Pin size={10} /> Pinned High Priority
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">{notice.date}</span>
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <h3 className="text-base sm:text-lg font-extrabold text-white mt-3">
                {notice.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {notice.content}
              </p>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Published by: <strong className="text-slate-200">{notice.author}</strong></span>
                <span className="text-indigo-400 font-semibold">AL-USWAH Verified Broadcast</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== POST NOTICE MODAL ===================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Create Official Class Notice</h3>
                  <p className="text-xs text-slate-400">Select notice type (Urgent, Exam, Fund, etc.)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNoticeSubmit} className="space-y-4">
              {/* Notice Type Selector (User requirement) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Notice Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'URGENT', label: '🚨 Urgent', color: 'border-rose-500 bg-rose-500/20 text-rose-300' },
                    { id: 'EXAM', label: '📝 Exam', color: 'border-purple-500 bg-purple-500/20 text-purple-300' },
                    { id: 'FUND', label: '💰 Fund', color: 'border-emerald-500 bg-emerald-500/20 text-emerald-300' },
                    { id: 'SCHEDULE', label: '⏰ Routine', color: 'border-cyan-500 bg-cyan-500/20 text-cyan-300' },
                    { id: 'EVENT', label: '🎪 Event', color: 'border-amber-500 bg-amber-500/20 text-amber-300' },
                    { id: 'GENERAL', label: '📢 General', color: 'border-indigo-500 bg-indigo-500/20 text-indigo-300' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setNoticeType(item.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        noticeType === item.id
                          ? item.color + ' ring-2 ring-white/20'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Notice Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URGENT: Physics practical workbook due this Friday"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Notice Content */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Notice Details / Content <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete details, instructions, lab room, deadlines, or payment instructions..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                />
              </div>

              {/* Author and Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Publisher Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="high">High (Pinned on Top)</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell size={14} />
                  <span>Publish & Save Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
