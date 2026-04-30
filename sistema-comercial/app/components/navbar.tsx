// components/Navbar.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfilInicial } = await supabase
    .from('profiles')
    .select('*')
    .single()


  if (!user) return null;

  const nome = perfilInicial?.full_name || "Usuário"
  const email = user.email
  const avatar = perfilInicial?.avatar_url
  console.log(user)

  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-black text-slate-900 tracking-tighter">
          Asa<span className="text-blue-600">web</span>
        </Link>
        
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link href="/proposta" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Propostas</Link>
          <Link href="/planos" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Planos</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/perfil" className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">Olá, {nome.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{email}</p>
          </div>
          <img src={avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
        </Link>
        
        <form action="/auth/signout" method="post">
          <button className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all border border-red-100">
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}