import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, User, Globe, Hash, Trash2, Clock, Send, Mail } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [chaves, setChaves] = useState([]);
    const [pendentes, setPendentes] = useState([]); // NOVO ESTADO
    const [loading, setLoading] = useState(false);
    const [loadingPendente, setLoadingPendente] = useState(null); // Para desabilitar apenas o botão clicado

    const fetchChaves = async () => {
        try {
            const res = await api.get('/admin/keys');
            setChaves(res.data);
        } catch (err) {
            toast.error("Erro ao sincronizar chaves");
        }
    };

    // BUSCAR BARBEIROS AGUARDANDO CHAVE
    const fetchPendentes = async () => {
        try {
            const res = await api.get('/admin/pendentes');
            setPendentes(res.data);
        } catch (err) {
            console.error("Erro ao buscar solicitações pendentes");
        }
    };

    const gerarChave = async () => {
        setLoading(true);
        try {
            await api.post('/admin/generate-key');
            toast.success("CÓDIGO DE ACESSO GERADO", {
                style: { background: '#111', color: '#06b6d4', border: '1px solid #06b6d4' }
            });
            fetchChaves();
        } catch (err) {
            toast.error("Falha na geração");
        } finally { setLoading(false); }
    };

    // FUNÇÃO MÁGICA: GERA E ENVIA POR E-MAIL
    const handleGerarEEnviar = async (email, id) => {
        setLoadingPendente(id);
        const toastId = toast.loading(`Enviando chave para ${email}...`);
        try {
            await api.post('/admin/enviar-chave', { 
                barbeiroEmail: email, 
                barbeiroId: id 
            });
            
            toast.success("CHAVE ENVIADA PARA O E-MAIL!", { id: toastId });
            
            // Atualiza as listas
            fetchPendentes();
            fetchChaves();
        } catch (err) {
            toast.error("Erro ao processar envio", { id: toastId });
        } finally {
            setLoadingPendente(null);
        }
    };

    const copiarChave = (texto) => {
        navigator.clipboard.writeText(texto);
        toast.success("Copiado!", { duration: 1000 });
    };

    const excluirChave = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <span className="font-bold text-sm">Deseja realmente deletar esta chave?</span>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/admin/keys/${id}`);
                                toast.success("CHAVE REMOVIDA");
                                fetchChaves();
                            } catch (err) {
                                toast.error("Erro ao excluir");
                            }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-all text-xs font-bold uppercase"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-sm hover:bg-gray-600 transition-all text-xs font-bold uppercase"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), {
            duration: 8000,
            style: { background: '#1a1a1a', border: '1px solid #ef4444', color: '#fff' }
        });
    };

    useEffect(() => { 
        fetchChaves(); 
        fetchPendentes();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-10 font-mono text-cyan-500">
            {/* Header Estilo Terminal */}
            <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-cyan-500/20 pb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-[0.2em] uppercase flex items-center gap-3">
                        <Globe className="animate-pulse" /> CORE_SYSTEM
                    </h1>
                    <p className="text-[10px] opacity-40 mt-1">SISTEMA CENTRAL DE LICENCIAMENTO BARBERMASTER // ACESSO_NIVEL_01</p>
                </div>
                
                <button 
                    onClick={gerarChave}
                    disabled={loading}
                    className="group relative px-8 py-4 bg-transparent border border-cyan-500 overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                    <div className="absolute inset-0 bg-cyan-500 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2 font-bold group-hover:text-black uppercase tracking-widest text-sm">
                        <Plus size={18} /> {loading ? 'PROCESSANDO...' : 'Gerar Chave'}
                    </span>
                </button>
            </header>

            <main className="max-w-6xl mx-auto space-y-12">
                
                {/* NOVO: SEÇÃO DE SOLICITAÇÕES PENDENTES */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <h2 className="text-[10px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.3em] text-amber-500">
                        <Clock size={16} /> Solicitações Aguardando Licença ({pendentes.length})
                    </h2>
                    
                    {pendentes.length === 0 ? (
                        <div className="border border-white/5 p-8 text-center rounded-sm bg-white/[0.01]">
                            <p className="text-[10px] opacity-20 uppercase tracking-[0.2em]">Nenhuma solicitação pendente no momento_</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendentes.map((b) => (
                                <div key={b.id} className="border border-amber-500/20 bg-amber-500/[0.03] p-5 flex justify-between items-center group hover:border-amber-500/50 transition-all shadow-lg">
                                    <div>
                                        <p className="text-[9px] text-amber-500/60 uppercase font-black mb-1">Aguardando Validação:</p>
                                        <h3 className="text-white font-bold uppercase text-sm tracking-tighter">{b.nome_barbearia}</h3>
                                        <div className="flex items-center gap-2 text-[10px] opacity-40 mt-1">
                                            <Mail size={12} /> {b.email}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleGerarEEnviar(b.email, b.id)}
                                        disabled={loadingPendente === b.id}
                                        className="bg-amber-500 text-black px-4 py-3 rounded-sm hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        <Send size={16} className={loadingPendente === b.id ? "animate-ping" : ""} />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Enviar Chave</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Tabela de Chaves Gerais */}
                <div className="bg-[#111]/50 border border-cyan-500/10 rounded-sm shadow-2xl">
                    <div className="p-4 border-b border-cyan-500/10 bg-cyan-500/5 flex items-center gap-2">
                        <Hash size={16} />
                        <span className="text-xs font-bold uppercase tracking-tighter">Database_Keys_Registry</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-cyan-500/40 border-b border-cyan-500/10">
                                    <th className="p-5 font-medium">Chave</th>
                                    <th className="p-5 font-medium">Status</th>
                                    <th className="p-5 font-medium">Utilizado por</th>
                                    <th className="p-5 font-medium">Data Criada</th>
                                    <th className="p-5 font-medium text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cyan-500/5 text-sm">
                                {chaves.map((item) => (
                                    <tr key={item.id} className="hover:bg-cyan-500/[0.02] transition-colors">
                                        <td className="p-5 font-bold tracking-wider">{item.codigo_chave}</td>
                                        <td className="p-5">
                                            <div className={`flex items-center gap-2 ${item.status === 'disponivel' ? 'text-green-500' : 'text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.status === 'disponivel' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-[10px] opacity-60">
                                            {item.email_barbeiro ? item.email_barbeiro : <span className="opacity-20 italic">Aguardando_uso</span>}
                                        </td>
                                        <td className="p-5 text-[10px] opacity-40">
                                            {new Date(item.criado_em).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => copiarChave(item.codigo_chave)} className="p-2 hover:bg-cyan-500 hover:text-black transition-all rounded-sm">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={() => excluirChave(item.id)} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded-sm text-red-500/50 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;