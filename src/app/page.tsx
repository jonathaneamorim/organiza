'use client';
import { useTasks } from '@/hooks/useTasks';
import { taskService } from '@/services/taskService';
import Link from 'next/link';

export default function Home() {
  const { tasks, isLoaded, importTasks } = useTasks();

  if (!isLoaded) return null;

  const pending = tasks.filter(t => !t.completed).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      importTasks(e.target.files[0]);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-blue-600">Organiza</h1>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-gray-700">
          Tarefas pendentes: <strong className="text-blue-700">{pending}</strong>
        </p>
      </div>
      <nav className="mt-6 flex flex-col gap-3">
        <Link href="/tarefas" className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-center font-bold">
          📋 Minhas Tarefas
        </Link>
        <Link href="/datas" className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-center font-bold">
          📅 Ver por Data
        </Link>
      </nav>
      <div className="mt-12 flex flex-col items-center gap-4 border-t pt-6">
        <button onClick={() => taskService.exportBackup(tasks)} className="text-sm text-blue-500 underline">
          Exportar Backup
        </button>
        <label className="text-xs text-gray-400 cursor-pointer underline">
          Importar Backup
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
    </main>
  );
}