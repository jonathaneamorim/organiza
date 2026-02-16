'use client';
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import Link from 'next/link';

type ViewMode = 'semana' | 'mes' | 'ano';

const toDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function DatasPage() {
  const { tasks, isLoaded, addTask, toggleTask, deleteTask } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateString(new Date()));
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!isLoaded) return null;

  const todayStr = toDateString(new Date());
  
  const upcomingTasks = [...tasks]
    .filter(t => t.date >= todayStr && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const tasksByDate = tasks.reduce((acc, task) => {
    acc[task.date] = [...(acc[task.date] || []), task];
    return acc;
  }, {} as Record<string, typeof tasks>);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() - 1);
    if (viewMode === 'semana') d.setDate(d.getDate() - 7);
    if (viewMode === 'ano') d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() + 1);
    if (viewMode === 'semana') d.setDate(d.getDate() + 7);
    if (viewMode === 'ano') d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDate) return;
    addTask(newTaskTitle, selectedDate);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === 'ano') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {months.map((m, i) => {
            const hasTasks = tasks.some(t => new Date(t.date + 'T12:00:00').getMonth() === i && new Date(t.date + 'T12:00:00').getFullYear() === year);
            return (
              <button
                key={m}
                onClick={() => {
                  setCurrentDate(new Date(year, i, 1));
                  setViewMode('mes');
                }}
                className={`p-6 border rounded-2xl flex flex-col items-center justify-center transition-all ${
                  hasTasks ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-transparent border-[var(--foreground)]/10 hover:border-[var(--foreground)]/30'
                }`}
              >
                <span className="font-bold text-lg">{m}</span>
                {hasTasks && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
              </button>
            );
          })}
        </div>
      );
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const daysToRender: Date[] = [];

    if (viewMode === 'semana') {
      const dayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        daysToRender.push(d);
      }
    } else {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      
      for (let i = 0; i < firstDay; i++) {
        daysToRender.push(new Date(year, month, i - firstDay + 1));
      }
      for (let i = 1; i <= daysInMonth; i++) {
        daysToRender.push(new Date(year, month, i));
      }
    }

    return (
      <div className="bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-3xl p-4 md:p-6 shadow-sm backdrop-blur-sm">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
          {weekDays.map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-xs md:text-sm font-bold opacity-40 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {daysToRender.map((d, i) => {
            const dateStr = toDateString(d);
            const isCurrentMonth = d.getMonth() === month;
            const isSelected = dateStr === selectedDate;
            const hasTasks = tasksByDate[dateStr]?.length > 0;
            const isToday = dateStr === todayStr;

            if (viewMode === 'mes' && !isCurrentMonth) {
              return <div key={i} className="p-2 md:p-4" />;
            }

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setIsAddingTask(false);
                }}
                className={`group relative flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl transition-all duration-200 ${
                  isSelected ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 scale-105 z-10' : 
                  isToday ? 'bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20' : 
                  'hover:bg-[var(--foreground)]/5 border border-transparent hover:border-[var(--foreground)]/10 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="text-sm md:text-base">{d.getDate()}</span>
                <div className="absolute bottom-2 flex gap-0.5">
                  {hasTasks && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (viewMode === 'ano') return currentDate.getFullYear();
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${currentDate.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-md md:max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Calendário</h2>
            <p className="text-sm opacity-60 font-medium mt-1">Organize seus dias</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-xl text-sm font-bold transition-colors">
            Voltar
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2 bg-[var(--foreground)]/5 p-1.5 rounded-xl w-full sm:w-auto">
                {(['semana', 'mes', 'ano'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 sm:flex-none px-6 py-2 text-sm rounded-lg capitalize transition-all duration-200 ${
                      viewMode === mode 
                        ? 'bg-[var(--background)] shadow-sm font-bold text-indigo-500' 
                        : 'opacity-60 hover:opacity-100 font-medium'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 bg-[var(--foreground)]/5 p-1.5 rounded-xl w-full sm:w-auto justify-between sm:justify-center">
                <button onClick={handlePrev} className="px-4 py-2 rounded-lg opacity-60 hover:opacity-100 hover:bg-[var(--background)] font-bold transition-all">←</button>
                <span className="font-bold min-w-[120px] text-center capitalize">{getHeaderTitle()}</span>
                <button onClick={handleNext} className="px-4 py-2 rounded-lg opacity-60 hover:opacity-100 hover:bg-[var(--background)] font-bold transition-all">→</button>
              </div>
            </div>

            {renderCalendar()}
          </div>

          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-8">
            
            {selectedDate && (
              <div className="bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-3xl p-6 shadow-sm backdrop-blur-md">
                <h3 className="font-extrabold text-lg mb-6 flex items-center gap-3">
                  <span className="bg-indigo-500/20 text-indigo-500 px-3 py-1.5 rounded-lg text-sm">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </span>
                </h3>
                
                <div className="flex flex-col gap-3">
                  {tasksByDate[selectedDate]?.length > 0 ? (
                    <>
                      {tasksByDate[selectedDate].map(t => (
                        <div key={t.id} className={`p-4 border border-[var(--foreground)]/10 rounded-2xl bg-[var(--background)] shadow-sm flex justify-between items-center transition-all ${t.completed ? 'opacity-50 grayscale' : 'hover:border-indigo-500/50'}`}>
                          <label className="flex items-center gap-4 cursor-pointer flex-1">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                checked={t.completed} 
                                onChange={() => toggleTask(t.id)}
                                className="peer appearance-none h-6 w-6 border-2 border-[var(--foreground)]/20 rounded-lg checked:bg-indigo-500 checked:border-indigo-500 cursor-pointer transition-all"
                              />
                              <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none font-bold text-xs">✓</span>
                            </div>
                            <span className={`font-semibold ${t.completed ? 'line-through text-[var(--foreground)]/50' : ''}`}>
                              {t.title}
                            </span>
                          </label>
                          <button 
                            onClick={() => deleteTask(t.id)}
                            className="ml-3 p-2 text-xs font-bold uppercase tracking-wider text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            Excluir
                          </button>
                        </div>
                      ))}
                      {!isAddingTask && (
                        <button 
                          onClick={() => setIsAddingTask(true)}
                          className="mt-2 p-4 border-2 border-dashed border-[var(--foreground)]/10 hover:border-indigo-500/50 rounded-2xl opacity-70 hover:opacity-100 font-bold transition-all text-left text-sm flex items-center gap-2"
                        >
                          <span className="text-indigo-500 text-lg">+</span> Nova tarefa
                        </button>
                      )}
                    </>
                  ) : (
                    !isAddingTask && (
                      <button 
                        onClick={() => setIsAddingTask(true)}
                        className="w-full text-center p-8 opacity-50 hover:opacity-100 transition-all border-2 border-dashed border-[var(--foreground)]/20 hover:border-indigo-500/50 rounded-3xl flex flex-col items-center gap-2"
                      >
                        <span className="text-2xl mb-2">📝</span>
                        <span className="font-medium text-sm">Dia livre! Nenhuma tarefa.</span>
                        <span className="font-bold text-indigo-500 text-sm mt-1">Clique para adicionar</span>
                      </button>
                    )
                  )}

                  {isAddingTask && (
                    <form onSubmit={handleAddTask} className="flex flex-col gap-3 mt-2 bg-[var(--background)] p-4 rounded-2xl border border-[var(--foreground)]/10 shadow-sm">
                      <input
                        autoFocus
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="O que faremos neste dia?"
                        className="p-3 border-none bg-[var(--foreground)]/5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors">Salvar</button>
                        <button type="button" onClick={() => setIsAddingTask(false)} className="px-5 py-3 border border-[var(--foreground)]/10 rounded-xl font-bold text-sm hover:bg-[var(--foreground)]/5 transition-colors">Cancelar</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg text-white">
                <h3 className="font-extrabold mb-4 flex items-center gap-2 text-lg">
                  Próximos passos 🚀
                </h3>
                <div className="flex flex-col gap-3">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl text-sm flex justify-between items-center border border-white/10">
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="relative flex items-center justify-center flex-shrink-0">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTask(task.id)}
                            className="peer appearance-none h-5 w-5 border-2 border-white/50 rounded-md checked:bg-white checked:border-white cursor-pointer transition-all"
                          />
                          <span className="absolute text-indigo-500 opacity-0 peer-checked:opacity-100 pointer-events-none font-bold text-[10px]">✓</span>
                        </div>
                        <span className="truncate font-medium pr-2">{task.title}</span>
                      </div>
                      <span className="whitespace-nowrap bg-white/20 px-2 py-1 rounded-lg font-bold text-xs">
                        {new Date(task.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}