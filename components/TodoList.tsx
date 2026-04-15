'use client';

import { useState, useEffect, useMemo } from 'react';
import { Todo, FilterType, SortType, Priority } from '@/types';
import TodoItem from './TodoItem';

const LOCAL_STORAGE_KEY = 'todo-app-data';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
      } catch {}
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    const newTodo: Todo = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority: selectedPriority,
      dueDate: selectedDueDate || null,
      category: selectedCategory.trim(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue('');
    setSelectedDueDate('');
    setSelectedCategory('');
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

  const duplicateTodo = (id: string) => {
    setTodos((prev) => {
      const original = prev.find((t) => t.id === id);
      if (!original) return prev;
      const duplicate: Todo = {
        ...original,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        completed: false,
        createdAt: Date.now(),
      };
      const index = prev.findIndex((t) => t.id === id);
      const newTodos = [...prev];
      newTodos.splice(index + 1, 0, duplicate);
      return newTodos;
    });
  };

  const updatePriority = (id: string, priority: Priority) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  const updateDueDate = (id: string, dueDate: string | null) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, dueDate } : todo
      )
    );
  };

  const updateCategory = (id: string, category: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, category } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const toggleAll = () => {
    const allCompleted = todos.every((t) => t.completed);
    setTodos((prev) =>
      prev.map((todo) => ({ ...todo, completed: !allCompleted }))
    );
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setTodos((prev) => {
      const newTodos = [...prev];
      const draggedIndex = newTodos.findIndex((t) => t.id === draggedId);
      const targetIndex = newTodos.findIndex((t) => t.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      const [dragged] = newTodos.splice(draggedIndex, 1);
      newTodos.splice(targetIndex, 0, dragged);
      return newTodos;
    });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Unique categories for display
  const allCategories = useMemo(() => {
    const cats = todos.map((t) => t.category).filter(Boolean);
    return [...new Set(cats)];
  }, [todos]);

  // Filtered and sorted todos
  const processedTodos = useMemo(() => {
    let result = todos.filter((todo) => {
      if (filter === 'active' && todo.completed) return false;
      if (filter === 'completed' && !todo.completed) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!todo.text.toLowerCase().includes(q) && !todo.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });

    if (sort !== 'newest') {
      result = [...result].sort((a, b) => {
        switch (sort) {
          case 'oldest':
            return a.createdAt - b.createdAt;
          case 'priority': {
            const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
          }
          case 'dueDate': {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          case 'alphabetical':
            return a.text.localeCompare(b.text);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [todos, filter, sort, searchQuery]);

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  const sortOptions: { label: string; value: SortType }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Priority', value: 'priority' },
    { label: 'Due Date', value: 'dueDate' },
    { label: 'A-Z', value: 'alphabetical' },
  ];

  return (
    <div className="w-full max-w-lg">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-purple-300/70">Progress</span>
            <span className="text-xs font-bold text-cyan-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 border border-purple-500/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-purple-300/40">{completedCount} done</span>
            <span className="text-[10px] text-purple-300/40">{activeCount} remaining</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="flex-1 rounded-lg border border-purple-500/30 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-gray-100 shadow-sm outline-none transition-colors placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
          />
          <button
            onClick={addTodo}
            disabled={inputValue.trim().length === 0}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* New todo options */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-purple-300/50">Priority:</label>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium border transition-colors ${
                  selectedPriority === p
                    ? p === 'high'
                      ? 'text-rose-400 bg-rose-400/10 border-rose-400/30'
                      : p === 'medium'
                      ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                      : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                    : 'border-purple-500/20 text-purple-300/40 hover:text-purple-300/70'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={selectedDueDate}
            onChange={(e) => setSelectedDueDate(e.target.value)}
            className="rounded border border-purple-500/30 bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 outline-none focus:ring-1 focus:ring-purple-400"
          />
          <input
            type="text"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            placeholder="Category"
            list="category-suggestions"
            className="rounded border border-purple-500/30 bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-purple-300/30 w-20"
          />
          <datalist id="category-suggestions">
            {allCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Search bar */}
      {todos.length > 0 && (
        <div className="mt-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search todos..."
              className="w-full rounded-lg border border-purple-500/20 bg-white/5 pl-9 pr-4 py-2 text-xs text-gray-200 outline-none transition-colors placeholder:text-purple-300/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/40 hover:text-purple-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter, Sort & Stats */}
      {todos.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === btn.value
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'bg-white/5 text-purple-300/70 hover:bg-white/10 hover:text-purple-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-purple-300/60">
                {activeCount} item{activeCount !== 1 ? 's' : ''} left
              </span>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-pink-400/80 transition-colors hover:text-pink-300"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-purple-300/50">Sort:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="rounded border border-purple-500/20 bg-slate-800 px-2 py-1 text-[11px] text-gray-300 outline-none focus:ring-1 focus:ring-purple-400"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {todos.length > 1 && (
              <button
                onClick={toggleAll}
                className="text-[10px] text-purple-300/60 hover:text-purple-200 transition-colors"
              >
                {todos.every((t) => t.completed) ? 'Uncheck all' : 'Check all'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Todo list */}
      <ul className="mt-4 flex flex-col gap-2">
        {processedTodos.map((todo) => (
          <div
            key={todo.id}
            draggable
            onDragStart={() => handleDragStart(todo.id)}
            onDragOver={(e) => handleDragOver(e, todo.id)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${draggedId === todo.id ? 'opacity-50' : 'opacity-100'}`}
          >
            <TodoItem
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              onDuplicate={duplicateTodo}
              onUpdatePriority={updatePriority}
              onUpdateDueDate={updateDueDate}
              onUpdateCategory={updateCategory}
            />
          </div>
        ))}
      </ul>

      {/* Empty states */}
      {todos.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
            <svg className="h-8 w-8 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-purple-300/70">No todos yet</p>
          <p className="mt-1 text-xs text-purple-300/40">Add your first todo above to get started</p>
        </div>
      )}

      {todos.length > 0 && processedTodos.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-purple-300/60">
            {searchQuery ? `No results for "${searchQuery}"` : `No ${filter} todos found`}
          </p>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {todos.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-[10px] text-purple-300/25">
            💡 Double-click to edit • Drag to reorder • Data saved locally
          </p>
        </div>
      )}
    </div>
  );
}
