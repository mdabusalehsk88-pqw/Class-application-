import React, { useState } from 'react';
import { mockBadges, mockLeaderboard } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Star
} from 'lucide-react';

export const GamificationView: React.FC = () => {
  const { currentUser } = useAuth();
  const { xp, level, streak, coins, triggerConfetti } = useGamification();
  const { playChime, addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'BADGES' | 'SHOP'>('LEADERBOARD');

  const shopItems = [
    { id: 'sh_1', title: 'সাইবার নিয়ন ডার্ক থিম', price: 150, unlocked: true },
    { id: 'sh_2', title: 'গোল্ডেন স্টার প্রোফাইল ফ্রেম', price: 200, unlocked: false },
    { id: 'sh_3', title: 'স্পেশাল রোবো পেঙ্গুইন অবতার', price: 350, unlocked: false }
  ];

  const handleBuy = (item: { title: string; price: number }) => {
    if (coins < item.price) {
      playChime('alert');
      addNotification({
        title: 'কয়েন অপর্যাপ্ত!',
        message: `এই আইটেমটি আনলক করতে আরও ${item.price - coins} কয়েন প্রয়োজন। কুইজ ও অ্যাসাইনমেন্টে অংশ নিন।`,
        type: 'warning'
      });
      return;
    }
    triggerConfetti();
    playChime('levelUp');
    addNotification({
      title: 'রিওয়ার্ড আনলক সফল! 🎁',
      message: `${item.title} সফলভাবে আপনার প্রোফাইলে যোগ হয়েছে!`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy size={14} />
            <span>গেমিফিকেশন ও মেধা তালিকা (Gamification & Rank)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            লেভেল #{level} • স্কলার খেতাব (Scholar)
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            মোট এক্সপি: {xp} XP | উপলব্ধ কয়েন: {coins} 🪙 | দৈনিক স্ট্রিক: {streak} দিন
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center p-1 bg-slate-800 rounded-2xl border border-slate-700">
          {[
            { id: 'LEADERBOARD', label: 'মেধা তালিকা' },
            { id: 'BADGES', label: 'অর্জিত ব্যাজ' },
            { id: 'SHOP', label: 'রিওয়ার্ড শপ' }
          ].map(tb => (
            <button
              key={tb.id}
              onClick={() => {
                setActiveTab(tb.id as 'LEADERBOARD' | 'BADGES' | 'SHOP');
                playChime('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tb.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'LEADERBOARD' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <span>দশম শ্রেণি সামগ্রিক মেধা তালিকা (Class Top Rankers)</span>
          </h3>

          <div className="space-y-3">
            {mockLeaderboard.map(lb => (
              <div
                key={lb.rank}
                className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                  lb.roll === currentUser.roll
                    ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-slate-850 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs ${
                    lb.rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : lb.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : lb.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{lb.rank}
                  </div>
                  <img
                    src={lb.avatar}
                    alt={lb.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      <span>{lb.name}</span>
                      {lb.roll === currentUser.roll && (
                        <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-semibold">
                          আপনি
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      রোল: {lb.roll} • খেতাব: {lb.badge}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">{lb.xp} XP</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Flame size={11} className="text-amber-400" />
                    <span>{lb.streak} দিন স্ট্রিক</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges Gallery Tab */}
      {activeTab === 'BADGES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mockBadges.map(b => (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition shadow-lg ${
                b.unlocked
                  ? 'bg-slate-900/90 border-indigo-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{b.icon}</span>
                {b.unlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>অর্জিত</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                    <Lock size={12} />
                    <span>লকড</span>
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{b.titleBn}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{b.descriptionBn}</p>

              {b.unlocked && (
                <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-800 pt-2">
                  আনলক হয়েছে: {b.unlockedAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rewards Shop Tab */}
      {activeTab === 'SHOP' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {shopItems.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-3">
                  <Sparkles size={20} />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">{item.title}</h4>
                <div className="text-xs text-amber-400 font-bold mb-4">{item.price} কয়েন 🪙</div>
              </div>

              <button
                disabled={item.unlocked}
                onClick={() => handleBuy(item)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                  item.unlocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                }`}
              >
                {item.unlocked ? 'ইতিমধ্যে আনলকড' : 'আনলক করুন'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
