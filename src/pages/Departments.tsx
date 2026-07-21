import React from 'react';
import { Building2, Users, FolderKanban, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';

const departmentsData = [
  { id: 1, name: 'Engineering', manager: 'Sarah Parker', employees: 42, activeProjects: 12, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { id: 2, name: 'Human Resources', manager: 'Donna Paulsen', employees: 8, activeProjects: 4, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  { id: 3, name: 'Finance', manager: 'Louis Litt', employees: 12, activeProjects: 6, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  { id: 4, name: 'Marketing', manager: 'Emma Watson', employees: 18, activeProjects: 9, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  { id: 5, name: 'Sales', manager: 'Michael Ross', employees: 35, activeProjects: 15, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/30' },
  { id: 6, name: 'Product', manager: 'Harvey Specter', employees: 14, activeProjects: 8, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
];

const Departments = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Departments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Manage organizational structures and department metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {departmentsData.map((dept, idx) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-xl ${dept.bg} ${dept.color}`}>
                <Building2 size={24} />
              </div>
              <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Edit2 size={18} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{dept.name}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Managed by {dept.manager}</p>
            
            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Users size={14} /> Team
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{dept.employees}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <FolderKanban size={14} /> Projects
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{dept.activeProjects}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
