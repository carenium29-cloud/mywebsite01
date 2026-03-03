import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginView = () => {
    const { adminLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await adminLogin(email, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data || 'Access Denied: Administrative credentials invalid.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(153,27,27,0.2),rgba(2,6,23,1))]">
            <div className="w-full max-w-[480px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-600/20">
                        <ShieldCheck className="text-white" size={36} />
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-black tracking-tighter text-white">CARENIUM CONTROL</h1>
                        <p className="text-xs text-rose-500 font-bold uppercase tracking-[0.5em] mt-2 leading-none">Master Interface</p>
                    </div>
                </div>

                <div className="glass-card p-12 rounded-[3rem] border border-rose-500/10 shadow-2xl shadow-black relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Admin Identity (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@carenium.com"
                                    required
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-rose-500/50 transition-all focus:ring-4 focus:ring-rose-500/5"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-rose-500/50 transition-all focus:ring-4 focus:ring-rose-500/5"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-[10px] font-bold text-rose-500 uppercase tracking-widest text-rose-500">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-rose-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:scale-100`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Initialize Control Session
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                        <Activity className="text-slate-500" size={12} />
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">System Protocol V6.4 ACTIVE</span>
                    </div>
                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">
                        Authorized Personnel Only • Hardware ID Logging Enabled
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginView;
