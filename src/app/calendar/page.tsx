'use client';
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import Link from 'next/link';
import EditModal from '@/components/EditModal';
import { Task } from '@/types/task';

type ViewMode = 'semana' | 'mes' | 'ano';

const toDateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
};

export default function DatasPage() {
  const { tasks, isLoaded, addTask, toggleTask, deleteTask, updateTask } = useTasks();

  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateString(new Date()));
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!isLoaded) return null;

  const todayStr = toDateString(new Date());

  const upcomingTasks = [...tasks]
    .filter(t => t.date >= todayStr && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const tasksByDate = tasks.reduce((acc, t) => {
    acc[t.date] = [...(acc[t.date] || []), t];
    return acc;
  }, {} as Record<string, Task[]>);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDate) return;

    addTask(newTaskTitle, selectedDate);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'semana') d.setDate(d.getDate() - 7);
    if (viewMode === 'mes') d.setMonth(d.getMonth() - 1);
    if (viewMode === 'ano') d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'semana') d.setDate(d.getDate() + 7);
    if (viewMode === 'mes') d.setMonth(d.getMonth() + 1);
    if (viewMode === 'ano') d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(toDateString(new Date()));
  };

  const getHeaderTitle = () => {
    if (viewMode === 'semana') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = startOfWeek.toLocaleDateString('pt-BR', { month: 'short' });
      const endMonth = endOfWeek.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (startMonth === endMonth) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${endMonth} de ${endOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} de ${endOfWeek.getFullYear()}`;
      }
    }
    if (viewMode === 'mes') {
      const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
      return `${monthName[0].toUpperCase() + monthName.slice(1)} de ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'ano') {
      return currentDate.getFullYear();
    }
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    const weekDayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="space-y-4">
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {weekDays.map((day, index) => {
              const dateStr = toDateString(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dayTasks = tasksByDate[dateStr] || [];
              const completedCount = dayTasks.filter(t => t.completed).length;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    flex-shrink-0 w-24 p-3 border border-[var(--foreground)]/10 rounded-xl
                    hover:border-indigo-500/50 transition-all text-center snap-start
                    ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : ''}
                    ${isToday && !isSelected ? 'bg-indigo-500/10 text-indigo-600' : ''}
                  `}
                >
                  <div className="text-xs font-medium opacity-60 mb-1">
                    {weekDayShort[index]}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? 'text-white' : ''}`}>
                    {day.getDate()}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium">
                        {completedCount}/{dayTasks.length}
                      </div>
                      <div className="w-full h-1 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                          style={{ width: `${(completedCount / dayTasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 p-4 bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-xl">
              <h4 className="font-medium mb-3 text-sm opacity-80">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h4>
              <div className="space-y-2">
                {(tasksByDate[selectedDate] || []).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-[var(--background)] rounded-lg">
                    <span className={`text-sm ${t.completed ? 'line-through opacity-50' : ''}`}>
                      {t.title}
                    </span>
                    <button
                      onClick={() => setEditingTask(t)}
                      className="text-xs text-indigo-500"
                    >
                      Editar
                    </button>
                  </div>
                ))}
                {!isAddingTask && (
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="w-full mt-2 p-2 text-sm border border-dashed border-[var(--foreground)]/20 rounded-lg text-left opacity-60"
                  >
                    + Adicionar tarefa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDayShort.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium opacity-60">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dateStr = toDateString(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dayTasks = tasksByDate[dateStr] || [];
              const completedCount = dayTasks.filter(t => t.completed).length;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    p-4 border border-[var(--foreground)]/10 rounded-xl
                    hover:border-indigo-500/50 hover:shadow-md transition-all text-center
                    ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : ''}
                    ${isToday && !isSelected ? 'bg-indigo-500/10 text-indigo-600' : ''}
                    min-h-[120px] flex flex-col
                  `}
                >
                  <div className="text-xs font-medium opacity-60 mb-1">
                    {weekDayShort[index]}
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${isToday ? 'text-indigo-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="mt-auto space-y-1">
                      <div className="text-xs font-medium">
                        {completedCount}/{dayTasks.length}
                      </div>
                      <div className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                          style={{ width: `${(completedCount / dayTasks.length) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] opacity-60 truncate max-w-full">
                        {dayTasks.slice(0, 2).map(t => t.title).join(', ')}
                        {dayTasks.length > 2 && ` +${dayTasks.length - 2}`}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-3xl p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-xs opacity-40 font-bold">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="p-3" />;
            }

            const dateStr = toDateString(date);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasTasks = !!tasksByDate[dateStr]?.length;
            const taskCount = tasksByDate[dateStr]?.length || 0;
            const completedCount = tasksByDate[dateStr]?.filter(t => t.completed).length || 0;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  p-3 rounded-xl transition-all relative
                  ${isSelected ? 'bg-indigo-600 text-white' : ''}
                  ${isToday && !isSelected ? 'bg-indigo-500/10 text-indigo-600 font-bold' : ''}
                  ${!isSelected && !isToday ? 'hover:bg-[var(--foreground)]/10' : ''}
                `}
              >
                <span className="text-sm md:text-base">{date.getDate()}</span>
                
                {hasTasks && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {Array.from({ length: Math.min(taskCount, 3) }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1 h-1 rounded-full ${
                          idx < completedCount
                            ? 'bg-green-500'
                            : isSelected
                            ? 'bg-white/50'
                            : 'bg-indigo-500'
                        }`}
                      />
                    ))}
                    {taskCount > 3 && (
                      <span className="text-[8px] opacity-60">+{taskCount - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const currentYear = currentDate.getFullYear();
    const years = [];

    for (let i = -5; i <= 6; i++) {
      years.push(currentYear + i);
    }

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {years.map((year) => {
          const isCurrentYear = year === new Date().getFullYear();
          const tasksInYear = tasks.filter(t => t.date.startsWith(year.toString()));
          const totalTasks = tasksInYear.length;
          const completedTasks = tasksInYear.filter(t => t.completed).length;
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <button
              key={year}
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setFullYear(year);
                setCurrentDate(newDate);
                setViewMode('mes');
              }}
              className={`
                p-4 md:p-6 border border-[var(--foreground)]/10 rounded-xl md:rounded-2xl 
                bg-[var(--foreground)]/[0.02] hover:border-indigo-500/50 
                hover:shadow-md transition-all text-center group
                ${isCurrentYear ? 'ring-2 ring-indigo-500/50' : ''}
              `}
            >
              <h3 className={`text-2xl md:text-3xl font-bold mb-2 md:mb-3 ${isCurrentYear ? 'text-indigo-500' : ''}`}>
                {year}
              </h3>
              
              {totalTasks > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-center gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <span className="font-bold text-indigo-500">{totalTasks}</span>
                      <span className="text-[10px] md:text-xs opacity-60 ml-1">total</span>
                    </div>
                    <div>
                      <span className="font-bold text-green-500">{completedTasks}</span>
                      <span className="text-[10px] md:text-xs opacity-60 ml-1">feitas</span>
                    </div>
                  </div>
                
                  <div className="w-full h-1.5 md:h-2 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  <div className="hidden sm:block text-xs opacity-60">
                    ~{Math.round(totalTasks / 12)} tarefas/mês
                  </div>
                </div>
              ) : (
                <p className="text-xs md:text-sm opacity-40">Nenhuma tarefa</p>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Calendário
              </h1>
              <p className="text-xs md:text-sm opacity-60 mt-1 font-medium">
                {viewMode === 'semana' && 'Visão semanal'}
                {viewMode === 'mes' && 'Visão mensal'}
                {viewMode === 'ano' && 'Visão anual'}
              </p>
            </div>
            
            <div className="flex items-center md:gap-3 w-full sm:w-auto justify-between">
              <div className="flex bg-[var(--foreground)]/5 rounded-lg md:rounded-xl p-1 text-sm md:text-base">
                <button
                  onClick={() => setViewMode('semana')}
                  className={`
                    px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all
                    ${viewMode === 'semana' 
                      ? 'bg-indigo-600 text-white' 
                      : 'opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  Sem
                </button>
                <button
                  onClick={() => setViewMode('mes')}
                  className={`
                    px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all
                    ${viewMode === 'mes' 
                      ? 'bg-indigo-600 text-white' 
                      : 'opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  Mês
                </button>
                <button
                  onClick={() => setViewMode('ano')}
                  className={`
                    px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all
                    ${viewMode === 'ano' 
                      ? 'bg-indigo-600 text-white' 
                      : 'opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  Ano
                </button>
              </div>

              <Link 
                href="/" 
                className="px-4 md:px-5 py-1.5 md:py-2.5 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-colors whitespace-nowrap"
              >
                Voltar
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 md:mt-6">
            <button
              onClick={handlePrev}
              className="p-1.5 md:p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors text-lg md:text-xl"
            >
              ←
            </button>
            
            <h2 className="text-base md:text-xl font-bold capitalize text-center px-2">
              {getHeaderTitle()}
            </h2>
            
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={handleToday}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors whitespace-nowrap"
              >
                Hoje
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 md:p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors text-lg md:text-xl"
              >
                →
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-7">
            {viewMode === 'semana' && renderWeekView()}
            {viewMode === 'mes' && renderMonthView()}
            {viewMode === 'ano' && renderYearView()}
          </div>

          <div className={`lg:col-span-5 ${viewMode === 'semana' ? 'hidden lg:block' : ''}`}>
            <div className="space-y-6">
              {selectedDate && viewMode !== 'semana' && (
                <div className="bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-2xl md:rounded-3xl p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-base md:text-lg">
                      {formatDate(selectedDate)}
                    </h3>
                    <span className="text-xs md:text-sm opacity-60">
                      {(tasksByDate[selectedDate] || []).length} tarefas
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2">
                    {(tasksByDate[selectedDate] || []).map((t) => (
                      <div
                        key={t.id}
                        className="group p-3 md:p-4 border border-[var(--foreground)]/10 rounded-xl md:rounded-2xl bg-[var(--background)] hover:border-indigo-500/50 transition-all"
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <button
                            onClick={() => toggleTask(t.id)}
                            className={`
                              mt-1 w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                              ${t.completed 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-[var(--foreground)]/20 hover:border-indigo-500'
                              }
                            `}
                          >
                            {t.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm md:text-base font-medium truncate ${t.completed ? 'line-through opacity-50' : ''}`}>
                              {t.title}
                            </p>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTask(t)}
                              className="p-1 md:p-2 text-xs font-bold text-indigo-500/80 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="p-1 md:p-2 text-xs font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!isAddingTask && (
                      <button
                        onClick={() => setIsAddingTask(true)}
                        className="w-full mt-4 p-3 md:p-4 border-2 border-dashed border-[var(--foreground)]/10 rounded-xl md:rounded-2xl hover:border-indigo-500/50 hover:bg-[var(--foreground)]/[0.02] transition-all text-left"
                      >
                        <span className="text-xs md:text-sm font-medium opacity-60">+ Adicionar tarefa</span>
                      </button>
                    )}

                    {isAddingTask && (
                      <form onSubmit={handleAddTask} className="mt-4 space-y-3">
                        <input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Título da tarefa..."
                          className="w-full p-2 md:p-3 text-sm border border-[var(--foreground)]/10 rounded-lg md:rounded-xl bg-[var(--background)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:p-3 text-sm rounded-lg md:rounded-xl font-bold transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingTask(false)}
                            className="px-3 md:px-4 bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 p-2 md:p-3 text-sm rounded-lg md:rounded-xl font-bold transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {upcomingTasks.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white">
                  <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 flex items-center gap-2">
                    <span>⏰</span>
                    Próximos passos
                  </h3>
                  <div className="space-y-2">
                    {upcomingTasks.map((t) => (
                      <div key={t.id} className="flex justify-between items-center p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-base">
                        <span className="font-medium truncate mr-2">{t.title}</span>
                        <span className="text-xs md:text-sm opacity-90 whitespace-nowrap">
                          {formatShortDate(t.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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