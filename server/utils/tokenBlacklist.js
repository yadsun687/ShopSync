const blacklist = new Set();

const addToBlacklist = (token) => {
  blacklist.add(token);
};

const isBlacklisted = (token) => {
  return blacklist.has(token);
};

export { addToBlacklist, isBlacklisted };
