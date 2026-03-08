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

const TaskCard = ({ task }) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Task #{task.id}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
        {task.status}
      </span>
    </div>
    {/* Progress bar */}
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Task Queue</h2>
        <div className="flex items-center gap-3">
          {started && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Running: {runningCount} / 2 &bull; Completed: {tasks.filter((t) => t.status === 'completed').length} / {tasks.length}
            </span>
          )}
          <button
            onClick={startQueue}
            disabled={starting || (started && !allDone)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {starting ? 'Starting...' : allDone ? 'Restart Queue' : 'Start Processing'}
          </button>
        </div>
      </div>

      {allDone && (
        <div className="mb-4 rounded bg-green-100 dark:bg-green-900 px-4 py-2 text-sm font-medium text-green-800 dark:text-green-200">
          All tasks completed!
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Click "Start Processing" to enqueue 10 tasks.
        </p>
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
