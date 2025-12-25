import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Terminal } from 'lucide-react';
import api from '../services/api'; // Sua configuração do axios
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/admin/login', formData);
            localStorage.setItem('adminToken', res.data.token);
            toast.success("Acesso Master Autorizado!");
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error("Acesso Negado: Credenciais Inválidas");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-mono">
            <div className="w-full max-w-md bg-[#111] border border-cyan-500/30 p-8 rounded-sm shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-cyan-500/10 flex items-center justify-center border border-cyan-500 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <Terminal className="text-cyan-500" size={32} />
                    </div>
                    <h1 className="text-cyan-500 text-xl font-black tracking-[0.3em] uppercase">Admin Master</h1>
                    <div className="h-1 w-20 bg-cyan-500 mt-2"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-cyan-500/50 text-[10px] uppercase font-bold ml-1">Terminal ID</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-cyan-500/50" size={18} />
                            <input 
                                type="email" 
                                className="w-full bg-black border border-cyan-500/20 rounded-none py-3 px-10 text-cyan-500 outline-none focus:border-cyan-500 transition-all"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-cyan-500/50 text-[10px] uppercase font-bold ml-1">Access Cipher</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-cyan-500/50" size={18} />
                            <input 
                                type="password" 
                                className="w-full bg-black border border-cyan-500/20 rounded-none py-3 px-10 text-cyan-500 outline-none focus:border-cyan-500 transition-all"
                                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-cyan-600/10 border border-cyan-500 text-cyan-500 font-bold py-4 hover:bg-cyan-500 hover:text-black transition-all duration-300 uppercase tracking-[0.2em] text-sm"
                    >
                        {loading ? 'AUTENTICANDO...' : 'EXECUTAR LOGIN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;