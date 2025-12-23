import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Enviando link de recuperação...');

        try {
            await api.post('/barber/forgot-password', { email });
            toast.success("Link enviado! Verifique sua caixa de entrada.", { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.error || "Erro ao processar", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#023047] flex items-center justify-center p-6">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl text-center">
                <div className="bg-[#FFB703]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="text-[#FFB703]" size={32} />
                </div>
                
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Recuperar Senha</h2>
                <p className="text-slate-400 text-sm mb-8">Digite seu e-mail cadastrado para receber o link de redefinição.</p>

                <form onSubmit={handleRequest} className="space-y-4">
                    <div className="relative text-left">
                        <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="email" 
                            required 
                            placeholder="Seu e-mail profissional"
                            className="w-full bg-white/5 border border-slate-700 rounded-xl py-3.5 px-10 text-white outline-none focus:border-[#FFB703] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#FFB703] text-[#023047] font-black py-4 rounded-xl hover:bg-[#e6a600] transition-all shadow-xl flex items-center justify-center gap-2 uppercase text-sm tracking-widest"
                    >
                        {loading ? 'ENVIANDO...' : <><Send size={18} /> ENVIAR LINK</>}
                    </button>
                </form>

                <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft size={14} /> Voltar para o Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;