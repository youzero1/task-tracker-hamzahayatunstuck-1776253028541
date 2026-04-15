'use client';

import { useState } from 'react';
import { Todo } from '@/types';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSubmitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed.length > 0) {
      onEdit(todo.id, trimmed);
      setIsEditing(false);
    } else {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-purple-500/20 bg-white/5 backdrop-blur-sm px-4 py-3 shadow-sm transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:bg-white/10">
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed
            ? 'border-cyan-400 bg-cyan-400 text-slate-900'
            : 'border-purple-400/50 hover:border-cyan-400'
        }`}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
          onBlur={handleSubmitEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded border border-purple-400/50 bg-slate-800 px-2 py-1 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-purple-400"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => {
            setIsEditing(true);
            setEditText(todo.text);
          }}
          className={`flex-1 cursor-pointer text-sm select-none transition-colors ${
            todo.completed ? 'text-purple-300/40 line-through' : 'text-gray-200'
          }`}
        >
          {todo.text}
        </span>
      )}

      <button
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 rounded p-1 text-purple-300/40 opacity-0 transition-all hover:bg-pink-500/20 hover:text-pink-400 group-hover:opacity-100"
        aria-label="Delete todo"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}
