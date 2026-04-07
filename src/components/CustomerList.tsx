import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { dbService } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const customerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  accountNumber: z.string().regex(/^\d+$/, 'Account number must be digits only').min(8, 'Min 8 digits').max(16, 'Max 16 digits'),
  bankId: z.string().min(1, 'Please select a bank'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['active', 'inactive'])
});

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBank, setFilterBank] = useState('all');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { status: 'active' }
  });

  useEffect(() => {
    const unsubCustomers = dbService.subscribeCustomers((data) => {
      setCustomers(data);
      setIsLoading(false);
    });
    const unsubBanks = dbService.subscribeBanks(setBanks);
    return () => {
      unsubCustomers();
      unsubBanks();
    };
  }, []);

  const onSubmit = async (data: any) => {
    await dbService.addCustomer(data);
    setIsModalOpen(false);
    reset();
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.accountNumber.includes(searchTerm);
    const matchesBank = filterBank === 'all' || c.bankId === filterBank;
    return matchesSearch && matchesBank;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-slate-500">Manage your bank customers and their account details.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or account number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterBank}
            onChange={(e) => setFilterBank(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500/50 min-w-[150px]"
          >
            <option value="all">All Banks</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
            ))
          ) : filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300">
                  {customer.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      customer.status === 'active' ? "bg-emerald-500" : "bg-slate-400"
                    )}></span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{customer.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-mono">{customer.accountNumber}</span>
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded uppercase">
                    {banks.find(b => b.id === customer.bankId)?.name || 'Bank'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Current Balance</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(customer.balance)}</p>
                </div>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                  Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Customer Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">New Customer</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <XCircle className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name</label>
                      <input 
                        {...register('name')}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50",
                          errors.name && "ring-2 ring-red-500/50"
                        )}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Bank</label>
                        <select 
                          {...register('bankId')}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="">Select Bank</option>
                          {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        {errors.bankId && <p className="text-xs text-red-500 mt-1">{errors.bankId.message as string}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Account Number</label>
                        <input 
                          {...register('accountNumber')}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="1234567890"
                        />
                        {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message as string}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input 
                          {...register('email')}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <input 
                          {...register('phone')}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="08123456789"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as string}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
