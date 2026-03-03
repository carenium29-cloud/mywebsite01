import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Users, LayoutDashboard, History, Settings, Edit, Search, Activity, Heart } from 'lucide-react';

const AdminDashboardView = ({ view }) => {
    const { isDemo } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({ fullName: '', email: '', department: '', role: '', status: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            if (isDemo) {
                setUsers([
                    { id: '1', fullName: 'Dr. Sarah Smith', email: 'sarah@hospital.com', role: 'ROLE_DOCTOR', department: 'Cardiology', status: 'Active' },
                    { id: '2', fullName: 'Nurse James Bond', email: 'james@hospital.com', role: 'ROLE_NURSE', department: 'Emergency', status: 'Active' },
                    { id: '3', fullName: 'Admin Root', email: 'admin@hospital.com', role: 'ROLE_ADMIN', department: 'IT', status: 'Active' },
                ]);
                setLoading(false);
                return;
            }

            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isDemo]);

    const handleEditClick = (u) => {
        setSelectedUser(u);
        setEditForm({
            fullName: u.fullName,
            email: u.email,
            department: u.department || '',
            role: u.roles ? u.roles[0].name : (u.role || ''),
            status: u.status || 'ACTIVE'
        });
        setIsEditing(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            if (isDemo) {
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
                setIsEditing(false);
                return;
            }

            const token = sessionStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/admin/users/${selectedUser.id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update user');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            {view === 'Staff Management' ? (
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none">Staff Portfolio</h2>
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Locate staff member..."
                                className="bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-16 pr-8 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-medium w-80 text-white"
                            />
                        </div>
                    </div>

                    <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocol Role</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Department</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">State</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8 text-white">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-rose-500 font-black text-sm ring-1 ring-white/5 shadow-lg group-hover:scale-110 transition-transform">
                                                    {u.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-base leading-none mb-1 tracking-tight">{u.fullName}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${u.role === 'ROLE_ADMIN'
                                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                : u.role === 'ROLE_DOCTOR' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                }`}>
                                                {u.role?.replace('ROLE_', '')}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-slate-300 text-sm font-bold tracking-tight">{u.department || 'Unassigned Node'}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${u.status === 'DISABLED' || u.status === 'SUSPENDED' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'} shrink-0 animate-pulse`}></div>
                                                <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">{u.status || 'Active'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <button
                                                onClick={() => handleEditClick(u)}
                                                className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-500 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all shadow-lg group-hover:shadow-rose-600/10"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="h-[60vh] glass-card rounded-[4rem] border border-white/5 flex items-center justify-center text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.05),transparent)]"></div>
                    <div className="relative z-10">
                        <Activity className="text-rose-500/10 mx-auto mb-10 animate-pulse" size={120} />
                        <h3 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4">{view}</h3>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.5em] italic">Accessing Real-Time Monitoring Nodes...</p>
                        <div className="mt-12 flex items-center justify-center gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-rose-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="glass-card w-full max-w-2xl p-16 rounded-[4rem] border border-rose-500/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 blur-[100px] -mr-40 -mt-40 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/5 blur-[100px] -ml-40 -mb-40 rounded-full"></div>

                        <div className="flex items-center gap-8 mb-16 relative z-10">
                            <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-600/30 ring-4 ring-rose-500/20">
                                <Edit className="text-white" size={40} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">Protocol Override</h2>
                                <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.3em]">Administrative Access for {selectedUser.fullName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-10 relative z-10">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Legal Identity</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-5 px-8 text-sm focus:outline-none focus:border-rose-500/50 transition-all text-white font-bold tracking-tight shadow-xl"
                                        value={editForm.fullName}
                                        onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Network ID</label>
                                    <input
                                        type="email"
                                        className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-5 px-8 text-sm focus:outline-none focus:border-rose-500/50 transition-all text-white font-bold tracking-tight shadow-xl"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">System Privilege</label>
                                    <select
                                        className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-5 px-8 text-sm focus:outline-none focus:border-rose-500/50 transition-all appearance-none cursor-pointer text-white font-bold tracking-tight shadow-xl"
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="ROLE_DOCTOR">Medical Staff</option>
                                        <option value="ROLE_NURSE">Nursing Ops</option>
                                        <option value="ROLE_ADMIN">Root Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Assign Node</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-5 px-8 text-sm focus:outline-none focus:border-rose-500/50 transition-all text-white font-bold tracking-tight shadow-xl"
                                        value={editForm.department}
                                        onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">State Assignment</label>
                                <select
                                    className="w-full bg-black/60 border border-white/5 rounded-[1.5rem] py-5 px-8 text-sm focus:outline-none focus:border-rose-500/50 transition-all appearance-none cursor-pointer text-white font-bold tracking-tight shadow-xl"
                                    value={editForm.status}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <option value="ACTIVE">System Active</option>
                                    <option value="DISABLED">Node Terminated</option>
                                    <option value="SUSPENDED">Security Lock</option>
                                </select>
                            </div>

                            <div className="flex gap-8 pt-10">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-[1.5rem] py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
                                >
                                    Abort Operation
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-rose-600 text-white rounded-[1.5rem] py-6 text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Commit Sync
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardView;
