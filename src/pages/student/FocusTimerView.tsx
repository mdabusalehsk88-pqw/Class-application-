import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useGamification } from '../../context/GamificationContext';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Music,
  CheckCircle2
} from 'lucide-react';

export const FocusTimerView: React.FC = () => {
  const [mode, setMode] = useState<'WORK' | 'BREAK'>('WORK');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'NONE' | 'RAIN' | 'CAFE'>('NONE');
  const [completedSessions, setCompletedSessions] = useState(3);
  const { playChime, addNotification } = useNotifications();
  const { addXP, triggerConfetti } = useGamification();

  // Web Audio Synthetic Ambient Noise generator
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'WORK') {
        setCompletedSessions(prev => prev + 1);
        addXP(30, '২৫ মিনিট পোমোডোরো ফোকাস সম্পন্ন');
        triggerConfetti();
        playChime('levelUp');
        addNotification({
          title: 'অভিনন্দন! ফোকাস সেশন সমাপ্ত 🎯',
          message: '২৫ মিনিটের নিবিড় স্টাডি সেশন সম্পন্ন হয়েছে। এবার ৫ মিনিটের প্রশান্তির বিরতি নিন।',
          type: 'success'
        });
        setMode('BREAK');
        setTimeLeft(5 * 60);
      } else {
        playChime('success');
        setMode('WORK');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
    playChime('click');
  };

  const resetTimer = (newMode?: 'WORK' | 'BREAK') => {
    setIsRunning(false);
    const m = newMode || mode;
    setMode(m);
    setTimeLeft(m === 'WORK' ? 25 * 60 : 5 * 60);
    playChime('click');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress =
    mode === 'WORK'
      ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
      : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Timer size={14} />
          <span>স্মার্ট পোমোডোরো ফোকাস ট্র্যাকার (Focus & Deep Work)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {mode === 'WORK' ? 'গভীর মনোযোগে অধ্যয়ন (Deep Study)' : 'প্রশান্তির বিরতি (Short Break)'}
        </h1>
        <p className="text-xs text-slate-400">
          ডিজিটাল বিভ্রান্তি দূর করে ২৫ মিনিট নিবিড়ভাবে একটিমাত্র বিষয়ের উপর কাজ করুন।
        </p>
      </div>

      {/* Mode Toggle Buttons */}
      <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => resetTimer('WORK')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'WORK' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          অধ্যয়ন মোড (২৫ মিনিট)
        </button>
        <button
          onClick={() => resetTimer('BREAK')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'BREAK' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          বিরতি মোড (৫ মিনিট)
        </button>
      </div>

      {/* Main Timer Display Circle */}
      <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
        {/* Outer Circular SVG Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="112"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r="112"
            stroke={mode === 'WORK' ? '#6366f1' : '#10b981'}
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 112}
            strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center space-y-1">
          <span className="text-5xl font-extrabold text-white font-mono tracking-wider">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
            {isRunning ? 'চলমান...' : 'বিরতিতে রয়েছে'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center gap-2 transition active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? 'থামান (Pause)' : 'শুরু করুন (Start)'}</span>
        </button>
        <button
          onClick={() => resetTimer()}
          className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl transition"
          title="রিসেট করুন"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Stats footer */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-around text-xs">
        <div>
          <div className="text-slate-400 font-semibold">আজ সম্পন্ন সেশন</div>
          <div className="text-lg font-extrabold text-white">{completedSessions} টি</div>
        </div>
        <div className="h-8 w-[1px] bg-slate-800" />
        <div>
          <div className="text-slate-400 font-semibold">মোট নিবিড় অধ্যয়ন</div>
          <div className="text-lg font-extrabold text-indigo-400">{completedSessions * 25} মিনিট</div>
        </div>
        <div className="h-8 w-[1px] bg-slate-800" />
        <div>
          <div className="text-slate-400 font-semibold">অর্জিত স্টাডি XP</div>
          <div className="text-lg font-extrabold text-amber-400">+{completedSessions * 30} XP</div>
        </div>
      </div>
    </div>
  );
};
