'use client';
import { useTasks } from '@/hooks/useTasks';
import Link from 'next/link';

export default function HistoryPage() {
  const { tasks, isLoaded, toggleTask, deleteTask } = useTasks();

  if (!isLoaded) return null;

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.date] = [...(acc[task.date] || []), task];
    return acc;
  }, {} as Record<string, typeof tasks>);

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
      <main className="p-4 md:p-8 max-w-md md:max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Histórico
            </h1>
            <p className="text-sm opacity-60 mt-1 font-medium">Todas as suas tarefas</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-xl text-sm font-bold transition-colors">
            Voltar
          </Link>
        </header>

        {sortedDates.length > 0 ? (
          <div className="flex flex-col gap-8">
            {sortedDates.map(date => {
              const dayTasks = groupedTasks[date];
              const completedCount = dayTasks.filter(t => t.completed).length;
              
              return (
                <section key={date} className="bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-3xl p-5 md:p-8 shadow-sm backdrop-blur-md">
                  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-[var(--foreground)]/10 pb-4 gap-3">
                    <h2 className="text-lg font-extrabold flex items-center gap-3">
                      <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-lg capitalize">
                        {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </h2>
                    <span className="text-sm font-bold opacity-60 bg-[var(--foreground)]/5 px-3 py-1.5 rounded-full whitespace-nowrap">
                      {completedCount} / {dayTasks.length} concluídas
                    </span>
                  </header>

                  <div className="flex flex-col gap-3">
                    {dayTasks.map(task => (
                      <div key={task.id} className={`group p-4 border border-[var(--foreground)]/10 rounded-2xl bg-[var(--background)] shadow-sm flex justify-between items-center transition-all ${task.completed ? 'opacity-60 grayscale hover:grayscale-0' : 'hover:border-indigo-500/50 hover:shadow-md'}`}>
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
                          <span className={`font-semibold transition-colors ${task.completed ? 'line-through text-[var(--foreground)]/60' : 'text-[var(--foreground)] group-hover:text-indigo-500'}`}>
                            {task.title}
                          </span>
                        </label>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="ml-4 p-2 text-xs font-bold uppercase tracking-wider text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-[var(--foreground)]/10 rounded-3xl opacity-60 mt-12">
            <span className="text-5xl mb-4">📭</span>
            <p className="font-bold text-lg text-center">Nenhum histórico encontrado</p>
            <p className="text-sm mt-2 text-center">Suas tarefas aparecerão aqui.</p>
          </div>
        )}
      </main>
    </div>
  );
}