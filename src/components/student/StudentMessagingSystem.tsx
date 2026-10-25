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
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Megaphone,
  Smile,
  Paperclip,
  X,
  Check,
  Clock,
  Shield,
  ArrowRight,
  Filter,
  Info,
  DollarSign,
  Calendar,
  Volume2,
  FileText,
  User,
  GraduationCap
} from 'lucide-react';

type StudentMessageTab = 'BROADCAST' | 'DIRECT_ADMIN' | 'GROUPS';

interface QuickInquiry {
  label: string;
  category: string;
  text: string;
}

const studentQuickInquiries: QuickInquiry[] = [
  {
    label: '💳 Tuition & Fee Clearance Inquiry',
    category: 'FEE',
    text: 'Assalamu Alaikum Sir, I would like to check if my recent tuition fee payment has been verified by the cashier office.'
  },
  {
    label: '🎓 Marksheet & Grade Clarification',
    category: 'MARKS',
    text: 'Sir, could you please verify my 1st Term exam marksheet? I had a question regarding my Mathematics derivation score.'
  },
  {
    label: '📅 Routine & Lab Schedule Question',
    category: 'ROUTINE',
    text: 'Sir, has the upcoming Physics practical session been confirmed for Smart Lab 1 as noted in the routine?'
  },
  {
    label: '📝 Assignment & Homework Submission',
    category: 'STUDY',
    text: 'Respected Teacher, I have uploaded my completed assignment to the study vault. Please verify receipt.'
  }
];

export const StudentMessagingSystem: React.FC = () => {
  const { currentUser, authenticatedStudent } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const { studentsList, studentDues } = useInstitution();
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    addReaction
  } = useChat();

  const [activeTab, setActiveTab] = useState<StudentMessageTab>('BROADCAST');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingContact, setTypingContact] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active student identification
  const currentStudent =
    studentsList.find(
      s =>
        s.id === currentUser.id ||
        (currentUser.admissionNumber && s.admissionNumber === currentUser.admissionNumber) ||
        s.name.toLowerCase() === currentUser.name.toLowerCase()
    ) ||
    authenticatedStudent || {
      id: currentUser.id || 'u_5',
      name: currentUser.name || 'Sadia Jahan',
      email: currentUser.email || 'sadia@smartclass.edu',
      admissionNumber: currentUser.admissionNumber || 'ADM-2026-015',
      role: 'STUDENT' as const,
      roll: currentUser.roll || '03',
      photo: currentUser.avatar
    };

  // Dedicated channels for student
  const studentChannels = [
    {
      id: 'all_students',
      tab: 'BROADCAST' as StudentMessageTab,
      name: 'AL-USWAH (All Students Broadcast)',
      description: 'Official announcements and urgent bulletins from Class IT Lead & Head Teacher',
      badge: 'Official',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      icon: Megaphone,
      color: '#6366f1'
    },
    {
      id: 'direct_admin_officer',
      tab: 'DIRECT_ADMIN' as StudentMessageTab,
      name: 'Abu Saleh (Class IT Officer - Super Admin)',
      description: 'Direct inquiry channel with Class IT Officer for marks, routine & fee clearance',
      badge: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      icon: Shield,
      color: '#f43f5e'
    },
    {
      id: 'direct_head_teacher',
      tab: 'DIRECT_ADMIN' as StudentMessageTab,
      name: 'Dr. Nusrat Jahan (Head Teacher)',
      description: 'Academic counseling, homework guidance and exam preparation',
      badge: 'Head Teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      icon: GraduationCap,
      color: '#a855f7'
    },
    // Only groups created by the Admin for students
    ...conversations
      .filter(c => c.type === 'GROUP')
      .map(g => ({
        id: g.id,
        tab: 'GROUPS' as StudentMessageTab,
        name: g.name,
        description: g.description || 'Admin created student group',
        badge: 'Admin Group',
        avatar: g.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
        icon: Users,
        color: g.color || '#6366f1'
      }))
  ];

  const [activeChannelId, setActiveChannelId] = useState<string>('all_students');
  const activeChannel = studentChannels.find(c => c.id === activeChannelId) || studentChannels[0];

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId, isTyping]);

  // Filter messages for current channel and student
  const displayedMessages = messages.filter(m => {
    if (activeChannelId === 'all_students') {
      return (
        m.conversationId === 'all_students' ||
        m.targetAudience === 'ALL'
      );
    }
    if (activeChannelId === 'direct_admin_officer') {
      return (
        m.conversationId === 'direct_admin_officer' ||
        (m.recipientIds && m.recipientIds.includes(currentStudent.id) && m.senderRole === 'SUPER_ADMIN') ||
        (m.senderId === currentStudent.id && m.conversationId === 'direct_admin_officer')
      );
    }
    if (activeChannelId === 'direct_head_teacher') {
      return (
        m.conversationId === 'direct_head_teacher' ||
        (m.recipientIds && m.recipientIds.includes(currentStudent.id) && m.senderRole === 'TEACHER') ||
        (m.senderId === currentStudent.id && m.conversationId === 'direct_head_teacher')
      );
    }
    return m.conversationId === activeChannelId;
  }).filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.message.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q);
  });

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachedFile) return;

    sendMessage({
      conversationId: activeChannelId,
      message: text,
      targetAudience: activeChannelId === 'all_students' ? 'ALL' : 'GROUP',
      attachments: attachedFile
        ? [{ name: attachedFile.name, type: 'FILE', size: attachedFile.size }]
        : undefined
    });

    setInputText('');
    setAttachedFile(null);
    playChime('click');
    addNotification({
      title: 'Message Delivered',
      message: `Posted to ${activeChannel.name}.`,
      type: 'success'
    });


  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      setAttachedFile({ name: file.name, size: sizeStr });
      playChime('click');
    }
  };

  const emojis = ['👍', '❤️', '🔥', '🙌', '💡', '👏', '🎯', '🚀'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <MessageSquare size={14} />
            <span>AL-USWAH Real-Time Communication Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Real-Time Messages & Officer Channel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Same live multi-channel messaging platform used by administration. Connect with Class IT Officer, Head Teacher, and project teams.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('BROADCAST');
              setActiveChannelId('all_students');
              playChime('click');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BROADCAST'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone size={13} />
            <span>Broadcasts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('DIRECT_ADMIN');
              setActiveChannelId('direct_admin_officer');
              playChime('click');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DIRECT_ADMIN'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={13} />
            <span>Officer Direct</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('GROUPS');
              setActiveChannelId('grp_stem_robotics');
              playChime('click');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'GROUPS'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Study Teams</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Layout: Left Channels List + Right Interactive Chat Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
        {/* Left: Channels & Contacts Sidebar */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Channels
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                5 Online
              </span>
            </div>

            {/* Channel List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {activeTab === 'GROUPS' && studentChannels.filter(c => c.tab === 'GROUPS').length === 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-dashed border-slate-800 text-center space-y-1.5 my-2">
                  <Users size={20} className="mx-auto text-slate-500" />
                  <div className="text-xs font-bold text-slate-300">No Student Groups Yet</div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Only groups created by the Admin for students will appear here.
                  </p>
                </div>
              )}
              {studentChannels
                .filter(c => activeTab === 'BROADCAST' || c.tab === activeTab || c.tab === 'BROADCAST')
                .map(channel => {
                  const isSelected = activeChannelId === channel.id;
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannelId(channel.id);
                        playChime('click');
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-md'
                          : 'bg-slate-950/70 border border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={channel.avatar}
                          alt={channel.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-white truncate">
                            {channel.name}
                          </h4>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold shrink-0 ${
                              channel.badge === 'Super Admin'
                                ? 'bg-rose-500/20 text-rose-300'
                                : channel.badge === 'Head Teacher'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-indigo-500/20 text-indigo-300'
                            }`}
                          >
                            {channel.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {channel.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Quick Info Box at bottom */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Real-Time Broadcast Synchronized</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Messages posted here sync instantly across devices with AL-USWAH IT server.
            </p>
          </div>
        </div>

        {/* Right: Live Interactive Messaging Workspace */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Active Channel Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={activeChannel.avatar}
                alt={activeChannel.name}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>{activeChannel.name}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">{activeChannel.description}</p>
              </div>
            </div>

            {/* Channel Search */}
            <div className="relative hidden sm:block w-48">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chat..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Live Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1">
            {displayedMessages.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <MessageSquare size={30} className="mx-auto text-slate-600" />
                <div className="text-slate-400 font-bold">No messages in this channel yet</div>
                <p className="text-[11px]">Type below or choose a quick inquiry template to begin.</p>
              </div>
            ) : (
              displayedMessages.map(msg => {
                const isMe = msg.senderId === currentStudent.id;
                const isSuperAdmin = msg.senderRole === 'SUPER_ADMIN';
                const isTeacher = msg.senderRole === 'TEACHER';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <img
                      src={
                        msg.senderAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-700 shadow"
                    />

                    <div
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 shadow ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : isSuperAdmin
                          ? 'bg-rose-950/40 border border-rose-800/60 text-slate-100 rounded-tl-none'
                          : isTeacher
                          ? 'bg-purple-950/40 border border-purple-800/60 text-slate-100 rounded-tl-none'
                          : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Sender Line */}
                      <div className="flex items-center justify-between gap-3 text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={
                              isMe
                                ? 'text-indigo-200'
                                : isSuperAdmin
                                ? 'text-rose-300'
                                : isTeacher
                                ? 'text-purple-300'
                                : 'text-cyan-300'
                            }
                          >
                            {isMe ? 'You (Student)' : msg.senderName}
                          </span>
                          {!isMe && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 font-mono">
                              {msg.senderRole}
                            </span>
                          )}
                        </div>
                        <span className="opacity-60 font-mono">{msg.timestamp}</span>
                      </div>

                      {/* Content */}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="pt-1.5 space-y-1">
                          {msg.attachments.map((att, attIdx) => (
                            <div
                              key={attIdx}
                              className="p-2 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-2 text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText size={13} className="text-amber-400 shrink-0" />
                                <span className="truncate font-mono">{att.name}</span>
                              </div>
                              <span className="text-[10px] opacity-75 shrink-0 font-mono">{att.size || 'PDF'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Reactions */}
                      <div className="pt-1 flex items-center gap-1 flex-wrap">
                        {msg.reactions &&
                          Object.entries(msg.reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(msg.id, emoji)}
                              className="px-1.5 py-0.5 rounded-lg bg-black/20 hover:bg-black/40 border border-white/10 text-[10px] flex items-center gap-1 transition cursor-pointer"
                            >
                              <span>{emoji}</span>
                              <span className="font-mono">{count}</span>
                            </button>
                          ))}

                        {/* Add reaction button */}
                        <button
                          onClick={() => addReaction(msg.id, '👍')}
                          className="px-1.5 py-0.5 rounded-lg hover:bg-black/20 text-[10px] opacity-60 hover:opacity-100 transition cursor-pointer"
                          title="Like"
                        >
                          +👍
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 w-fit animate-pulse">
                <Sparkles size={13} className="text-rose-400 animate-spin" />
                <span>
                  <strong>{typingContact}</strong> is drafting a reply...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Area: Quick Inquiry Chips + File Preview + Input Box */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            {/* Quick Inquiry Chips (for direct officer questions) */}
            {activeChannelId !== 'grp_stem_robotics' && activeChannelId !== 'grp_math_olympiad' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[10px] text-slate-500 font-semibold shrink-0">Quick Query:</span>
                {studentQuickInquiries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(q.text);
                      playChime('click');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-[10px] text-slate-300 hover:text-white transition whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Attached file preview */}
            {attachedFile && (
              <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between text-xs text-indigo-300">
                <div className="flex items-center gap-2">
                  <Paperclip size={13} />
                  <span>{attachedFile.name} ({attachedFile.size})</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Message Input Box with Tools */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                title="Attach Document or Lab Worksheet"
              >
                <Paperclip size={16} />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Send message to ${activeChannel.name}...`}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  <Smile size={16} />
                </button>

                {/* Emoji Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute right-0 bottom-12 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center gap-1 z-30">
                    {emojis.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setInputText(prev => prev + e);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1 hover:bg-slate-800 rounded-lg text-sm transition cursor-pointer"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !attachedFile}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer shrink-0"
              >
                <Send size={15} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
