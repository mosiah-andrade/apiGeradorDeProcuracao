import { User, Calculator, GripVertical } from 'lucide-react';

interface KanbanCardProps {
  cliente: any;
  ehColunaProposta?: boolean;
  onClick: (clienteId: string) => void;
  onPropostaClick?: (cliente: any) => void;
  isOrfan?: boolean;
}

export function KanbanCard({ 
  cliente, 
  ehColunaProposta, 
  onClick, 
  onPropostaClick,
  isOrfan 
}: KanbanCardProps) {
  return (
    <div
      data-kanban-card
      draggable
      onDragStart={(e) => {
        e.stopPropagation(); // Impede que a coluna seja arrastada junto
        // Empacota o ID e o tipo do item arrastado em JSON seguro
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'card', id: cliente.id }));
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onClick={() => onClick(cliente.id)}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 bg-white border flex flex-col justify-between 
        hover:-translate-y-1 hover:shadow-lg
        ${isOrfan 
          ? 'border-red-100 shadow-red-100/50 hover:border-red-300' 
          : 'border-slate-200 shadow-slate-200/50 hover:border-slate-300'
        }`}
    >
      <div className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-slate-300 hover:text-slate-500">
        <GripVertical className="w-4 h-4" />
      </div>

      <div>
        <div className="flex items-start gap-2 mb-2 pr-6">
          <User className={`w-4 h-4 mt-0.5 transition-colors ${isOrfan ? 'text-red-400 group-hover:text-red-600' : 'text-slate-400 group-hover:text-amber-500'}`} />
          <h4 className={`font-semibold text-sm line-clamp-1 transition-colors ${isOrfan ? 'text-red-900' : 'text-slate-800 group-hover:text-amber-600'}`}>
            {cliente.nome}
          </h4>
        </div>
        <div className="space-y-1.5 text-xs text-slate-500 pl-6 mb-1">
          {cliente.email && <div className="truncate flex items-center gap-1.5">{cliente.email}</div>}
          {cliente.telefone && <div className="flex items-center gap-1.5">{cliente.telefone}</div>}
        </div>
      </div>

      {ehColunaProposta && onPropostaClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPropostaClick(cliente);
          }}
          className="w-full mt-4 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95"
        >
          <Calculator className="w-3.5 h-3.5" />
          Dimensionar Proposta
        </button>
      )}
    </div>
  );
}
