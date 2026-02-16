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
  const { tasks, isLoaded } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateString(new Date()));

  if (!isLoaded) return null;

  const todayStr = toDateString(new Date());
  
  const upcomingTasks = [...tasks]
    .filter(t => t.date >= todayStr && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

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

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === 'ano') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return (
        <div className="grid grid-cols-3 gap-2">
          {months.map((m, i) => {
            const hasTasks = tasks.some(t => new Date(t.date + 'T12:00:00').getMonth() === i && new Date(t.date + 'T12:00:00').getFullYear() === year);
            return (
              <button
                key={m}
                onClick={() => {
                  setCurrentDate(new Date(year, i, 1));
                  setViewMode('mes');
                }}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center ${hasTasks ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
              >
                <span className="font-bold">{m}</span>
                {hasTasks && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
      );
    }

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
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
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-xs font-bold text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysToRender.map((d, i) => {
            const dateStr = toDateString(d);
            const isCurrentMonth = d.getMonth() === month;
            const isSelected = dateStr === selectedDate;
            const hasTasks = tasksByDate[dateStr]?.length > 0;
            const isToday = dateStr === todayStr;

            if (viewMode === 'mes' && !isCurrentMonth) {
              return <div key={i} className="p-2" />;
            }

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                  isSelected ? 'bg-blue-600 text-white font-bold shadow-md' : 
                  isToday ? 'bg-blue-100 text-blue-700 font-bold' : 
                  'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-sm">{d.getDate()}</span>
                <div className="h-1 flex mt-1">
                  {hasTasks && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
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
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Calendário</h2>
        <Link href="/" className="text-sm font-bold text-blue-500">Voltar</Link>
      </header>

      {upcomingTasks.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            🔥 Próximas Tarefas
          </h3>
          <div className="flex flex-col gap-2">
            {upcomingTasks.map(task => (
              <div key={task.id} className="bg-white/20 p-2 rounded-lg text-sm flex justify-between">
                <span className="truncate pr-2 font-medium">{task.title}</span>
                <span className="whitespace-nowrap text-blue-100 font-bold">
                  {new Date(task.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
        {(['semana', 'mes', 'ano'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-1.5 text-sm rounded-md capitalize transition-all ${
              viewMode === mode ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-gray-500'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={handlePrev} className="p-2 text-gray-500 hover:text-blue-600 font-bold">{'<'}</button>
        <span className="font-bold text-gray-700">{getHeaderTitle()}</span>
        <button onClick={handleNext} className="p-2 text-gray-500 hover:text-blue-600 font-bold">{'>'}</button>
      </div>

      {renderCalendar()}

      {selectedDate && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
            <span>Tarefas do dia</span>
            <span className="text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
          </h3>
          <div className="flex flex-col gap-2">
            {tasksByDate[selectedDate]?.length > 0 ? (
              tasksByDate[selectedDate].map(t => (
                <div key={t.id} className="p-3 border rounded-lg bg-white shadow-sm flex justify-between items-center text-sm">
                  <span className={t.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}>
                    {t.title}
                  </span>
                  {t.completed && <span className="text-green-500 font-bold">✓</span>}
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                Nenhuma tarefa para esta data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}