import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-green-600">
            ProcuraSolar
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-gray-600 hover:text-green-600 transition">Recursos</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-green-600 transition">Como Funciona</Link>
            <Link href="https://asaweb.tech" target="_blank" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold">
              Gerar Procuração
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="https://asaweb.tech" target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Iniciar
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
