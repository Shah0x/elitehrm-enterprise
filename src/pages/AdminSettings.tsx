import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building, ShieldCheck, Mail, CheckCircle2, Lock, Key, Globe, LayoutTemplate } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('org');

  const tabs = [
    { id: 'org', label: 'Organization Info', icon: Building },
    { id: 'security', label: 'Security & RBAC', icon: ShieldCheck },
    { id: 'integrations', label: 'Mail & Integrations', icon: Mail },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Enterprise Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Configure global parameters and security constraints.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Settings Sidebar */}
        <div className="md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/50">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm whitespace-nowrap min-h-[44px] ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8 min-h-[500px]">
          <AnimateTabContent activeTab={activeTab}>
            {activeTab === 'org' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Organization Profile</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block ml-1">Company Name</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" defaultValue="EliteHRM Enterprise" className="w-full pl-11 pr-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block ml-1">Primary Domain</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" defaultValue="elitehrm.com" className="w-full pl-11 pr-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block ml-1 mb-3">Brand Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-sm">
                        E
                      </div>
                      <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Upload New Logo
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
                  <button className="px-6 py-3 min-h-[44px] bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Security & RBAC</h2>
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">JWT Expiration Policy</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Define how long authentication tokens remain valid before requiring re-login.</p>
                      <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                        <option>1 Hour (Strict)</option>
                        <option>8 Hours (Shift)</option>
                        <option selected>24 Hours (Standard)</option>
                        <option>7 Days (Relaxed)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enforce Strong Passwords</h4>
                        <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Require min 12 chars, uppercase, numbers, and special symbols.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">System Integrations</h2>
                <div className="space-y-4">
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="text-slate-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">SMTP Mail Server</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Used for transactional emails and alerts.</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                      <CheckCircle2 size={14} /> Connected
                    </span>
                  </div>

                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center justify-center shrink-0">
                        <LayoutTemplate className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Gemini AI Engine</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Powers smart insights and predictive analytics.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Configure API
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimateTabContent>
        </div>
      </div>
    </div>
  );
};

const AnimateTabContent = ({ children, activeTab }: any) => (
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export default AdminSettings;
