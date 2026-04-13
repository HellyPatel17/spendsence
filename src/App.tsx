/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ArrowLeft, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  Download,
  Trash2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { format } from 'date-fns';
import { cn, formatCurrency } from './lib/utils';
import { storage } from './services/storage';
import { Transaction, CATEGORIES, PAYMENT_METHODS, TransactionType } from './types';

// --- Components ---

const StatusBar = () => (
  <div className="h-6 bg-blue-600 text-white flex justify-between items-center px-4 text-[10px] font-medium">
    <span>9:41</span>
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-full border border-white/50 flex items-center justify-center">
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
      <div className="w-4 h-2 bg-white/30 rounded-sm relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-white w-3/4" />
      </div>
    </div>
  </div>
);

const Header = ({ title, showBack, onBack, rightElement, colorClass = "bg-blue-600" }: { title: string, showBack?: boolean, onBack?: () => void, rightElement?: React.ReactNode, colorClass?: string }) => (
  <header className={cn(colorClass, "text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm")}>
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="p-1 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      {rightElement}
    </div>
  </header>
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm p-4", className)}>
    {children}
  </div>
);

const FloatingActionButton = ({ onClick, icon: Icon, colorClass, label }: { onClick: () => void, icon: any, colorClass: string, label?: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95",
      colorClass
    )}
  >
    <Icon size={28} />
    {label && <span className="sr-only">{label}</span>}
  </button>
);

// --- Screens ---

const Dashboard = ({ transactions, onNavigate, onDelete }: { transactions: Transaction[], onNavigate: (path: string) => void, onDelete: (id: string) => void }) => {
  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = totals.income - totals.expense;

  const mostSpentCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      if (t.category) {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'None';
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header 
        title="SpendSense" 
        rightElement={
          <>
            <button onClick={() => onNavigate('/analytics')} className="p-2 hover:bg-blue-700 rounded-lg"><PieChartIcon size={20} /></button>
            <button onClick={() => onNavigate('/analytics')} className="p-2 hover:bg-blue-700 rounded-lg"><BarChart3 size={20} /></button>
            <button onClick={() => onNavigate('/settings')} className="p-2 hover:bg-blue-700 rounded-lg"><SettingsIcon size={20} /></button>
          </>
        }
      />

      <main className="p-4 space-y-4">
        {/* Balance Card */}
        <Card className="bg-blue-600 text-white p-6">
          <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold">{formatCurrency(balance)}</h2>
        </Card>

        {/* Income/Expense Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <TrendingDown size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Expense</span>
            </div>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totals.expense)}</p>
          </Card>
        </div>

        {/* Most Spent Banner */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Most Spent Category:</span>
          <span className="text-blue-600 font-bold">{mostSpentCategory}</span>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 mt-6 mb-2">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet size={48} className="mx-auto mb-2 opacity-20" />
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.slice(0, 10).map((t) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={t.id}
              >
                <Card className="flex items-center justify-between p-3 group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      t.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.category || t.source || 'General'}</p>
                      <p className="text-xs text-gray-500">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={cn(
                      "font-bold",
                      t.type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <FloatingActionButton 
          onClick={() => onNavigate('/add-income')} 
          icon={TrendingUp} 
          colorClass="bg-green-600" 
          label="Add Income"
        />
        <FloatingActionButton 
          onClick={() => onNavigate('/add-expense')} 
          icon={Plus} 
          colorClass="bg-red-500" 
          label="Add Expense"
        />
      </div>
    </div>
  );
};

const TransactionForm = ({ type, onSave, onBack }: { type: TransactionType, onSave: (data: any) => void, onBack: () => void }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [source, setSource] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSave({
      type,
      amount: parseFloat(amount),
      category: type === 'expense' ? category : undefined,
      source: type === 'income' ? source : undefined,
      paymentMethod: type === 'expense' ? paymentMethod : undefined,
      note,
      date: new Date().toISOString()
    });
  };

  const isExpense = type === 'expense';

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      <Header 
        title={`Add ${isExpense ? 'Expense' : 'Income'}`}
        showBack
        onBack={onBack}
        colorClass={isExpense ? "bg-red-500" : "bg-green-600"}
      />

      <main className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            {isExpense ? (
              <>
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-gray-50 px-1 text-xs text-gray-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-gray-50 px-1 text-xs text-gray-500">Payment Method (optional)</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full p-4 rounded-full text-white font-bold text-lg shadow-lg active:scale-95 transition-all",
              isExpense ? "bg-red-500" : "bg-green-600"
            )}
          >
            Save
          </button>
        </form>
      </main>
    </div>
  );
};

const Analytics = ({ transactions, onBack }: { transactions: Transaction[], onBack: () => void }) => {
  const expenseData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      if (t.category) {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2', '#ea580c', '#4b5563'];

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Category/Source', 'Payment Method', 'Note'];
    const rows = transactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.amount,
      t.category || t.source || '',
      t.paymentMethod || '',
      t.note || ''
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `spendsense_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Analytics" showBack onBack={onBack} />
      
      <main className="p-4 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Expenses by Category</h2>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            {expenseData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={exportToCSV}
          className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Download size={20} />
          Export Report as CSV
        </button>
      </main>
    </div>
  );
};

// --- Main App Component ---

const SplashScreen = () => (
  <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center text-white z-50">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-[2.5rem] mb-6 shadow-2xl"
    >
      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center">
        <Wallet size={48} className="text-white" />
      </div>
    </motion.div>
    <h1 className="text-4xl font-bold tracking-tight">SpendSense</h1>
    <p className="text-blue-100 mt-2 text-lg">Smart Expense Manager</p>
  </div>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    setTransactions(storage.getTransactions());
    return () => clearTimeout(timer);
  }, []);

  const handleSaveTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'local-user',
      ...data
    };
    storage.saveTransaction(newTransaction);
    setTransactions(storage.getTransactions());
    window.history.back();
  };

  const handleDeleteTransaction = (id: string) => {
    storage.deleteTransaction(id);
    setTransactions(storage.getTransactions());
  };

  return (
    <Router>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!showSplash && (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[812px] sm:h-[812px] shadow-2xl relative overflow-hidden sm:rounded-[3rem] sm:border-[8px] border-gray-900 flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Routes>
                <Route path="/" element={
                  <>
                    <StatusBar />
                    <Dashboard 
                      transactions={transactions} 
                      onNavigate={(path) => window.location.href = path} 
                      onDelete={handleDeleteTransaction}
                    />
                  </>
                } />
                <Route path="/add-income" element={
                  <TransactionForm 
                    type="income" 
                    onSave={handleSaveTransaction} 
                    onBack={() => window.history.back()} 
                  />
                } />
                <Route path="/add-expense" element={
                  <TransactionForm 
                    type="expense" 
                    onSave={handleSaveTransaction} 
                    onBack={() => window.history.back()} 
                  />
                } />
                <Route path="/analytics" element={
                  <>
                    <StatusBar />
                    <Analytics 
                      transactions={transactions} 
                      onBack={() => window.history.back()} 
                    />
                  </>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            {/* Home Indicator for simulated mobile view */}
            <div className="hidden sm:block h-1 w-32 bg-gray-900/20 rounded-full mx-auto mb-2 shrink-0" />
          </div>
        </div>
      )}
    </Router>
  );
}


