import { useState } from 'react';
import { Move } from 'lucide-react';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  coluna: any;
  index: number;
  clientes: any[];
  onColumnDrop: (sourceIndex: number, targetIndex: number) => void;
  onCardDrop: (clienteId: string, statusId: string | null) => void;
  onCardClick: (clienteId: string) => void;
  onPropostaClick: (cliente: any) => void;
}

export function KanbanColumn({
  coluna,
  index,
  clientes,
  onColumnDrop,
  onCardDrop,
  onCardClick,
  onPropostaClick
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const ehColunaProposta = coluna.nome.toLowerCase().includes('proposta');

  return (
    <div 
      onDragOver={(e) => {
        e.preventDefault(); // Obrigatório para permitir o drop
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        try {
          // Extrai os dados que empacotamos no DragStart
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          
          if (data.type === 'column') {
            onColumnDrop(data.index, index);
          } else if (data.type === 'card') {
            onCardDrop(data.id, coluna.id);
          }
        } catch (error) {
          console.error("Erro ao decodificar o drop:", error);
        }
      }}
      className={`rounded-2xl p-4 w-80 shrink-0 min-h-[550px] transition-colors duration-200 border flex flex-col
        ${isDragOver ? 'bg-amber-50/50 border-amber-300 shadow-inner' : 'bg-slate-50/80 border-slate-200/80'}`}
    >
      <div 
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/json', JSON.stringify({ type: 'column', index }));
        }}
        className="flex justify-between items-center mb-5 cursor-grab active:cursor-grabbing bg-white/60 p-2.5 rounded-xl border border-transparent hover:border-slate-200 hover:shadow-sm group/header transition-all"
      >
        <div className="flex items-center gap-2.5 truncate flex-1">
          <Move className="w-4 h-4 text-slate-400 opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0" />
          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: coluna.cor }} />
          <h2 className="font-bold text-slate-700 text-sm truncate max-w-[150px] tracking-tight">{coluna.nome}</h2>
        </div>
        <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 font-mono shrink-0">
          {clientes.length}
        </span>
      </div>

      <div className="space-y-3.5 flex-1 overflow-y-auto overflow-x-hidden pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {clientes.map((cliente) => (
          <KanbanCard
            key={cliente.id}
            cliente={cliente}
            ehColunaProposta={ehColunaProposta}
            onClick={onCardClick}
            onPropostaClick={onPropostaClick}
          />
        ))}

        {clientes.length === 0 && (
          <div className={`text-center py-10 text-xs rounded-xl border-2 border-dashed transition-colors duration-200
            ${isDragOver ? 'border-amber-400 text-amber-600 bg-amber-50' : 'border-slate-200 text-slate-400 bg-slate-50/50'}`}>
            Solte o card aqui
          </div>
        )}
      </div>
    </div>
  );
}