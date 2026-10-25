import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';

export interface RoboMessage {
  id: string;
  sender: 'user' | 'robo';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

interface AIContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: RoboMessage[];
  sendMessage: (query: string) => void;
  isThinking: boolean;
  clearHistory: () => void;
  speakText: (text: string) => void;
  isSpeaking: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser, currentRole } = useAuth();
  const { addXP } = useGamification();

  const [messages, setMessages] = useState<RoboMessage[]>([
    {
      id: 'robo_init',
      sender: 'robo',
      text: `Hello ${currentUser.name}! I am "Robo Sir" 🦉🎓, your SmartClass Pro AI academic advisor. I can assist you with class timetables, attendance analytics, homework derivations, formula explanations, and personalized study schedules. How can I help you today?`,
      timestamp: 'Just now',
      suggestions: [
        'When is my next class & in which room?',
        'What is my overall attendance rate?',
        'Explain Newton\'s 3 Laws of Motion',
        'Generate an optimized study schedule for today'
      ]
    }
  ]);

  const toggleOpen = () => setIsOpen(prev => !prev);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const getSmartRoboResponse = (query: string): { reply: string; suggestions?: string[] } => {
    const q = query.toLowerCase();

    if (q.includes('next class') || q.includes('routine') || q.includes('schedule') || q.includes('timetable')) {
      return {
        reply: `Your next lecture is "Physics (Wave Mechanics)" at 08:30 AM in Lab-301 (Science Block) with Dr. Nusrat Jahan. The class commences in 12 minutes! 🔔`,
        suggestions: ['Show lab practical notes', 'Open full routine schedule']
      };
    }

    if (q.includes('attendance') || q.includes('absent') || q.includes('present')) {
      return {
        reply: `Your overall campus attendance is currently ${currentUser.attendancePercentage || 94.5}%! This comfortably surpasses the institutional requirement of 75%. You are 2 days away from unlocking the "Iron Discipline" streak badge! 🚀`,
        suggestions: ['How to apply for official leave?', 'Show attendance calendar heatmap']
      };
    }

    if (q.includes('newton') || q.includes('law') || q.includes('force') || q.includes('physics')) {
      return {
        reply: `Here are Newton's 3 Fundamental Laws of Motion:\n1. Law of Inertia: An object remains at rest or in uniform straight-line motion unless acted upon by a net external force.\n2. Law of Acceleration: Net force equals the time rate of change of momentum (F = m · a for invariant mass).\n3. Action & Reaction: For every action, there is an equal and opposite reaction acting on separate bodies. 🌟`,
        suggestions: ['Solve sample problem with F=ma', 'State Law of Conservation of Momentum']
      };
    }

    if (q.includes('study plan') || q.includes('schedule') || q.includes('routine') || q.includes('exam')) {
      return {
        reply: `Here is your optimized Robo Sir study plan for today:\n• 04:00 PM - 05:00 PM: Physics Chapter 4 (Newtonian Mechanics Problem Set)\n• 05:15 PM - 06:00 PM: Advanced Math Trigonometric Functions Practice\n• 07:00 PM - 08:00 PM: Chemistry Periodic Table Revision\n• Remember to take 5-minute Pomodoro focus breaks in between! ☕`,
        suggestions: ['Launch Pomodoro focus timer', 'Check pending assignment deadlines']
      };
    }

    if (q.includes('cgpa') || q.includes('result') || q.includes('gpa') || q.includes('mark') || q.includes('grade')) {
      return {
        reply: `Your latest term evaluation: CGPA 3.92 (Grade A+). You secured top honors in Advanced Mathematics (98/100) and Physics (94/100). You are ranked in the top 5% of your class! 🏆`,
        suggestions: ['Download official marksheet', 'View examination date sheet']
      };
    }

    if (currentRole === 'TEACHER') {
      return {
        reply: `Doctor/Professor, you have 3 scheduled lectures today. In Period 2 (Grade 10A), 32 student attendances are awaiting verification. You can project the live QR code in 1-click for auto-check-in! 📋`,
        suggestions: ['Launch Attendance QR Code', 'Open Gradebook evaluation']
      };
    }

    if (currentRole === 'ADMIN') {
      return {
        reply: `Principal, today's institution-wide operational snapshot:\n• Overall Student Attendance: 94.6%\n• Active Faculty: 74 certified teachers\n• Monthly Tuition Collection: 84% completed\n• Cloud Server Infrastructure: 99.99% uptime, healthy. ✅`,
        suggestions: ['View user management directory', 'Open financial ledger']
      };
    }

    return {
      reply: `Great question regarding "${query}". The SmartClass Pro knowledge engine has related references in your course materials, the student doubt forum, and the question bank. Would you like me to guide you to relevant materials? 🎓`,
      suggestions: ['Show today\'s class schedule', 'Launch speed quiz', 'View campus notices']
    };
  };

  const sendMessage = (query: string) => {
    if (!query.trim()) return;

    const userMsg: RoboMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const response = getSmartRoboResponse(query);
      const roboMsg: RoboMessage = {
        id: `msg_r_${Date.now()}`,
        sender: 'robo',
        text: response.reply,
        timestamp: 'Just now',
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, roboMsg]);
      setIsThinking(false);
      addXP(10, 'Robo Sir AI Consultation');
    }, 550);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'robo_init_fresh',
        sender: 'robo',
        text: `Conversation history refreshed. Hello ${currentUser.name}, how may I assist you today? 🦉`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <AIContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        messages,
        sendMessage,
        isThinking,
        clearHistory,
        speakText,
        isSpeaking
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};
