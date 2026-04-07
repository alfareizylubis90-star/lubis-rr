import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ArrowLeftRight, 
  History, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Search,
  Bell
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/banks', icon: Building2, label: 'Banks' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/history', icon: History, label: 'History' },
  ];

  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out border-r",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className={cn("flex items-center gap-3", !isSidebarOpen && "lg:hidden")}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
              <span className="font-bold text-xl tracking-tight">BankData</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                    : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn("font-medium transition-opacity", !isSidebarOpen && "lg:opacity-0 lg:w-0")}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors",
                isDarkMode && "hover:bg-red-500/10"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-40 h-16 border-b backdrop-blur-md flex items-center justify-between px-6",
          isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className={cn(
                  "pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-transparent"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <Outlet context={{ isDarkMode }} />
        </div>
      </main>
    </div>
  );
}
