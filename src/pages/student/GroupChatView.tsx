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
  Hash,
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
  Radio,
  Clock,
  Shield,
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';

export const GroupChatView: React.FC = () => {
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const { studentsList } = useInstitution();
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    createGroup,
    sendToSelectedStudents,
    addReaction,
    deleteMessage,
    isOnline
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [searchChannel, setSearchChannel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modal 1: Make a Group
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Modal 2: Send to Selected Students
  const [showSelectedStudentsModal, setShowSelectedStudentsModal] = useState(false);
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);
  const [targetMessageText, setTargetMessageText] = useState('');
  const [targetStudentSearch, setTargetStudentSearch] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  const activeConversation =
    conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Filter messages for active conversation
  const currentMessages = messages.filter(
    m => m.conversationId === activeConversation?.id
  );

  const studentsOnly = studentsList.filter(s => s.role === 'STUDENT');

  // Send message in current conversation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    sendMessage({
      conversationId: activeConversation.id,
      message: inputMessage.trim(),
      targetAudience:
        activeConversation.type === 'ALL_STUDENTS'
          ? 'ALL'
          : activeConversation.type === 'GROUP'
          ? 'GROUP'
          : 'SELECTED_STUDENTS',
      isAnnouncement
    });

    setInputMessage('');
    setIsAnnouncement(false);
  };

  // Toggle member in group creation
  const handleToggleMember = (studentId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    playChime('click');
  };

  // Toggle student in targeted direct message
  const handleToggleTargetStudent = (studentId: string) => {
    setTargetStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    playChime('click');
  };

  // Submit Create Group
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      addNotification({
        title: 'Group Name Required',
        message: 'Please provide a name for your class group.',
        type: 'warning'
      });
      return;
    }

    if (selectedMemberIds.length === 0) {
      addNotification({
        title: 'Select Members',
        message: 'Please select at least one student for your group.',
        type: 'warning'
      });
      return;
    }

    createGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      memberIds: selectedMemberIds,
      color: newGroupColor
    });

    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedMemberIds([]);
  };

  // Submit Send to Selected Students
  const handleSendToSelectedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStudentIds.length === 0) {
      addNotification({
        title: 'Select Recipients',
        message: 'Please pick one or more students to message.',
        type: 'warning'
      });
      return;
    }

    if (!targetMessageText.trim()) {
      addNotification({
        title: 'Message Text Required',
        message: 'Please type the message to deliver.',
        type: 'warning'
      });
      return;
    }

    sendToSelectedStudents(targetStudentIds, targetMessageText.trim(), true);
    setShowSelectedStudentsModal(false);
    setTargetStudentIds([]);
    setTargetMessageText('');
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchChannel.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchChannel.toLowerCase())
  );

  const allStudentsChannel = filteredConversations.filter(c => c.type === 'ALL_STUDENTS');
  const customGroups = filteredConversations.filter(c => c.type === 'GROUP');
  const directMessages = filteredConversations.filter(c => c.type === 'DIRECT_MESSAGE');

  return (
    <div className="h-[82vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Universal Chat Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                Class 10-A Real-Time Messaging Hub
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Real-Time Sync</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Broadcast to all students, target only selected students, or collaborate in custom project groups.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowSelectedStudentsModal(true);
              playChime('click');
            }}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck size={14} />
            <span>Message Selected Students</span>
          </button>

          <button
            onClick={() => {
              setShowCreateGroupModal(true);
              playChime('click');
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Make a Group</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Area: Channels Sidebar + Active Chat Stream */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Channels & Groups Sidebar */}
        <div className="w-full md:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col shrink-0">
          {/* Search Channels */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups & channels..."
                value={searchChannel}
                onChange={e => setSearchChannel(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Channels & Groups List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Section 1: All Students Broadcast */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
                <span>Class Broadcast</span>
                <span className="text-emerald-400 font-mono">All Students</span>
              </div>
              {allStudentsChannel.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveConversationId(ch.id);
                    playChime('click');
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 ${
                    activeConversationId === ch.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800/80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                    <Megaphone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{ch.name}</span>
                      <span className={`text-[10px] ${activeConversationId === ch.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {ch.lastMessageTime || 'Live'}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${activeConversationId === ch.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {ch.lastMessage || ch.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Section 2: Custom Created Groups */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
                <span>Project & Study Groups ({customGroups.length})</span>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="text-indigo-400 hover:underline font-bold text-[10px] cursor-pointer"
                >
                  + New Group
                </button>
              </div>

              {customGroups.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
                  No groups yet. Click "+ Make a Group" above.
                </div>
              ) : (
                customGroups.map(grp => (
                  <button
                    key={grp.id}
                    onClick={() => {
                      setActiveConversationId(grp.id);
                      playChime('click');
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition cursor-pointer flex items-center gap-3 ${
                      activeConversationId === grp.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow"
                      style={{ backgroundColor: grp.color || '#6366f1' }}
                    >
                      <Users size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{grp.name}</span>
                        <span className={`text-[10px] ${activeConversationId === grp.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {grp.memberIds.length} members
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${activeConversationId === grp.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {grp.lastMessage || grp.description}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Section 3: Targeted Selected Student DMs */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
                <span>Selected Student Messages ({directMessages.length})</span>
                <button
                  onClick={() => setShowSelectedStudentsModal(true)}
                  className="text-rose-400 hover:underline font-bold text-[10px] cursor-pointer"
                >
                  + Direct
                </button>
              </div>

              {directMessages.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
                  No targeted chats. Click "Message Selected Students" to start.
                </div>
              ) : (
                directMessages.map(dm => (
                  <button
                    key={dm.id}
                    onClick={() => {
                      setActiveConversationId(dm.id);
                      playChime('click');
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition cursor-pointer flex items-center gap-3 ${
                      activeConversationId === dm.id
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                        : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                      <Lock size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{dm.name}</span>
                        <span className={`text-[10px] ${activeConversationId === dm.id ? 'text-rose-200' : 'text-slate-500'}`}>
                          {dm.lastMessageTime || 'Direct'}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${activeConversationId === dm.id ? 'text-rose-100' : 'text-slate-400'}`}>
                        {dm.lastMessage || dm.description}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Active Conversation Stream */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
          {/* Active Conversation Header */}
          {activeConversation && (
            <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow"
                  style={{ backgroundColor: activeConversation.color || '#6366f1' }}
                >
                  {activeConversation.type === 'ALL_STUDENTS' ? (
                    <Megaphone size={18} />
                  ) : activeConversation.type === 'GROUP' ? (
                    <Users size={18} />
                  ) : (
                    <Lock size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white truncate">
                      {activeConversation.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeConversation.type === 'ALL_STUDENTS'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : activeConversation.type === 'GROUP'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {activeConversation.type === 'ALL_STUDENTS'
                        ? 'Delivered to All Students'
                        : activeConversation.type === 'GROUP'
                        ? `Custom Group (${activeConversation.memberIds.length} members)`
                        : 'Private / Selected Students'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {activeConversation.description || 'Active real-time classroom conversation stream.'}
                  </p>
                </div>
              </div>

              {/* Members status summary */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                <span>Active</span>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <MessageSquare size={26} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-300">No messages in this channel yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Send a message below to start real-time messaging with your classmates and teachers.
                  </p>
                </div>
              </div>
            ) : (
              currentMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <img
                      src={
                        msg.senderAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={msg.senderName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                    />

                    {/* Message Bubble Container */}
                    <div className={`max-w-[78%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : ''}`}>
                      {/* Name & Role Header */}
                      <div className={`flex items-center gap-2 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-bold text-white">{msg.senderName}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            msg.senderRole === 'SUPER_ADMIN'
                              ? 'bg-rose-500/20 text-rose-300'
                              : msg.senderRole === 'TEACHER'
                              ? 'bg-purple-500/20 text-purple-300'
                              : msg.senderRole === 'SUB_ADMIN'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">{msg.timestamp}</span>
                      </div>

                      {/* Tag if Sent to Selected Students */}
                      {msg.targetAudience === 'SELECTED_STUDENTS' && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                          <Lock size={10} />
                          <span>Delivered to Only Selected Students</span>
                        </div>
                      )}

                      {/* Tag if Announcement */}
                      {msg.isAnnouncement && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          <Megaphone size={10} />
                          <span>Official Announcement</span>
                        </div>
                      )}

                      {/* Bubble Text */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md relative ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : msg.isAnnouncement
                            ? 'bg-slate-800 text-amber-200 border border-amber-500/30 rounded-tl-none'
                            : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>

                        {/* Reactions and Actions toolbar */}
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-[11px]">
                          {/* Reaction emojis */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.reactions &&
                              Object.entries(msg.reactions).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(msg.id, emoji)}
                                  className="px-1.5 py-0.5 rounded-lg bg-black/20 hover:bg-black/40 text-[10px] flex items-center gap-1 transition cursor-pointer"
                                >
                                  <span>{emoji}</span>
                                  <span className="font-bold">{count}</span>
                                </button>
                              ))}

                            {/* Add reaction buttons */}
                            <button
                              onClick={() => addReaction(msg.id, '👍')}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded transition text-xs cursor-pointer"
                              title="Thumbs Up"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => addReaction(msg.id, '🔥')}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded transition text-xs cursor-pointer"
                              title="Fire"
                            >
                              🔥
                            </button>
                            <button
                              onClick={() => addReaction(msg.id, '❤️')}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded transition text-xs cursor-pointer"
                              title="Heart"
                            >
                              ❤️
                            </button>
                          </div>

                          {/* Delete message if author or Super Admin */}
                          {(isMe || currentUser.role === 'SUPER_ADMIN') && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-rose-300 transition cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Composer Input Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
            {/* Announcement toggle for Super Admin / Teachers */}
            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TEACHER') && (
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnouncement}
                    onChange={e => setIsAnnouncement(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className={isAnnouncement ? 'text-amber-400 font-bold' : ''}>
                    📢 Mark as Important Announcement
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">Press Enter to send</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Type a real-time message to ${activeConversation?.name || 'chat'}...`}
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===================== MODAL 1: MAKE A GROUP ===================== */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Create a Custom Class Group</h3>
                  <p className="text-xs text-slate-400">Collaborate with chosen classmates on projects or study</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Group Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Wave Mechanics Team or Class Picnic Organizers"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Group Purpose / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Group Purpose / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Collaboration on robotics greenhouse code and diagrams"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Group Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {['#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#f59e0b'].map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewGroupColor(c)}
                      className={`w-7 h-7 rounded-xl transition cursor-pointer ${
                        newGroupColor === c ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Member Selection List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Select Group Members ({selectedMemberIds.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds(studentsOnly.map(s => s.id))}
                      className="text-[11px] text-indigo-400 hover:underline font-bold"
                    >
                      Select All Students
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      className="text-[11px] text-slate-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search members */}
                <input
                  type="text"
                  placeholder="Filter students by name or roll..."
                  value={memberSearchQuery}
                  onChange={e => setMemberSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                {/* Member Checkbox Cards */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {studentsList
                    .filter(
                      m =>
                        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                        (m.roll && m.roll.includes(memberSearchQuery))
                    )
                    .map(member => {
                      const isSelected = selectedMemberIds.includes(member.id);

                      return (
                        <div
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-805'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                member.photo ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={member.name}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {member.roll && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Roll {member.roll}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500">{member.role}</span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'border-slate-700'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Users size={14} />
                  <span>Create Group & Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: SEND TO SELECTED STUDENTS ===================== */}
      {showSelectedStudentsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Message Only Selected Students</h3>
                  <p className="text-xs text-slate-400">Targeted real-time direct delivery to chosen students</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelectedStudentsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendToSelectedSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Student Picker with Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Pick Target Students ({targetStudentIds.length} chosen) <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTargetStudentIds(studentsOnly.map(s => s.id))}
                    className="text-[11px] text-rose-400 hover:underline font-bold"
                  >
                    Select All ({studentsOnly.length})
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search students..."
                  value={targetStudentSearch}
                  onChange={e => setTargetStudentSearch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {studentsOnly
                    .filter(
                      s =>
                        s.name.toLowerCase().includes(targetStudentSearch.toLowerCase()) ||
                        (s.roll && s.roll.includes(targetStudentSearch)) ||
                        s.admissionNumber.toLowerCase().includes(targetStudentSearch.toLowerCase())
                    )
                    .map(student => {
                      const isTargeted = targetStudentIds.includes(student.id);

                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleTargetStudent(student.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isTargeted
                              ? 'bg-rose-600/20 border-rose-500/50 text-white'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                student.photo ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={student.name}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{student.name}</span>
                                <span className="text-[10px] text-cyan-300 font-mono">
                                  Roll {student.roll}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {student.admissionNumber}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                              isTargeted
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'border-slate-700'
                            }`}
                          >
                            {isTargeted && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Message Content <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Please note: you have pending science fair practical files due before 1:00 PM today..."
                  value={targetMessageText}
                  onChange={e => setTargetMessageText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSelectedStudentsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Deliver to {targetStudentIds.length} Student(s)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
