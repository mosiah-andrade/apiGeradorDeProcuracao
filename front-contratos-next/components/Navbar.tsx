// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          Gerador Solar
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-item">Início</Link>
          <Link href="/blog" className="nav-item">Blog</Link>
        </div>
      </div>
    </nav>
  );
}