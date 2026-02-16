import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { taskService } from '@/services/taskService';

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
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    taskService.saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    taskService.saveTasks(updated);
  };

  const importTasks = async (file: File) => {
    const imported = await taskService.importBackup(file);
    setTasks(imported);
    taskService.saveTasks(imported);
  };

  return { tasks, isLoaded, addTask, toggleTask, deleteTask, importTasks };
}