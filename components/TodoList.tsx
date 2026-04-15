'use client';

import { useState } from 'react';
import { Todo, FilterType } from '@/types';
import TodoItem from './TodoItem';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const addTodo = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    const newTodo: Todo = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, newText: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="w-full max-w-lg">
      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={addTodo}
          disabled={inputValue.trim().length === 0}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Filter & Stats */}
      {todos.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === btn.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {activeCount} item{activeCount !== 1 ? 's' : ''} left
            </span>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-red-500 transition-colors hover:text-red-700"
              >
                Clear completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Todo list */}
      <ul className="mt-4 flex flex-col gap-2">
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        ))}
      </ul>

      {/* Empty states */}
      {todos.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">No todos yet</p>
          <p className="mt-1 text-xs text-gray-400">Add your first todo above to get started</p>
        </div>
      )}

      {todos.length > 0 && filteredTodos.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            No {filter} todos found
          </p>
        </div>
      )}
    </div>
  );
}
