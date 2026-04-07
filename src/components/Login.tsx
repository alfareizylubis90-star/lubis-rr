import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-2xl shadow-blue-500/10 overflow-hidden border border-slate-100"
        >
          <div className="p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                B
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">BankData</h1>
                <p className="text-slate-500 text-sm">Secure Management System</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-slate-500 mt-2">Please sign in to your account to continue.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or</span></div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="Email address"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      placeholder="Password"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Enterprise-grade security enabled
            </div>
          </div>
        </motion.div>
        
        <p className="text-center mt-8 text-slate-400 text-sm">
          &copy; 2026 BankData Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
