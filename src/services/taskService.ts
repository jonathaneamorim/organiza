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
    link.setAttribute('download', `organiza_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  importBackup: (file: File): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        return reject(new Error('Formato inválido. Por favor, importe um arquivo .json'));
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          const importedTasks = content.tasks ? content.tasks : content;

          if (!Array.isArray(importedTasks)) {
            return reject(new Error('Estrutura de dados inválida. Esperava-se uma lista de tarefas.'));
          }

          const isValid = importedTasks.every((t: unknown) => {
            if (typeof t !== 'object' || t === null) return false;
            const task = t as Record<string, unknown>;
            return (
              'id' in task && typeof task.id === 'string' &&
              'title' in task && typeof task.title === 'string' &&
              'date' in task && typeof task.date === 'string' &&
              'completed' in task && typeof task.completed === 'boolean'
            );
          });

          if (!isValid) {
            return reject(new Error('O arquivo contém tarefas com dados faltando ou corrompidos.'));
          }

          resolve(importedTasks as Task[]);
        } catch (error) {
          reject(new Error('O arquivo não é um JSON válido ou está corrompido. ', error instanceof Error ? { cause: error } : undefined));
        }
      };

      reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
      reader.readAsText(file);
    });
  }
};