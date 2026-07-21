import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  Settings, 
  LogOut,
  Building2,
  Briefcase,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

const NavItem = ({ to, icon: Icon, label, onClick }: any) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400'}
    `}
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

const Sidebar: React.FC<{ isMobileMenuOpen?: boolean; setIsMobileMenuOpen?: (open: boolean) => void }> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  const handleNavClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className={`w-72 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 fixed left-0 top-0 transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            E
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">EliteHRM</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sleek Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          
          {/* Mobile Close Button */}
          {setIsMobileMenuOpen && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Main Menu</div>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={handleNavClick} />
        <NavItem to="/employees" icon={Users} label="Employees" onClick={handleNavClick} />
        <NavItem to="/attendance" icon={Clock} label="Attendance" onClick={handleNavClick} />
        <NavItem to="/leaves" icon={Calendar} label="Leave Requests" onClick={handleNavClick} />
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mt-8 mb-3">Organization</div>
        <NavItem to="/departments" icon={Building2} label="Departments" onClick={handleNavClick} />
        <NavItem to="/jobs" icon={Briefcase} label="Job Openings" onClick={handleNavClick} />
        {user?.role === 'admin' && (
          <NavItem to="/settings" icon={Settings} label="Admin Settings" onClick={handleNavClick} />
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
            <img src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=random`} alt="User" />
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate capitalize">{user?.role}</div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4 cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        {/* Brand Ownership Signature */}
        <div className="px-2 pt-4 text-center">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">EliteHRM Enterprise</p>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Owner: Shahmeer</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
