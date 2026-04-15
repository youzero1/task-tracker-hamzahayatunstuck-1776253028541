import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12 sm:py-20">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent sm:text-5xl">
          Todo App
        </h1>
        <p className="mt-2 text-sm text-purple-300/70">
          Stay organized and get things done
        </p>
      </div>
      <TodoList />
    </main>
  );
}
