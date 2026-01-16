import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div style={{textAlign: 'center', marginTop: '100px', color: '#fff'}}>
      <h2>Página não encontrada</h2>
      <p>O link que você acessou não existe.</p>
      <Link href="/" style={{color: '#10b981', textDecoration: 'underline'}}>
        Voltar para o Gerador
      </Link>
    </div>
  )
}