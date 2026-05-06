'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export default function ToastHandler() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error) {
      toast.error(error)
      // Limpa a URL para não repetir o toast ao recarregar
      limparUrl()
    }

    if (message) {
      toast.success(message)
      limparUrl()
    }
  }, [searchParams])

  const limparUrl = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('error')
    params.delete('message')
    
    const query = params.toString() ? `?${params.toString()}` : ''
    router.replace(`${pathname}${query}`)
  }

  return null // Componente invisível
}