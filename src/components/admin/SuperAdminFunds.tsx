import React, { useState } from 'react';
import { useInstitution } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  DollarSign,
  UserCheck,
  CreditCard,
  FileText,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Filter,
  Edit2,
  Trash2
} from 'lucide-react';

export const SuperAdminFunds: React.FC = () => {
  const {
    stats,
    studentsList,
    fundTransactions,
    studentDues,
    addIncome,
    addExpense,
    addStudentDue,
    recordStudentPayment,
    updateTransaction,
    deleteTransaction,
    updateStudentDue,
    deleteStudentDue
  } = useInstitution();
  const { playChime, addNotification } = useNotifications();

  // Modal & Box States
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

  // Edit Transaction States (CRUD Modification)
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editTxTitle, setEditTxTitle] = useState('');
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxCategory, setEditTxCategory] = useState('Science Project');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxReceipt, setEditTxReceipt] = useState('');

  // Edit Student Due States (CRUD Modification)
  const [editingDue, setEditingDue] = useState<any | null>(null);
  const [editDueTitle, setEditDueTitle] = useState('');
  const [editDueTotal, setEditDueTotal] = useState('');
  const [editDuePaid, setEditDuePaid] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueNotes, setEditDueNotes] = useState('');

  // Income / Expense Form States
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Science Project');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Add Due Form States
  const [dueStudentId, setDueStudentId] = useState('');
  const [dueTitle, setDueTitle] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueNotes, setDueNotes] = useState('');

  // Record Payment Form States
  const [selectedDueId, setSelectedDueId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash to Class Cashier');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter & Search
  const [activeLedgerTab, setActiveLedgerTab] = useState<'TRANSACTIONS' | 'STUDENT_DUES'>('TRANSACTIONS');
  const [searchDues, setSearchDues] = useState('');
  const [duesStatusFilter, setDuesStatusFilter] = useState<'ALL' | 'UNPAID' | 'PARTIAL' | 'PAID'>('ALL');

  const studentsOnly = studentsList.filter(s => s.role === 'STUDENT');

  // Financial Computations
  const totalIncome = fundTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = fundTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const totalDuesAssigned = studentDues.reduce((acc, d) => acc + d.totalDue, 0);
  const totalDuesCollected = studentDues.reduce((acc, d) => acc + d.paidAmount, 0);
  const totalOutstandingDues = Math.max(0, totalDuesAssigned - totalDuesCollected);

  // Graph Data (Categories Breakdown)
  const incomeCategories = ['Science Project', 'Donation', 'Student Dues', 'Picnic Fund', 'Other'];
  const expenseCategories = ['Robotics Kit', 'Classroom Supplies', 'Photocopy', 'Events', 'Other'];

  const categoryIncomeTotals = incomeCategories.map(cat => ({
    category: cat,
    total: fundTransactions
      .filter(t => t.type === 'INCOME' && (t.category === cat || (!incomeCategories.includes(t.category) && cat === 'Other')))
      .reduce((sum, t) => sum + t.amount, 0)
  }));

  const categoryExpenseTotals = expenseCategories.map(cat => ({
    category: cat,
    total: fundTransactions
      .filter(t => t.type === 'EXPENSE' && (t.category === cat || (!expenseCategories.includes(t.category) && cat === 'Other')))
      .reduce((sum, t) => sum + t.amount, 0)
  }));

  const maxGraphVal = Math.max(
    ...categoryIncomeTotals.map(c => c.total),
    ...categoryExpenseTotals.map(c => c.total),
    100
  );

  // Submit Income
  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount || Number(txAmount) <= 0) return;
    addIncome(txTitle.trim(), Number(txAmount), txCategory, txDate);
    setShowIncomeModal(false);
    setTxTitle('');
    setTxAmount('');
  };

  // Submit Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount || Number(txAmount) <= 0) return;
    addExpense(txTitle.trim(), Number(txAmount), txCategory, txDate);
    setShowExpenseModal(false);
    setTxTitle('');
    setTxAmount('');
  };

  // Submit Due
  const handleAddDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueTitle.trim() || !dueAmount || Number(dueAmount) <= 0) return;

    if (dueStudentId === 'ALL') {
      // Add due for every enrolled student
      studentsOnly.forEach(student => {
        addStudentDue(student.id, dueTitle.trim(), Number(dueAmount), dueDate, dueNotes);
      });
      playChime('success');
      addNotification({
        title: 'Class-Wide Due Assigned',
        message: `$${dueAmount} assigned to all ${studentsOnly.length} students for "${dueTitle}".`,
        type: 'success'
      });
    } else {
      const student = studentsOnly.find(s => s.id === dueStudentId);
      if (!student) return;
      addStudentDue(dueStudentId, dueTitle.trim(), Number(dueAmount), dueDate, dueNotes);
    }

    setShowAddDueModal(false);
    setDueStudentId('');
    setDueTitle('');
    setDueAmount('');
    setDueNotes('');
  };

  // Submit Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDueId || !payAmount || Number(payAmount) <= 0) return;

    recordStudentPayment(selectedDueId, Number(payAmount), payMethod, payDate);
    setShowRecordPaymentModal(false);
    setSelectedDueId('');
    setPayAmount('');
  };

  // Open Edit Transaction
  const openEditTxModal = (tx: any) => {
    setEditingTx(tx);
    setEditTxTitle(tx.title);
    setEditTxAmount(tx.amount.toString());
    setEditTxCategory(tx.category || 'Science Project');
    setEditTxDate(tx.date || new Date().toISOString().split('T')[0]);
    setEditTxReceipt(tx.receiptNumber || '');
    playChime('click');
  };

  // Save Edited Transaction
  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const numAmount = Number(editTxAmount);
    if (!editTxTitle.trim() || isNaN(numAmount) || numAmount <= 0) {
      addNotification({
        title: 'Invalid Input',
        message: 'Please provide a valid title and positive amount.',
        type: 'warning'
      });
      return;
    }
    updateTransaction(editingTx.id, {
      title: editTxTitle.trim(),
      amount: numAmount,
      category: editTxCategory,
      date: editTxDate,
      receiptNumber: editTxReceipt.trim()
    });
    setEditingTx(null);
  };

  // Open Edit Due
  const openEditDueModal = (due: any) => {
    setEditingDue(due);
    setEditDueTitle(due.title);
    setEditDueTotal(due.totalDue.toString());
    setEditDuePaid(due.paidAmount.toString());
    setEditDueDate(due.dueDate || new Date().toISOString().split('T')[0]);
    setEditDueNotes(due.notes || '');
    playChime('click');
  };

  // Save Edited Due
  const handleSaveEditDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDue) return;
    const total = Number(editDueTotal);
    const paid = Number(editDuePaid);
    if (!editDueTitle.trim() || isNaN(total) || total <= 0) {
      addNotification({
        title: 'Invalid Input',
        message: 'Please provide a valid due title and amount.',
        type: 'warning'
      });
      return;
    }
    const safePaid = isNaN(paid) ? 0 : Math.max(0, Math.min(paid, total));
    const status: 'PAID' | 'PARTIAL' | 'UNPAID' =
      safePaid >= total ? 'PAID' : safePaid > 0 ? 'PARTIAL' : 'UNPAID';

    updateStudentDue(editingDue.id, {
      title: editDueTitle.trim(),
      totalDue: total,
      paidAmount: safePaid,
      dueDate: editDueDate,
      notes: editDueNotes.trim(),
      status
    });
    setEditingDue(null);
  };

  // Filtered Dues
  const filteredDues = studentDues.filter(due => {
    const matchesSearch =
      due.studentName.toLowerCase().includes(searchDues.toLowerCase()) ||
      due.title.toLowerCase().includes(searchDues.toLowerCase()) ||
      due.admissionNumber.toLowerCase().includes(searchDues.toLowerCase()) ||
      due.roll.includes(searchDues);
    const matchesStatus = duesStatusFilter === 'ALL' || due.status === duesStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDueRecord = studentDues.find(d => d.id === selectedDueId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Wallet size={14} />
            <span>AL-USWAH Cashier & Treasury Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Class Funds, Ledger & Student Dues
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor class cash reserves, view financial inflow/outflow graph, assign student dues, and record fee payments.
          </p>
        </div>

        {/* 4 Action Buttons requested by user */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setShowIncomeModal(true);
              playChime('click');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>+ Add Income</span>
          </button>

          <button
            onClick={() => {
              setShowExpenseModal(true);
              playChime('click');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <MinusCircle size={15} />
            <span>- Add Expense</span>
          </button>

          <button
            onClick={() => {
              setShowAddDueModal(true);
              playChime('click');
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign size={15} />
            <span>Assign Student Dues</span>
          </button>

          <button
            onClick={() => {
              setShowRecordPaymentModal(true);
              playChime('click');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck size={15} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Current Balance */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Class Fund Balance</span>
            <Wallet size={16} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 mt-2">
            ${currentBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available cash in class treasury</div>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-900/40 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>Total Income Inflow</span>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            ${totalIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300/70 mt-1">From fees, donations & drives</div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-900/40 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
            <span>Total Spent Expenses</span>
            <ArrowDownRight size={16} className="text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">
            ${totalExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-300/70 mt-1">Robotics kits, supplies & events</div>
        </div>

        {/* Outstanding Dues */}
        <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-900/40 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>Outstanding Dues</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            ${totalOutstandingDues.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300/70 mt-1">
            ${totalDuesCollected.toLocaleString()} of ${totalDuesAssigned.toLocaleString()} collected
          </div>
        </div>
      </div>

      {/* ===================== FINANCIAL GRAPH ===================== */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-400" />
              <span>Class Funds Breakdown & Income vs Expense Graph</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visual comparison of inflow categories vs expenditure allocations
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Income Categories
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Expenses
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Income Categories Bars */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>Income Sources</span>
              <span>${totalIncome.toLocaleString()}</span>
            </div>
            <div className="space-y-2.5">
              {categoryIncomeTotals.map(item => {
                const pct = maxGraphVal > 0 ? (item.total / maxGraphVal) * 100 : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{item.category}</span>
                      <span className="font-mono font-bold text-emerald-400">${item.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense Categories Bars */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
              <span>Expense Allocations</span>
              <span>${totalExpense.toLocaleString()}</span>
            </div>
            <div className="space-y-2.5">
              {categoryExpenseTotals.map(item => {
                const pct = maxGraphVal > 0 ? (item.total / maxGraphVal) * 100 : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{item.category}</span>
                      <span className="font-mono font-bold text-rose-400">${item.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== LEDGER TABS & TABLES ===================== */}
      <div className="space-y-4">
        {/* Tab Selector */}
        <div className="flex items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveLedgerTab('TRANSACTIONS');
                playChime('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeLedgerTab === 'TRANSACTIONS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Class Transactions History ({fundTransactions.length})
            </button>
            <button
              onClick={() => {
                setActiveLedgerTab('STUDENT_DUES');
                playChime('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeLedgerTab === 'STUDENT_DUES'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Dues & Collections Ledger ({studentDues.length})
            </button>
          </div>

          {activeLedgerTab === 'STUDENT_DUES' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search dues..."
                value={searchDues}
                onChange={e => setSearchDues(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <select
                value={duesStatusFilter}
                onChange={e => setDuesStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          )}
        </div>

        {/* View 1: Transactions Table */}
        {activeLedgerTab === 'TRANSACTIONS' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description / Purpose</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Receipt / Voucher #</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fundTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {tx.type === 'INCOME' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white">
                        <div>{tx.title}</div>
                        {tx.studentName && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            Paid by: {tx.studentName}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-[11px]">{tx.category}</td>
                      <td className="p-4 text-slate-400">{tx.date}</td>
                      <td className="p-4 font-mono text-[11px] text-cyan-300">
                        {tx.receiptNumber || 'N/A'}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-sm">
                        <span className={tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditTxModal(tx)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                            title="Edit transaction details or amount"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition border border-rose-500/20 cursor-pointer"
                            title="Remove / Delete this transaction"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 2: Student Dues & Collections Table */}
        {activeLedgerTab === 'STUDENT_DUES' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Roll</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Fee / Due Item</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Total Due</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDues.map(due => {
                    const remaining = Math.max(0, due.totalDue - due.paidAmount);

                    return (
                      <tr key={due.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 font-mono font-bold text-white">
                          <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
                            {due.roll}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-white">
                          <div>{due.studentName}</div>
                          <div className="text-[11px] text-cyan-300 font-mono">{due.admissionNumber}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-200">{due.title}</div>
                          {due.notes && <div className="text-[10px] text-slate-400">{due.notes}</div>}
                        </td>
                        <td className="p-4 text-slate-400">{due.dueDate}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              due.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : due.status === 'PARTIAL'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {due.status === 'PAID' && <CheckCircle2 size={12} />}
                            {due.status === 'PARTIAL' && <Clock size={12} />}
                            {due.status === 'UNPAID' && <AlertCircle size={12} />}
                            <span>{due.status}</span>
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">${due.totalDue}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">${due.paidAmount}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {due.status !== 'PAID' ? (
                              <button
                                onClick={() => {
                                  setSelectedDueId(due.id);
                                  setPayAmount(remaining.toString());
                                  setShowRecordPaymentModal(true);
                                  playChime('click');
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow cursor-pointer"
                              >
                                Pay ${remaining}
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                                <CheckCircle2 size={13} /> Paid Full
                              </span>
                            )}
                            <button
                              onClick={() => openEditDueModal(due)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                              title="Edit due amount or notes"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteStudentDue(due.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition border border-rose-500/20 cursor-pointer"
                              title="Remove / Delete student due"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODAL 1: ADD INCOME ===================== */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Deposit Class Income</h3>
                  <p className="text-xs text-slate-400">Add funds into AL-USWAH treasury</p>
                </div>
              </div>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Income Title / Source</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Project Kit Contribution"
                  value={txTitle}
                  onChange={e => setTxTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="150"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Science Project">Science Project</option>
                    <option value="Picnic Fund">Picnic Fund</option>
                    <option value="Donation">Parent Donation</option>
                    <option value="Student Dues">Student Dues</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deposit Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Confirm & Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: ADD EXPENSE ===================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <MinusCircle size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Record Class Expense</h3>
                  <p className="text-xs text-slate-400">Deduct cash spent for class items</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Expense Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchased Arduino Boards & Wires"
                  value={txTitle}
                  onChange={e => setTxTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="85"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Robotics Kit">Robotics Kit</option>
                    <option value="Classroom Supplies">Classroom Supplies</option>
                    <option value="Photocopy">Photocopy Worksheets</option>
                    <option value="Events">Class Events & Picnic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date Spent</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30"
                >
                  Deduct & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: ASSIGN STUDENT DUES ===================== */}
      {showAddDueModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Assign Due to Students</h3>
                  <p className="text-xs text-slate-400">Select student(s) to add due and save</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDueModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDueSubmit} className="space-y-4">
              {/* Student Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Student <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={dueStudentId}
                  onChange={e => setDueStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Choose a student --</option>
                  <option value="ALL">★ All Class Students ({studentsOnly.length} students)</option>
                  {studentsOnly.map(s => (
                    <option key={s.id} value={s.id}>
                      Roll {s.roll || 'N/A'} — {s.name} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Due Title / Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Robotics Kit Fee"
                  value={dueTitle}
                  onChange={e => setDueTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="30"
                    value={dueAmount}
                    onChange={e => setDueAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Additional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Mandatory component fee"
                  value={dueNotes}
                  onChange={e => setDueNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDueModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30"
                >
                  Assign Due & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 4: RECORD STUDENT PAYMENT ===================== */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Record Student Payment</h3>
                  <p className="text-xs text-slate-400">Select student to how much paid and save</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              {/* Select Due Record */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Student Due Item <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedDueId}
                  onChange={e => {
                    setSelectedDueId(e.target.value);
                    const found = studentDues.find(d => d.id === e.target.value);
                    if (found) {
                      setPayAmount((found.totalDue - found.paidAmount).toString());
                    }
                  }}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose student fee record --</option>
                  {studentDues
                    .filter(d => d.status !== 'PAID')
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        Roll {d.roll} — {d.studentName} : {d.title} (Remaining: ${d.totalDue - d.paidAmount})
                      </option>
                    ))}
                </select>
              </div>

              {selectedDueRecord && (
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Student:</span>
                    <span className="font-bold text-white">{selectedDueRecord.studentName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Admission Number:</span>
                    <span className="font-mono text-cyan-300">{selectedDueRecord.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Fee:</span>
                    <span className="font-mono font-bold">${selectedDueRecord.totalDue}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Already Paid:</span>
                    <span className="font-mono text-emerald-400">${selectedDueRecord.paidAmount}</span>
                  </div>
                </div>
              )}

              {/* Amount Paid */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  How Much Paid ($) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedDueRecord ? selectedDueRecord.totalDue - selectedDueRecord.paidAmount : undefined}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Cash to Class Cashier">Cash to Class Cashier (Samiul Karim)</option>
                  <option value="bKash / Mobile Banking">bKash / Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer / Card</option>
                </select>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Payment & Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT TRANSACTION ===================== */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${editingTx.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Edit {editingTx.type === 'INCOME' ? 'Income' : 'Expense'} Transaction</h3>
                  <p className="text-xs text-slate-400">Modify amount, category, or title</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditTx} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title / Description</label>
                <input
                  type="text"
                  required
                  value={editTxTitle}
                  onChange={e => setEditTxTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editTxAmount}
                    onChange={e => setEditTxAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editTxCategory}
                    onChange={e => setEditTxCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={editTxDate}
                    onChange={e => setEditTxDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Receipt / Voucher #</label>
                  <input
                    type="text"
                    value={editTxReceipt}
                    onChange={e => setEditTxReceipt(e.target.value)}
                    placeholder="e.g. REC-8492"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT STUDENT DUE ===================== */}
      {editingDue && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Edit Student Due</h3>
                  <p className="text-xs text-slate-400">{editingDue.studentName} ({editingDue.admissionNumber})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDue(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditDue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fee / Due Item Title</label>
                <input
                  type="text"
                  required
                  value={editDueTitle}
                  onChange={e => setEditDueTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total Due ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editDueTotal}
                    onChange={e => setEditDueTotal(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount Paid ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editDuePaid}
                    onChange={e => setEditDuePaid(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={editDueNotes}
                  onChange={e => setEditDueNotes(e.target.value)}
                  placeholder="Optional note"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDue(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
