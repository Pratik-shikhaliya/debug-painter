export default class DebugPainter {
  constructor(options = {}) {
    this.options = {
      showTimings: true,
      showMemory: true,
      colorize: true,
      slowThreshold: 100, // ms
      ...options,
    };

    this.logs = [];
    this.timers = new Map();
    this.setupConsoleOverride();
  }

  setupConsoleOverride() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    // Enhance console methods
    Object.keys(originalConsole).forEach((method) => {
      console[method] = (...args) => {
        const time = new Date().toLocaleTimeString();
        const stack = new Error().stack.split("\n")[2];
        const location = stack.match(/\((.+?)\)/)?.[1] || stack;

        const prefix = this.colorize(`[${time}] ${location} →`, method);
        originalConsole[method](prefix, ...args);

        this.logs.push({
          type: method,
          time,
          location,
          args,
        });
      };
    });
  }

  colorize(text, type) {
    if (!this.options.colorize) return text;

    const colors = {
      log: "\x1b[0m", // white
      error: "\x1b[31m", // red
      warn: "\x1b[33m", // yellow
      info: "\x1b[36m", // cyan
      time: "\x1b[32m", // green
    };

    return `${colors[type]}${text}\x1b[0m`;
  }

  watch(target, methodName) {
    const original = target[methodName];
    const self = this;

    target[methodName] = function (...args) {
      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      console.log(self.colorize(`→ Calling ${methodName} with:`, "info"), args);

      try {
        const result = original.apply(this, args);

        // Handle promises
        if (result && typeof result.then === "function") {
          return result.finally(() => {
            self.logPerformance(methodName, startTime, startMemory);
          });
        }

        self.logPerformance(methodName, startTime, startMemory);
        return result;
      } catch (error) {
        console.error(`Error in ${methodName}:`, error);
        throw error;
      }
    };
  }

  logPerformance(methodName, startTime, startMemory) {
    const duration = performance.now() - startTime;
    const memoryUsed =
      (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024;

    const durationColor =
      duration > this.options.slowThreshold ? "warn" : "time";

    console.log(
      this.colorize(`← ${methodName} completed in:`, durationColor),
      `${duration.toFixed(2)}ms`,
      this.colorize(`(Memory: ${memoryUsed.toFixed(2)}MB)`, "info")
    );
  }

  startGroup(name) {
    const id = `${name}_${Date.now()}`;
    this.timers.set(id, {
      name,
      start: performance.now(),
      steps: [],
    });
    return id;
  }

  addStep(groupId, stepName) {
    const group = this.timers.get(groupId);
    if (!group) return;

    const currentTime = performance.now();
    const lastStep = group.steps[group.steps.length - 1];
    const stepStart = lastStep ? lastStep.end : group.start;

    group.steps.push({
      name: stepName,
      start: stepStart,
      end: currentTime,
      duration: currentTime - stepStart,
    });
  }

  endGroup(groupId) {
    const group = this.timers.get(groupId);
    if (!group) return;

    const end = performance.now();
    const totalDuration = end - group.start;

    console.log(
      "\n" + this.colorize(`Performance Analysis: ${group.name}`, "info")
    );
    console.log("┌" + "─".repeat(50) + "┐");

    group.steps.forEach((step, index) => {
      const percentage = (step.duration / totalDuration) * 100;
      const barLength = Math.floor(percentage / 2);
      const bar = "█".repeat(barLength) + "░".repeat(50 - barLength);

      console.log(`│ ${bar} │`);
      console.log(`│ Step ${index + 1}: ${step.name}`);
      console.log(
        `│ Duration: ${step.duration.toFixed(2)}ms (${percentage.toFixed(1)}%)`
      );
      console.log("│" + "─".repeat(50) + "│");
    });

    console.log(`└ Total: ${totalDuration.toFixed(2)}ms ┘\n`);
    this.timers.delete(groupId);
  }

  getStats() {
    const stats = {
      totalLogs: this.logs.length,
      byType: {},
      recentLogs: this.logs.slice(-5),
    };

    this.logs.forEach((log) => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    });

    return stats;
  }

  clearLogs() {
    this.logs = [];
    this.timers.clear();
  }
}
