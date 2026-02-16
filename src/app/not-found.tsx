import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-6 bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 p-10 rounded-3xl shadow-sm backdrop-blur-md">
        
        <h1 className="text-8xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          404
        </h1>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Caminho não encontrado</h2>
          <p className="text-sm opacity-60 font-medium leading-relaxed">
            Parece que você se perdeu no cronograma. A página que você tentou acessar não existe ou foi movida.
          </p>
        </div>

        <Link 
          href="/" 
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 w-full sm:w-auto active:scale-95"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}