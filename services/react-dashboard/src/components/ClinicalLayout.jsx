import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserCircle, LogOut, Bell, Activity, Shield } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all ${isActive ? 'text-blue-400 bg-blue-400/10 border-r-2 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
        }
    >
        <Icon size={20} />
        {label}
    </NavLink>
);

const ClinicalLayout = () => {
    const { user, logout, isDemo } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const isAdmin = user?.roles?.some(r => r.name === 'ROLE_ADMIN') || user?.role === 'ROLE_ADMIN';

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-inter">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 flex flex-col glass-card">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Carenium</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Enterprise SaaS</p>
                    </div>
                </div>

                <nav className="flex-1 mt-4">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarLink to="/patients" icon={Users} label="My Patients" />
                    {isAdmin && <SidebarLink to="/admin" icon={Shield} label="Admin Panel" />}
                    <SidebarLink to="/profile" icon={UserCircle} label="My Profile" />
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {isDemo && (
                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-amber-500">
                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            Demo Mode Active — External writes disabled
                        </span>
                        <button className="text-[10px] hover:underline">Dismiss</button>
                    </div>
                )}

                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 glass-card">
                    <h2 className="text-lg font-semibold text-white">Clinical Overview</h2>
                    <div className="flex items-center gap-6">
                        <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                        </button>
                        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-none">{user.fullName}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">
                                    {user.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white/10 flex items-center justify-center font-bold text-sm">
                                {user.fullName?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.3),rgba(2,6,23,1))]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ClinicalLayout;
