# Debug Painter

`debug-painter` is a visual debugging and performance monitoring tool designed to enhance console logging. It tracks execution time, memory usage, and logs function calls with additional context like time and location. It also colorizes logs to make them more readable.

## Installation

You can install `debug-painter` via npm:

```bash
npm install debug-painter
```

## Usage

Example: Basic Logging
Here’s an example of using the package for logging:

```bash
import DebugPainter from "debug-painter";

// Create an instance of DebugPainter with options enabled
const debug = new DebugPainter({
  showTimings: true, // Enable timing information
  showMemory: true, // Enable memory tracking
  colorize: true, // Enable colorized logs
  slowThreshold: 100, // Threshold for slow performance (in ms)
});

// Example of logging different types of messages
console.log("This is a log message.");
console.warn("This is a warning.");
console.error("This is an error.");
console.info("This is an info message.");
```

Expected Output:

```bash
[12:14:27 pm] file:///path/to/your/file/index.js:10:9 → This is a log message.
[12:14:27 pm] file:///path/to/your/file/index.js:11:9 → This is a warning.
[12:14:27 pm] file:///path/to/your/file/index.js:12:9 → This is an error.
[12:14:27 pm] file:///path/to/your/file/index.js:13:9 → This is an info message.
```

Example: Watch Functions
Track the performance of a function with the watch method:

```bash
function sampleFunction(x, y) {
  return x + y;
}

// Watch the `sampleFunction` method for performance
debug.watch(global, "sampleFunction");

// Call the watched function
const result = sampleFunction(10, 20);
console.log(`Result of sampleFunction: ${result}`);
```

Expected Output:

```bash
[12:15:30 pm] file:///path/to/your/file/index.js:6:7 → Performance of sampleFunction: 1.22ms, Memory: 54.3KB
Result of sampleFunction: 30
```

Example: Performance Group
Track multiple steps within a performance group:

```bash
const groupId = debug.startGroup("MyPerformanceGroup");

// Simulate some code with delays to measure performance
setTimeout(() => {
  debug.addStep(groupId, "Step 1: Initializing something...");
}, 100); // Simulate 100ms delay

setTimeout(() => {
  debug.addStep(groupId, "Step 2: Fetching data...");
}, 300); // Simulate 300ms delay

setTimeout(() => {
  debug.addStep(groupId, "Step 3: Processing data...");
}, 500); // Simulate 500ms delay

// End the group after all steps are added
setTimeout(() => {
  debug.endGroup(groupId);
}, 700); // End the group after 700ms
```

Expected Output:

```bash
Performance Analysis: MyPerformanceGroup
┌────────────────────────────────────────────────────────────┐
│ ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ Step 1: Initializing something...                          │
│ Duration: 100.00ms (14.2%)                                  │
│────────────────────────────────────────────────────────────│
│ ██████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ Step 2: Fetching data...                                   │
│ Duration: 300.00ms (42.8%)                                  │
│────────────────────────────────────────────────────────────│
│ ███████████████████████████████████░░░░░░░░░░░░░░░░│
│ Step 3: Processing data...                                 │
│ Duration: 500.00ms (71.4%)                                  │
│────────────────────────────────────────────────────────────│
└ Total: 700.00ms                                            ┘
```

Example: Track Custom Event
Log custom events and monitor their execution time and memory usage.

```bash
const customEventId = debug.startEvent("Custom Event Example");
setTimeout(() => {
  debug.endEvent(customEventId, "Completed custom event processing");
}, 200);
```

Expected Output:

```bash
[12:16:00 pm] file:///path/to/your/file/index.js:8:7 → Custom Event Example → Completed custom event processing
```

Example: Log Statistics
Track log statistics such as the number of logs and performance data.

```bash
setTimeout(() => {
  const stats = debug.getStats();
  console.log("Log statistics:", stats);
}, 800); // After performance group ends, log stats
```

Expected Output:

```bash
Log statistics: { logsCount: 5, performanceGroups: 1, memoryUsed: '50KB', executionTime: '1.5ms' }
```

Example: Clearing Logs
Clear the logs and monitor the effect on statistics.

```bash
setTimeout(() => {
  debug.clearLogs();
  console.log("Logs cleared.");

  // Log the stats again after clearing logs
  const statsAfterClear = debug.getStats();
  console.log("Log statistics after clearing:", statsAfterClear);
}, 1000); // Clear logs after 1 second
```

Expected Output:

```bash
Logs cleared.
Log statistics after clearing: { logsCount: 0, performanceGroups: 0, memoryUsed: '0KB', executionTime: '0ms' }
```

## Reference

`DebugPainter(options)`
Creates a new instance of `DebugPainter` with the following options:

`showTimings`: `Boolean` to enable/disable timing information (default: `true`)
`showMemory`: `Boolean` to enable/disable memory tracking (default: `true`)
`colorize`: `Boolean` to enable/disable colorized logs (default: `true`)
`slowThreshold`: Number in milliseconds to track slow performance (default: `100ms`)

`debug.watch(object, functionName)`
Watch a function to track performance metrics such as execution time and memory usage.

`debug.startGroup(groupName)`
Start a performance group with the given name.

`debug.addStep(groupId, description)`
Add a step within a performance group.

`debug.endGroup(groupId)`
End the performance group and log the results.

`debug.startEvent(eventName)`
Start a custom event with the given name.

`debug.endEvent(eventId, description)`
End the custom event and log its result.

`debug.getStats()`
Retrieve log statistics, including the number of logs, performance groups, and memory usage.

`debug.clearLogs()`
Clear all logs from the instance.
End the performance group and log the results.
