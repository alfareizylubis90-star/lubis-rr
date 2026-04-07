import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Wallet,
  Building2,
  History as HistoryIcon,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { dbService } from '../lib/db';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalCustomers: 0,
    totalBanks: 0,
    todayTransactions: 0,
    recentTransactions: [] as any[],
    chartData: [] as any[]
  });

  useEffect(() => {
    const unsubCustomers = dbService.subscribeCustomers((customers) => {
      const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
      setStats(prev => ({ ...prev, totalBalance, totalCustomers: customers.length }));
    });

    const unsubBanks = dbService.subscribeBanks((banks) => {
      setStats(prev => ({ ...prev, totalBanks: banks.length }));
    });

    const unsubTransactions = dbService.subscribeTransactions((transactions) => {
      const today = new Date().setHours(0, 0, 0, 0);
      const todayCount = transactions.filter(t => t.timestamp?.toDate() >= today).length;
      
      // Group by date for chart
      const grouped = transactions.reduce((acc: any, t) => {
        const date = format(t.timestamp?.toDate() || new Date(), 'MMM dd');
        if (!acc[date]) acc[date] = { date, amount: 0 };
        acc[date].amount += t.amount;
        return acc;
      }, {});

      setStats(prev => ({ 
        ...prev, 
        todayTransactions: todayCount, 
        recentTransactions: transactions.slice(0, 5),
        chartData: Object.values(grouped).reverse().slice(-7)
      }));
    });

    return () => {
      unsubCustomers();
      unsubBanks();
      unsubTransactions();
    };
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  const statCards = [
    { label: 'Total Balance', value: formatCurrency(stats.totalBalance), icon: Wallet, color: 'bg-blue-500', trend: '+12.5%' },
    { label: 'Active Customers', value: stats.totalCustomers, icon: Users, color: 'bg-emerald-500', trend: '+3.2%' },
    { label: 'Registered Banks', value: stats.totalBanks, icon: Building2, color: 'bg-indigo-500', trend: 'Stable' },
    { label: 'Today Transactions', value: stats.todayTransactions, icon: Clock, color: 'bg-amber-500', trend: '+18.4%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Download Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl text-white", card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                card.trend.startsWith('+') ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-600 dark:bg-slate-500/10"
              )}>
                {card.trend}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Transaction Volume</h3>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {stats.recentTransactions.length > 0 ? stats.recentTransactions.map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    t.type === 'deposit' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10" : 
                    t.type === 'withdraw' ? "bg-red-100 text-red-600 dark:bg-red-500/10" : 
                    "bg-blue-100 text-blue-600 dark:bg-blue-500/10"
                  )}>
                    {t.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : 
                     t.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> : 
                     <ArrowLeftRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{t.type}</p>
                    <p className="text-xs text-slate-500">{format(t.timestamp?.toDate() || new Date(), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-sm font-bold",
                  t.type === 'deposit' ? "text-emerald-600" : "text-red-600"
                )}>
                  {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-500">
                <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
