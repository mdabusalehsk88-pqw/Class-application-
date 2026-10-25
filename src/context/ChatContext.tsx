import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useInstitution } from './InstitutionContext';

interface SendMessageArgs {
  conversationId: string;
  message: string;
  targetAudience?: 'ALL' | 'SELECTED_STUDENTS' | 'GROUP';
  recipientIds?: string[];
  recipientNames?: string[];
  attachments?: { name: string; url?: string; type: string; size?: string }[];
  isAnnouncement?: boolean;
}

interface CreateGroupArgs {
  name: string;
  description?: string;
  memberIds: string[];
  color?: string;
}

interface ChatContextType {
  conversations: ChatConversation[];
  messages: ChatMessage[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (args: SendMessageArgs) => void;
  createGroup: (args: CreateGroupArgs) => ChatConversation;
  sendToSelectedStudents: (studentIds: string[], messageText: string, isAnnouncement?: boolean) => void;
  addReaction: (msgId: string, emoji: string) => void;
  deleteMessage: (msgId: string) => void;
  isOnline: boolean;
}

const defaultConversations: ChatConversation[] = [
  {
    id: 'all_students',
    type: 'ALL_STUDENTS',
    name: 'AL-USWAH (All Students Broadcast)',
    description: 'Official real-time channel delivered to all enrolled students and class administration.',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    color: '#6366f1',
    memberIds: ['ALL'],
    createdAt: '2026-10-20'
  }
];

const defaultInitialMessages: ChatMessage[] = [];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const { studentsList } = useInstitution();

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_chat_conversations');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultConversations;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultInitialMessages;
  });

  const [activeConversationId, setActiveConversationId] = useState<string>('all_students');
  const [isOnline] = useState(true);

  // Real-time broadcast channel reference
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    localStorage.setItem('smartclass_chat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('smartclass_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Set up BroadcastChannel for instant inter-tab/inter-window real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('smartclass_realtime_chat');
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'NEW_MESSAGE' && payload) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.id)) return prev;
              return [...prev, payload];
            });

            // Update last message in conversation
            setConversations(prev =>
              prev.map(c =>
                c.id === payload.conversationId
                  ? { ...c, lastMessage: payload.message, lastMessageTime: payload.timestamp }
                  : c
              )
            );

            playChime('click');
          } else if (type === 'NEW_GROUP' && payload) {
            setConversations(prev => {
              if (prev.some(c => c.id === payload.id)) return prev;
              return [payload, ...prev];
            });
            playChime('success');
          } else if (type === 'DELETE_MESSAGE' && payload) {
            setMessages(prev => prev.filter(m => m.id !== payload.id));
          } else if (type === 'REACTION' && payload) {
            setMessages(prev =>
              prev.map(m =>
                m.id === payload.msgId
                  ? {
                      ...m,
                      reactions: {
                        ...m.reactions,
                        [payload.emoji]: (m.reactions?.[payload.emoji] || 0) + 1
                      }
                    }
                  : m
              )
            );
          }
        };

        const handleStorage = (e: StorageEvent) => {
          if (e.key === 'smartclass_chat_messages' && e.newValue) {
            try {
              const freshMsgs = JSON.parse(e.newValue);
              if (Array.isArray(freshMsgs)) setMessages(freshMsgs);
            } catch {
              // ignore
            }
          }
          if (e.key === 'smartclass_chat_conversations' && e.newValue) {
            try {
              const freshConvs = JSON.parse(e.newValue);
              if (Array.isArray(freshConvs)) setConversations(freshConvs);
            } catch {
              // ignore
            }
          }
        };

        window.addEventListener('storage', handleStorage);

        return () => {
          channel.close();
          window.removeEventListener('storage', handleStorage);
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }
  }, [playChime]);

  // Send message
  const sendMessage = ({
    conversationId,
    message,
    targetAudience = 'ALL',
    recipientIds,
    recipientNames,
    attachments,
    isAnnouncement
  }: SendMessageArgs) => {
    if (!message.trim()) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      message: message.trim(),
      timestamp: timeStr,
      targetAudience,
      recipientIds,
      recipientNames,
      attachments,
      isAnnouncement,
      reactions: { '👍': 1 }
    };

    setMessages(prev => [...prev, newMsg]);

    // Update conversation last message preview
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: isAnnouncement ? `📢 ${message.trim()}` : message.trim(),
              lastMessageTime: timeStr
            }
          : c
      )
    );

    // Broadcast across windows/tabs in real-time
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'NEW_MESSAGE',
        payload: newMsg
      });
    }

    playChime('click');
  };

  // Create a new custom group
  const createGroup = ({ name, description, memberIds, color = '#6366f1' }: CreateGroupArgs) => {
    const newGroupId = `grp_${Date.now()}`;
    const newGroup: ChatConversation = {
      id: newGroupId,
      type: 'GROUP',
      name: name.trim(),
      description: description?.trim() || `AL-USWAH project and study group with ${memberIds.length} members.`,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      color,
      memberIds: Array.from(new Set([currentUser.id, ...memberIds])),
      createdBy: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
      lastMessage: 'Group created. Start messaging your team!',
      lastMessageTime: 'Just now'
    };

    setConversations(prev => [newGroup, ...prev]);
    setActiveConversationId(newGroupId);

    // Post system greeting
    const welcomeMsg: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      conversationId: newGroupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      message: `🎉 Created the group "${name.trim()}". Welcome team members!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      targetAudience: 'GROUP',
      reactions: { '👋': 1, '🚀': 1 }
    };

    setMessages(prev => [...prev, welcomeMsg]);

    // Broadcast
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'NEW_GROUP', payload: newGroup });
      broadcastChannelRef.current.postMessage({ type: 'NEW_MESSAGE', payload: welcomeMsg });
    }

    playChime('success');
    addNotification({
      title: 'Class Group Created! 👥',
      message: `"${name}" with ${newGroup.memberIds.length} members created successfully.`,
      type: 'success'
    });

    return newGroup;
  };

  // Send to ONLY selected students (Direct / targeted messaging)
  const sendToSelectedStudents = (
    studentIds: string[],
    messageText: string,
    isAnnouncement = false
  ) => {
    if (studentIds.length === 0 || !messageText.trim()) return;

    // Resolve student names
    const matchedStudents = studentsList.filter(s => studentIds.includes(s.id));
    const recipientNames = matchedStudents.map(s => s.name);

    // Look for existing direct conversation or create new targeted conversation
    const directConvId =
      studentIds.length === 1
        ? `dm_${[currentUser.id, studentIds[0]].sort().join('_')}`
        : `targeted_${Date.now()}`;

    let targetConv = conversations.find(c => c.id === directConvId);

    if (!targetConv) {
      const convName =
        studentIds.length === 1
          ? `Direct: ${matchedStudents[0]?.name || 'Student'}`
          : `Selected (${studentIds.length} Students): ${recipientNames.slice(0, 2).join(', ')}${
              recipientNames.length > 2 ? '...' : ''
            }`;

      targetConv = {
        id: directConvId,
        type: 'DIRECT_MESSAGE',
        name: convName,
        description: `Targeted messaging to: ${recipientNames.join(', ')}`,
        avatar: matchedStudents[0]?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        color: '#f43f5e',
        memberIds: [currentUser.id, ...studentIds],
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().split('T')[0],
        lastMessage: messageText.trim(),
        lastMessageTime: 'Just now'
      };

      setConversations(prev => [targetConv!, ...prev]);
    }

    // Set active to this conversation
    setActiveConversationId(directConvId);

    // Send the message
    sendMessage({
      conversationId: directConvId,
      message: messageText.trim(),
      targetAudience: 'SELECTED_STUDENTS',
      recipientIds: studentIds,
      recipientNames,
      isAnnouncement
    });

    playChime('success');
    addNotification({
      title: 'Targeted Message Sent',
      message: `Delivered to ${studentIds.length} selected student(s) (${recipientNames.slice(0, 2).join(', ')}).`,
      type: 'success'
    });
  };

  // Add emoji reaction
  const addReaction = (msgId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId) {
          const currentCount = m.reactions?.[emoji] || 0;
          return {
            ...m,
            reactions: { ...m.reactions, [emoji]: currentCount + 1 }
          };
        }
        return m;
      })
    );

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'REACTION',
        payload: { msgId, emoji }
      });
    }

    playChime('click');
  };

  // Delete message
  const deleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'DELETE_MESSAGE',
        payload: { id: msgId }
      });
    }
    playChime('alert');
  };

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
