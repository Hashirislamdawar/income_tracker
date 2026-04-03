"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Trash2, 
  PieChart as PieChartIcon, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';

const CAT_COLORS: Record<string, string> = {
  Food: '#10b981', // Neon Green
  Housing: '#3b82f6', // Bright Blue
  Transport: '#f59e0b', // Amber
  Health: '#f43f5e', // Rose
  Entertainment: '#8b5cf6', // Violet
  Shopping: '#ec4899', // Pink
  Salary: '#10b981', 
  Other: '#64748b' // Slate
};

const CAT_EMOJI: Record<string, string> = {
  Food: '🍔', Housing: '🏠', Transport: '🚗', Health: '💊',
  Entertainment: '🎬', Shopping: '🛍', Salary: '💼', Other: '📦'
};

type Transaction = {
  id: number;
  desc: string;
  amount: number;
  cat: string;
  type: 'income' | 'expense';
  date: string;
};

type Goal = {
  id: number;
  name: string;
  target: number;
  saved: number;
};

export default function BudgetPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Mounted state for hydration mismatch avoidance
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCat, setTxCat] = useState('Food');
  const [txDate, setTxDate] = useState('');
  const [goalName, setGoalName] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const savedTx = localStorage.getItem('bp_tx_react');
    const savedGoals = localStorage.getItem('bp_goals_react');
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    setTxDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bp_tx_react', JSON.stringify(transactions));
      localStorage.setItem('bp_goals_react', JSON.stringify(goals));
    }
  }, [transactions, goals, isMounted]);

  if (!isMounted) return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Loading...</div>;

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const getMonthKey = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  const monthKey = getMonthKey(currentDate);
  const monthTxs = transactions.filter(t => t.date.startsWith(monthKey));

  const income = monthTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance = income - expenses;

  // Pie chart calculation
  const catTotals: Record<string, number> = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.cat] = (catTotals[t.cat] || 0) + t.amount;
  });
  const pieEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const addTransaction = () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return alert('Please enter a valid amount greater than 0.');
    
    // Default the description to the category name if they left it blank
    const finalDesc = txDesc.trim() || txCat;
    const finalDate = txDate || new Date().toISOString().split('T')[0];
    
    setTransactions(prev => [{ id: Date.now(), desc: finalDesc, amount, cat: txCat, type: txType, date: finalDate }, ...prev]);
    setTxDesc('');
    setTxAmount('');
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = () => {
    const raw = goalName.trim();
    if (!raw) return;
    const match = raw.match(/\$(\d+)/);
    const target = match ? parseInt(match[1]) : 100;
    const name = raw.replace(/\$\d+/, '').trim() || 'Goal';
    setGoals(prev => [...prev, { id: Date.now(), name, target, saved: 0 }]);
    setGoalName('');
  };

  const updateGoalSaved = (id: number, val: string) => {
    const num = parseFloat(val) || 0;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.max(0, Math.min(g.target, num)) } : g));
  };
  
  const deleteGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="w-full h-full p-4 md:p-8 bg-transparent text-white overflow-y-auto custom-scrollbar font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Smart Budget
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Track income, spending & goals dynamically.</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 bg-zinc-900 p-1.5 rounded-full border border-zinc-800 shadow-inner">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            ←
          </button>
          <span className="font-semibold text-zinc-200 min-w-[120px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            →
          </button>
        </div>
      </div>

      {/* Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard 
          title="Income" 
          amount={fmt(income)} 
          sub={`${monthTxs.filter(t=>t.type==='income').length} transactions`}
          icon={<ArrowUpRight className="text-emerald-400" size={24} />}
          glowColor="rgba(16, 185, 129, 0.15)"
        />
        <SummaryCard 
          title="Expenses" 
          amount={fmt(expenses)} 
          sub={`${monthTxs.filter(t=>t.type==='expense').length} transactions`}
          icon={<ArrowDownRight className="text-rose-400" size={24} />}
          glowColor="rgba(244, 63, 94, 0.15)"
        />
        <SummaryCard 
          title="Balance" 
          amount={fmt(balance)} 
          sub={balance >= 0 ? "You're on track!" : "Spending exceeds income"}
          icon={<Wallet className="text-cyan-400" size={24} />}
          glowColor="rgba(34, 211, 238, 0.15)"
          isHighlight={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Add Transaction */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md">
            <h3 className="text-lg font-semibold mb-4 text-zinc-100">Add Transaction</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <input 
                  type="text" 
                  value={txDesc}
                  onChange={e => setTxDesc(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount ($)</label>
                <input 
                  type="number" 
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  placeholder="0.00" 
                  min="0" step="0.01"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-4 mb-5">
              <div className="flex flex-col gap-1.5 col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</label>
                <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                  <button 
                    type="button"
                    onClick={() => { setTxType('income'); setTxCat('Salary'); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${txType === 'income' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Income
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setTxType('expense'); setTxCat('Food'); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${txType === 'expense' ? 'bg-rose-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 col-span-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                <select 
                  value={txCat}
                  onChange={e => setTxCat(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  {txType === 'income' ? (
                    <>
                      <option value="Salary">💼 Salary</option>
                      <option value="Other">📦 Other</option>
                    </>
                  ) : (
                    <>
                      {Object.keys(CAT_EMOJI).filter(c => c !== 'Salary').map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                    </>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-400 focus:outline-none focus:border-emerald-500 block w-full appearance-none"
                />
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={addTransaction}
              className={`w-full font-bold py-2.5 rounded-lg transition-shadow text-zinc-950 ${
                txType === 'income' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]'
              }`}
            >
              Add {txType === 'income' ? 'Income' : 'Expense'}
            </motion.button>
          </div>

          {/* Transactions List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-zinc-100 flex items-center gap-2">
              Recent Activity
            </h3>
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-2 h-[320px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {monthTxs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                      <Wallet size={24} className="text-zinc-600" />
                    </div>
                    No transactions this month.
                  </motion.div>
                ) : (
                  monthTxs.map(tx => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, zIndex: -1 }}
                      transition={{ duration: 0.2 }}
                      key={tx.id}
                      className="group flex items-center justify-between p-3 mb-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${CAT_COLORS[tx.cat]}20`, color: CAT_COLORS[tx.cat] }}
                        >
                          {CAT_EMOJI[tx.cat] || '📦'}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-zinc-200">{tx.desc}</div>
                          <div className="text-xs text-zinc-500">{tx.cat} • {tx.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-mono font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                        <button 
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Spending Donut */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-sm font-semibold mb-6 text-zinc-100 flex items-center gap-2">
              <PieChartIcon size={16} className="text-cyan-400" />
              Spending Breakdown
            </h3>
            
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-lg">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#27272a" strokeWidth="12" />
                {totalDonutPaths(pieEntries, expenses)}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-xl text-zinc-100">{expenses === 0 ? "–" : fmt(expenses).replace('.00','')}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Spent</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
              {pieEntries.length === 0 ? (
                <div className="text-xs text-center text-zinc-500 mt-2">Add expenses to see breakdown</div>
              ) : (
                pieEntries.map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: CAT_COLORS[cat] || '#94a3b8', color: CAT_COLORS[cat] || '#94a3b8' }}></div>
                      <span className="text-zinc-300">{CAT_EMOJI[cat]} {cat}</span>
                    </div>
                    <span className="text-zinc-500 font-mono">{Math.round((amt/expenses)*100)}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex-1">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-sm font-semibold mb-4 text-zinc-100 flex items-center gap-2">
              <Target size={16} className="text-fuchsia-400" />
              Savings Goals
            </h3>
            
            <div className="flex flex-col gap-4 mb-4 mt-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {goals.length === 0 ? (
                <div className="text-xs text-center text-zinc-500 my-4">No goals yet. Add one below!</div>
              ) : (
                <AnimatePresence>
                  {goals.map((g, i) => {
                    const pct = Math.round((g.saved / g.target) * 100);
                    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
                    const col = colors[i % colors.length];
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        key={g.id} 
                        className="group relative bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-zinc-200">{g.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-mono">{fmt(g.saved)} / {fmt(g.target)}</span>
                            <button onClick={() => deleteGoal(g.id)} className="text-zinc-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${pct}%` }} 
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full shadow-[0_0_8px_currentColor]" 
                            style={{ backgroundColor: col, color: col }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] font-medium" style={{ color: col }}>{pct}%</span>
                          <input 
                            type="number" 
                            value={g.saved || ''} 
                            onChange={e => updateGoalSaved(g.id, e.target.value)}
                            className="w-16 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-right text-zinc-300 focus:outline-none focus:border-zinc-600"
                            placeholder="0"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="Name & amount (Trip $500)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500"
                onKeyDown={e => e.key === 'Enter' && addGoal()}
              />
              <button 
                onClick={addGoal}
                className="bg-zinc-800 text-zinc-200 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                aria-label="Add Goal"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}} />
    </div>
  );
}

// Subcomponents

function SummaryCard({ title, amount, sub, icon, glowColor, isHighlight = false }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px " + glowColor }}
      className={"relative overflow-hidden p-5 rounded-2xl border " + (isHighlight ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-cyan-900/50' : 'bg-zinc-900/50 border-zinc-800') + " backdrop-blur-md"}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-50 pointer-events-none" style={{ backgroundColor: glowColor }}></div>
      <div className="flex items-center gap-3 mb-3 text-zinc-400">
        <div className="p-2 rounded-xl bg-zinc-950 shadow-inner border border-zinc-800/50">
          {icon}
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="text-3xl font-bold tracking-tight text-white mb-1">{amount}</div>
      <div className={"text-xs " + (isHighlight ? 'text-cyan-400/80' : 'text-zinc-500')}>{sub}</div>
    </motion.div>
  );
}

function totalDonutPaths(entries: [string, number][], total: number) {
  if (total === 0) return null;
  const R = 38;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  
  return entries.map(([cat, amt]) => {
    const dash = (amt / total) * circ;
    const col = CAT_COLORS[cat] || '#94a3b8';
    const path = (
      <circle 
        key={cat}
        cx="50" cy="50" r={R} 
        fill="none" 
        stroke={col} 
        strokeWidth="12" 
        strokeDasharray={dash + " " + (circ - dash)} 
        strokeDashoffset={-offset} 
        strokeLinecap="round"
        className="drop-shadow-[0_0_4px_currentColor]"
        style={{ color: col, transition: 'all 1s ease' }}
      />
    );
    offset += dash;
    return path;
  });
}
