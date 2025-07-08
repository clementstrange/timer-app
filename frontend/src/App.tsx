import React from 'react';
import { useState, useRef } from 'react';

function App() {
  function getSessionDuration(type: any) {
  if (type === "work") return 25; // Test only 25 seconds
  if (type === "break") return 5;  // Test only 5 seconds for break too
  if (type === "longBreak") return 10; // Test only 10 seconds for long break
  // No default return - force explicit types
  throw new Error(`Unknown session type: ${type}`);
}
  // ===== STATE VARIABLES =====
  const [count, setCount] = useState(getSessionDuration("work"));
  const [task, setTask] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [timerState, setTimerState] = useState("stopped"); // "stopped", "running", "paused"
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [sessionType, setSessionType] = useState("work"); // "work", "break"
  const [completedPomos, setCompletedPomos] = useState(0);
  const currentSessionTypeRef = useRef("work");

  // Edit mode state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null); // Track which task is being edited (null = none)
  const [editTaskName, setEditTaskName] = useState("");
  const [editTimeWorked, setEditTimeWorked] = useState(0);
  
  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskRef = useRef("");
  const hasStartedRef = useRef(false);
  
  // URL for the backend API
  const API_BASE_URL = "https://believable-courage-production.up.railway.app";
  // ===== STYLES =====
  const containerStyle = { 
    display: "flex", 
    flexDirection: "row" as const, 
    alignItems: "flex-start", 
    padding: "20px", 
    gap: "20px" 
  };
  
  const leftColumnStyle = { 
    flex: 0.4, 
    display: "flex", 
    flexDirection: "column" as const, 
    alignItems: "center" 
  };
  
  const rightColumnStyle = { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column" as const, 
    alignItems: "center" 
  };
  
  const taskListStyle = { 
    display: "flex", 
    flexDirection: "column" as const, 
    alignItems: "center", 
    gap: "10px", 
    width: "100%", 
    marginTop: "20px" 
  };
  
  const taskItemStyle = { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  };
  
  const buttonGroupStyle = { 
    display: "flex", 
    gap: "10px", 
    justifyContent: "center" 
  };

  // ===== LIFECYCLE =====
React.useEffect(() => {
  fetchTasks();
}, []);
  
// 1. Add the missing ref sync
React.useEffect(() => {
  currentSessionTypeRef.current = sessionType;
}, [sessionType]);

// 2. Fix the sessionType useEffect with proper timer restart
React.useEffect(() => {
  setCount(getSessionDuration(sessionType));
  
  if (timerState === "running") {
    // Restart timer for ANY session type when timer is running
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCount(prev => prev <= 0 ? 0 : prev - 1);
    }, 1000);
  }
}, [sessionType]);

React.useEffect(() => {
  if (count === 0 && timerState === "running") {
    if (currentSessionTypeRef.current === "work") {
      saveWorkSession().then(() => {
        fetchTasks(); // Refresh the task list after saving
      });
      setCompletedPomos(prev => {
        const newCount = prev + 1;
        if (newCount === 4) {
          setSessionType("longBreak"); // Long break after 4th pomo
          return 0; // Reset counter
        } else {
          setSessionType("break"); // Regular break
          return newCount; // Keep counting
        }
      });
    } else if (currentSessionTypeRef.current === "break") {
      setSessionType("work");
      setTimerState("stopped");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (currentSessionTypeRef.current === "longBreak") {
      // Long break ending - same as regular break
      setSessionType("work");
      setTimerState("stopped");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }
}, [count, timerState]);
// // 3. Keep the transition logic simple
// React.useEffect(() => {
//   if (count === 0 && timerState === "running") {
//     if (currentSessionTypeRef.current === "work") {
//       setCompletedPomos(prev => prev + 1);
//       setSessionType("break");
//     } else if (currentSessionTypeRef.current === "break") {
//       setSessionType("work");
//       setTimerState("stopped");
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     }
//   }
// }, [count, timerState]);
  // ===== TIMER FUNCTIONS =====
  
  function start() {
    hasStartedRef.current = true;
    setTimerState("running");
    console.log("Starting timer");
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pause() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
    setTimerState("paused");
  }

  async function reset() {
    await saveWorkSession();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = null;
    fetchTasks();
    setTimerState("stopped");
    setSessionType("work");  // Always reset to work
    setCompletedPomos(0); 
  }

  // ===== TASK MANAGEMENT FUNCTIONS =====
  function submit() {
    saveWorkSession();
    setTask(inputValue);
    currentTaskRef.current = inputValue;
  }

  async function saveWorkSession() {
  const timeWorked = getSessionDuration(sessionType) - count;
    const taskName = currentTaskRef.current;

    if (taskName && hasStartedRef.current && timeWorked > 0) {
      await fetch(`${API_BASE_URL}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskName, time: timeWorked })
      });
      hasStartedRef.current = false;
    }
  }

  function fetchTasks() {
    fetch(`${API_BASE_URL}/latest-session`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(data => {
        console.log("Fetched tasks:", data);
        setCompletedTasks(data);
      });
  }

  // ===== CRUD FUNCTIONS =====
  function editTask(task_id: number) {
    setEditingTaskId(task_id);
    
    // Find the task being edited
    const taskToEdit = completedTasks.find(task => task.task_id === task_id);
    if (taskToEdit) {
      setEditTaskName(taskToEdit.task_name);
      setEditTimeWorked(taskToEdit.time_worked);
    }
  }

  function saveTask(task_id: number) {
    // Send the edited values to backend
    fetch(`${API_BASE_URL}/task/${task_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_name: editTaskName,
        time_worked: editTimeWorked
      })
    })
      .then(() => {
        setEditingTaskId(null); // Exit edit mode
        fetchTasks(); // Refresh the list
      });
  }

  function deleteTask(task_id: number) {
    fetch(`${API_BASE_URL}/task/${task_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
      .then(() => fetchTasks());
  }
  
  function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
  
  return `${minutes}:${paddedSeconds}`;
}
  // ===== RENDER =====
  return (
    <div style={containerStyle}>
      {/* Left side - Task entry and history */}
      <div style={leftColumnStyle}>
        <h3>Ultimate Task Timer</h3>

        <input 
          placeholder="Enter new task" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
        />
        <p></p>
        <button onClick={submit}>Submit task</button>

        <div style={taskListStyle}>
          <h3>Completed Tasks</h3>
          {completedTasks.length > 0 ? (
            completedTasks.map((task, index) => (
              <div key={index} style={taskItemStyle}>
                {editingTaskId === task.task_id ? (
                  <div>
                    <input
                      placeholder={`Editing "${task.task_name}"`}
                      value={editTaskName}
                      onChange={(e) => setEditTaskName(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder={task.time_worked ? `${task.time_worked}` : "Time worked"}
                      value={editTimeWorked}
                      onChange={(e) => setEditTimeWorked(Number(e.target.value))}
                      style={{ width: "100px", marginLeft: "8px" }}
                    />
                    <button onClick={() => saveTask(task.task_id)}>Save</button>
                    <button onClick={() => setEditingTaskId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    {task.task_name}: {task.time_worked} seconds
                    <button onClick={() => editTask(task.task_id)}>Edit</button>
                    <button onClick={() => deleteTask(task.task_id)}>Delete</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No past tasks to display</div>
          )}
        </div>
      </div>

      {/* Right side - Timer and controls */}
      <div style={rightColumnStyle}>
        <h1>{sessionType === "work" ? "WORK SESSION" : 
        sessionType === "break" ? "BREAK TIME" : "LONG BREAK"}</h1>
        <h1>Pomodoros: {completedPomos}/4</h1>
        <h1>Active Task:</h1>
        <h1>{task ? task : "None"}</h1>
        <h1>{formatTime(count)}</h1>
        <div style={buttonGroupStyle}>
          <button onClick={() => {
            if (timerState === "stopped") {
              start();
            } else if (timerState === "running") {
              pause();
            } else if (timerState === "paused") {
              start();
            }
          }}>
            {timerState === "stopped" ? "Start" :
              timerState === "running" ? "Pause" :
                "Resume"}
          </button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;