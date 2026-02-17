'use client';
import { useState } from 'react';

type EditModalProps = {
  isOpen: boolean;
  initialTitle: string;
  initialDate: string;
  onClose: () => void;
  onSave: (title: string, date: string) => void;
};

export default function EditModal({
  isOpen,
  initialTitle,
  initialDate,
  onClose,
  onSave
}: EditModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, date);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 text-[var(--foreground)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Editar tarefa</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="p-3 border border-[var(--foreground)]/10 rounded-lg bg-[var(--background)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            autoFocus
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-3 border border-[var(--foreground)]/10 rounded-lg bg-[var(--background)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition-colors"
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 p-3 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}