import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { dbService } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const transactionSchema = z.object({
  type: z.enum(['deposit', 'withdraw', 'transfer']),
  amount: z.number().min(10000, 'Minimum amount is Rp10.000'),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  description: z.string().min(3, 'Description is too short')
}).refine(data => {
  if (data.type === 'withdraw' || data.type === 'transfer') return !!data.fromAccountId;
  return true;
}, { message: 'Source account is required', path: ['fromAccountId'] })
.refine(data => {
  if (data.type === 'deposit' || data.type === 'transfer') return !!data.toAccountId;
  return true;
}, { message: 'Destination account is required', path: ['toAccountId'] })
.refine(data => {
  if (data.type === 'transfer') return data.fromAccountId !== data.toAccountId;
  return true;
}, { message: 'Cannot transfer to the same account', path: ['toAccountId'] });

export default function TransactionForm() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'deposit', amount: 0 }
  });

  const type = watch('type');

  useEffect(() => {
    const unsubCustomers = dbService.subscribeCustomers(setCustomers);
    const unsubBanks = dbService.subscribeBanks(setBanks);
    return () => {
      unsubCustomers();
      unsubBanks();
    };
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      await dbService.processTransaction(data);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
        <p className="text-slate-500">Process deposits, withdrawals, and transfers securely.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="p-1 flex bg-slate-100 dark:bg-slate-800 rounded-t-3xl border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
            { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setValue('type', item.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all",
                type === item.id 
                  ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <AnimatePresence mode="wait">
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Transaction processed successfully!</span>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold mb-2">Amount (IDR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                <input 
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-blue-500/50"
                  placeholder="0"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Account */}
              {(type === 'withdraw' || type === 'transfer') && (
                <div>
                  <label className="block text-sm font-semibold mb-2">From Account</label>
                  <select 
                    {...register('fromAccountId')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Account</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatCurrency(c.balance)})
                      </option>
                    ))}
                  </select>
                  {errors.fromAccountId && <p className="text-xs text-red-500 mt-1">{errors.fromAccountId.message as string}</p>}
                </div>
              )}

              {/* To Account */}
              {(type === 'deposit' || type === 'transfer') && (
                <div>
                  <label className="block text-sm font-semibold mb-2">To Account</label>
                  <select 
                    {...register('toAccountId')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Account</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.accountNumber}
                      </option>
                    ))}
                  </select>
                  {errors.toAccountId && <p className="text-xs text-red-500 mt-1">{errors.toAccountId.message as string}</p>}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description / Notes</label>
              <textarea 
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                placeholder="Enter transaction details..."
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Transaction'}
          </button>
        </form>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Min Deposit</p>
          <p className="font-bold">Rp10.000</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Max Daily</p>
          <p className="font-bold">Rp100M</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Fee</p>
          <p className="font-bold text-emerald-600">Free</p>
        </div>
      </div>
    </div>
  );
}
