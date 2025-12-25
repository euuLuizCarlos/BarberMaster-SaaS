import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, MailSearch } from 'lucide-react';

const Verificacao = () => {
    const { state } = useLocation(); // Recebe os dados do Register.jsx
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);

    // Proteção: Se não houver dados de formulário, volta para o registro
    if (!state?.formData) {
        React.useEffect(() => {
            navigate('/register');
        }, [navigate]);
        return null;
    }

    const handleValidarEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Validando código de segurança...');

        try {
            // Preparamos o payload apenas com os dados de registro e o código do e-mail
            const payload = {
                ...state.formData,
                codigo_verificacao: codigo
            };

            // O backend processa o registerBarber, cria o barbeiro e retorna o userId
            const response = await api.post('/barber/register', payload);
            
            toast.success("E-mail verificado com sucesso!", { id: toastId });

            // ETAPA SEQUENCIAL: Envia o usuário para a tela de licença
            // Passamos o userId no 'state' para a próxima página saber quem ativar
            setTimeout(() => {
                navigate('/validar-licenca', { 
                    state: { userId: response.data.userId } 
                });
            }, 1000);

        } catch (error) {
            const msg = error.response?.data?.error || "Código inválido ou expirado";
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#023047] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
                
                <div className="bg-[#FFB703]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MailSearch className="text-[#FFB703]" size={40} />
                </div>

                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter text-center">
                    Verifique seu E-mail
                </h2>
                
                <p className="text-slate-300 mb-8 text-center text-sm leading-relaxed">
                    Para sua segurança, inserira o código de 6 dígitos enviado para:<br/>
                    <span className="text-[#FFB703] font-bold">{state.formData.email}</span>
                </p>

                <form onSubmit={handleValidarEmail} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[#FFB703] text-[10px] font-black uppercase tracking-widest ml-1">
                            Código de Verificação
                        </label>
                        <input 
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            required
                            className="w-full bg-black/20 border-2 border-slate-700 rounded-2xl py-5 text-center text-4xl tracking-[0.4em] text-white font-black outline-none focus:border-[#FFB703] focus:ring-4 ring-[#FFB703]/10 transition-all"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} // Apenas números
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#FFB703] text-[#023047] font-black py-4 rounded-xl hover:bg-[#e6a600] active:scale-95 transition-all shadow-xl uppercase tracking-widest text-sm disabled:opacity-50"
                    >
                        {loading ? 'PROCESSANDO...' : 'CONFIRMAR E-MAIL'}
                    </button>
                </form>

                <button 
                    onClick={() => navigate('/register')}
                    className="mt-8 text-slate-500 hover:text-white flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft size={14} /> Voltar para o Cadastro
                </button>
            </div>
        </div>
    );
};

export default Verificacao;