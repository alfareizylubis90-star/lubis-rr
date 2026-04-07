import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Calendar
} from 'lucide-react';
import { dbService } from '../lib/db';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const unsubTrans = dbService.subscribeTransactions((data) => {
      setTransactions(data);
      setIsLoading(false);
    });
    const unsubCustomers = dbService.subscribeCustomers(setCustomers);
    return () => {
      unsubTrans();
      unsubCustomers();
    };
  }, []);

  const getCustomerName = (id?: string) => {
    if (!id) return '-';
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  const filteredTransactions = transactions.filter(t => {
    const fromName = getCustomerName(t.fromAccountId).toLowerCase();
    const toName = getCustomerName(t.toAccountId).toLowerCase();
    const matchesSearch = fromName.includes(searchTerm.toLowerCase()) || 
                         toName.includes(searchTerm.toLowerCase()) ||
                         t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-slate-500">View and export all financial activities.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by customer or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500/50 min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">From / To</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filteredTransactions.map((t) => (
                  <motion.tr 
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium">{format(t.timestamp?.toDate() || new Date(), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-slate-500">{format(t.timestamp?.toDate() || new Date(), 'HH:mm:ss')}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        t.type === 'deposit' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10" : 
                        t.type === 'withdraw' ? "bg-red-100 text-red-600 dark:bg-red-500/10" : 
                        "bg-blue-100 text-blue-600 dark:bg-blue-500/10"
                      )}>
                        {t.type === 'deposit' ? <ArrowDownLeft className="w-3 h-3" /> : 
                         t.type === 'withdraw' ? <ArrowUpRight className="w-3 h-3" /> : 
                         <ArrowLeftRight className="w-3 h-3" />}
                        {t.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {t.type === 'deposit' && <span>To: <span className="font-bold">{getCustomerName(t.toAccountId)}</span></span>}
                        {t.type === 'withdraw' && <span>From: <span className="font-bold">{getCustomerName(t.fromAccountId)}</span></span>}
                        {t.type === 'transfer' && (
                          <div className="flex flex-col">
                            <span>From: <span className="font-bold">{getCustomerName(t.fromAccountId)}</span></span>
                            <span>To: <span className="font-bold">{getCustomerName(t.toAccountId)}</span></span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{t.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <p className={cn(
                        "text-sm font-bold",
                        t.type === 'deposit' ? "text-emerald-600" : "text-red-600"
                      )}>
                        {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!isLoading && filteredTransactions.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
