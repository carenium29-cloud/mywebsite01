import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building, Save, X, ShieldCheck, BadgeCheck } from 'lucide-react';

const ProfileField = ({ label, value, icon: Icon, disabled, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
        <div className="relative group">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
                type="text"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    </div>
);

const ProfileView = () => {
    const { user, isDemo } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '+1 (555) 0123',
        department: user?.department || 'Cardiology',
    });

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="glass-card rounded-[3rem] p-12 border border-white/10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-20"></div>

                <div className="relative flex flex-col md:flex-row gap-12 items-start">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-blue-500 to-indigo-600 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-4xl font-black text-white relative z-10">
                            {user?.fullName?.[0]}
                        </div>
                        <div className="absolute -inset-2 bg-blue-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="flex-1 pt-4">
                        <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formData.fullName}</h3>
                            <BadgeCheck className="text-blue-400" size={24} />
                        </div>
                        <p className="text-slate-400 font-medium mb-8">Clinical Practitioner • {formData.department}</p>

                        <div className="flex gap-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white/5 border border-white/10 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="medical-gradient px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.05] transition-all flex items-center gap-2"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-white/5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                    <ProfileField
                        label="Full Legal Name"
                        value={formData.fullName}
                        icon={User}
                        disabled={!isEditing}
                        onChange={(val) => setFormData({ ...formData, fullName: val })}
                    />
                    <ProfileField
                        label="Work Email"
                        value={formData.email}
                        icon={Mail}
                        disabled={true}
                    />
                    <ProfileField
                        label="Contact Number"
                        value={formData.phone}
                        icon={Phone}
                        disabled={!isEditing}
                        onChange={(val) => setFormData({ ...formData, phone: val })}
                    />
                    <ProfileField
                        label="Assigned Department"
                        value={formData.department}
                        icon={Building}
                        disabled={!isEditing}
                        onChange={(val) => setFormData({ ...formData, department: val })}
                    />
                </div>

                <div className="mt-12 pt-12 border-t border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-blue-500" />
                        Security Settings
                    </h4>
                    <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        Change Password Protocol
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
