export default {
  setItem: () => Promise.resolve(),
  getItem: () => Promise.resolve(null),
  removeItem: () => Promise.resolve(),
  clear: () => Promise.resolve(),
  getAllKeys: () => Promise.resolve([]),
  multiSet: () => Promise.resolve(),
  multiGet: () => Promise.resolve([]),
  multiRemove: () => Promise.resolve(),
};
