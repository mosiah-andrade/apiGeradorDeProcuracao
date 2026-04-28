// app/perfil/page.tsx
import { createClient } from '@/lib/supabase/server'
import PerfilPage from './PerfilPage'

export const dynamic = 'force-dynamic' // FORÇA O NEXT A BUSCAR DADOS NOVOS

export default async function Page() {
  const supabase = await createClient()
  
  const { data: perfilInicial } = await supabase
    .from('profiles')
    .select('*')
    .single()

  // Console log aqui para testar se o servidor está pegando os dados:
  console.log("Dados no Servidor:", perfilInicial)

  return <PerfilPage perfilInicial={perfilInicial} />
}