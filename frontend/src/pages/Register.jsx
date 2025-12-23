import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scissors, ChevronLeft, User, Mail, Lock, Phone, FileText, MapPin, Camera, Trash2, Eye, EyeOff } from 'lucide-react';
import barberLogo from '../assets/Gemini_Generated_Image_lkroqflkroqflkro.png';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '', email: '', password: '', confirmPassword: '',
        nome_barbearia: '', documento: '', telefone: '', 
        cep: '', rua: '', numero: '', bairro: '', localidade: '', uf: ''
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    

    // --- MÁSCARAS ---
    const maskCep = (v) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
    const maskTelefone = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
    const maskDocumento = (v) => {
        v = v.replace(/\D/g, '');
        if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
        return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18);
    };

    // Validação de CPF
    const validarCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    };

    // Validação de CNPJ
    const validarCNPJ = (cnpj) => {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
        
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
        
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) return false;
        
        return true;
    };

    // Validação de Email
    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Validação em tempo real
    const validarCampo = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'nome':
                if (value.trim().length < 3) {
                    newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
                } else {
                    delete newErrors.nome;
                }
                break;

            case 'email':
                if (!validarEmail(value)) {
                    newErrors.email = 'E-mail inválido';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'password':
                if (value.length < 6) {
                    newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
                } else {
                    delete newErrors.password;
                }
                // Verifica confirmação se ela já foi preenchida
                if (formData.confirmPassword && value !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'As senhas não coincidem';
                } else if (formData.confirmPassword && value === formData.confirmPassword) {
                    delete newErrors.confirmPassword;
                }
                break;

            case 'confirmPassword':
                if (value !== formData.password) {
                    newErrors.confirmPassword = 'As senhas não coincidem';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;

            case 'nome_barbearia':
                if (value.trim().length < 3) {
                    newErrors.nome_barbearia = 'Nome da barbearia deve ter no mínimo 3 caracteres';
                } else {
                    delete newErrors.nome_barbearia;
                }
                break;

            case 'documento':
                const docClean = value.replace(/\D/g, '');
                if (docClean.length === 0) {
                    delete newErrors.documento;
                } else if (docClean.length === 11) {
                    if (!validarCPF(value)) {
                        newErrors.documento = 'CPF inválido';
                    } else {
                        delete newErrors.documento;
                    }
                } else if (docClean.length === 14) {
                    if (!validarCNPJ(value)) {
                        newErrors.documento = 'CNPJ inválido';
                    } else {
                        delete newErrors.documento;
                    }
                } else if (docClean.length > 0) {
                    newErrors.documento = 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido';
                }
                break;

            case 'telefone':
                const telClean = value.replace(/\D/g, '');
                if (telClean.length > 0 && telClean.length < 11) {
                    newErrors.telefone = 'Telefone deve ter 11 dígitos (DDD + número)';
                } else {
                    delete newErrors.telefone;
                }
                break;

            case 'cep':
                const cepClean = value.replace(/\D/g, '');
                if (cepClean.length > 0 && cepClean.length < 8) {
                    newErrors.cep = 'CEP deve ter 8 dígitos';
                } else {
                    delete newErrors.cep;
                }
                break;

            case 'numero':
                if (value.trim().length === 0) {
                    newErrors.numero = 'Informe o número';
                } else {
                    delete newErrors.numero;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            setFormData({ ...formData, [name]: files[0] });
            setPreviewUrl(URL.createObjectURL(files[0]));
            return;
        }

        let maskedValue = value;
        if (name === 'cep') maskedValue = maskCep(value);
        if (name === 'telefone') maskedValue = maskTelefone(value);
        if (name === 'documento') maskedValue = maskDocumento(value);

        setFormData({ ...formData, [name]: maskedValue });
        
        // Validação em tempo real
        validarCampo(name, maskedValue);
    };
   

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await resp.json();
            if (data.erro) {
                toast.error("CEP não encontrado");
                return;
            }
            setFormData(f => ({
                ...f, rua: data.logradouro, bairro: data.bairro, 
                localidade: data.localidade, uf: data.uf
            }));
            toast.success("Endereço localizado!");
        } catch (e) { console.error(e); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validação final antes de enviar
        if (Object.keys(errors).length > 0) {
            toast.error("Corrija os erros antes de continuar!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            return toast.error("As senhas não coincidem!");
        }

        const toastId = toast.loading('Criando seu perfil profissional...');
        
        try {
            const cleanData = { 
                ...formData, 
                documento: formData.documento.replace(/\D/g, ''),
                telefone: formData.telefone.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, '')
            };

            await api.post('/barber/register', cleanData);
            toast.success("Parabéns! Sua barbearia foi cadastrada.", { id: toastId });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao cadastrar", { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="bg-[#023047] p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700">

                <div className="text-center mb-8">
                    <img src={barberLogo} alt="Logo" className="mx-auto w-48 mb-4 drop-shadow-lg" />
                    <h2 className="text-2xl font-bold text-[#FFB703]">Cadastro de Barbeiro</h2>
                    <p className="text-slate-400 text-sm mt-1">• Crie sua conta profissional</p>
                </div>

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="md:col-span-2 border-b border-white/10 pb-2 mb-2">
                        <span className="text-[#FFB703] text-[10px] font-black uppercase tracking-[0.2em]">Dados de Acesso</span>
                    </div>

                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input name="nome" placeholder="Seu Nome Completo" required className={`w-full bg-white/5 border ${errors.nome ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 text-white outline-none focus:border-[#FFB703]`} value={formData.nome} onChange={handleChange} />
                        {errors.nome && <p className="text-red-400 text-xs mt-1 ml-1">{errors.nome}</p>}
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input type="email" name="email" 
                        placeholder="E-mail" 
                        required className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 text-white outline-none focus:border-[#FFB703]`} value={formData.email} onChange={handleChange} />
                        {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input type={showPassword ? "text" : "password"} name="password" placeholder="Senha" 
                        required className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 pr-10 text-white outline-none focus:border-[#FFB703]`} value={formData.password} onChange={handleChange} />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-[#FFB703] transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirmar senha" 
                        required className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 pr-10 text-white outline-none focus:border-[#FFB703]`} value={formData.confirmPassword} onChange={handleChange} />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-[#FFB703] transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="md:col-span-2 border-b border-white/10 pb-2 mt-4 mb-2">
                        <span className="text-[#FFB703] text-[10px] font-black uppercase tracking-[0.2em]">Sua Barbearia</span>
                    </div>

                    <div className="md:col-span-2 relative">
                        <Scissors className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input name="nome_barbearia" placeholder="Nome da Barbearia" required className={`w-full bg-white/5 border ${errors.nome_barbearia ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 text-white outline-none focus:border-[#FFB703]`} value={formData.nome_barbearia} onChange={handleChange} />
                        {errors.nome_barbearia && <p className="text-red-400 text-xs mt-1 ml-1">{errors.nome_barbearia}</p>}
                    </div>

                    <div className="relative">
                        <FileText className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input name="documento" placeholder="CPF ou CNPJ" required className={`w-full bg-white/5 border ${errors.documento ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 text-white outline-none focus:border-[#FFB703]`} value={formData.documento} onChange={handleChange} />
                        {errors.documento && <p className="text-red-400 text-xs mt-1 ml-1">{errors.documento}</p>}
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input name="telefone" placeholder="WhatsApp da Barbearia" required className={`w-full bg-white/5 border ${errors.telefone ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2.5 px-10 text-white outline-none focus:border-[#FFB703]`} value={formData.telefone} onChange={handleChange} />
                        {errors.telefone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.telefone}</p>}
                    </div>

                   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-3">
    
    {/* 1. CEP - Gatilho para o auto-preenchimento */}
    <div className="relative md:col-span-3">
        <label className="text-[#FFB703] text-[10px] font-bold uppercase mb-1 block ml-1">CEP</label>
        <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
            <input 
                name="cep" 
                placeholder="00000-000" 
                onBlur={handleCepBlur} 
                required 
                className={`w-full bg-white/5 border ${errors.cep ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2 px-10 text-white outline-none focus:border-[#FFB703] transition-all text-sm`} 
                value={formData.cep} 
                onChange={handleChange} 
            />
            {errors.cep && <p className="text-red-400 text-xs mt-1 ml-1 absolute">{errors.cep}</p>}
        </div>
    </div>

    {/* 2. CIDADE - Preenchida via CEP */}
    <div className="relative md:col-span-3">
        <label className="text-slate-400 text-[10px] font-bold uppercase mb-1 block ml-1">Cidade</label>
        <input 
            name="localidade" 
            placeholder="Cidade" 
            readOnly 
            className="w-full bg-black/20 border border-slate-700 rounded-lg py-2 px-4 text-slate-400 outline-none text-sm" 
            value={formData.localidade} 
        />
    </div>

    {/* 3. UF - Preenchida via CEP */}
    <div className="relative md:col-span-1">
        <label className="text-slate-400 text-[10px] font-bold uppercase mb-1 block ml-1">UF</label>
        <input 
            name="uf" 
            placeholder="UF" 
            readOnly 
            className="w-full bg-black/20 border border-slate-700 rounded-lg py-2 text-slate-400 outline-none text-center text-sm" 
            value={formData.uf} 
        />
    </div>

    {/* 4. ENDEREÇO (RUA) - Ocupa o restante do espaço principal */}
    <div className="relative md:col-span-3">
        <label className="text-[#FFB703] text-[10px] font-bold uppercase mb-1 block ml-1">Endereço (Rua/Av)</label>
        <input 
            name="rua" 
            placeholder="Nome da via" 
            required 
            className="w-full bg-white/5 border border-slate-600 rounded-lg py-2 px-4 text-white outline-none focus:border-[#FFB703] transition-all text-sm" 
            value={formData.rua} 
            onChange={handleChange} 
        />
    </div>

    {/* 5. NÚMERO - Finaliza a linha */}
    <div className="relative md:col-span-2">
        <label className="text-[#FFB703] text-[10px] font-bold uppercase mb-1 block ml-1">Número</label>
        <input 
            name="numero" 
            placeholder="Nº" 
            required 
            className={`w-full bg-white/5 border ${errors.numero ? 'border-red-500' : 'border-slate-600'} rounded-lg py-2 px-4 text-white outline-none focus:border-[#FFB703] transition-all text-center text-sm`} 
            value={formData.numero} 
            onChange={handleChange} 
        />
        {errors.numero && <p className="text-red-400 text-xs mt-1 ml-1 absolute">{errors.numero}</p>}
    </div>
</div>

                    <div className="md:col-span-2 mt-4">
    <div className="relative">
        <label className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-slate-600 rounded-xl p-4 text-slate-400 hover:border-[#FFB703] hover:text-[#FFB703] cursor-pointer transition-all bg-black/10 group">
            <Camera size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">
                {previewUrl ? "Trocar Logo Selecionada" : "Anexar Logo da Barbearia"}
            </span>
            <input type="file" name="foto_perfil" accept="image/*" onChange={handleChange} className="hidden" />
        </label>
        
        {previewUrl && (
    <div className="mt-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="relative group">
            {/* A Foto com borda dourada */}
            <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-28 h-28 rounded-full border-4 border-[#FFB703] object-cover shadow-2xl transition-transform group-hover:scale-105" 
            />
        </div>

        {/* O Botão de Remover "Premium" */}
        <button 
            type="button"
            onClick={() => {
                setFormData({ ...formData, foto_perfil: null });
                setPreviewUrl(null);
                toast.success("Foto removida!");
            }}
            className="mt-4 flex items-center gap-2 bg-slate-800/80 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95"
        >
            <Trash2 size={14} className="text-red-400 group-hover:text-white" />
            Remover Foto
        </button>
    </div>
)}
    </div>
</div>

                    <button type="submit" className="md:col-span-2 mt-6 bg-[#FFB703] text-[#023047] font-black py-4 rounded-xl hover:bg-[#e6a600] transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm">
                        CONFIRMAR
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-8 text-xs font-medium">
                    JÁ POSSUI CADASTRO? <Link to="/login" className="text-[#FFB703] font-bold hover:underline">CLIQUE AQUI PARA LOGAR</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;