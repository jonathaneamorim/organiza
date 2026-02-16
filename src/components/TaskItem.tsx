import { Task } from '@/types/task';

export const TaskItem = ({ task, onToggle, onDelete }: { task: Task, onToggle: (id: string) => void, onDelete: (id: string) => void }) => (
  <div className={`flex items-center p-3 border-b ${task.completed ? 'opacity-50' : ''}`}>
    <input 
      type="checkbox" 
      checked={task.completed} 
      onChange={() => onToggle(task.id)}
      className="mr-3 h-5 w-5"
    />
    <div className="flex-1">
      <p className={task.completed ? 'line-through' : ''}>{task.title}</p>
      <small className="text-gray-500">{task.date}</small>
    </div>
    <button onClick={() => onDelete(task.id)} className="text-red-500 ml-2">Excluir</button>
  </div>
);