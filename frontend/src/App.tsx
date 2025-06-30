import React from 'react';
import { useState, useRef } from 'react';

function App() {
  // ===== STATE VARIABLES =====
  const [count, setCount] = useState(60);
  const [task, setTask] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [timerState, setTimerState] = useState("stopped"); // "stopped", "running", "paused"
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  
  // Edit mode state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null); // Track which task is being edited (null = none)
  const [editTaskName, setEditTaskName] = useState("");
  const [editTimeWorked, setEditTimeWorked] = useState(0);
  
  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskRef = useRef("");
  const hasStartedRef = useRef(false);

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
    setCount(60);
  }

  // ===== TASK MANAGEMENT FUNCTIONS =====
  function submit() {
    saveWorkSession();
    setTask(inputValue);
    currentTaskRef.current = inputValue;
  }

  async function saveWorkSession() {
    const timeWorked = 60 - count;
    const taskName = currentTaskRef.current;

    if (taskName && hasStartedRef.current && timeWorked > 0) {
      await fetch("http://127.0.0.1:8000/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskName, time: timeWorked })
      });
      hasStartedRef.current = false;
    }
  }

  function fetchTasks() {
    fetch("http://127.0.0.1:8000/latest-session", {
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
    fetch(`http://127.0.0.1:8000/task/${task_id}`, {
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
    fetch(`http://127.0.0.1:8000/task/${task_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
      .then(() => fetchTasks());
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
        <h1>Active Task:</h1>
        <h1>{task ? task : "None"}</h1>
        <h1>{count}</h1>
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