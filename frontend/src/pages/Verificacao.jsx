import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const Verificacao = () => {
    const { state } = useLocation(); // Pega os dados vindos do Register
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);

    if (!state?.formData) {
        navigate('/register');
        return null;
    }

    const handleFinalizar = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Finalizando cadastro...');

        try {
            // Montamos o objeto final exatamente como o seu BarberController espera
            const payload = {
                ...state.formData,
                codigo_verificacao: codigo
            };

            await api.post('/barber/register', payload);
            
            toast.success("Cadastro realizado com sucesso!", { id: toastId });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.error || "Código inválido", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#023047] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <ShieldCheck size={80} className="mx-auto text-[#FFB703] mb-6 animate-pulse" />
                <h2 className="text-3xl font-black text-white mb-2 uppercase">Verifique seu E-mail</h2>
                <p className="text-slate-300 mb-8">
                    Enviamos um código de segurança para <br/>
                    <span className="text-[#FFB703] font-bold">{state.formData.email}</span>
                </p>

                <form onSubmit={handleFinalizar} className="space-y-6">
                    <input 
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        required
                        className="w-full bg-white/10 border-2 border-[#FFB703] rounded-2xl py-5 text-center text-4xl tracking-[0.5em] text-white font-black outline-none focus:ring-4 ring-[#FFB703]/20"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#FFB703] text-[#023047] font-black py-4 rounded-xl hover:bg-[#e6a600] transition-all shadow-xl uppercase tracking-widest"
                    >
                        {loading ? 'Confirmando...' : 'Finalizar Cadastro'}
                    </button>
                </form>

                <button 
                    onClick={() => navigate('/register')}
                    className="mt-8 text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto text-sm uppercase font-bold"
                >
                    <ArrowLeft size={16} /> Voltar e corrigir dados
                </button>
            </div>
        </div>
    );
};

export default Verificacao;