// components/Navbar.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MobileMenu from './MobileMenu' // Importe o novo componente
import { ChevronDown } from "lucide-react";

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null;

  const { data: perfilInicial } = await supabase
    .from('profiles')
    .select('*')
    .single()

  const nome = perfilInicial?.full_name || "Usuário"
  const email = user.email
  const avatar = perfilInicial?.avatar_url
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle(); // Retorna o objeto ou null se não existir

  // 2. Define a variável isPro de forma segura
  // Se houver dados (subscription não é null), isPro será true
  const isPro = !!subscription; 

  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Menu Hambúrguer (Mobile Only) */}
        <MobileMenu isPro={isPro} />

        <Link href="/" className="text-xl font-black text-slate-900 tracking-tighter">
          Asa<span className="text-blue-600">web</span>
        </Link>
        
        {/* Navegação Desktop */}
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link href="/proposta" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Propostas</Link>
          <Link href="/planos" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Planos</Link>
          {isPro && (
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                Funções Pro
                <ChevronDown className="w-4 h-4" />
              </button>

              <div
                className="
                  absolute left-0 top-full z-50 mt-1 min-w-48
                  rounded-lg border border-slate-200 bg-white shadow-lg
                  opacity-0 invisible translate-y-2
                  transition-all duration-200
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-y-0
                "
              >
                <Link
                  href="/clientes"
                  className="block px-4 py-3 text-sm hover:bg-blue-100 text-gray-900 hover:font-bold"
                >
                  Clientes
                </Link>

                <Link
                  href="/datasheets"
                  className="block px-4 py-3 text-sm hover:bg-blue-100 text-gray-900 hover:font-bold"
                >
                  Datasheets
                </Link>
                <Link
                  href="/kanban"
                  className="block px-4 py-3 text-sm hover:bg-blue-100 text-gray-900 hover:font-bold"
                >
                  Kanban
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/perfil" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">Olá, {nome.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{email}</p>
          </div>
          <img 
            src={avatar || '/default-avatar.png'} 
            alt="avatar" 
            className="w-10 h-10 rounded-full border border-slate-100 object-cover" 
          />
        </Link>
        
        <form action="/auth/signout" method="post" className="hidden sm:block">
          <button className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all border border-red-100">
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}