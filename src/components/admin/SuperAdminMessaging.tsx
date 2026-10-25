import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import { useChat } from '../../context/ChatContext';
import { ChatMessage, ChatConversation } from '../../types';
import {
  MessageSquare,
  Send,
  Users,
  UserPlus,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Megaphone,
  Plus,
  Smile,
  Paperclip,
  Trash2,
  X,
  Check,
  Clock,
  Shield,
  ArrowRight,
  Filter,
  UserCheck,
  AlertTriangle,
  Radio,
  Share2,
  Info,
  DollarSign,
  Calendar,
  Volume2
} from 'lucide-react';

type MessagingMode = 'ALL_STUDENTS' | 'SELECTED_STUDENTS';

interface QuickTemplate {
  label: string;
  type: 'URGENT' | 'ROUTINE' | 'DUE' | 'EXAM' | 'GENERAL';
  title: string;
  message: string;
}

const quickTemplates: QuickTemplate[] = [
  {
    label: '🚨 Urgent Class Notice',
    type: 'URGENT',
    title: 'Urgent: Tomorrow Schedule Adjustment',
    message: 'Notice to all students: Tomorrow 1st period will start promptly at 08:30 AM in Room 402. Please arrive 10 minutes early.'
  },
  {
    label: '💰 Class Fund Dues',
    type: 'DUE',
    title: 'Class Fund Dues Clearance Notice',
    message: 'Friendly reminder to all students: Please clear your pending monthly class fund dues with the Cashier by this Thursday.'
  },
  {
    label: '📅 Routine & Lab Shift',
    type: 'ROUTINE',
    title: 'Computer Lab Practical Routine Update',
    message: 'Physics practical lab has been moved to Lab-2 after tiffin break. Bring your signed lab practical observation manuals.'
  },
  {
    label: '📝 Exam & Test Alert',
    type: 'EXAM',
    title: 'Mathematics Chapter-5 Speed Quiz Tomorrow',
    message: 'Prepare Chapter-5 (Calculus Limits & Trigonometry) for tomorrow\'s 20-minute class evaluation speed quiz.'
  }
];

export const SuperAdminMessaging: React.FC = () => {
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const { studentsList, studentDues, stats } = useInstitution();
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    createGroup,
    sendToSelectedStudents,
    addReaction,
    deleteMessage
  } = useChat();

  const [activeMode, setActiveMode] = useState<MessagingMode>('ALL_STUDENTS');

  // Mode 1: Broadcast to All
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'URGENT' | 'ROUTINE' | 'DUE' | 'EXAM' | 'GENERAL'>('GENERAL');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Mode 2: Selected Students
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState<'ALL' | 'WITH_DUES' | 'BOYS' | 'GIRLS'>('ALL');
  const [selectedMessageText, setSelectedMessageText] = useState('');
  const [selectedIsUrgent, setSelectedIsUrgent] = useState(false);
  const [typingStudentName, setTypingStudentName] = useState<string | null>(null);

  // Mode 3: Make & Manage Groups
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [groupSelectedMemberIds, setGroupSelectedMemberIds] = useState<string[]>([]);
  const [groupMemberSearch, setGroupMemberSearch] = useState('');
  const [groupInputText, setGroupInputText] = useState('');
  const [showGroupMembersDrawer, setShowGroupMembersDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversationId]);

  // Active conversation object
  const currentConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Messages for active conversation
  const currentMessages = messages.filter(m => m.conversationId === activeConversationId);

  // Broadcasts for All Students
  const allBroadcastMessages = messages.filter(m => m.conversationId === 'all_students');

  // Send Broadcast to All Students
  const handleSendBroadcast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadcastText.trim()) return;

    setIsBroadcasting(true);
    playChime('success');

    const formattedMessage = broadcastTitle.trim()
      ? `📢 [${broadcastPriority}] ${broadcastTitle.trim()}\n\n${broadcastText.trim()}`
      : `📢 [${broadcastPriority}] ${broadcastText.trim()}`;

    sendMessage({
      conversationId: 'all_students',
      message: formattedMessage,
      targetAudience: 'ALL',
      isAnnouncement: broadcastPriority === 'URGENT'
    });

    addNotification({
      title: 'Broadcast Dispatched to All Students',
      message: `Message sent to all ${stats.totalStudents} class students in real-time.`,
      type: 'success'
    });

    setBroadcastTitle('');
    setBroadcastText('');
    setIsBroadcasting(false);
  };

  // Quick fill from template
  const handleApplyTemplate = (template: QuickTemplate) => {
    setBroadcastTitle(template.title);
    setBroadcastText(template.message);
    setBroadcastPriority(template.type);
    playChime('click');
  };

  // Filter students for Selected Students Mode
  const filteredStudents = studentsList.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (student.roll && student.roll.includes(studentSearchQuery));

    if (!matchesSearch) return false;

    if (studentFilter === 'WITH_DUES') {
      return studentDues.some(d => d.studentId === student.id && d.status === 'UNPAID');
    }
    if (studentFilter === 'BOYS') {
      return student.gender === 'Boy';
    }
    if (studentFilter === 'GIRLS') {
      return student.gender === 'Girl';
    }
    return true;
  });

  // Toggle selection of student
  const toggleSelectStudent = (id: string) => {
    playChime('click');
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    playChime('click');
    const allFilteredIds = filteredStudents.map(s => s.id);
    setSelectedStudentIds(allFilteredIds);
  };

  const handleClearSelection = () => {
    playChime('click');
    setSelectedStudentIds([]);
  };

  // Send to Selected Students
  const handleSendToSelectedStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessageText.trim() || selectedStudentIds.length === 0) return;

    playChime('success');
    sendToSelectedStudents(
      selectedStudentIds,
      selectedMessageText.trim(),
      selectedIsUrgent
    );

    const recipientNames = studentsList
      .filter(s => selectedStudentIds.includes(s.id))
      .map(s => s.name);

    addNotification({
      title: 'Direct Message Sent',
      message: `Delivered to ${selectedStudentIds.length} selected student(s): ${recipientNames.slice(0, 2).join(', ')}${recipientNames.length > 2 ? '...' : ''}`,
      type: 'success'
    });

    const sentMessage = selectedMessageText.trim();
    setSelectedMessageText('');


  };

  // Mode 3: Create New Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || groupSelectedMemberIds.length === 0) return;

    playChime('success');
    const newGrp = createGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Custom AL-USWAH Study & Project Group',
      memberIds: groupSelectedMemberIds,
      color: newGroupColor
    });

    addNotification({
      title: `Group Created: ${newGroupName}`,
      message: `Group is active with ${groupSelectedMemberIds.length} members.`,
      type: 'success'
    });

    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setGroupSelectedMemberIds([]);
    setActiveConversationId(newGrp.id);
  };

  // Send message in Group Chat
  const handleSendGroupMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupInputText.trim()) return;

    playChime('click');
    sendMessage({
      conversationId: activeConversationId,
      message: groupInputText.trim(),
      targetAudience: 'GROUP'
    });

    const sentText = groupInputText.trim();
    setGroupInputText('');
  };

  const groupConversations = conversations.filter(c => c.type === 'GROUP');

  return (
    <div className="space-y-6">
      {/* Real-time Messaging System Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-rose-950/80 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-Time Broadcast Engine • AL-USWAH</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare size={26} className="text-indigo-400" />
            <span>Class Real-Time Messaging Hub</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Broadcast urgent announcements to all {stats.totalStudents} students, send direct messages to selected students with dues or alerts, and create collaborative project groups.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setActiveMode('ALL_STUDENTS');
              setActiveConversationId('all_students');
              playChime('click');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'ALL_STUDENTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone size={14} />
            <span>Message All Students</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('SELECTED_STUDENTS');
              playChime('click');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'SELECTED_STUDENTS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck size={14} />
            <span>Selected Students</span>
            {selectedStudentIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {selectedStudentIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: BROADCAST TO ALL STUDENTS                                        */}
      {/* ========================================================================= */}
      {activeMode === 'ALL_STUDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Broadcast Composer & Templates (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Broadcast to Entire Class</h3>
                    <p className="text-xs text-slate-400">
                      Dispatched instantly to all {stats.totalStudents} enrolled students
                    </p>
                  </div>
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-1">
                  {(['GENERAL', 'URGENT', 'DUE', 'ROUTINE', 'EXAM'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBroadcastPriority(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                        broadcastPriority === p
                          ? p === 'URGENT'
                            ? 'bg-rose-500 text-white shadow-md animate-pulse'
                            : p === 'DUE'
                            ? 'bg-emerald-500 text-white'
                            : p === 'ROUTINE'
                            ? 'bg-amber-500 text-black'
                            : p === 'EXAM'
                            ? 'bg-purple-500 text-white'
                            : 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>1-Click Notice Templates:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 text-left transition text-xs group cursor-pointer"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-indigo-300">
                        {tmpl.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tmpl.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendBroadcast} className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Subject / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., Mandatory Physics Practical & Attendance Notice..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Broadcast Message Body *
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastText}
                    onChange={e => setBroadcastText(e.target.value)}
                    placeholder="Type the message that will be delivered live to all class students..."
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Live recipients: {stats.totalStudents} Students</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!broadcastText.trim() || isBroadcasting}
                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Send Broadcast to All Students</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Class Broadcast Stream (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio size={16} className="text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Broadcast Stream
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {allBroadcastMessages.length} Messages Logged
                </span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                {allBroadcastMessages.map(msg => {
                  const isMe = msg.senderRole === 'SUPER_ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isMe
                          ? 'bg-indigo-950/40 border-indigo-500/30 ml-4'
                          : 'bg-slate-950/70 border-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-white">{msg.senderName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400">
                            {msg.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>

                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </div>

                      {/* Read receipts indicator */}
                      {isMe && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-indigo-500/20 text-[10px] text-indigo-300">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Delivered to {stats.totalStudents} students</span>
                          </span>
                          <span>39 Read</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MESSAGE SELECTED STUDENTS                                        */}
      {/* ========================================================================= */}
      {activeMode === 'SELECTED_STUDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Selector Table (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck size={18} className="text-rose-400" />
                    <span>Select Target Students</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pick single or multiple students by admission no, roll, or dues
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-rose-300 transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={e => setStudentSearchQuery(e.target.value)}
                    placeholder="Search by student name, roll number, or admission number..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setStudentFilter('ALL')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      studentFilter === 'ALL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    All Students ({studentsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentFilter('WITH_DUES')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      studentFilter === 'WITH_DUES'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-amber-400 hover:text-white'
                    }`}
                  >
                    <DollarSign size={12} />
                    <span>With Pending Dues</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentFilter('BOYS')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      studentFilter === 'BOYS'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Boys ({stats.boysCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentFilter('GIRLS')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      studentFilter === 'GIRLS'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Girls ({stats.girlsCount})
                  </button>
                </div>
              </div>

              {/* Student List Grid */}
              <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
                {filteredStudents.map(student => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const studentDue = studentDues.find(d => d.studentId === student.id && d.status === 'UNPAID');

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleSelectStudent(student.id)}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/30 border-rose-500/60 shadow-md'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'border-slate-700 bg-slate-900 text-transparent'
                          }`}
                        >
                          <Check size={13} strokeWidth={3} />
                        </div>

                        <img
                          src={student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                        />

                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{student.name}</span>
                            {student.roll && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                Roll {student.roll}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {student.admissionNumber}
                          </div>
                        </div>
                      </div>

                      {/* Due or Status badge */}
                      <div>
                        {studentDue ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            Due: ৳{studentDue.totalDue - studentDue.paidAmount}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                            No Dues
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Direct Messaging Composer & Active Thread (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col h-[520px]">
              {/* Header */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Send size={14} className="text-rose-400" />
                    <span>Direct Message Stream</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedStudentIds.length === 0 ? (
                      <span className="text-amber-400 font-medium">
                        ⚠️ Please select at least one student from the left panel
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        Targeting {selectedStudentIds.length} student(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIsUrgent}
                      onChange={e => setSelectedIsUrgent(e.target.checked)}
                      className="rounded accent-rose-600"
                    />
                    <span className="text-[11px] font-bold text-rose-300">Mark Urgent</span>
                  </label>
                </div>
              </div>

              {/* Message Thread Area */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                {currentMessages.slice(-8).map(msg => {
                  const isMe = msg.senderRole === 'SUPER_ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isMe
                          ? 'bg-rose-950/30 border-rose-500/30 ml-6'
                          : 'bg-slate-950/70 border-slate-800 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-white">{msg.senderName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Student Typing Indicator */}
                {typingStudentName && (
                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 w-fit flex items-center gap-2 text-xs text-slate-400 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>{typingStudentName} is typing a reply...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Students Composer Form */}
              <form onSubmit={handleSendToSelectedStudents} className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedMessageText}
                    onChange={e => setSelectedMessageText(e.target.value)}
                    disabled={selectedStudentIds.length === 0}
                    placeholder={
                      selectedStudentIds.length === 0
                        ? 'Select students to enable messaging...'
                        : `Message to ${selectedStudentIds.length} student(s)...`
                    }
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!selectedMessageText.trim() || selectedStudentIds.length === 0}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {false && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Group Channels List & Create Group CTA (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={16} className="text-emerald-400" />
                    <span>Class Groups</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {groupConversations.length} Active Project Groups
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Make a Group</span>
                </button>
              </div>

              {/* Group Channels List */}
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {groupConversations.map(grp => {
                  const isCurrent = grp.id === activeConversationId;
                  return (
                    <div
                      key={grp.id}
                      onClick={() => {
                        setActiveConversationId(grp.id);
                        playChime('click');
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0"
                          style={{ backgroundColor: grp.color || '#10b981' }}
                        >
                          {grp.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{grp.name}</h4>
                            <span className="text-[10px] text-slate-500">{grp.lastMessageTime}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {grp.lastMessage || grp.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{grp.memberIds?.length || 5} Members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Group Chat Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col h-[520px]">
              {/* Group Workspace Header */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                    style={{ backgroundColor: currentConversation.color || '#10b981' }}
                  >
                    {currentConversation.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{currentConversation.name}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-md truncate">
                      {currentConversation.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGroupMembersDrawer(!showGroupMembersDrawer)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users size={14} className="text-emerald-400" />
                    <span>Members ({currentConversation.memberIds?.length || 5})</span>
                  </button>
                </div>
              </div>

              {/* Members Drawer (if toggled) */}
              {showGroupMembersDrawer && (
                <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
                  {studentsList
                    .filter(s => currentConversation.memberIds?.includes(s.id))
                    .map(member => (
                      <div
                        key={member.id}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 shrink-0 text-xs"
                      >
                        <img
                          src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={member.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-200">{member.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Roll {member.roll}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                {currentMessages.map(msg => {
                  const isMe = msg.senderRole === 'SUPER_ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isMe
                          ? 'bg-emerald-950/40 border-emerald-500/30 ml-8'
                          : 'bg-slate-950/70 border-slate-800 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-white">{msg.senderName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {msg.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>

                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Group Chat Input */}
              <form onSubmit={handleSendGroupMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={groupInputText}
                  onChange={e => setGroupInputText(e.target.value)}
                  placeholder={`Send a message to ${currentConversation.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!groupInputText.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW GROUP                                                  */}
      {/* ========================================================================= */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-base font-bold text-white">Create New Class Group</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="e.g., Science Project Team Alpha, Class Dues Committee..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Group Description / Objective
                </label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="e.g., Preparing physics model display and collecting project notes..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Group Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {['#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewGroupColor(c)}
                      className={`w-7 h-7 rounded-full transition cursor-pointer flex items-center justify-center ${
                        newGroupColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {newGroupColor === c && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Member Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Select Member Students * ({groupSelectedMemberIds.length} Selected)
                  </label>
                  <input
                    type="text"
                    value={groupMemberSearch}
                    onChange={e => setGroupMemberSearch(e.target.value)}
                    placeholder="Search name/roll..."
                    className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-500 w-36"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1 p-2 rounded-2xl bg-slate-950 border border-slate-800">
                  {studentsList
                    .filter(s =>
                      s.name.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
                      (s.roll && s.roll.includes(groupMemberSearch))
                    )
                    .map(student => {
                      const isSelected = groupSelectedMemberIds.includes(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            setGroupSelectedMemberIds(prev =>
                              prev.includes(student.id)
                                ? prev.filter(x => x !== student.id)
                                : [...prev, student.id]
                            );
                          }}
                          className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition ${
                            isSelected ? 'bg-emerald-950/40 text-emerald-200' : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-emerald-600 rounded"
                            />
                            <span>{student.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Roll {student.roll}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{student.admissionNumber}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim() || groupSelectedMemberIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Create & Launch Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
