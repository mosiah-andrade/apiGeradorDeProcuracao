'use client'

import { updateProfile } from '@/app/auth/actions'
import { useActionState, useState, useEffect } from 'react'
import AvatarUpload from '@/app/components/AvatarUpload'
import { toast } from 'sonner'
import Link from 'next/link'


export default function PerfilPage({ perfilInicial }: { perfilInicial: any }) {
  const [avatarUrl, setAvatarUrl] = useState(perfilInicial?.avatar_url || '')
  const [logoUrl, setLogoUrl] = useState(perfilInicial?.company_logo_url || '')
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [showSuccess, setShowSuccess] = useState(false)

  // Sincroniza os estados de imagem quando a prop muda (pós-save)
  useEffect(() => {
    if (perfilInicial) {
      setAvatarUrl(perfilInicial.avatar_url || '')
      setLogoUrl(perfilInicial.company_logo_url || '')
    }
  }, [perfilInicial])

 useEffect(() => {
  if (state?.success) {
    toast.success('Perfil atualizado com sucesso!');
    setIsEditing(false);
  } else if (state?.error) {
    toast.error(state.error);
  }
}, [state]);

  const ProfileField = ({ label, value, name, placeholder }: any) => (
    <div className="space-y-1.5 group relative">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
      {isEditing ? (
        <input 
          name={name} 
          key={value} // O PULO DO GATO: Força o input a resetar quando o valor do banco mudar
          defaultValue={value} 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          placeholder={placeholder}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-medium border border-transparent">
          {value || <span className="text-slate-300 italic">Não informado</span>}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex justify-between items-center px-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meu Perfil</h1>
            <p className="text-slate-500 text-sm">Configurações de marca e contato.</p>
          </div>

          <div className="flex items-center gap-3">
            {showSuccess && <span className="text-emerald-600 text-xs font-bold animate-fade-in">✅ Salvo!</span>}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <span>✏️</span> Editar Perfil
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden transition-all">
          <form action={formAction} className="p-8 space-y-8">
            <input type="hidden" name="avatar_url" value={avatarUrl} />
            <input type="hidden" name="company_logo_url" value={logoUrl} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-slate-100">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Foto</label>
                <div className="flex items-center gap-4">
                    {isEditing ? (
                        <AvatarUpload url={avatarUrl} onUpload={setAvatarUrl} />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : "👤"}
                        </div>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo da Empresa</label>
                <div className="flex items-center gap-4">
                    {isEditing ? (
                        <AvatarUpload url={logoUrl} onUpload={setLogoUrl} />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center p-2">
                            {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : "🏢"}
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Note que passamos o valor direto da prop perfilInicial para o ProfileField */}
              <ProfileField label="Nome Completo" value={perfilInicial?.full_name} name="full_name" placeholder="Seu Nome" />
              <ProfileField label="Nome da Empresa" value={perfilInicial?.company_name} name="company_name" placeholder="Empresa Solar" />
              <ProfileField label="WhatsApp" value={perfilInicial?.phone} name="phone" placeholder="(00) 00000-0000" />
              <ProfileField label="Website" value={perfilInicial?.website} name="website" placeholder="www.seusite.com.br" />
            </div>

            {isEditing && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-2">
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className={`bg-blue-600 text-white font-bold py-3 px-10 rounded-2xl transition-all shadow-lg shadow-blue-100 ${isPending ? 'opacity-50' : 'hover:bg-blue-700 active:scale-95'}`}
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}

            <Link href="/planos" className="block mt-6 text-center">
              <p className="mt-4 text-center text-sm text-blue-600 hover:underline cursor-pointer transition-colors ">
                contratar um plano para desbloquear mais recursos e personalizações! 🚀
              </p>
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}