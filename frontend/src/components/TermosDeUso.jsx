import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';

const TermosDeUso = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-[#023047] flex items-center gap-2">
                        <FileText className="text-[#FFB703]" /> Termos e Privacidade
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Conteúdo com Scroll Customizado */}
                <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed text-sm space-y-4 custom-scrollbar">
                    <h3 className="text-lg font-black text-[#023047] uppercase tracking-wider">Acordo de Utilização BarberMaster</h3>
                    
                    <p className="italic text-slate-500">Bem-vindo(a) à plataforma BarberMaster SaaS!</p>

                    <section className="space-y-2">
                        <h4 className="font-bold text-[#023047]">1. Aceitação e Cadastro</h4>
                        <p>Ao se cadastrar, você declara ser o responsável legal pela barbearia e concorda que a precisão dos dados (CPF/CNPJ e Endereço) é de sua inteira responsabilidade.</p>
                    </section>

                    <section className="space-y-2">
                        <h4 className="font-bold text-[#023047]">2. Proteção de Dados (LGPD)</h4>
                        <p>Em conformidade com a Lei 13.709/2018, informamos que:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Finalidade:</strong> Seus dados são usados para autenticação, segurança e emissão de cobranças.</li>
                            <li><strong>Segurança:</strong> Utilizamos criptografia de ponta a ponta para proteger suas senhas e informações de clientes.</li>
                            <li><strong>Direitos:</strong> Você pode solicitar a exclusão de seus dados a qualquer momento via suporte.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h4 className="font-bold text-[#023047]">3. Verificação de Identidade</h4>
                        <p>Para garantir a segurança da comunidade, um código de verificação único será enviado ao seu e-mail. O acesso só será liberado após a validação correta deste token.</p>
                    </section>

                    <div className="bg-amber-50 p-4 border-l-4 border-[#FFB703] rounded text-xs text-amber-900">
                        <strong>Nota Importante:</strong> O uso indevido da plataforma para spam ou práticas ilícitas resultará no bloqueio imediato da licença sem direito a reembolso.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-[#023047] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#03405e] transition-all flex items-center gap-2"
                    >
                        <CheckCircle size={18} /> Entendi e Aceito
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermosDeUso;