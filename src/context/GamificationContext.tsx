import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
import { useNotifications } from './NotificationContext';

interface GamificationContextType {
  xp: number;
  level: number;
  streak: number;
  coins: number;
  addXP: (amount: number, reason?: string) => void;
  triggerConfetti: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('smartclass_xp')) || 2850;
  });
  const [streak] = useState<number>(18);
  const [coins, setCoins] = useState<number>(430);
  const { playChime, addNotification } = useNotifications();

  const level = Math.floor(xp / 200) + 1;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const addXP = (amount: number, reason: string = 'অ্যাক্টিভিটি সম্পন্ন') => {
    const nextXp = xp + amount;
    const oldLevel = Math.floor(xp / 200) + 1;
    const newLevel = Math.floor(nextXp / 200) + 1;

    setXp(nextXp);
    setCoins(prev => prev + Math.floor(amount / 5));
    localStorage.setItem('smartclass_xp', String(nextXp));

    if (newLevel > oldLevel) {
      triggerConfetti();
      playChime('levelUp');
      addNotification({
        title: `অভিনন্দন! লেভেল আপ #${newLevel} 🎉`,
        message: `আপনি নতুন লেভেলে উত্তীর্ণ হয়েছেন! অর্জিত বোনাস: +৫০ কয়েন।`,
        type: 'success'
      });
    } else {
      playChime('success');
      addNotification({
        title: `+${amount} XP অর্জিত!`,
        message: `${reason} করার মাধ্যমে আপনি পয়েন্ট অর্জন করেছেন।`,
        type: 'info'
      });
    }
  };

  return (
    <GamificationContext.Provider value={{ xp, level, streak, coins, addXP, triggerConfetti }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within GamificationProvider');
  return context;
};
