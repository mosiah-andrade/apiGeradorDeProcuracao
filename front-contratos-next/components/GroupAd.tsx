import Image from 'next/image';
import Link from 'next/link';

export default function GroupAd() {
  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {/* Rótulo de Parceiro */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '8px', 
        fontSize: '0.8rem', 
        color: '#64748b',
        fontWeight: '600'
      }}>
        <span style={{ 
          backgroundColor: '#e2e8f0', 
          padding: '2px 8px', 
          borderRadius: '4px', 
          textTransform: 'uppercase',
          fontSize: '0.7rem' 
        }}>
          Parceiro
        </span>
        <span>Recomendação Asa Web</span>
      </div>

      <Link 
        href="https://chat.whatsapp.com/Dhyc7U4CYRwCM8ue38yL9q?mode=gi_t" 
        target="_blank" 
        style={{ display: 'block' }}
      >
        <div style={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '16/5' }}>
          <Image
            src="/veteranos-wpp.jpeg"
            alt="Grupo de WhatsApp do nosso parceiro"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      
      {/* Disclaimer (opcional, mas bom para transparência) */}
      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px', textAlign: 'center' }}>
        Este é um grupo externo moderado por um parceiro de confiança.
      </p>
    </div>
  );
}