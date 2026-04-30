'use client'

import { createCustomerPortal, updateProfile } from '@/app/auth/actions'
import { useActionState, useState, useEffect } from 'react'
import AvatarUpload from '@/app/components/AvatarUpload'
import { toast } from 'sonner'
import Link from 'next/link'
import { Settings, User, Building2, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react'

export default function PerfilPage({ perfilInicial }: { perfilInicial: any }) {
  const [avatarUrl, setAvatarUrl] = useState(perfilInicial?.avatar_url || '')
  const [logoUrl, setLogoUrl] = useState(perfilInicial?.company_logo_url || '')
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  useEffect(() => {
    if (state?.success) {
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const ProfileField = ({ label, value, name, placeholder, icon: Icon }: any) => (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
        <Icon size={12} className="text-slate-300" />
        {label}
      </label>
      {isEditing ? (
        <input 
          name={name} 
          key={value}
          defaultValue={value} 
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white text-slate-700 shadow-sm"
          placeholder={placeholder}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 border border-slate-100 text-slate-700 font-medium group-hover:bg-slate-50 transition-colors">
          {value || <span className="text-slate-300 italic font-normal text-sm">Não informado</span>}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Fixo/Flutuante */}
      <div className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200/60 mb-8">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <User size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
          </div>

          
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* Card Principal: Informações */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <form action={formAction} className="p-8 space-y-10">
            <input type="hidden" name="avatar_url" value={avatarUrl} />
            <input type="hidden" name="company_logo_url" value={logoUrl} />

            {/* Seção de Mídia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800">Identidade Visual</h3>
                  <p className="text-xs text-slate-400">Sua foto e logo da empresa para propostas.</p>
                </div>
                <div className="flex justify-center md:justify-start gap-6">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase text-center">Avatar</p>
                     {isEditing ? (
                        <AvatarUpload url={avatarUrl} onUpload={setAvatarUrl} />
                     ) : (
                        <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex items-center justify-center">
                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <User size={30} className="text-slate-300" />}
                        </div>
                     )}
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase text-center">Empresa</p>
                     {isEditing ? (
                        <AvatarUpload url={logoUrl} onUpload={setLogoUrl} />
                     ) : (
                        <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex items-center justify-center p-3">
                            {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <Building2 size={30} className="text-slate-300" />}
                        </div>
                     )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <ProfileField label="Nome Completo" value={perfilInicial?.full_name} name="full_name" placeholder="Seu Nome" icon={User} />
              <ProfileField label="Nome da Empresa" value={perfilInicial?.company_name} name="company_name" placeholder="Empresa Solar" icon={Building2} />
              <ProfileField label="WhatsApp" value={perfilInicial?.phone} name="phone" placeholder="(00) 00000-0000" icon={Settings} />
              <ProfileField label="Website" value={perfilInicial?.website} name="website" placeholder="www.seusite.com.br" icon={ExternalLink} />
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100 animate-in fade-in duration-500">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className={`bg-blue-600 text-white font-bold py-3 px-10 rounded-2xl transition-all shadow-lg shadow-blue-200 ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95'}`}
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </form>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="ml-auto mr-8 mb-8 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer "
            >
              ✏️ Editar Perfil
            </button>
          )}
        </div>

        {/* Card de Assinatura - Contexto Separado */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            <CreditCard size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-blue-400">
               <ShieldCheck size={18} />
               <span className="text-xs font-black uppercase tracking-widest">Plano & Assinatura</span>
            </div>
            
            <div className="max-w-md">
              <h3 className="text-xl font-bold mb-2">Controle seus Pagamentos</h3>
              <p className="text-slate-400 text-sm mb-6">Acesse o portal para atualizar cartões, baixar notas fiscais ou gerenciar seu cancelamento com segurança.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <form action={createCustomerPortal}>
                 <button type="submit" className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all active:scale-95">
                   Gerenciar no Stripe <ExternalLink size={14} />
                 </button>
               </form>
               
               <Link href="/planos" className="flex items-center justify-center gap-2 bg-slate-800 text-slate-300 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-700 transition-all">
                 Ver Outros Planos
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}