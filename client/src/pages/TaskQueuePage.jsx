import { useState, useEffect, useCallback } from 'react';
import api from '../services/axiosInstance';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const progressBarColors = {
  pending: 'bg-yellow-400',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
};

const categoryColors = {
  inventory: 'text-purple-600 dark:text-purple-400',
  pricing: 'text-emerald-600 dark:text-emerald-400',
  orders: 'text-orange-600 dark:text-orange-400',
  reports: 'text-cyan-600 dark:text-cyan-400',
  notifications: 'text-pink-600 dark:text-pink-400',
  search: 'text-indigo-600 dark:text-indigo-400',
  maintenance: 'text-gray-600 dark:text-gray-400',
  media: 'text-amber-600 dark:text-amber-400',
};

const TaskCard = ({ task }) => (
  <div className={`rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm transition-all ${
    task.status === 'running' ? 'border-blue-300 dark:border-blue-600 ring-1 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'
  }`}>
    <div className="mb-1 flex items-center justify-between">
      <span className="text-lg">{task.icon}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
        {task.status}
      </span>
    </div>
    <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{task.name}</h4>
    <p className={`mb-3 text-xs font-medium ${categoryColors[task.category] || 'text-gray-500'}`}>{task.category}</p>
    {/* Progress bar */}
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${progressBarColors[task.status]}`}
        style={{ width: `${task.progress}%` }}
      />
    </div>
    <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">{task.progress}%</p>
  </div>
);

const TaskQueuePage = () => {
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);

  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const allDone = started && tasks.length > 0 && tasks.every((t) => t.status === 'completed');

  const startQueue = async () => {
    setStarting(true);
    try {
      const res = await api.post('/queue/start');
      setTasks(res.data.tasks);
      setStarted(true);
    } catch (err) {
      console.error('Failed to start queue:', err);
    } finally {
      setStarting(false);
    }
  };

  // Poll task status every 500ms while the queue is active.
  // Dependencies: [tasks, runningCount]
  //   - `tasks` is needed so the effect can read the latest task list to decide
  //     whether polling should continue (all completed → stop).
  //   - `runningCount` is needed because when it changes (a task finishes or starts),
  //     the component must re-evaluate whether to keep polling or clean up.
  const pollStatus = useCallback(async () => {
    try {
      const res = await api.get('/queue/status');
      setTasks(res.data.tasks);
    } catch (err) {
      console.error('Failed to poll status:', err);
    }
  }, []);

  useEffect(() => {
    if (!started || allDone) return;

    const id = setInterval(pollStatus, 500);

    // Cleanup: clear the interval when component unmounts or polling should stop
    return () => clearInterval(id);
  }, [tasks, runningCount, started, allDone, pollStatus]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bulk Operations</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Run store maintenance tasks with max 2 concurrent operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startQueue}
            disabled={starting || (started && !allDone)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {starting ? 'Starting...' : allDone ? '🔄 Run Again' : '▶ Run All Operations'}
          </button>
        </div>
      </div>

      {/* Progress summary */}
      {started && (
        <div className="mb-6 flex gap-4">
          <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{runningCount}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Running</p>
          </div>
          <div className="flex-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{tasks.length - completedCount - runningCount}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
          </div>
          <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-900/30 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
          </div>
          <div className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{tasks.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
      )}

      {allDone && (
        <div className="mb-4 rounded bg-green-100 dark:bg-green-900 px-4 py-2 text-sm font-medium text-green-800 dark:text-green-200">
          ✅ All store operations completed successfully!
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">No operations queued</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Click "Run All Operations" to start inventory sync, price updates, report generation, and more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskQueuePage;
