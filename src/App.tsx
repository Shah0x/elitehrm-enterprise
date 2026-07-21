import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import EmployeeDirectory from './pages/EmployeeDirectory.tsx';
import AttendanceTracker from './pages/AttendanceTracker.tsx';
import LeaveManager from './pages/LeaveManager.tsx';
import Departments from './pages/Departments.tsx';
import JobOpenings from './pages/JobOpenings.tsx';
import AdminSettings from './pages/AdminSettings.tsx';

// Simple placeholder pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8"><h1 className="text-2xl font-bold">{title} Page</h1><p className="text-slate-500 dark:text-slate-400 mt-2">Content coming soon...</p></div>
);

const Login = () => {
  const { user, login: setAuthUser } = useAuth();
  const [email, setEmail] = React.useState('admin@elitehrm.com');
  const [pass, setPass] = React.useState('admin123');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      
      if (res.ok) {
        setAuthUser(data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection refused. Is the server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCreds = (e: string, p: string) => {
    setEmail(e);
    setPass(p);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-sm">
            E
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome to EliteHRM</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Please sign in to your professional portal</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm font-semibold mb-6 animate-pulse border border-rose-100 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Work Email</label>
            <input 
              type="email" 
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 transition-all duration-200 font-medium disabled:opacity-50"
              placeholder="e.g. john@elitehrm.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <input 
              type="password" 
              disabled={isSubmitting}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 transition-all duration-200 font-medium disabled:opacity-50"
              placeholder="Enter your password"
            />
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Authorized Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Demo Credentials</p>
          <div className="flex flex-col gap-2">
            <button 
              type="button"
              onClick={() => setDemoCreds('admin@elitehrm.com', 'EliteAuth_Admin_2026!')} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Briefcase size={16} /> Admin Account
            </button>
            <button 
              type="button"
              onClick={() => setDemoCreds('sarah@elitehrm.com', 'EliteAuth_Emp_2026!')} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <User size={16} /> Employee Account (Sarah)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 w-full lg:ml-72 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              E
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">EliteHRM</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/employees" element={<PrivateRoute><EmployeeDirectory /></PrivateRoute>} />
            <Route path="/attendance" element={<PrivateRoute><AttendanceTracker /></PrivateRoute>} />
            <Route path="/leaves" element={<PrivateRoute><LeaveManager /></PrivateRoute>} />
            <Route path="/departments" element={<PrivateRoute><Departments /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><JobOpenings /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute roles={['admin']}><AdminSettings /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
