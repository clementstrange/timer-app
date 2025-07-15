import React from 'react';
import { useState, useRef } from 'react';

// #region Component Styles
const containerStyle = { 
  display: "flex", 
  flexDirection: "column" as const, 
  minHeight: "100vh",
  padding: "10px",
  gap: "20px",
  backgroundColor: "#f5f5f5"
};

const webContainerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  minHeight: "100vh",
  backgroundColor: "#e9ecef",
  padding: "20px",
  alignItems: "center",
  justifyContent: "center"
};

const webFrameStyle = {
  display: "flex",
  flexDirection: "column" as const,
  maxWidth: "600px",
  width: "100%",
  gap: "20px",
  backgroundColor: "#f5f5f5",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
};

const rightColumnStyle = { 
  display: "flex", 
  flexDirection: "column" as const, 
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  minHeight: "400px"
};

const taskListStyle = { 
  display: "flex", 
  flexDirection: "column" as const, 
  alignItems: "stretch", 
  gap: "12px", 
  maxHeight: "400px",
  overflowY: "auto" as const,
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const taskItemStyle = { 
  display: "flex", 
  flexDirection: "column" as const,
  gap: "8px",
  padding: "12px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "1px solid #e9ecef"
};

const taskItemContentStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "8px"
};

const taskButtonsStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap" as const
};

const buttonGroupStyle = { 
  display: "flex", 
  gap: "10px", 
  justifyContent: "center",
  flexWrap: "wrap" as const,
  marginTop: "20px"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "2px solid #ddd",
  outline: "none",
  transition: "border-color 0.2s"
};

const compactRowStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  justifyContent: "center",
  width: "100%"
};

const taskInputStyle = {
  width: "200px",
  padding: "12px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "2px solid #ddd",
  outline: "none",
  transition: "border-color 0.2s"
};

const buttonStyle = {
  padding: "12px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s",
  minWidth: "80px"
};

const primaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#007bff",
  color: "white"
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  color: "white"
};

const dangerButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#dc3545",
  color: "white"
};

const successButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#28a745",
  color: "white"
};

const timerDisplayStyle = {
  fontSize: "clamp(2rem, 8vw, 4rem)",
  fontWeight: "bold",
  color: "#333",
  textAlign: "center" as const,
  margin: "20px 0"
};

const sessionHeaderStyle = {
  fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#333",
  margin: "10px 0"
};

const activeTaskStyle = {
  fontSize: "clamp(1rem, 3vw, 1.2rem)",
  textAlign: "center" as const,
  color: "#666",
  margin: "10px 0",
  wordBreak: "break-word" as const
};

const editFormStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  width: "100%"
};

const editInputRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const
};

const compactInputStyle = {
  ...inputStyle,
  width: "80px",
  padding: "8px"
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
  const prevTimerStateRef = useRef(timerState);
  
  // Detect if we're on mobile or desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // #endregion

  // ==================== LIFECYCLE EFFECTS ====================
  
  // Initial data fetch
  React.useEffect(() => {
    fetchTasks();
  }, []);
  
  // Add this useEffect to show timer in title
  React.useEffect(() => {
    const baseTitle = "Life in Focus";
    if (timerState === "running") {
      document.title = `${formatTime(count)} - ${sessionType === "work" ? "Work" : "Break"} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [count, timerState, sessionType]);
  
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

  // Handle screen resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // When timer stops, populate input with current task (only on state transition)
React.useEffect(() => {
  if (timerState === "stopped" && prevTimerStateRef.current !== "stopped" && task) {
    setInputValue(task);
  }
  prevTimerStateRef.current = timerState;
}, [timerState, task]);
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
    setSessionType("break"); 
  }

  // ==================== TASK MANAGEMENT ====================
  
  function submit() {
    saveWorkSession();
    setTask(inputValue.trim() ? inputValue : "Work Session");
    currentTaskRef.current = inputValue.trim() ? inputValue : "Work Session";
    setInputValue(""); // Clear the input
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
    
    return `${minutes}:${paddedSeconds}`;
  }

  // ==================== SHARED EVENT HANDLERS ====================
  
  const handleStartPauseResume = () => {
    if (timerState === "stopped") {
      if (!task) {
        submit(); // Set the task first
      }
      start(); // Then start the timer
    } else if (timerState === "running") {
      pause();
    } else if (timerState === "paused") {
      start();
    }
  };

  const handleTaskInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submit();
      start(); 
    }
  };

  const handleSkip = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerState("stopped");
    setSessionType("work");
  };

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

  // Get session type color
  function getSessionColor() {
    if (sessionType === "work") return "#007bff";
    if (sessionType === "break") return "#28a745";
    return "#17a2b8";
  }

  // ==================== SHARED COMPONENTS ====================
  
  const sessionHeader = (
    <div style={{...sessionHeaderStyle, color: getSessionColor()}}>
      {sessionType === "work" ? "🍅 WORK SESSION" : 
       sessionType === "break" ? "☕ BREAK TIME" : 
       "🏖️ LONG BREAK"}
    </div>
  );

  const pomodoroCounter = (
    <div style={sessionHeaderStyle}>
      Pomodoros: {completedPomos}/4
    </div>
  );

  const activeTaskDisplay = timerState !== "stopped" && (
  <div style={activeTaskStyle}>
    <strong>Active Task:</strong><br />
    {task || "Work Session"}
  </div>
);

  const taskInput = timerState === "stopped" && (
  <div style={compactRowStyle}>
    <input 
      style={taskInputStyle}
      placeholder="Enter new task" 
      value={inputValue} 
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleTaskInput}
    />
  </div>
);

  const timerDisplay = (
    <div style={{...timerDisplayStyle, color: getSessionColor()}}>
      {formatTime(count)}
    </div>
  );

  const buttonGroup = (
    <div style={buttonGroupStyle}>
      <button 
        style={primaryButtonStyle}
        onClick={handleStartPauseResume}
      >
        {timerState === "stopped" ? "Start" :
          timerState === "running" ? "Pause" :
            "Resume"}
      </button>
      
      {sessionType === "work" && (timerState === "running" || timerState === "paused") ? (
        <button 
          style={secondaryButtonStyle}
          onClick={reset}
        >
          Finish
        </button>
      ) : sessionType !== "work" && (
        <>
          <button 
            style={successButtonStyle}
            onClick={() => setCount(prev => prev + 60)}
          >
            +1 min
          </button> 
          <button 
            style={dangerButtonStyle}
            onClick={() => setCount(prev => Math.max(0, prev - 60))}
          >
            -1 min
          </button>
          <button 
            style={secondaryButtonStyle}
            onClick={handleSkip}
          >
            Skip
          </button>
        </>
      )}
    </div>
  );

  const taskList = (
    <div style={taskListStyle}>
      <h4 style={{margin: "0 0 15px 0", color: "#333"}}>Recent Tasks</h4>
      {completedTasks.length > 0 ? (
        completedTasks.map((task, index) => (
          <div key={index} style={taskItemStyle}>
            {editingTaskId === task.task_id ? (
              <div style={editFormStyle}>
                <input
                  style={inputStyle}
                  placeholder="Task name"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                />
                <div style={editInputRowStyle}>
                  <input
                    style={compactInputStyle}
                    type="number"
                    placeholder="Seconds"
                    value={editTimeWorked}
                    onChange={(e) => setEditTimeWorked(Number(e.target.value))}
                  />
                  <button 
                    style={successButtonStyle}
                    onClick={() => saveTask(task.task_id)}
                  >
                    Save
                  </button>
                  <button 
                    style={secondaryButtonStyle}
                    onClick={() => setEditingTaskId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={taskItemContentStyle}>
                <div style={{flex: 1, minWidth: "120px"}}>
                  <div style={{fontWeight: "bold", marginBottom: "4px"}}>
                    {task.task_name}
                  </div>
                  <div style={{color: "#666", fontSize: "14px"}}>
                    {formatTime(task.time_worked)}
                  </div>
                </div>
                <div style={taskButtonsStyle}>
                  <button 
                    style={secondaryButtonStyle}
                    onClick={() => editTask(task.task_id)}
                  >
                    Edit
                  </button>
                  <button 
                    style={dangerButtonStyle}
                    onClick={() => deleteTask(task.task_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
          No tasks yet.
        </div>
      )}
    </div>
  );

  // ==================== RENDER ====================
  
  const timerSection = (
    <div style={rightColumnStyle}>
      {sessionHeader}
      {pomodoroCounter}
      {activeTaskDisplay}
      {taskInput}
      {timerDisplay}
      {buttonGroup}
    </div>
  );

  if (isMobile) {
    return (
      <div style={containerStyle}>
        {timerSection}
        {taskList}
      </div>
    );
  }

  // Desktop version
  return (
    <div style={webContainerStyle}>
      <div style={webFrameStyle}>
        {timerSection}
        {taskList}
      </div>
    </div>
  );
}

export default App;