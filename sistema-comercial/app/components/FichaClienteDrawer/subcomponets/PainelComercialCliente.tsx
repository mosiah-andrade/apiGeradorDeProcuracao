"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, CheckCircle2, ClipboardList, Flame, Plus, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ClienteData, Proposta } from "../types";

type Atividade = {
  id: string;
  titulo: string;
  tipo: "ligacao" | "mensagem" | "tarefa" | "nota";
  concluida: boolean;
  agendada_para: string | null;
  created_at: string;
};

const tiposAtividade = ["ligacao", "mensagem", "tarefa", "nota"] as const;

export function PainelComercialCliente({
  cliente,
  propostas,
  modoEdicao,
  onChange,
  onCriarProposta,
}: {
  cliente: ClienteData;
  propostas: Proposta[];
  modoEdicao: boolean;
  onChange: (campo: keyof ClienteData, valor: string | null) => void;
  onCriarProposta: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [novaAtividade, setNovaAtividade] = useState("");
  const [tipoAtividade, setTipoAtividade] = useState<Atividade["tipo"]>("tarefa");
  const [dataAtividade, setDataAtividade] = useState("");
  const [erroAtividades, setErroAtividades] = useState(false);

  const consumo = Number(cliente.consumo_medio_kwh || 0);
  const demandaEstimada = Number(cliente.demanda_estimada_kw || 0);
  const potenciaSugerida = Number(cliente.potencia_sugerida_kwp || 0);
  const ultimaProposta = propostas[0];

  useEffect(() => {
    if (!cliente.id) return;

    async function carregarAtividades() {
      const { data, error } = await supabase
        .from("crm_atividades")
        .select("id, titulo, tipo, concluida, agendada_para, created_at")
        .eq("cliente_id", cliente.id)
        .order("concluida", { ascending: true })
        .order("agendada_para", { ascending: true, nullsFirst: false })
        .limit(12);

      if (error) {
        setErroAtividades(true);
        return;
      }

      setErroAtividades(false);
      setAtividades(data || []);
    }

    void carregarAtividades();
  }, [cliente.id, supabase]);

  function calcularDemanda() {
    const potencia = consumo > 0 ? Number((consumo / 120).toFixed(2)) : 0;
    const demanda = potencia > 0 ? Number((potencia * 0.82).toFixed(2)) : 0;
    onChange("potencia_sugerida_kwp", potencia.toString());
    onChange("demanda_estimada_kw", demanda.toString());
  }

  async function adicionarAtividade(event: React.FormEvent) {
    event.preventDefault();
    if (!cliente.id || !novaAtividade.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase.from("crm_atividades").insert({
      user_id: session.user.id,
      cliente_id: cliente.id,
      titulo: novaAtividade.trim(),
      tipo: tipoAtividade,
      agendada_para: dataAtividade || null,
    }).select("id, titulo, tipo, concluida, agendada_para, created_at").single();

    if (error || !data) {
      setErroAtividades(true);
      return;
    }

    setAtividades(atual => [...atual, data]);
    setNovaAtividade("");
    setDataAtividade("");
  }

  async function alternarAtividade(atividade: Atividade) {
    const concluida = !atividade.concluida;
    setAtividades(atual => atual.map(item => item.id === atividade.id ? { ...item, concluida } : item));
    const { error } = await supabase.from("crm_atividades").update({ concluida }).eq("id", atividade.id);
    if (error) setAtividades(atual => atual.map(item => item.id === atividade.id ? atividade : item));
  }

  return (
    <div className="min-w-0 space-y-5">
      <section className="overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Oportunidade comercial</p>
            <h3 className="mt-1 truncate text-lg font-black text-slate-900">{cliente.nome}</h3>
            <p className="mt-1 text-sm text-slate-600">{cliente.origem || "Origem não informada"} · {cliente.cidade || "Cidade pendente"}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${cliente.temperatura_lead === "quente" ? "bg-red-100 text-red-700" : cliente.temperatura_lead === "morno" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
            {cliente.temperatura_lead === "quente" ? "Lead quente" : cliente.temperatura_lead === "morno" ? "Lead morno" : "Lead frio"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
          <Metric label="Propostas" value={propostas.length.toString()} />
          <Metric label="Última" value={ultimaProposta ? formatarMoeda(ultimaProposta.valor_total) : "Sem proposta"} />
          <Metric label="Próximo contato" value={formatarData(cliente.proximo_contato_em)} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-blue-600" /><h3 className="font-bold text-slate-800">Dimensionamento comercial</h3></div>
          <button type="button" onClick={onCriarProposta} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 sm:w-auto"><Send className="h-4 w-4" /> Criar proposta</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <NumberField label="Consumo médio" suffix="kWh/mês" value={consumo} disabled={!modoEdicao} onChange={valor => onChange("consumo_medio_kwh", valor)} />
          <Metric label="Potência sugerida" value={potenciaSugerida ? `${potenciaSugerida} kWp` : "Calcular"} />
          <Metric label="Demanda estimada" value={demandaEstimada ? `${demandaEstimada} kW` : "Calcular"} />
        </div>
        <button type="button" disabled={!modoEdicao || consumo <= 0} onClick={calcularDemanda} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><Calculator className="h-4 w-4" /> Calcular demanda e potência</button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-amber-500" /><h3 className="font-bold text-slate-800">Qualificação e negociação</h3></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SelectField label="Temperatura" value={cliente.temperatura_lead || "frio"} disabled={!modoEdicao} onChange={valor => onChange("temperatura_lead", valor)} options={["frio", "morno", "quente"]} />
          <TextField label="Origem do lead" value={cliente.origem || ""} disabled={!modoEdicao} onChange={valor => onChange("origem", valor)} placeholder="Ex.: Indicação, Instagram" />
          <DateField label="Próximo contato" value={cliente.proximo_contato_em || ""} disabled={!modoEdicao} onChange={valor => onChange("proximo_contato_em", valor || null)} />
          <TextField label="Observações comerciais" value={cliente.observacoes_comerciais || ""} disabled={!modoEdicao} onChange={valor => onChange("observacoes_comerciais", valor)} placeholder="Necessidades, objeções, condições..." />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-violet-600" /><h3 className="font-bold text-slate-800">Atividades e follow-up</h3></div>

        <div className="mt-3 space-y-2">
          {atividades.map(atividade => <button key={atividade.id} type="button" onClick={() => void alternarAtividade(atividade)} className={`flex w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-2 text-left ${atividade.concluida ? "border-slate-100 bg-slate-50 text-slate-400" : "border-slate-200 bg-white text-slate-700"}`}><CheckCircle2 className={`h-4 w-4 shrink-0 ${atividade.concluida ? "text-emerald-600" : "text-slate-300"}`} /><span className="min-w-0 flex-1 truncate text-sm font-medium">{atividade.titulo}</span><span className="shrink-0 text-xs">{atividade.agendada_para ? formatarData(atividade.agendada_para) : atividade.tipo}</span></button>)}
          {atividades.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-sm text-slate-500">Nenhuma atividade registrada.</p>}
          {erroAtividades && <p className="text-xs text-amber-700">Atividades estarão disponíveis após aplicar a migração comercial.</p>}
        </div>

        <form onSubmit={adicionarAtividade} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_130px]">
          <input value={novaAtividade} onChange={event => setNovaAtividade(event.target.value)} placeholder="Ex.: Ligar para validar proposta" className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-300" />
          <select value={tipoAtividade} onChange={event => setTipoAtividade(event.target.value as Atividade["tipo"])} className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm">{tiposAtividade.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}</select>
          <input type="date" value={dataAtividade} onChange={event => setDataAtividade(event.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button type="submit" className="mt-2 flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700 sm:col-span-3 sm:mt-0"><Plus className="h-4 w-4" /> Adicionar</button>
        </form>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="mt-1 block truncate text-sm font-bold text-slate-800">{value}</span></div>; }
function NumberField({ label, suffix, value, disabled, onChange }: { label: string; suffix: string; value: number; disabled: boolean; onChange: (value: string) => void }) { return <label className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><div className="mt-1 flex min-w-0 items-center gap-1"><input type="number" min="0" disabled={disabled} value={value || ""} onChange={event => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none disabled:text-slate-500" /><span className="shrink-0 text-[10px] text-slate-400">{suffix}</span></div></label>; }
function TextField({ label, value, disabled, onChange, placeholder }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void; placeholder: string }) { return <label className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><input disabled={disabled} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold outline-none disabled:text-slate-500" /></label>; }
function DateField({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) { return <label className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><input type="date" disabled={disabled} value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold outline-none disabled:text-slate-500" /></label>; }
function SelectField({ label, value, disabled, onChange, options }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void; options: string[] }) { return <label className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><select disabled={disabled} value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold outline-none disabled:text-slate-500">{options.map(opcao => <option key={opcao} value={opcao}>{opcao[0].toUpperCase() + opcao.slice(1)}</option>)}</select></label>; }
function formatarMoeda(valor: number) { return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function formatarData(data: string | null | undefined) { return data ? new Date(`${data.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR") : "Não definido"; }
