import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';

const LoginView = () => {
    const { login, setIsDemo } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        login(email, password);
    };

    const handleDemo = () => {
        sessionStorage.setItem('demoMode', 'true');
        setIsDemo(true);
        login('demo@carenium.com', 'demo');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.5),rgba(2,6,23,1))]">
            <div className="w-full max-width-[480px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="w-16 h-16 medical-gradient rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20">
                        <Activity className="text-white" size={36} />
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-black tracking-tighter text-white">CARENIUM</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.5em] mt-2">Enterprise Healthcare</p>
                    </div>
                </div>

                <div className="glass-card p-12 rounded-[3rem] border border-white/10 shadow-2xl shadow-black">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@hospital.com"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full medical-gradient text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            <LogIn size={18} />
                            Sign Into Gateway
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-600"><span className="bg-[#020617] px-4 italic">Internal Preview</span></div>
                    </div>

                    <button
                        onClick={handleDemo}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                        <ShieldCheck size={18} className="text-amber-500" />
                        Explore Demo Environment
                    </button>
                </div>

                <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Authorized Clinical Access Only • Secure JWT Protocol V5
                </p>
            </div>
        </div>
    );
};

export default LoginView;
