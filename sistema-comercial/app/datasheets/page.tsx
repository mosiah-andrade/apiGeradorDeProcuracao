import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DatasheetClientPage from "./DatasheetClientPage";

export const metadata = {
  title: "Datasheets Técnicos - Homolog Solar",
  description: "Busque e baixe datasheets de inversores e módulos solares.",
};

export default async function DatasheetsPage() {
  const supabase = await createClient();

  // 1. Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login?next=/dashboard/datasheets");
  }

  // 2. Verificar se o usuário é pagante (status da assinatura ativo ou trialing)
  const { data: perfil, error: perfilError } = await supabase
    .from("profiles") // Nome correto da sua tabela
    .select("stripe_subscription_id, role")
    .eq("id", user.id)
    .single();

    // O usuário será considerado PRO/Pagante se possuir um ID de assinatura ativo no perfil
    const éPagante = perfil && perfil.stripe_subscription_id !== null;
    const éAdmin = perfil && perfil.role === "admin";

    if (!éPagante && !éAdmin) {
    redirect("/planos?motivo=requer-assinatura");
    }

  // 3. Buscar a lista inicial de datasheets cadastrados no banco
  const { data: datasheets, error: dbError } = await supabase
    .from("inversores")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) {
  console.error("Erro real do Supabase:", dbError.message, dbError.details, dbError.hint);
}

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 ">
            Biblioteca de Datasheets
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Acesso exclusivo para assinantes. Busque e faça o download dos arquivos técnicos homologados.
          </p>
        </div>
      </div>

      <DatasheetClientPage initialData={datasheets || []} />
    </div>
  );
}