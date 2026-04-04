const store = new Map();

export function __resetMockStorage() {
  store.clear();
}

export default {
  getItem: async (k) => (store.has(k) ? store.get(k) : null),
  setItem: async (k, v) => {
    store.set(k, v);
  },
  removeItem: async (k) => {
    store.delete(k);
  },
};
