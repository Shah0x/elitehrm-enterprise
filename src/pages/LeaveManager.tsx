import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, FileText, Send, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const LeaveManager: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchHistory();
    // For admins, we should fetch all leaves. For now, let's keep it personal.
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    const endpoint = user?.role === 'admin' ? '/api/leaves/all' : '/api/leaves/my';
    fetch(endpoint)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveType, startDate, endDate, reason })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Leave request submitted for professional review.' });
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: 'Failed to submit request. Verify all fields.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network synchronization failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchHistory();
    } catch (err) {
      console.error('Error updating leave status');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Professional leave planning and organizational balance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8">
        {/* Application Form */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText size={20} className="text-blue-600 dark:text-blue-400" /> Apply for Leave
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium"
                >
                  <option value="sick">Medical / Sick Leave</option>
                  <option value="casual">Casual / Personal</option>
                  <option value="vacation">Annual Vacation</option>
                  <option value="other">Compensatory / Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Strategic Reason</label>
                <textarea 
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need this leave..."
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium resize-none"
                />
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                  {message.text}
                </div>
              )}

              <button 
                disabled={isSubmitting}
                className="w-full py-4 min-h-[44px] bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
              >
                <Send size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Requests List */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
             <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
               <Calendar size={20} className="text-blue-600 dark:text-blue-400" /> {user?.role === 'admin' ? 'Strategic Oversight' : 'Personal History'}
             </h2>
          </div>

          <div className="space-y-0 divide-y divide-slate-100">
            {loading ? (
                <div className="p-20 text-center text-slate-400 font-medium">Synchronizing records...</div>
            ) : !Array.isArray(history) || history.length === 0 ? (
                <div className="p-20 text-center text-slate-400 font-medium">No professional leave records found.</div>
            ) : history.map((leave, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={leave._id} 
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950/50 group transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl h-fit">
                        <Calendar size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {user?.role === 'admin' ? `${leave.userId.firstName} ${leave.userId.lastName}` : leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                        </span>
                        {user?.role === 'admin' && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                {leave.leaveType}
                            </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-1">{leave.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        leave.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        leave.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                        {leave.status}
                    </span>
                    
                    {user?.role === 'admin' && leave.status === 'pending' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleAction(leave._id, 'approved')}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
                            ><CheckCircle size={14} /></button>
                            <button 
                                onClick={() => handleAction(leave._id, 'rejected')}
                                className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
                            ><XCircle size={14} /></button>
                        </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManager;
