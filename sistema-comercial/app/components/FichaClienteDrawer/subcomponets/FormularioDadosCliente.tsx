import { ClienteData } from '../types';

interface Props {
  dados: ClienteData;
  onChange: (campo: keyof ClienteData, valor: string) => void;
  modoEdicao: boolean;
}

export function FormularioDadosCliente({ dados, onChange, modoEdicao }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Cliente</label>
        <input type="text" disabled={!modoEdicao} value={dados.nome || ''} onChange={e => onChange('nome', e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-xl text-sm font-semibold disabled:bg-transparent" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label>
          <input type="email" disabled={!modoEdicao} value={dados.email || ''} onChange={e => onChange('email', e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-transparent" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Telefone</label>
          <input type="text" disabled={!modoEdicao} value={dados.telefone || ''} onChange={e => onChange('telefone', e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade</label>
          <input type="text" disabled={!modoEdicao} value={dados.cidade || ''} onChange={e => onChange('cidade', e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-transparent" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Estado</label>
          <input type="text" maxLength={2} disabled={!modoEdicao} value={dados.estado || ''} onChange={e => onChange('estado', e.target.value.toUpperCase())} className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm text-center disabled:bg-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Concessionária</label>
          <input type="text" disabled={!modoEdicao} value={dados.concessionaria || ''} onChange={e => onChange('concessionaria', e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-transparent" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Código UC</label>
          <input type="text" disabled={!modoEdicao} value={dados.codigo_uc || ''} onChange={e => onChange('codigo_uc', e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm font-mono disabled:bg-transparent" />
        </div>
      </div>
    </div>
  );
}
