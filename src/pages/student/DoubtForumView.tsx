import React, { useState } from 'react';
import { mockDoubts } from '../../data/mockData';
import { DoubtQuestion } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import {
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  Plus,
  X,
  Send,
  Search,
  Sparkles
} from 'lucide-react';

export const DoubtForumView: React.FC = () => {
  const [doubts, setDoubts] = useState<DoubtQuestion[]>(mockDoubts);
  const [showAskModal, setShowAskModal] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [questionSubject, setQuestionSubject] = useState('Physics');
  const { currentUser } = useAuth();
  const { playChime, addNotification } = useNotifications();
  const { addXP } = useGamification();

  const handleUpvote = (id: string) => {
    setDoubts(prev =>
      prev.map(d => (d.id === id ? { ...d, upvotes: d.upvotes + 1 } : d))
    );
    playChime('click');
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim()) return;

    const newDoubt: DoubtQuestion = {
      id: `dbt_${Date.now()}`,
      title: questionTitle,
      body: questionBody,
      subject: questionSubject,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      createdAt: 'এইমাত্র',
      upvotes: 1,
      answersCount: 1,
      isSolved: false,
      acceptedAnswer: `রোবো স্যার এআই পরামর্শ: "${questionTitle}" এর মূল সমাধানের জন্য আপনার সংশ্লিষ্ট অধ্যায়ের মৌলিক সংজ্ঞা ও সূত্র লক্ষ্য করুন। শিক্ষক শীঘ্রই রিভিউ করবেন।`,
      tags: [questionSubject, 'Question']
    };

    setDoubts(prev => [newDoubt, ...prev]);
    setShowAskModal(false);
    setQuestionTitle('');
    setQuestionBody('');
    playChime('success');
    addXP(20, 'ডাউট ফোরামে প্রশ্ন উত্থাপন');
    addNotification({
      title: 'প্রশ্ন পোস্ট সম্পন্ন',
      message: 'আপনার ডাউট সহপাঠী ও শিক্ষকদের ফোরামে প্রকাশিত হয়েছে।',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <HelpCircle size={14} />
            <span>ডাউট ও সমস্যা সমাধান ফোরাম (Peer & Teacher Forum)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            প্রশ্নোত্তর ও একাডেমিক সংশয় নিরসন
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            প্রশ্ন করুন • শিক্ষক ও সহপাঠীদের নিকট হতে যাচাইকৃত সঠিক সমাধান পান
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          <Plus size={16} />
          <span>নতুন প্রশ্ন করুন</span>
        </button>
      </div>

      {/* List of Doubts */}
      <div className="space-y-4">
        {doubts.map(dbt => (
          <div
            key={dbt.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-md"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={dbt.authorAvatar}
                  alt={dbt.authorName}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                />
                <div>
                  <div className="font-bold text-xs text-white">{dbt.authorName}</div>
                  <div className="text-[10px] text-slate-400">
                    {dbt.subject} • {dbt.createdAt}
                  </div>
                </div>
              </div>

              {dbt.isSolved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <CheckCircle size={12} />
                  <span>সমাধানপ্রাপ্ত (Solved)</span>
                </span>
              )}
            </div>

            {/* Question Title & Body */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">{dbt.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{dbt.body}</p>
            </div>

            {/* Accepted Answer if present */}
            {dbt.acceptedAnswer && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  <span>যাচাইকৃত সমাধান (Verified Solution):</span>
                </div>
                <p className="leading-relaxed text-slate-200">{dbt.acceptedAnswer}</p>
              </div>
            )}

            {/* Footer row: upvote & tags */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpvote(dbt.id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <ThumbsUp size={13} className="text-indigo-400" />
                  <span>{dbt.upvotes}</span>
                </button>
                <div className="text-slate-400 flex items-center gap-1">
                  <MessageCircle size={13} />
                  <span>{dbt.answersCount}টি উত্তর</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {dbt.tags.map((tg, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]"
                  >
                    #{tg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">নতুন প্রশ্ন পোস্ট করুন</h3>
              <button onClick={() => setShowAskModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">বিষয় নির্বাচন</label>
                <select
                  value={questionSubject}
                  onChange={e => setQuestionSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="Physics">পদার্থবিজ্ঞান (Physics)</option>
                  <option value="Higher Math">উচ্চতর গণিত (Higher Math)</option>
                  <option value="Chemistry">রসায়ন (Chemistry)</option>
                  <option value="Biology">জীববিজ্ঞান (Biology)</option>
                  <option value="ICT">আইসিটি (ICT)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">প্রশ্নের মূল শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={e => setQuestionTitle(e.target.value)}
                  placeholder="যেমন: অপটিক্সে আলো অভিলম্বের দিকে বাঁকে কেন?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">বিস্তারিত ব্যাখ্যা বা সমস্যা</label>
                <textarea
                  rows={4}
                  required
                  value={questionBody}
                  onChange={e => setQuestionBody(e.target.value)}
                  placeholder="আপনার সমাধানের কোন ধাপে সমস্যা হচ্ছে বিস্তারিত লিখুন..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>প্রশ্ন প্রকাশ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
