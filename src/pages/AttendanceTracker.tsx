import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, CheckCircle2, AlertCircle, History, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const AttendanceTracker: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    fetch('/api/attendance/my')
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  };

  const handleMark = async (type: 'check-in' | 'check-out') => {
    setIsMarking(true);
    setMessage('');
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, location: 'San Francisco HQ' })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(type === 'check-in' ? 'Successfully clocked in for today.' : 'Work shift ended. Goodbye!');
        fetchHistory();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Network error. Failed to track attendance.');
    } finally {
      setIsMarking(false);
    }
  };

  const safeHistory = Array.isArray(history) ? history : [];

  const hasCheckedIn = safeHistory.some(h => {
    const today = new Date().toDateString();
    return new Date(h.date).toDateString() === today;
  });

  const activeEntry = safeHistory.find(h => {
    const today = new Date().toDateString();
    return new Date(h.date).toDateString() === today && !h.checkOut;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Time & Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Precision tracking for your professional work hours.</p>
        </div>
        <div className="flex gap-4">
           {!activeEntry ? (
            <button 
              disabled={isMarking || hasCheckedIn}
              onClick={() => handleMark('check-in')}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={20} />
              {hasCheckedIn ? 'Logged for Today' : 'Initialize Check-in'}
            </button>
           ) : (
            <button 
              disabled={isMarking}
              onClick={() => handleMark('check-out')}
              className="flex items-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 dark:shadow-none hover:bg-rose-700 transition-all disabled:opacity-50"
            >
              <Clock size={20} /> Complete Work Shift
            </button>
           )}
        </div>
      </div>

      {message && (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 font-semibold text-sm ${
                message.includes('Success') ? 'bg-emerald-50 dark:bg-emerald-900/30 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' : 'bg-rose-50 dark:bg-rose-900/30 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
            }`}
        >
          {message.includes('Success') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4">Current Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Shift</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${activeEntry ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:text-slate-400'}`}>
                {activeEntry ? 'Clocked IN' : 'INACTIVE'}
              </span>
            </div>
            {activeEntry && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Clock size={16} /></div>
                  Start: {new Date(activeEntry.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><MapPin size={16} /></div>
                  {activeEntry.location}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
               <History size={20} className="text-slate-400" /> Recent History
             </h2>
             <button onClick={fetchHistory} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline min-h-[44px] self-start md:self-auto">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                   <th className="px-8 py-4">Date</th>
                   <th className="px-8 py-4">Timeline</th>
                   <th className="px-8 py-4">Total Hours</th>
                   <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium">Synchronizing log history...</td></tr>
                ) : safeHistory.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium">No work logs found in current cycle.</td></tr>
                ) : safeHistory.slice(0, 7).map((log, i) => (
                    <motion.tr 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950/50 transition-all font-mono text-[13px]"
                    >
                        <td className="px-8 py-5 font-bold text-slate-900 dark:text-slate-100 font-sans">
                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <ArrowRight size={12} className="text-slate-300" />
                                {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            {log.checkOut ? `${Math.round((new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60) * 10) / 10} hrs` : '--'}
                        </td>
                        <td className="px-8 py-5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                log.status === 'present' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 
                                log.status === 'late' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30'
                            }`}>
                                {log.status}
                            </span>
                        </td>
                    </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
