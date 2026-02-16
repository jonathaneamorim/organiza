export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export interface StorageData {
  tasks: Task[];
  lastBackup: string;
}