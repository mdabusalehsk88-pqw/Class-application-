import React, { useState } from 'react';
import { mockInvoices } from '../../data/mockData';
import { FeeInvoice } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useGamification } from '../../context/GamificationContext';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Wallet,
  ShieldCheck
} from 'lucide-react';

export const FeesView: React.FC = () => {
  const [invoices, setInvoices] = useState<FeeInvoice[]>(mockInvoices);
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD' | 'CARD'>('BKASH');
  const { playChime, addNotification } = useNotifications();
  const { addXP, triggerConfetti } = useGamification();

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === payingInvoice.id
          ? {
              ...inv,
              status: 'PAID',
              paidDate: '২০২৬-১০-১১',
              paymentMethod: paymentMethod === 'BKASH' ? 'bKash Gateway' : paymentMethod === 'NAGAD' ? 'Nagad Gateway' : 'Visa/Mastercard'
            }
          : inv
      )
    );

    const paidTitle = payingInvoice.titleBn;
    setPayingInvoice(null);
    triggerConfetti();
    playChime('levelUp');
    addXP(50, 'সময়মতো ফি পরিশোধ');
    addNotification({
      title: 'পেমেন্ট সফল হয়েছে! 💳',
      message: `${paidTitle} এর বিল সফলভাবে পরিশোধিত হয়েছে। ডিজিটাল মানি রিসিট সংরক্ষিত হয়েছে।`,
      type: 'success'
    });
  };

  const handleDownloadReceipt = (inv: FeeInvoice) => {
    playChime('success');
    addNotification({
      title: 'রিসিপ্ট ডাউনলোড সম্পন্ন',
      message: `ইনভয়েস #${inv.invoiceNumber} এর অফিসিয়াল ফি রিসিপ্ট সেভ করা হয়েছে।`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <CreditCard size={14} />
            <span>ফি ও আর্থিক লেনদেন ব্যবস্থাপনা (Tuition & Fees)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            টিউশন ফি ও পেমেন্ট হিস্ট্রি
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            নিরাপদ ডিজিটাল গেটওয়ে (bKash, Nagad, Cards) • অটো ইনভয়েস ও রসিদ
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.map(inv => (
          <div
            key={inv.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-400 font-bold">
                  {inv.invoiceNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inv.status === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {inv.status === 'PAID' ? 'পরিশোধিত (PAID)' : 'পরিশোধ বাকি (DUE)'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{inv.titleBn}</h3>
              <div className="text-xs text-slate-400">
                নির্ধারিত শেষ তারিখ: {inv.dueDate} {inv.paidDate && `• পরিশোধের তারিখ: ${inv.paidDate}`}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-semibold">বিল পরিমাণ</div>
                <div className="text-xl font-extrabold text-white">৳ {inv.amount.toLocaleString()}</div>
              </div>

              {inv.status === 'DUE' ? (
                <button
                  onClick={() => setPayingInvoice(inv)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  এখনই পরিশোধ করুন
                </button>
              ) : (
                <button
                  onClick={() => handleDownloadReceipt(inv)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>রসিদ ডাউনলোড</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Gateway Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">অনলাইন পেমেন্ট গেটওয়ে</h3>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800 rounded-2xl text-center">
                <div className="text-slate-400">{payingInvoice.titleBn}</div>
                <div className="text-2xl font-extrabold text-white mt-1">
                  ৳ {payingInvoice.amount.toLocaleString()}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">পেমেন্ট মাধ্যম বেছে নিন</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BKASH', label: 'বিকাশ (bKash)', color: 'bg-pink-600' },
                    { id: 'NAGAD', label: 'নগদ (Nagad)', color: 'bg-orange-600' },
                    { id: 'CARD', label: 'কার্ড (Visa/MC)', color: 'bg-blue-600' }
                  ].map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as 'BKASH' | 'NAGAD' | 'CARD')}
                      className={`p-3 rounded-2xl border text-center font-bold transition ${
                        paymentMethod === m.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {paymentMethod === 'CARD' ? 'কার্ড নম্বর' : 'মোবাইল অ্যাকাউন্ট নম্বর'}
                </label>
                <input
                  type="text"
                  required
                  defaultValue={paymentMethod === 'CARD' ? '4111 2222 3333 4444' : '01712-345678'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] justify-center pt-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>১২৮-বিট এনক্রিপ্টেড ও সুরক্ষিত লেনদেন</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/30 text-sm transition"
                >
                  ৳ {payingInvoice.amount.toLocaleString()} পরিশোধ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
