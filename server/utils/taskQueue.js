const MAX_PARALLEL = 2;

// Real ShopSync bulk operations that an admin would trigger
const BULK_OPERATIONS = [
  { name: 'Sync inventory stock levels', category: 'inventory', icon: '📦' },
  { name: 'Recalculate sale prices', category: 'pricing', icon: '💰' },
  { name: 'Process pending orders', category: 'orders', icon: '🛒' },
  { name: 'Generate monthly sales report', category: 'reports', icon: '📊' },
  { name: 'Send shipping notifications', category: 'notifications', icon: '📧' },
  { name: 'Update product search index', category: 'search', icon: '🔍' },
  { name: 'Clean up soft-deleted records', category: 'maintenance', icon: '🧹' },
  { name: 'Backup product catalogue', category: 'maintenance', icon: '💾' },
  { name: 'Validate supplier pricing', category: 'pricing', icon: '✅' },
  { name: 'Compress product images', category: 'media', icon: '🖼️' },
];

let tasks = [];
let runningCount = 0;

const addTasks = (count) => {
  const newTasks = [];
  for (let i = 0; i < count; i++) {
    const op = BULK_OPERATIONS[i % BULK_OPERATIONS.length];
    newTasks.push({
      id: tasks.length + i + 1,
      name: op.name,
      category: op.category,
      icon: op.icon,
      status: 'pending',
      progress: 0,
    });
  }
  tasks = tasks.concat(newTasks);
  return newTasks;
};

const runTask = (task) => {
  task.status = 'running';
  runningCount++;

  // Simulate varying task durations (each tick 3-8% progress)
  const increment = Math.floor(Math.random() * 6) + 3;

  const interval = setInterval(() => {
    task.progress = Math.min(task.progress + increment, 100);

    if (task.progress >= 100) {
      task.progress = 100;
      task.status = 'completed';
      runningCount--;
      clearInterval(interval);
      processTasks();
    }
  }, 200);
};

const processTasks = () => {
  const pending = tasks.filter((t) => t.status === 'pending');

  while (runningCount < MAX_PARALLEL && pending.length > 0) {
    const nextTask = pending.shift();
    runTask(nextTask);
  }
};

const getTasks = () => tasks;

const resetTasks = () => {
  tasks = [];
  runningCount = 0;
};

export { addTasks, processTasks, getTasks, resetTasks };
