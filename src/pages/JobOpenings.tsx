import React from 'react';
import { Briefcase, MapPin, Users, Plus, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const jobsData = [
  { id: 1, title: 'Senior MERN Engineer', department: 'Engineering', location: 'Remote', type: 'Full-Time', salary: '$130k - $160k', applicants: 45, status: 'Active', posted: '2 days ago' },
  { id: 2, title: 'Lead HR Generalist', department: 'Human Resources', location: 'San Francisco', type: 'Full-Time', salary: '$90k - $120k', applicants: 12, status: 'Active', posted: '5 days ago' },
  { id: 3, title: 'Product Marketing Manager', department: 'Marketing', location: 'New York', type: 'Full-Time', salary: '$110k - $140k', applicants: 28, status: 'Active', posted: '1 week ago' },
  { id: 4, title: 'Frontend Developer (React)', department: 'Engineering', location: 'Remote', type: 'Contract', salary: '$80k - $100k', applicants: 85, status: 'Active', posted: '2 weeks ago' },
  { id: 5, title: 'Sales Executive', department: 'Sales', location: 'London', type: 'Full-Time', salary: '£60k + Commission', applicants: 15, status: 'Paused', posted: '1 month ago' },
];

const JobOpenings = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Job Openings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Manage recruiting pipeline and active position listings.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Plus size={18} /> Create Job Opening
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-4">Position details</th>
                <th className="px-8 py-4">Location & Type</th>
                <th className="px-8 py-4">Compensation</th>
                <th className="px-8 py-4">Pipeline</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobsData.map((job, idx) => (
                <motion.tr 
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-all"
                >
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{job.title}</span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{job.department}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <MapPin size={14} className="text-slate-400" /> {job.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <Briefcase size={14} className="text-slate-400" /> {job.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{job.salary}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg px-2.5 py-1 text-xs font-bold gap-1.5 border border-emerald-100 dark:border-emerald-900/50">
                        <Users size={14} /> {job.applicants}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock size={12}/> {job.posted}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      job.status === 'Active' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobOpenings;
