import React from 'react';
import { useState, useRef } from 'react';

// #region Component Styles
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
// #endregion

const API_BASE_URL = "https://believable-courage-production.up.railway.app";

function App() {
  function getSessionDuration(type: any) {
    if (type === "work") return 25;
    if (type === "break") return 5;
    if (type === "longBreak") return 10;
    throw new Error(`Unknown session type: ${type}`);
  }

  // #region State Variables
  // Timer state
  const [count, setCount] = useState(getSessionDuration("work"));
  const [timerState, setTimerState] = useState("stopped");
  const [sessionType, setSessionType] = useState("work");
  const [completedPomos, setCompletedPomos] = useState(0);

  // Task state  
  const [task, setTask] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  // Edit mode state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTimeWorked, setEditTimeWorked] = useState(0);
  
  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskRef = useRef("");
  const hasStartedRef = useRef(false);
  const currentSessionTypeRef = useRef("work");
  // #endregion

  // ==================== LIFECYCLE EFFECTS ====================
  
  // Initial data fetch
  React.useEffect(() => {
    fetchTasks();
  }, []);
  
  // Keep session type ref in sync
  React.useEffect(() => {
    currentSessionTypeRef.current = sessionType;
  }, [sessionType]);

  // Handle session type changes and timer restart
  React.useEffect(() => {
    setCount(getSessionDuration(sessionType));
    
    if (timerState === "running") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setCount(prev => prev <= 0 ? 0 : prev - 1);
      }, 1000);
    }
  }, [sessionType]);

  // Handle session transitions when timer reaches 0
  React.useEffect(() => {
    if (count === 0 && timerState === "running") {
      if (currentSessionTypeRef.current === "work") {
        saveWorkSession().then(() => {
          fetchTasks();
        });
        setCompletedPomos(prev => {
          const newCount = prev + 1;
          if (newCount === 4) {
            setSessionType("longBreak");
            return 0;
          } else {
            setSessionType("break");
            return newCount;
          }
        });
      } else if (currentSessionTypeRef.current === "break") {
        setSessionType("work");
        setTimerState("stopped");
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else if (currentSessionTypeRef.current === "longBreak") {
        setSessionType("work");
        setTimerState("stopped");
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  }, [count, timerState]);

  // ==================== TIMER LOGIC ====================
  
  function start() {
    hasStartedRef.current = true;
    setTimerState("running");
    
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
    setSessionType("work");
    setCompletedPomos(0); 
  }

  // ==================== TASK MANAGEMENT ====================
  
  function submit() {
    saveWorkSession();
    setTask(inputValue);
    currentTaskRef.current = inputValue;
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
    
    return `${minutes}:${paddedSeconds}`;
  }

  // #region API Calls
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
        setCompletedTasks(data);
      });
  }
  // #endregion

  // ==================== TASK EDITING ====================
  
  function editTask(task_id: number) {
    setEditingTaskId(task_id);
    
    const taskToEdit = completedTasks.find(task => task.task_id === task_id);
    if (taskToEdit) {
      setEditTaskName(taskToEdit.task_name);
      setEditTimeWorked(taskToEdit.time_worked);
    }
  }

  function saveTask(task_id: number) {
    fetch(`${API_BASE_URL}/task/${task_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_name: editTaskName,
        time_worked: editTimeWorked
      })
    })
      .then(() => {
        setEditingTaskId(null);
        fetchTasks();
      });
  }

  function deleteTask(task_id: number) {
    fetch(`${API_BASE_URL}/task/${task_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
      .then(() => fetchTasks());
  }

  // ==================== RENDER ====================
  
  return (
    <div style={containerStyle}>
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
          
          {sessionType === "work" ? (
            <button onClick={reset}>Finish Session</button>
          ) : (
            <>
              <button onClick={() => setCount(prev => prev + 5)}>+5 sec</button> 
              <button onClick={() => setCount(prev => Math.max(0, prev - 5))}>-5 sec</button>
              <button onClick={() => {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                setTimerState("stopped");
                setSessionType("work");
              }}>Skip Break</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;