// Browser shim for Node.js 'https' module
// This provides a mock Agent class that @switchboard-xyz/common expects

export class Agent {
  maxSockets: number;
  
  constructor(options?: { maxSockets?: number; keepAlive?: boolean }) {
    this.maxSockets = options?.maxSockets ?? 100;
    // No-op in browser - axios handles connections differently
  }
}

export default { Agent };
