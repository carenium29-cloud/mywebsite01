import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Heart, Thermometer, Droplets, Users, ShieldAlert } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:border-blue-500/30 transition-all duration-500">
        <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center p-4 shadow-lg`}>
            <Icon className="text-white" size={32} />
        </div>
        <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
                {trend && <span className="text-[10px] text-emerald-500 font-bold">{trend}</span>}
            </div>
        </div>
    </div>
);

const DashboardView = () => {
    const { user, isDemo } = useAuth();
    const [stats, setStats] = useState({
        patients: 124,
        critical: 5,
        avgHR: 78,
        oxy: 98
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.patients}
                    icon={Users}
                    color="bg-blue-500"
                    trend="+12% vs last month"
                />
                <StatCard
                    title="Critical Alerts"
                    value={stats.critical}
                    icon={ShieldAlert}
                    color="bg-rose-500"
                    trend="Needs Attention"
                />
                <StatCard
                    title="Avg Heart Rate"
                    value={`${stats.avgHR} BPM`}
                    icon={Activity}
                    color="bg-emerald-500"
                    trend="Normal Range"
                />
                <StatCard
                    title="Avg SpO2"
                    value={`${stats.oxy}%`}
                    icon={Droplets}
                    color="bg-indigo-500"
                    trend="Excellent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-10 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Activity className="text-blue-500" />
                            Live Patient Vitals Feed
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Live Sync Active
                        </div>
                    </div>
                    {/* Real-time feed simulation placeholder */}
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] text-slate-500">
                        <Activity size={48} className="animate-pulse mb-4 opacity-20" />
                        <p className="text-sm font-medium">Waiting for bedside monitor data...</p>
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10">
                    <h3 className="text-xl font-bold text-white mb-8">Department Load</h3>
                    <div className="space-y-6">
                        {['Cardiology', 'Emergency', 'ICU', 'Neurology'].map((dept, i) => (
                            <div key={dept} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">{dept}</span>
                                    <span className="text-white">{85 - (i * 15)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${i === 2 ? 'from-rose-500 to-red-600' : 'from-blue-500 to-indigo-600'} rounded-full`}
                                        style={{ width: `${85 - (i * 15)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
