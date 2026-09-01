import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function usuarioAtual(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) return user;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  const user = await usuarioAtual(request);
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("homologacao_notificacoes")
    .select("id, projeto_id, titulo, descricao, lida_em, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ notificacoes: data || [] });
}

export async function PATCH(request: Request) {
  const user = await usuarioAtual(request);
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("homologacao_notificacoes")
    .update({ lida_em: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("lida_em", null);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await usuarioAtual(request);
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("homologacao_notificacoes")
    .delete()
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
