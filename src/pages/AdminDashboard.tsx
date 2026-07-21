import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext.tsx';

const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <Icon size={24} />
      </div>
      <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {change}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, leaveRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/attendance/stats'),
        fetch('/api/leaves/all')
      ]);
      
      const empData = await empRes.json();
      const attData = await attRes.json();
      const leaveData = await leaveRes.json();

      setEmployees(Array.isArray(empData) ? empData : []);
      setAttendance(Array.isArray(attData) ? attData : []);
      setLeaves(Array.isArray(leaveData) ? leaveData : []);
    } catch (err) {
      console.error('Error fetching dashboard data');
      setEmployees([]);
      setAttendance([]);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analytics/insights');
      const data = await res.json();
      if (res.ok && Array.isArray(data.insights)) {
        setInsights(data.insights);
      } else {
        console.error('Failed to retrieve insights from secure channel', data.message);
      }
    } catch (err) {
      console.error('Network sync failure during analysis', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process data for charts
  const attendanceTrends = [
    { name: 'Mon', attendance: 88 },
    { name: 'Tue', attendance: 92 },
    { name: 'Wed', attendance: 85 },
    { name: 'Thu', attendance: 94 },
    { name: 'Fri', attendance: 91 },
  ];

  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const leaveDistribution = [
    { name: 'Approved', value: safeLeaves.filter(l => l.status === 'approved').length || 1, color: '#10b981' },
    { name: 'Pending', value: safeLeaves.filter(l => l.status === 'pending').length || 1, color: '#f59e0b' },
    { name: 'Rejected', value: safeLeaves.filter(l => l.status === 'rejected').length || 1, color: '#ef4444' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 inline-block mr-2" /> Enterprise Command
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Strategic intelligence and workforce overview.</p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 dark:text-blue-400 transition-all font-semibold shadow-sm w-12 h-12 flex items-center justify-center shrink-0"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-100 dark:shadow-none hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]">
            Generate Executive Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Global Presence" value={employees.length || '11'} change="+2" isPositive={true} icon={Users} />
        <StatCard title="Workforce Health" value="98.2%" change="+1.4%" isPositive={true} icon={Clock} />
        <StatCard title="Active Requests" value={leaves.length || '5'} change="-2" isPositive={false} icon={Calendar} />
        <StatCard title="Network Latency" value="23ms" change="-1ms" isPositive={true} icon={TrendingUp} />
      </div>

      {/* AI Smart Insights */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-blue-900 text-white p-4 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Sparkles size={200} />
        </div>
        <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-900/20 p-2 rounded-lg backdrop-blur-md">
                        <Sparkles className="text-amber-300" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">HR Strategic Intelligence</h2>
                        <p className="text-blue-200 text-sm font-medium">AI-powered workforce analysis & risk detection</p>
                    </div>
                </div>
                {!insights && (
                   <button 
                    onClick={generateInsights}
                    disabled={isAnalyzing}
                    className="px-6 py-3 bg-white dark:bg-slate-900 text-blue-900 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl shadow-black/20 cursor-pointer"
                   >
                     {isAnalyzing ? 'Analyzing Ecosystem...' : 'Generate New Insights'}
                   </button>
                )}
            </div>

            {insights && Array.isArray(insights) && insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {insights.map((item: any, idx: number) => (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            key={idx} 
                            className="bg-white dark:bg-slate-900/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest">Insight {idx + 1}</div>
                                    <span className="text-[9px] bg-white dark:bg-slate-900/20 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{item.tag || 'Trend'}</span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{item.title}</h3>
                                <p className="text-xs font-medium leading-relaxed opacity-95 text-blue-100">{item.insight}</p>
                            </div>
                        </motion.div>
                    ))}
                    <div className="col-span-1 md:col-span-3 pt-2">
                        <button onClick={() => setInsights(null)} className="text-xs font-bold text-blue-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 underline underline-offset-4 cursor-pointer">Reset Analysis</button>
                    </div>
                </div>
            )}
        </div>
      </motion.div>

      {/* Tables & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-4 md:p-8">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-4 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Attendance Velocity</h2>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Weekly Trend</span>
           </div>
           <div className="w-full h-80 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
               <BarChart data={attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f3f4f6"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? "#64748b" : "#9ca3af", fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? "#64748b" : "#9ca3af", fontSize: 10, fontWeight: 700}} dx={-10} />
                  <Tooltip cursor={{fill: isDark ? "#1e293b" : "#f8fafc"}} contentStyle={{borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#f8fafc" : "#0f172a"}} />
                  <Bar dataKey="attendance" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 md:p-4 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8">Leave Allocation</h2>
           <div className="w-full h-72 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
               <PieChart>
                 <Pie data={leaveDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                   {leaveDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                 </Pie>
                 <Tooltip contentStyle={{borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#f8fafc" : "#0f172a"}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="space-y-3 mt-6">
              {leaveDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-4 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Recent Ecosystem Activity</h2>
           <button className="text-sm font-bold text-blue-600 dark:text-blue-400 dark:text-blue-400 flex items-center gap-1 self-start md:self-auto min-h-[44px]">Global Directory <ChevronRight size={16} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-4">Professional</th>
                <th className="px-8 py-4">Role & Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeEmployees.slice(0, 4).map((emp, i) => (
                <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950/50 group transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                         <img src={`https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`} alt={`${emp.firstName} ${emp.lastName}`} className="w-full h-full object-cover" />
                       </div>
                       <div>
                         <div className="text-sm font-black text-slate-900 dark:text-slate-100">{emp.firstName} {emp.lastName}</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase">{emp.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{emp.designation}</span>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{emp.department}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <button className="p-2 text-slate-300 hover:text-blue-600 dark:text-blue-400 dark:text-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
