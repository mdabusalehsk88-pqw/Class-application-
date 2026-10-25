import React, { useState } from 'react';
import { mockFlashcards } from '../../data/mockData';
import { useNotifications } from '../../context/NotificationContext';
import { useGamification } from '../../context/GamificationContext';
import {
  Layers,
  RotateCw,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { playChime, addNotification } = useNotifications();
  const { addXP } = useGamification();

  const card = mockFlashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
    playChime('click');
  };

  const handleNext = (mastery: 'EASY' | 'MEDIUM' | 'HARD') => {
    setIsFlipped(false);
    playChime('success');
    addXP(15, 'ফ্ল্যাশ কার্ড রিভিশন');

    if (currentIndex < mockFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      addNotification({
        title: 'ফ্ল্যাশ কার্ড ডেক সম্পন্ন! 🎯',
        message: 'আপনি এই ডেকের সকল কার্ড সফলভাবে রিভিশন দিয়েছেন।',
        type: 'success'
      });
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Layers size={14} />
          <span>স্পেসড রিপিটেশন ফ্ল্যাশ কার্ড (SRS Learning)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {card.deck} ({currentIndex + 1} / {mockFlashcards.length})
        </h1>
        <p className="text-xs text-slate-400">
          কার্ডে ট্যাপ বা ক্লিক করে পেছনের উত্তর দেখুন।
        </p>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full h-80 cursor-pointer perspective-1000 select-none"
      >
        <div
          className={`relative w-full h-full duration-500 preserve-3d rounded-3xl transition-transform shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>{card.subject}</span>
              <span className="flex items-center gap-1 text-slate-400">
                <RotateCw size={13} />
                <span>ট্যাপ করে উল্টান</span>
              </span>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                {card.frontBn}
              </h2>
              <p className="text-xs text-indigo-200/80">{card.front}</p>
            </div>

            <div className="text-center text-[11px] text-slate-500 font-semibold">
              ক্লিক করে সমাধান / সূত্র দেখুন
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 border-2 border-violet-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-violet-300">
              <span className="flex items-center gap-1">
                <Sparkles size={14} className="text-amber-400" />
                <span>রোবো স্যার উত্তর ও সূত্র</span>
              </span>
              <span className="text-slate-400">সমাধান</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {card.backBn}
              </p>
              <p className="text-xs text-slate-300 font-mono">{card.back}</p>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              মনে রাখার সহজ কৌশল প্রয়োগ করুন
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons for SRS Spaced Repetition */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleNext('HARD')}
          className="px-5 py-2.5 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white rounded-2xl text-xs font-bold transition active:scale-95"
        >
          কঠিন লেগেছে (Hard)
        </button>
        <button
          onClick={() => handleNext('MEDIUM')}
          className="px-5 py-2.5 bg-amber-600/30 hover:bg-amber-600 border border-amber-500/40 text-amber-200 hover:text-white rounded-2xl text-xs font-bold transition active:scale-95"
        >
          মাঝারি (Medium)
        </button>
        <button
          onClick={() => handleNext('EASY')}
          className="px-5 py-2.5 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-200 hover:text-white rounded-2xl text-xs font-bold transition active:scale-95"
        >
          সহজ / মুখস্থ (Easy)
        </button>
      </div>
    </div>
  );
};
