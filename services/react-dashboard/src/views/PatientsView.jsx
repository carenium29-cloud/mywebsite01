import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, MoreVertical, Heart, Droplets, Thermometer, User } from 'lucide-react';

const PatientCard = ({ patient }) => (
    <div className="glass-card rounded-[2rem] p-8 border border-white/5 hover:border-blue-500/30 transition-all duration-500 group">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-400 group-hover:medical-gradient group-hover:text-white transition-all duration-500 shadow-inner">
                    <User size={28} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white leading-none">{patient.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{patient.ward} • Bed {patient.bed}</p>
                </div>
            </div>
            <button className="text-slate-600 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <MoreVertical size={20} />
            </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-1">
                    <Heart size={10} className="text-rose-500" /> HR
                </div>
                <p className="text-lg font-black text-white">{patient.vitals.hr}<span className="text-[10px] ml-1 opacity-40">BPM</span></p>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-1">
                    <Droplets size={10} className="text-blue-500" /> SpO2
                </div>
                <p className="text-lg font-black text-white">{patient.vitals.spo2}<span className="text-[10px] ml-1 opacity-40">%</span></p>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-1">
                    <Thermometer size={10} className="text-amber-500" /> Temp
                </div>
                <p className="text-lg font-black text-white">{patient.vitals.temp}<span className="text-[10px] ml-1 opacity-40">°C</span></p>
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${patient.status === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                patient.status === 'Warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                {patient.status}
            </span>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors">
                View Charts
            </button>
        </div>
    </div>
);

const PatientsView = () => {
    const { isDemo } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdmitting, setIsAdmitting] = useState(false);
    const [newPatient, setNewPatient] = useState({
        fullName: '',
        wardInfo: '',
        medicalUnit: '',
        status: 'STABLE'
    });
    const [error, setError] = useState('');

    const mockPatients = [
        { id: 1, name: 'John Doe', ward: 'Cardiology', bed: '101', status: 'Warning', vitals: { hr: 98, spo2: 94, temp: 37.2, bp: '140/90' } },
        { id: 2, name: 'Sarah Jane', ward: 'Emergency', bed: 'ICU-4', status: 'Critical', vitals: { hr: 124, spo2: 89, temp: 38.5, bp: '90/60' } },
        { id: 3, name: 'Robert Wilson', ward: 'Neurology', bed: '305', status: 'Stable', vitals: { hr: 72, spo2: 98, temp: 36.8, bp: '120/80' } },
        { id: 4, name: 'Emily Chen', ward: 'Cardiology', bed: '102', status: 'Stable', vitals: { hr: 68, spo2: 99, temp: 36.6, bp: '115/75' } },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPatient.fullName || !newPatient.medicalUnit) {
            setError('Patient Name and Medical Unit are required');
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            // In demo mode or actual API call
            if (isDemo) {
                console.log('Demo Admission:', newPatient);
                setIsAdmitting(false);
                setNewPatient({ fullName: '', wardInfo: '', medicalUnit: '', status: 'STABLE' });
                return;
            }

            await axios.post('http://localhost:8080/api/patients', newPatient, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsAdmitting(false);
            setNewPatient({ fullName: '', wardInfo: '', medicalUnit: '', status: 'STABLE' });
            // Refresh patient list (could be implemented with a fetch hook)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to admit patient');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search patients by name or ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="glass-card px-6 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                        <Filter size={16} /> Filter
                    </button>
                    <button
                        onClick={() => setIsAdmitting(true)}
                        className="medical-gradient px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Admit Patient
                    </button>
                </div>
            </div>

            {isAdmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-white mb-8 tracking-tight">New Patient Admission</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                    value={newPatient.fullName}
                                    onChange={e => setNewPatient({ ...newPatient, fullName: e.target.value })}
                                    placeholder="Enter full legal name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ward / Room</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={newPatient.wardInfo}
                                        onChange={e => setNewPatient({ ...newPatient, wardInfo: e.target.value })}
                                        placeholder="e.g. Ward G1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Medical Unit</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={newPatient.medicalUnit}
                                        onChange={e => setNewPatient({ ...newPatient, medicalUnit: e.target.value })}
                                        placeholder="e.g. Cardiology"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-rose-500 text-xs font-bold px-2">{error}</p>}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdmitting(false)}
                                    className="flex-1 bg-white/5 border border-white/5 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 medical-gradient text-white rounded-2xl py-4 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Complete Admission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {mockPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                ))}
            </div>
        </div>
    );
};

export default PatientsView;
