import { Task } from '@/types/task';

const STORAGE_KEY = '@organiza:tasks';

export const taskService = {
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  exportBackup: (tasks: Task[]) => {
    const dataStr = JSON.stringify({ tasks, lastBackup: new Date().toISOString() });
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `organiza_backup_${new Date().toLocaleDateString()}.json`);
    link.click();
  },

  importBackup: (file: File): Promise<Task[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = JSON.parse(e.target?.result as string);
        resolve(content.tasks || []);
      };
      reader.readAsText(file);
    });
  }
};