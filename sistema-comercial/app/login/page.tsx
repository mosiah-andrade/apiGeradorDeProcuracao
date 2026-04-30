// app/login/page.tsx
import LoginForm from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  // Aqui resolvemos a Promise antes de renderizar o formulário
  const { error, message } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Asa<span className="text-blue-600">web</span>
          </h1>
        </div>
        
        {/* Passamos apenas os valores (strings), não a Promise */}
        <LoginForm error={error} message={message} />
      </div>
    </main>
  )
}