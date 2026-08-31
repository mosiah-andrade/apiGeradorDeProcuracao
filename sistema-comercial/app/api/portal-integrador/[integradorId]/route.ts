import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checklistPadraoHomologacao } from "@/app/kanban/homologacao/mockData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function validarPortal(integradorId: string, token: string | null) {
  const baseQuery = supabaseAdmin
    .from("homologacao_integradores")
    .select("id, user_id, nome, contato");

  // Compatibilidade com links públicos gerados antes da migration do token.
  // O UUID do integrador continua sendo difícil de adivinhar; novos links
  // recebem a camada adicional de token assim que a migration for aplicada.
  if (!token) {
    const { data } = await baseQuery.eq("id", integradorId).maybeSingle();
    return data;
  }

  const { data } = await baseQuery.eq("id", integradorId).eq("portal_token", token).maybeSingle();
  return data;
}

export async function GET(request: Request, { params }: { params: Promise<{ integradorId: string }> }) {
  const { integradorId } = await params;
  const portal = await validarPortal(integradorId, new URL(request.url).searchParams.get("token"));
  if (!portal) return NextResponse.json({ erro: "Link de acesso inválido." }, { status: 404 });

  const [documentos, status, projetos] = await Promise.all([
    supabaseAdmin.from("homologacao_documentos_config").select("id, nome, tipo, obrigatorio, ativo").eq("user_id", portal.user_id).eq("ativo", true).order("created_at"),
    supabaseAdmin.from("homologacao_status").select("id, nome, cor, ordem").eq("user_id", portal.user_id).order("ordem"),
    supabaseAdmin.from("homologacao_projetos").select("id, integrador_id, status_id, nome, titular, unidade_consumidora, concessionaria, prazo, potencia_kwp, created_at").eq("integrador_id", integradorId).order("created_at", { ascending: false }),
  ]);
  if (documentos.error || status.error || projetos.error) return NextResponse.json({ erro: "Não foi possível carregar o formulário." }, { status: 500 });

  return NextResponse.json({ integrador: { nome: portal.nome, contato: portal.contato || "" }, documentos: documentos.data, status: status.data, projetos: projetos.data });
}

export async function POST(request: Request, { params }: { params: Promise<{ integradorId: string }> }) {
  const { integradorId } = await params;
  const form = await request.formData();
  const portal = await validarPortal(integradorId, String(form.get("token") || ""));
  if (!portal) return NextResponse.json({ erro: "Link de acesso inválido." }, { status: 403 });

  const json = <T,>(name: string, fallback: T): T => {
    try { return JSON.parse(String(form.get(name) || "")) as T; } catch { return fallback; }
  };
  const campos = json<Array<{ id: string; nome: string; valor: string }>>("camposAdicionais", []);
  const beneficiarias = json<Array<{ id: string; nome: string; unidadeConsumidora: string; prioridade: number; porcentagem: number }>>("beneficiarias", []);
  const status = await supabaseAdmin.from("homologacao_status").select("id, nome").eq("user_id", portal.user_id).order("ordem").limit(1);
  const recebido = status.data?.find(item => item.nome.toLowerCase().trim() === "recebido") || status.data?.[0];
  const text = (name: string) => String(form.get(name) || "").trim();
  if (!text("nome") || !text("titular") || !text("unidadeConsumidora")) return NextResponse.json({ erro: "Preencha projeto, titular e unidade consumidora." }, { status: 400 });

  const { data: projeto, error } = await supabaseAdmin.from("homologacao_projetos").insert({
    user_id: portal.user_id, integrador_id: integradorId, status_id: recebido?.id || null,
    nome: text("nome"), titular: text("titular"), email: text("email") || null, telefone: text("telefone") || null,
    cpf_cnpj: text("cpfCnpj"), rg: text("rg"), orgao_emissor: text("orgaoEmissor"), endereco: text("endereco"), bairro: text("bairro"), cep: text("cep"), cidade: text("cidade") || null, estado: text("estado") || null,
    concessionaria: text("concessionaria"), cidade_concessionaria: text("cidadeConcessionaria"), cnpj_concessionaria: text("cnpjConcessionaria"), unidade_consumidora: text("unidadeConsumidora"),
    consumo_medio_kwh: Number(text("consumoMedioKwh")) || 0, potencia_kwp: Number(text("potenciaKWp")) || 0, tipo_ligacao: text("tipoLigacao") || "Bifasico",
    prazo: "Recebido pelo portal", responsavel: "Homologador", checklist: checklistPadraoHomologacao, campos_adicionais: campos, beneficiarias, metodo_rateio: text("metodoRateio") || "porcentagem",
  }).select("id, nome, status_id, prazo").single();
  if (error || !projeto) return NextResponse.json({ erro: "Não foi possível registrar o projeto." }, { status: 500 });

  const uploads = form.getAll("arquivo").filter((item): item is File => item instanceof File && item.size > 0);
  for (const arquivo of uploads) {
    if (arquivo.size > 10 * 1024 * 1024) return NextResponse.json({ erro: "Cada anexo deve ter no máximo 10 MB." }, { status: 400 });
    const configId = arquivo.name.split("__")[0] || null;
    const extensao = arquivo.name.split(".").pop() || "bin";
    const caminho = `${integradorId}/${projeto.id}/${crypto.randomUUID()}.${extensao}`;
    const { error: uploadError } = await supabaseAdmin.storage.from("homologacao-documentos").upload(caminho, arquivo, { upsert: false });
    if (uploadError) continue;
    await supabaseAdmin.from("homologacao_documentos_uploads").insert({ user_id: portal.user_id, integrador_id: integradorId, projeto_id: projeto.id, documento_config_id: configId === "extra" ? null : configId, nome: arquivo.name.replace(/^[^_]+__/, ""), tipo: arquivo.type || "arquivo", storage_path: caminho });
  }
  return NextResponse.json({ projeto, status: recebido?.nome || "Recebido" }, { status: 201 });
}
