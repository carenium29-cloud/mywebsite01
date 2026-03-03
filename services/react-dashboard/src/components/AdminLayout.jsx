import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, ShieldCheck, Heart, History, Settings } from 'lucide-react';

const AdminSidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        end={to === "/admin"}
        className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-r-2 ${isActive
                ? 'text-rose-500 bg-rose-500/10 border-rose-500'
                : 'text-slate-500 hover:text-white hover:bg-white/5 border-transparent'
            }`
        }
    >
        <Icon size={18} />
        {label}
    </NavLink>
);

const AdminLayout = () => {
    const { user, logout, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/admin-login" replace />;

    const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN') || user?.role === 'ROLE_ADMIN';
    if (!isAdmin) return <Navigate to="/" replace />;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-inter">
            {/* Admin Sidebar */}
            <aside className="w-80 border-r border-white/5 flex flex-col glass-card">
                <div className="p-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-600/20">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white leading-none">CONTROL</h1>
                        <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.3em] mt-1">Carenium Base</p>
                    </div>
                </div>

                <nav className="flex-1 mt-6">
                    <AdminSidebarLink to="/admin" icon={LayoutDashboard} label="Overview" />
                    <AdminSidebarLink to="/admin/staff" icon={Users} label="Staff Management" />
                    <AdminSidebarLink to="/admin/patients" icon={Heart} label="Patient Access" />
                    <AdminSidebarLink to="/admin/logs" icon={History} label="Audit Matrix" />
                    <AdminSidebarLink to="/admin/settings" icon={Settings} label="Core Settings" />
                </nav>

                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 text-slate-500 hover:text-rose-500 transition-all w-full px-4 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Admin Header */}
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 glass-card">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Master Interface</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Global Hospital Governance Protocol</p>
                        </div>
                        <div className="h-8 w-px bg-white/5"></div>
                        <span className="bg-rose-500/10 text-rose-500 text-[9px] font-black px-4 py-1.5 rounded-full border border-rose-500/20 uppercase tracking-[0.2em] animate-pulse">
                            Secure Root Access
                        </span>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-8 pr-8 border-r border-white/5">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] leading-none mb-2">Systems Status</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-[10px] font-black text-white leading-none">NETWORK OPTIMAL</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] leading-none mb-2">Active Nodes</span>
                                <span className="text-xs font-black text-white leading-none">128.42.0.1</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="text-right">
                                <p className="text-sm font-black text-white tracking-tight leading-none mb-1">{user.fullName}</p>
                                <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Master Administrator</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center font-black text-white text-lg ring-4 ring-rose-500/5 shadow-2xl shadow-rose-600/20">
                                {user.fullName?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-12 bg-[radial-gradient(circle_at_top_right,rgba(153,27,27,0.1),rgba(2,6,23,1))]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
