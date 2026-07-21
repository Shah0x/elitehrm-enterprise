import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MoreHorizontal, Mail, Phone, Calendar as CalendarIcon, Briefcase } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  joinDate: string;
}

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states for adding an employee
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newDesignation, setNewDesignation] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setEmployees([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          password: newPassword,
          department: newDepartment,
          designation: newDesignation
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        // Reset fields
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        setNewPassword('');
        setNewDepartment('Engineering');
        setNewDesignation('');
        fetchEmployees(); // Reload directory
      } else {
        setModalError(data.message || 'Failed to add employee');
      }
    } catch (err) {
      setModalError('Connection error. Could not contact the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const filtered = safeEmployees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Manage and view all your professional team members across the organization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-950/30">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Filter size={18} /> Filter
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Employee
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-4">Professional</th>
                <th className="px-8 py-4">Department & Role</th>
                <th className="px-8 py-4">Joined On</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">Loading synchronized directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">No team members matches your criteria.</td>
                </tr>
              ) : filtered.map((emp, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={emp._id} 
                  className="hover:bg-blue-50 dark:bg-blue-900/30/30 group transition-all cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <img src={`https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`} alt={`${emp.firstName} ${emp.lastName}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{emp.firstName} {emp.lastName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">ID: {emp._id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-slate-400" /> {emp.designation}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{emp.department}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <CalendarIcon size={14} className="text-slate-400" />
                      {new Date(emp.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      emp.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' : 
                      emp.status === 'remote' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50' : 
                      emp.status === 'on_leave' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50' : 
                      'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}>
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 text-slate-400 hover:text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-all" title="Send Email">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-4 md:p-8 relative overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-2">Onboard New Talent</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter candidate details below to provision a synchronized employee account.</p>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newFirstName} 
                    onChange={e => setNewFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newLastName} 
                    onChange={e => setNewLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Professional Email</label>
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="jane.doe@elitehrm.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Access Password</label>
                <input 
                  type="password" 
                  required 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Department</label>
                  <select 
                    value={newDepartment} 
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Designation</label>
                  <input 
                    type="text" 
                    required 
                    value={newDesignation} 
                    onChange={e => setNewDesignation(e.target.value)}
                    placeholder="Senior Frontend Dev"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold">
                  {modalError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm flex items-center justify-center min-h-[44px]"
                >
                  {submitting ? 'Onboarding...' : 'Onboard Employee'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
