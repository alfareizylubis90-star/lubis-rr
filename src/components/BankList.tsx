import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Globe, 
  Hash, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  MoreVertical
} from 'lucide-react';
import { dbService } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const bankSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  code: z.string().min(3, 'Code must be at least 3 chars'),
  country: z.string().min(2, 'Country is required'),
  status: z.enum(['active', 'inactive'])
});

export default function BankList() {
  const [banks, setBanks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: { status: 'active', country: 'Indonesia' }
  });

  useEffect(() => {
    const unsub = dbService.subscribeBanks((data) => {
      setBanks(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const onSubmit = async (data: any) => {
    await dbService.addBank(data);
    setIsModalOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banks</h1>
          <p className="text-slate-500">Manage supported banking institutions and their codes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
            ))
          ) : banks.map((bank) => (
            <motion.div
              key={bank.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  bank.status === 'active' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-600 dark:bg-slate-500/10"
                )}>
                  {bank.status}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">{bank.name}</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Hash className="w-4 h-4" />
                    <span>Code</span>
                  </div>
                  <span className="font-mono font-bold">{bank.code}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Globe className="w-4 h-4" />
                    <span>Country</span>
                  </div>
                  <span className="font-medium">{bank.country}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className="w-full py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                  Edit Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Bank Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-8">Register New Bank</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Bank Name</label>
                  <input 
                    {...register('name')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="e.g. Bank Central Asia"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bank Code</label>
                    <input 
                      {...register('code')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="014"
                    />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Country</label>
                    <input 
                      {...register('country')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message as string}</p>}
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Bank'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
