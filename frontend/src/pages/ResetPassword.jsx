import React, { useState } from 'react';
import { Lock, CheckCircle, ShieldAlert } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleReset = async (e) => {
        e.preventDefault();
        if (novaSenha !== confirmarSenha) return toast.error("As senhas não coincidem!");
        if (novaSenha.length < 6) return toast.error("A senha deve ter no mínimo 6 dígitos.");

        setLoading(true);
        const toastId = toast.loading('Atualizando sua senha...');

        try {
            await api.post('/barber/reset-password', { email, token, novaSenha });
            toast.success("Senha atualizada com sucesso!", { id: toastId });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Link expirado ou inválido", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-[#023047] flex items-center justify-center p-6 text-white text-center">
                <div className="space-y-4">
                    <ShieldAlert size={64} className="text-red-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Link Inválido</h2>
                    <p className="text-slate-400">Este link de recuperação parece estar quebrado.</p>
                    <button onClick={() => navigate('/login')} className="text-[#FFB703] font-bold">Voltar ao início</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#023047] flex items-center justify-center p-6">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="bg-[#FFB703]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-[#FFB703]" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Nova Senha</h2>
                    <p className="text-slate-400 text-sm">Crie uma senha forte para sua segurança.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            required 
                            placeholder="Nova Senha"
                            className="w-full bg-white/5 border border-slate-700 rounded-xl py-3.5 px-10 text-white outline-none focus:border-[#FFB703] transition-all"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <CheckCircle className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            required 
                            placeholder="Confirme a Nova Senha"
                            className="w-full bg-white/5 border border-slate-700 rounded-xl py-3.5 px-10 text-white outline-none focus:border-[#FFB703] transition-all"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#FFB703] text-[#023047] font-black py-4 rounded-xl hover:bg-[#e6a600] transition-all shadow-xl uppercase text-sm tracking-widest"
                    >
                        {loading ? 'ATUALIZANDO...' : 'REDEFINIR AGORA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;