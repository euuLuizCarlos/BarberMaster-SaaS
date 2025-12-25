import React, { useState } from 'react';
import { Key, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ValidarLicenca = () => {
    const [chave, setChave] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { state } = useLocation(); // CAPTURA O USERID VINDO DA TELA ANTERIOR

    const handleAtivar = async (e) => {
        e.preventDefault();

        // Segurança: Se o userId não existir (tentativa de burlar), manda pro login
        if (!state?.userId) {
            toast.error("Sessão expirada. Faça login para continuar.");
            return navigate('/login');
        }

        setLoading(true);
        const toastId = toast.loading('Validando sua licença...');

        try {
            // ENVIAMOS A CHAVE + O USERID PARA O BACKEND
            await api.post('/barber/validar-licenca', { 
                chave, 
                userId: state.userId 
            });

            toast.success("Licença Ativada! Prepare as tesouras.", { id: toastId });
            
            // Após ativar, redirecionamos para o login para ele entrar com segurança
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Chave inválida", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#023047] flex items-center justify-center p-6 font-sans">
            <div className="bg-white/5 p-8 rounded-2xl border border-[#FFB703]/30 w-full max-w-md shadow-2xl text-center backdrop-blur-sm">
                <div className="bg-[#FFB703] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,183,3,0.4)]">
                    <Key className="text-[#023047]" size={40} />
                </div>
                
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Ativação de Acesso</h2>
                <p className="text-slate-400 text-sm mb-8 italic">
                    Segunda etapa: Insira a chave gerada no Admin Master.
                </p>

                <form onSubmit={handleAtivar} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[#FFB703] text-[10px] font-black uppercase tracking-widest block text-left ml-1">
                            Chave de Licença
                        </label>
                        <input 
                            type="text" 
                            placeholder="BARBER-XXXX-XXXX"
                            className="w-full bg-black/20 border-2 border-slate-700 rounded-xl py-4 px-4 text-center text-xl font-mono text-[#FFB703] tracking-[0.2em] outline-none focus:border-[#FFB703] transition-all uppercase placeholder:opacity-20"
                            value={chave}
                            onChange={(e) => setChave(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#FFB703] text-[#023047] font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 uppercase text-sm disabled:opacity-50"
                    >
                        {loading ? 'VALIDANDO...' : <><ShieldCheck size={20} /> ATIVAR MINHA BARBEARIA</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ValidarLicenca;