import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, Scissors, ClipboardList, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [logs, setLogs] = useState([]);
    const [servicos, setServicos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resLogs, resServicos] = await Promise.all([
                api.get('/barber/logs'),
                api.get('/services')
            ]);
            setLogs(resLogs.data);
            setServicos(resServicos.data);
        } catch (error) {
            toast.error("Erro ao carregar dados");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success("Até logo!");
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Scissors className="text-black" /> BARBER<span className="text-gray-500">MASTER</span>
                    </h1>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                        Sair <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna de Serviços */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ClipboardList size={22} /> Meus Serviços
                        </h3>
                        <button className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 transition shadow-lg text-sm font-bold">
                            <Plus size={18} /> NOVO SERVIÇO
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {servicos.map(s => (
                            <div key={s.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 uppercase">{s.nome}</h4>
                                        <p className="text-gray-500 text-sm">{s.duracao_minutos} minutos</p>
                                    </div>
                                    <span className="text-lg font-black text-emerald-600">R$ {s.preco}</span>
                                </div>
                                <button className="absolute bottom-2 right-2 text-gray-300 hover:text-red-500 transition-colors p-2">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coluna de Logs (AuditLog) */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-700">
                        <ShieldCheck size={22} className="text-emerald-500" /> Atividades
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                            {logs.map((l, index) => (
                                <div key={index} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-800">{l.acao}</p>
                                    <p className="text-xs text-gray-500 mb-1">{l.detalhes}</p>
                                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400">
                                        {new Date(l.criado_em).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}