import { Metadata } from 'next';

// Isso adicionará tags <meta name="robots" content="noindex, nofollow"> automaticamente
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}