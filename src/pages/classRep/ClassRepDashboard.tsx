import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useGamification } from '../../context/GamificationContext';
import {
  Wallet,
  Plus,
  Send,
  Vote,
  Users,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';

interface FundTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

const initialTransactions: FundTransaction[] = [
  { id: 'tx_1', description: 'Grade 10-A Science Fair Project Contribution (35 students)', amount: 1050, type: 'INCOME', date: 'Oct 05, 2026' },
  { id: 'tx_2', description: 'Purchased robotics sensor breadboard kit & markers', amount: 85, type: 'EXPENSE', date: 'Oct 07, 2026' },
  { id: 'tx_3', description: 'Teacher Day greeting banner & token bouquet', amount: 120, type: 'EXPENSE', date: 'Oct 08, 2026' }
];

export const ClassRepDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<FundTransaction[]>(initialTransactions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  // Poll simulation
  const [pollVotes, setPollVotes] = useState({ option1: 22, option2: 14 });
  const [hasVoted, setHasVoted] = useState(false);

  const { playChime, addNotification } = useNotifications();
  const { addXP } = useGamification();

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;

    const newTx: FundTransaction = {
      id: `tx_${Date.now()}`,
      description: desc,
      amount: Number(amount),
      type: txType,
      date: 'Today'
    };

    setTransactions(prev => [newTx, ...prev]);
    setShowAddModal(false);
    setDesc('');
    setAmount('');
    playChime('success');
    addXP(25, 'Updated class fund ledger');
    addNotification({
      title: 'Class Fund Record Logged',
      message: `${desc}: $${Number(amount).toLocaleString()} successfully recorded into petty cash register.`,
      type: 'success'
    });
  };

  const handleVote = (option: 'option1' | 'option2') => {
    if (hasVoted) return;
    setPollVotes(prev => ({ ...prev, [option]: prev[option] + 1 }));
    setHasVoted(true);
    playChime('click');
    addXP(10, 'Participated in class poll');
    addNotification({
      title: 'Vote Cast Successfully! 🗳️',
      message: 'Your opinion has been tallied in the Grade 10-A representative poll.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Wallet size={14} />
            <span>Class Representative Portal (CR Hub)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Class Fund Ledger & Peer Governance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Grade 10 (Section A) • Transparent class petty cash audit & student opinion polls
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-extrabold text-lg">
            $
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Available Class Fund</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              ${currentBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">Verified & auditable balance</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Total Collections</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
              ${totalIncome.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Contributions & activity pools</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Total Disbursed</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-0.5">
              ${totalExpense.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Approved vouchers & receipts</div>
          </div>
        </div>
      </div>

      {/* Grid: Ledger Table + Live Student Poll */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ledger Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Fund Entries</h3>
            <span className="text-xs text-slate-400">{transactions.length} records logged</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {transactions.map(t => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white">{t.description}</div>
                  <div className="text-[11px] text-slate-400">{t.date}</div>
                </div>
                <div className={`font-mono font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Peer Poll */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Vote size={16} className="text-indigo-400" />
              <span>Active Class Poll</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              Open Voting
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="font-bold text-xs text-white">
              Which topic should we choose for the Inter-Class Science Fair Display?
            </div>

            <div className="space-y-2">
              <button
                disabled={hasVoted}
                onClick={() => handleVote('option1')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                  hasVoted ? 'border-slate-800 bg-slate-900' : 'border-slate-700 bg-slate-850 hover:border-indigo-500'
                }`}
              >
                <span>A. Autonomous Drone Crop Monitoring</span>
                <span className="font-bold text-indigo-400">{pollVotes.option1} votes</span>
              </button>

              <button
                disabled={hasVoted}
                onClick={() => handleVote('option2')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                  hasVoted ? 'border-slate-800 bg-slate-900' : 'border-slate-700 bg-slate-850 hover:border-indigo-500'
                }`}
              >
                <span>B. Renewable Green Hydrogen Generator</span>
                <span className="font-bold text-indigo-400">{pollVotes.option2} votes</span>
              </button>
            </div>

            {hasVoted && (
              <div className="text-[11px] text-emerald-400 font-semibold text-center pt-1">
                ✓ Your vote has been recorded anonymously.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Record Class Fund Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Transaction Description</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. Science Fair poster printing"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('INCOME')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      txType === 'INCOME' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    Income (Collection)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('EXPENSE')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      txType === 'EXPENSE' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    Expense (Disbursed)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
