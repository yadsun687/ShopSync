const MAX_PARALLEL = 2;

let tasks = [];
let runningCount = 0;

const addTasks = (count) => {
  const newTasks = [];
  for (let i = 0; i < count; i++) {
    newTasks.push({
      id: tasks.length + i + 1,
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

  const interval = setInterval(() => {
    task.progress += 5;

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

module.exports = { addTasks, processTasks, getTasks, resetTasks };
