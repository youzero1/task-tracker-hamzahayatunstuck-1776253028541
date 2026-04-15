'use client';

import { useState } from 'react';
import { Todo, Priority } from '@/types';

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400' },
  medium: { label: 'Med', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', dot: 'bg-amber-400' },
  high: { label: 'High', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30', dot: 'bg-rose-400' },
};

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onDuplicate,
  onUpdatePriority,
  onUpdateDueDate,
  onUpdateCategory,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDuplicate: (id: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateDueDate: (id: string, dueDate: string | null) => void;
  onUpdateCategory: (id: string, category: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showDetails, setShowDetails] = useState(false);

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

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date(new Date().toDateString());
  const isDueToday = todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString();

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const pConfig = priorityConfig[todo.priority];

  return (
    <li className={`group rounded-lg border ${isOverdue ? 'border-rose-500/40 bg-rose-500/5' : 'border-purple-500/20 bg-white/5'} backdrop-blur-sm shadow-sm transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:bg-white/10`}>
      <div className="flex items-center gap-3 px-4 py-3">
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

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
              onBlur={handleSubmitEdit}
              onKeyDown={handleKeyDown}
              className="w-full rounded border border-purple-400/50 bg-slate-800 px-2 py-1 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                onDoubleClick={() => {
                  setIsEditing(true);
                  setEditText(todo.text);
                }}
                className={`cursor-pointer text-sm select-none transition-colors ${
                  todo.completed ? 'text-purple-300/40 line-through' : 'text-gray-200'
                }`}
              >
                {todo.text}
              </span>
              {todo.category && (
                <span className="inline-flex items-center rounded-full bg-purple-500/15 border border-purple-400/20 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                  {todo.category}
                </span>
              )}
            </div>
          )}

          {/* Meta info row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${pConfig.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pConfig.dot}`} />
              {pConfig.label}
            </span>
            {todo.dueDate && (
              <span className={`text-[10px] font-medium ${
                isOverdue ? 'text-rose-400' : isDueToday ? 'text-amber-400' : 'text-purple-300/60'
              }`}>
                📅 {formatDueDate(todo.dueDate)}
                {isOverdue && ' (overdue)'}
              </span>
            )}
            <span className="text-[10px] text-purple-300/30">
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded p-1 text-purple-300/40 opacity-0 transition-all hover:bg-purple-500/20 hover:text-purple-300 group-hover:opacity-100"
            aria-label="Toggle details"
          >
            <svg className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onDuplicate(todo.id)}
            className="rounded p-1 text-purple-300/40 opacity-0 transition-all hover:bg-cyan-500/20 hover:text-cyan-400 group-hover:opacity-100"
            aria-label="Duplicate todo"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="rounded p-1 text-purple-300/40 opacity-0 transition-all hover:bg-pink-500/20 hover:text-pink-400 group-hover:opacity-100"
            aria-label="Delete todo"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable details panel */}
      {showDetails && (
        <div className="border-t border-purple-500/10 px-4 py-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-purple-300/60">Priority:</label>
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdatePriority(todo.id, p)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium border transition-colors ${
                    todo.priority === p
                      ? priorityConfig[p].color
                      : 'border-purple-500/20 text-purple-300/40 hover:text-purple-300/70'
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-purple-300/60">Due date:</label>
            <input
              type="date"
              value={todo.dueDate || ''}
              onChange={(e) => onUpdateDueDate(todo.id, e.target.value || null)}
              className="rounded border border-purple-500/30 bg-slate-800 px-2 py-1 text-xs text-gray-200 outline-none focus:ring-1 focus:ring-purple-400"
            />
            {todo.dueDate && (
              <button
                onClick={() => onUpdateDueDate(todo.id, null)}
                className="text-[10px] text-pink-400/80 hover:text-pink-300"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-purple-300/60">Category:</label>
            <input
              type="text"
              value={todo.category}
              onChange={(e) => onUpdateCategory(todo.id, e.target.value)}
              placeholder="e.g. Work, Personal"
              className="rounded border border-purple-500/30 bg-slate-800 px-2 py-1 text-xs text-gray-200 outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-purple-300/30 w-36"
            />
          </div>
        </div>
      )}
    </li>
  );
}
