import { X, User, Edit2, Check, FolderOpen, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props {
  abaAtiva: 'detalhes' | 'documentos';
  setAbaAtiva: (aba: 'detalhes' | 'documentos') => void;
  modoEdicao: boolean;
  onToggleEdicao: () => void;
  isPending: boolean;
  onClose: () => void;
}

export function CabecalhoFichaCliente({ abaAtiva, setAbaAtiva, modoEdicao, onToggleEdicao, isPending, onClose }: Props) {
  
  return (
    <>
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <User className="text-amber-500 w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-800">Ficha do Cliente</h2>
        </div>
        <div className="flex items-center gap-2">
          {abaAtiva === 'detalhes' && (
            <button
              onClick={onToggleEdicao}
              disabled={isPending}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                modoEdicao ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {modoEdicao ? <><Check className="w-3.5 h-3.5" /> Salvar</> : <><Edit2 className="w-3.5 h-3.5" /> Editar</>}
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex px-6 border-b border-slate-200 bg-slate-50">
        <button 
          onClick={() => setAbaAtiva('detalhes')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 ${abaAtiva === 'detalhes' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          Dados Cadastrais
        </button>
        <button 
          onClick={() => setAbaAtiva('documentos')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 ${abaAtiva === 'documentos' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          <FolderOpen className="w-4 h-4" /> Documentos
        </button>
        <Link href="/configuracoes/documentos" className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> Configurar Regras
        </Link>

      </div>
    </>
  );
}