// Mock file system for browser compatibility
export default {
  readFileSync: () => {},
  writeFileSync: () => {},
  exists: () => false,
  promises: {
    readFile: async () => {},
    writeFile: async () => {},
  },
};
