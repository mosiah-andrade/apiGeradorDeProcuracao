import { X, User, Edit2, Check, FolderOpen, Zap, BriefcaseBusiness } from 'lucide-react';
import Link from 'next/link';

interface Props {
  abaAtiva: 'detalhes' | 'comercial' | 'documentos';
  setAbaAtiva: (aba: 'detalhes' | 'comercial' | 'documentos') => void;
  modoEdicao: boolean;
  onToggleEdicao: () => void;
  isPending: boolean;
  onClose: () => void;
}

export function CabecalhoFichaCliente({ abaAtiva, setAbaAtiva, modoEdicao, onToggleEdicao, isPending, onClose }: Props) {
  
  return (
    <>
      <div className="flex max-w-full items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-2">
          <User className="h-5 w-5 shrink-0 text-amber-500" />
          <h2 className="truncate text-base font-bold text-slate-800 sm:text-lg">Ficha do Cliente</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {(abaAtiva === 'detalhes' || abaAtiva === 'comercial') && (
            <button
              onClick={onToggleEdicao}
              disabled={isPending}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                modoEdicao ? 'border-green-600 bg-green-600 text-white' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {modoEdicao ? <><Check className="h-3.5 w-3.5" /> Salvar</> : <><Edit2 className="h-3.5 w-3.5" /> Editar</>}
            </button>
          )}
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex max-w-full overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 sm:px-6">
        <button 
          onClick={() => setAbaAtiva('detalhes')}
          className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold sm:px-4 sm:text-sm ${abaAtiva === 'detalhes' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          Dados Cadastrais
        </button>
        <button
          onClick={() => setAbaAtiva('comercial')}
          className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold sm:gap-2 sm:px-4 sm:text-sm ${abaAtiva === 'comercial' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          <BriefcaseBusiness className="h-4 w-4" /> Comercial
        </button>
        <button 
          onClick={() => setAbaAtiva('documentos')}
          className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold sm:gap-2 sm:px-4 sm:text-sm ${abaAtiva === 'documentos' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          <FolderOpen className="h-4 w-4" /> Documentos
        </button>
        <Link href="/configuracoes/documentos" className="ml-auto hidden shrink-0 items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 sm:flex">
          <Zap className="h-3.5 w-3.5" /> Configurar Regras
        </Link>

      </div>
    </>
  );
}
