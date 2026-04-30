'use client'
import { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner';

// Função auxiliar para transformar o corte do canvas em uma imagem blob/file
const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File | null> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Define o tamanho do canvas para o tamanho do corte (quadrado)
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Desenha a parte cortada da imagem no canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Transforma o canvas em um arquivo JPEG comprimido
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(null);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.85); // 0.85 é a qualidade da compressão (85%)
  });
};

interface AvatarUploadProps {
  url: string;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ url, onUpload }: AvatarUploadProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para o processo de upload e corte
  const [upLoading, setUpLoading] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // 1. Quando o usuário seleciona um arquivo (pode ser pesado)
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      
      // Validação básica de tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem válido.');
        return;
      }

      // Lê o arquivo pesado e transforma em uma URL local para o editor
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string)
      })
      reader.readAsDataURL(file)
    }
  }

  // 2. Salva a área que o usuário cortou
  const onCropComplete = useCallback((_croppedArea: any, _croppedAreaPixels: any) => {
    setCroppedAreaPixels(_croppedAreaPixels)
  }, [])

  // 3. Processa o corte, comprime e faz o upload para o Supabase
  const handleFinalUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    try {
      setUpLoading(true)

      // A. Corta e comprime a imagem no frontend (retorna um File quadrado < 500kb geralmente)
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels)
      
      if (!croppedFile) throw new Error('Falha ao processar corte.');

      // B. Prepara o upload para o Supabase
      const fileExt = 'jpg'
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // C. Upload para o Storage (Bucket 'avatars' deve ser público)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedFile)

      if (uploadError) throw uploadError

      // D. Pega a URL pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      // E. Retorna a URL para o formulário pai
      onUpload(data.publicUrl)
      
      // Fecha o modal de corte
      setImageToCrop(null)
    } catch (error: any) {
      console.error(error)
      toast.error(`Erro no upload: ${error.message || 'Verifique sua conexão'}`)
    } finally {
      setUpLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      {/* Visualização do Avatar Atual (Sempre Quadrado) */}
      <div className="relative w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center">
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">👤</span>
        )}
        {upLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Botão para acionar o input oculto */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={upLoading}
        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50"
      >
        {upLoading ? 'Processando...' : 'Alterar Foto'}
      </button>

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* MODAL DE CORTE (Aparece após selecionar o arquivo) */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6">
            <header className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Ajuste sua foto</h2>
              <p className="text-sm text-slate-500">Recorte para ficar quadrada</p>
            </header>

            {/* Área do Cropper (Obrigatório ter posição relative e altura) */}
            <div className="relative w-full h-80 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1 / 1} // Força proporção quadrada
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                // circularCrop={false} // Define se o guia é círculo ou quadrado
              />
            </div>

            {/* Controle de Zoom */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-slate-500 uppercase">Zoom</label>
               <input
                 type="range"
                 value={zoom}
                 min={1}
                 max={3}
                 step={0.1}
                 aria-labelledby="Zoom"
                 onChange={(e) => setZoom(Number(e.target.value))}
                 className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
               />
            </div>

            {/* Botões de Ação do Modal */}
            <footer className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImageToCrop(null)} // Cancela
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalUpload} // Corta, comprime e sobe
                disabled={upLoading}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
              >
                {upLoading ? 'Salvando...' : 'Confirmar e Salvar'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}