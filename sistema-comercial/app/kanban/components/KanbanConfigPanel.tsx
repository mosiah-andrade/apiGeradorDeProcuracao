import { Plus } from 'lucide-react';

interface KanbanConfigPanelProps {
  novoStatusNome: string;
  setNovoStatusNome: (nome: string) => void;
  adicionarColuna: (e: React.FormEvent) => void;
  colunas: any[]; // Importar StatusColuna[]
  colunasProtegidas: string[];
  excluirColunaCustomizada: (id: string, nome: string) => void;
}

export function KanbanConfigPanel({
  novoStatusNome,
  setNovoStatusNome,
  adicionarColuna,
  colunas,
  colunasProtegidas,
  excluirColunaCustomizada
}: KanbanConfigPanelProps) {
  return (
    <div className="mb-6 w-full animate-fade-in space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Criar Novo Status Personalizado</h3>
        <form onSubmit={adicionarColuna} className="flex gap-3 max-w-md">
          <input 
            type="text" 
            placeholder="Ex: Pós-Venda, Visita Técnica..." 
            value={novoStatusNome}
            onChange={(e) => setNovoStatusNome(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </form>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Colunas Customizadas (Clique no ✕ para excluir):</span>
        <div className="flex flex-wrap gap-2">
          {colunas.map((col) => {
            const ehProtegido = colunasProtegidas.includes(col.nome.toLowerCase().trim());
            if (ehProtegido) return null;

            return (
              <div key={col.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.cor }} />
                <span>{col.nome}</span>
                <button
                  type="button"
                  onClick={() => excluirColunaCustomizada(col.id, col.nome)}
                  className="text-slate-300 hover:text-red-500 transition-colors pl-1 font-bold"
                >
                  ✕
                </button>
              </div>
            );
          })}
          {colunas.filter(c => !colunasProtegidas.includes(c.nome.toLowerCase().trim())).length === 0 && (
            <span className="text-xs text-slate-400 italic">Nenhuma coluna extra criada ainda.</span>
          )}
        </div>
      </div>
    </div>
  );
}
