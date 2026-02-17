'use client';
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import Link from 'next/link';
import EditModal from '@/components/EditModal';
import { Task } from '@/types/task';

export default function Home() {
  const { tasks, isLoaded, toggleTask, deleteTask, addTask, importTasks, exportTasks, updateTask } = useTasks();
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!isLoaded) return null;

  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      importTasks(e.target.files[0]);
      e.target.value = ''; 
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle, newDate);
    setNewTitle('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
      <main className="p-4 md:p-8 max-w-md md:max-w-5xl mx-auto">
        
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Organiza
          </h1>
          <p className="text-sm opacity-60 mt-1 font-medium">Seu espaço produtivo</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-[var(--foreground)]/[0.03] border border-[var(--foreground)]/10 p-5 rounded-2xl shadow-sm backdrop-blur-md">
              <h2 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">Nova Tarefa</h2>
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="O que precisa ser feito?"
                  className="p-3.5 border border-[var(--foreground)]/10 rounded-xl shadow-sm bg-[var(--background)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all w-full font-medium"
                />
                <div className="flex gap-3">
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)}
                    className="p-3.5 border border-[var(--foreground)]/10 rounded-xl shadow-sm bg-[var(--background)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all flex-1 font-medium text-sm"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold transition-colors shadow-md shadow-indigo-500/20">
                    Add
                  </button>
                </div>
              </form>
            </div>

            <nav className="flex flex-col gap-3">
              <Link href="/calendar" className="group flex items-center justify-between p-5 border border-[var(--foreground)]/10 rounded-2xl shadow-sm bg-[var(--background)] hover:border-indigo-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    📅
                  </div>
                  <span className="font-bold">Abrir Calendário</span>
                </div>
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">→</span>
              </Link>

              <Link href="/history" className="group flex items-center justify-between p-5 border border-[var(--foreground)]/10 rounded-2xl shadow-sm bg-[var(--background)] hover:border-indigo-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    🗂️
                  </div>
                  <span className="font-bold">Ver Histórico</span>
                </div>
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </nav>

            <div className="flex justify-between items-center p-5 border border-[var(--foreground)]/10 rounded-2xl bg-[var(--foreground)]/[0.02]">
              <button onClick={exportTasks} className="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                📥 Exportar JSON
              </button>
              <div className="w-px h-4 bg-[var(--foreground)]/10"></div>
              <label className="text-sm font-bold opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                📤 Importar JSON
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Tarefas Pendentes
              </h2>
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-full font-bold">
                {pendingTasks.length} {pendingTasks.length === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>
            
            {pendingTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="group p-4 border border-[var(--foreground)]/10 rounded-2xl bg-[var(--background)] shadow-sm hover:shadow-md transition-all flex justify-between items-center">
                    <label className="flex items-center gap-4 cursor-pointer flex-1">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => toggleTask(task.id)}
                          className="peer appearance-none h-6 w-6 border-2 border-[var(--foreground)]/20 rounded-lg checked:bg-indigo-500 checked:border-indigo-500 cursor-pointer transition-all"
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none font-bold text-xs">✓</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--foreground)] group-hover:text-indigo-500 transition-colors">
                          {task.title}
                        </span>
                        <span className="text-xs opacity-50 font-medium">
                          {new Date(task.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </label>

                    <button 
                      onClick={() => setEditingTask({ ...task })}
                      className="ml-4 p-2 text-xs font-bold uppercase tracking-wider text-indigo-500/80 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                    >
                      Editar
                    </button>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="ml-4 p-2 text-xs font-bold uppercase tracking-wider text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--foreground)]/10 rounded-3xl opacity-60">
                <span className="text-4xl mb-4">🎉</span>
                <p className="font-medium text-center">Tudo limpo por aqui!</p>
                <p className="text-sm mt-1">Nenhuma tarefa pendente no momento.</p>
              </div>
            )}
          </div>

        </div>
      </main>
      
      {editingTask && (
        <EditModal 
          key={editingTask.id} 
          isOpen={true}
          initialTitle={editingTask.title}
          initialDate={editingTask.date}
          onClose={() => setEditingTask(null)}
          onSave={(newTitle, newDate) => {
            updateTask(editingTask.id, { title: newTitle, date: newDate });
            setEditingTask(null);
          }}
        />
      )}

    </div>
  );
}
