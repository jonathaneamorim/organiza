'use client';
import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { taskService } from '@/services/taskService';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = taskService.getTasks();
    requestAnimationFrame(() => {
      setTasks(saved);
      setIsLoaded(true);
    });
  }, []);

  const addTask = (title: string, date: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description: '',
      date,
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    taskService.saveTasks(updated);
    toast.success('Tarefa adicionada!');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const isCompleted = !t.completed;
        if (isCompleted) toast.success('Tarefa concluída! 🎉');
        return { ...t, completed: isCompleted };
      }
      return t;
    });
    setTasks(updated);
    taskService.saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    taskService.saveTasks(updated);
    toast('Tarefa excluída', { icon: '🗑️' });
  };

  const importTasks = async (file: File) => {
    try {
      const imported = await taskService.importBackup(file);
      setTasks(imported);
      taskService.saveTasks(imported);
      toast.success('Backup importado!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro desconhecido ao importar o arquivo.');
      }
    }
  };

  const exportTasks = () => {
    taskService.exportBackup(tasks);
    toast.success('Backup exportado!');
  };

  return { tasks, isLoaded, addTask, toggleTask, deleteTask, importTasks, exportTasks };
}