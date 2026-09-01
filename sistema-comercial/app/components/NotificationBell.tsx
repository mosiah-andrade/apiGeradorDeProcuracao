"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Notificacao {
  id: string;
  projeto_id: string | null;
  titulo: string;
  descricao: string | null;
  lida_em: string | null;
  created_at: string;
}

export function NotificationBell() {
  const supabase = createClient();
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [erro, setErro] = useState(false);

  async function carregarNotificacoes() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resposta = await fetch("/api/notificacoes", {
        cache: "no-store",
        credentials: "include",
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || "Erro desconhecido");

      setErro(false);
      setNotificacoes(dados.notificacoes || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setErro(true);
      setNotificacoes([]);
    }
  }

  useEffect(() => {
    void carregarNotificacoes();

    const intervalo = window.setInterval(() => void carregarNotificacoes(), 30_000);
    return () => window.clearInterval(intervalo);
    // O log é recarregado ao abrir a aplicação e a cada 30 segundos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function marcarTodasComoLidas() {
    const naoLidas = notificacoes.filter(notificacao => !notificacao.lida_em);
    if (naoLidas.length === 0) return;

    const lidaEm = new Date().toISOString();
    setNotificacoes(atual => atual.map(notificacao => ({ ...notificacao, lida_em: notificacao.lida_em || lidaEm })));
    const { data: { session } } = await supabase.auth.getSession();
    const resposta = await fetch("/api/notificacoes", {
      method: "PATCH",
      credentials: "include",
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    if (!resposta.ok) void carregarNotificacoes();
  }

  async function apagarNotificacoes() {
    if (notificacoes.length === 0 || !window.confirm("Apagar todas as notificações?")) return;

    const { data: { session } } = await supabase.auth.getSession();
    const resposta = await fetch("/api/notificacoes", {
      method: "DELETE",
      credentials: "include",
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });

    if (resposta.ok) setNotificacoes([]);
    else void carregarNotificacoes();
  }

  const totalNaoLidas = notificacoes.filter(notificacao => !notificacao.lida_em).length;

  function abrirProjeto(notificacao: Notificacao) {
    if (!notificacao.projeto_id) return;
    setAberto(false);
    window.location.assign(`/kanban?projeto=${encodeURIComponent(notificacao.projeto_id)}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setAberto(abertoAtual => !abertoAtual);
          void carregarNotificacoes();
        }}
        className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
        aria-label="Abrir notificações"
      >
        <Bell className="h-5 w-5" />
        {totalNaoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notificações</h2>
              <p className="text-xs text-slate-500">Projetos e prazos de homologação</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void marcarTodasComoLidas()}
                disabled={totalNaoLidas === 0}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Marcar todas como lidas"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void apagarNotificacoes()}
                disabled={notificacoes.length === 0}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Apagar notificações"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificacoes.map(notificacao => (
              <button
                key={notificacao.id}
                type="button"
                onClick={() => abrirProjeto(notificacao)}
                disabled={!notificacao.projeto_id}
                className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 ${notificacao.lida_em ? "bg-white" : "bg-blue-50/60"} ${notificacao.projeto_id ? "cursor-pointer hover:bg-slate-50" : "cursor-default"}`}
              >
                <p className="text-sm font-bold text-slate-800">{notificacao.titulo}</p>
                {notificacao.descricao && <p className="mt-1 text-xs leading-relaxed text-slate-500">{notificacao.descricao}</p>}
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">{new Date(notificacao.created_at).toLocaleString("pt-BR")}</p>
              </button>
            ))}
            {notificacoes.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                {erro ? "Não foi possível carregar as notificações." : "Nenhuma notificação por enquanto."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
