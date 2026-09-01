import { KanbanCard } from './KanbanCard';

interface KanbanOrphanColumnProps {
  clientes: any[];
  onCardDrop: (clienteId: string, statusId: string | null) => void;
  onCardClick: (clienteId: string) => void;
}

export function KanbanOrphanColumn({ clientes, onCardDrop, onCardClick }: KanbanOrphanColumnProps) {
  if (clientes.length === 0) return null;

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          if (data.type === 'card') onCardDrop(data.id, null);
        } catch (error) {
          console.error("Erro ao processar drop em órfãos", error);
        }
      }}
      className="w-[calc(100vw-2rem)] shrink-0 min-h-[calc(100dvh-245px)] rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-3 sm:w-80 sm:min-h-[550px] sm:p-4"
    >
      <div className="flex justify-between items-center mb-4 p-2 bg-red-100/60 rounded-xl">
        <div className="flex items-center gap-2 truncate">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <h2 className="font-bold text-red-800 text-sm truncate">Sem Status</h2>
        </div>
        <span className="bg-red-200 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
          {clientes.length}
        </span>
      </div>

      <div className="space-y-3">
        {clientes.map((cliente) => (
          <KanbanCard
            key={cliente.id}
            cliente={cliente}
            isOrfan={true}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}
