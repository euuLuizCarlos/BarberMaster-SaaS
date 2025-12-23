import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scissors, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import barberLogo from '../assets/Gemini_Generated_Image_lkroqflkroqflkro.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Verificando credenciais...');
        
        try {
            const response = await api.post('/barber/login', { 
                email: formData.email,
                senha: formData.password // Ajustado para 'senha' conforme seu backend atual
            });

            localStorage.setItem('token', response.data.token);
            
            toast.success(`Bem-vindo, ${response.data.userName || 'Barbeiro'}!`, { id: toastId });
            
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao conectar ao servidor';
            toast.error(errorMessage, { id: toastId });

            // Lógica de Ativação Pendente que você tinha no TCC
            if (error.response?.status === 403 && errorMessage.includes('Ativação pendente')) {
                const pendingUserId = error.response.data?.userId;
                setTimeout(() => navigate(`/ativacao?userId=${pendingUserId}`), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-[#023047] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                
                {/* Cabeçalho com Logo */}
            <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
    
            <img
            src={barberLogo}
            alt="BarberApp Logo"
            className="w-full h-auto max-w-[150px] drop-shadow-md" 
        />
            </div>

    <h2 className="text-2xl font-bold text-[#FFB703] mt-2">Área de Acesso</h2>
</div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campo Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Seu e-mail"
                            className="w-full bg-white/10 border border-slate-600 rounded-lg py-3 px-10 text-white placeholder-slate-400 outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703] transition"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Campo Senha */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Sua senha"
                            className="w-full bg-white/10 border border-slate-600 rounded-lg py-3 px-10 text-white placeholder-slate-400 outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703] transition"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-[#FFB703] transition"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FFB703] text-[#023047] font-bold py-3 rounded-lg hover:bg-[#e6a600] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Continuar'}
                    </button>
                </form>

                {/* Links de Rodapé */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-slate-400 text-sm">
                        Não tem conta? {' '}
                        <Link to="/register" className="text-[#FFB703] font-bold hover:underline">
                            Cadastre-se aqui
                        </Link>
                    </p>
                    <Link to="/forgot-password" size="sm" className="block text-slate-400 text-xs hover:text-white transition">
                        Esqueceu sua senha?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;