import { Trash2 } from 'lucide-react';

interface Props {
  onExcluir: () => void;
  isPending: boolean;
}

export function BotaoExcluirCliente({ onExcluir, isPending }: Props) {
  return (
    <div className="pt-4 border-t border-slate-100 mt-8">
      <button
        type="button"
        disabled={isPending}
        onClick={onExcluir}
        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl py-3 font-semibold text-sm transition-all active:scale-[0.99] disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {isPending ? 'Excluindo registro...' : 'Excluir Cliente Permanentemente'}
      </button>
    </div>
  );
}