import React from 'react';
import { useState, useRef } from 'react';
import { supabase } from './supabase';

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
  width: "auto", // Changed from "100%"
  flex: 1,       // Added this to fill available space
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
  transition: "border-color 0.2s",
  textAlign: "center" as const  // Add this to center the text and placeholder
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

// Login/Logout styles


const modalOverlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000
};

const modalStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
};

const modalFormStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "15px"
};


// #endregion

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

  // Detect login state
  const [user, setUser] = useState<any>(null);
  console.log('Current user state:', user);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({
  name: '',
  email: '',
  password: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);

  // #endregion

  // ==================== LIFECYCLE EFFECTS ====================
  
  React.useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    fetchTasks(); // Fetch after auth state is set
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const wasLoggedOut = !user;
    const isNowLoggedIn = session?.user;
    

  if (hasStartedRef.current) {
    saveWorkSession();
  }
  
    setUser(session?.user ?? null);
    
    if (wasLoggedOut && isNowLoggedIn) {
      migrateLocalStorageToSupabase().then(() => fetchTasks());
    } else {
      fetchTasks();
    }
  });

  return () => subscription.unsubscribe();
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

React.useEffect(() => {
  fetchTasks();
}, [user]);
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
  console.log('saveWorkSession called');
  console.log('taskName:', taskName);
  console.log('hasStartedRef.current:', hasStartedRef.current);
  console.log('timeWorked:', timeWorked);
  console.log('User state in saveWorkSession:', user);

  if (taskName && hasStartedRef.current && timeWorked > 0) {
    if (user) {
  // Test what Supabase thinks the current user is
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  console.log('React user.id:', user.id);
  console.log('Supabase user.id:', currentUser?.id);
  console.log('Are they equal?', user.id === currentUser?.id);
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        task_name: taskName,
        time_worked: timeWorked,
        user_id: user.id
      }
    ]);
  
  console.log('Insert response - data:', data);
  console.log('Insert response - error:', error);
  console.log('=== END DEBUG ===');
  
  if (error) console.error('Error saving task:', error);
} else {
      console.log('Using localStorage');

      // localStorage code
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const newTask = { 
        id: Date.now(), // simple ID for localStorage
        task_name: taskName, 
        time_worked: timeWorked,
        created_at: new Date().toISOString()
      };
      existingTasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(existingTasks));
    }
    
    hasStartedRef.current = false;
  }
}
function fetchTasks() {
  if (user) {
    // Your existing Supabase code
    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching tasks:', error);
        } else {
          setCompletedTasks(data || []);
        }
      });
  } else {
    // localStorage code
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setCompletedTasks(tasks);
  }
}

async function signUp() {
  const { error } = await supabase.auth.signUp({
    email: authForm.email,
    password: authForm.password,
    options: {
      data: {
        name: authForm.name
      }
    }
  });
  
  if (error) {
    alert(error.message); // Show the actual error message
  } else {
    alert('Check your email to confirm your account!'); // Let them know to check email
    setShowAuthModal(false);
    setAuthForm({ name: '', email: '', password: '' });
  }
}
async function signIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email: authForm.email,
    password: authForm.password
  });
  
  if (error) {
    alert(error.message); // Show the actual error message
  } else {
    setShowAuthModal(false);
    setAuthForm({ name: '', email: '', password: '' });
    fetchTasks();
  }
}

async function signOut() {
  await supabase.auth.signOut();
}


  // #endregion

  // ==================== TASK EDITING ====================
  
  function editTask(task_id: number) {
    setEditingTaskId(task_id);
    
    const taskToEdit = completedTasks.find(task => task.id === task_id);
    if (taskToEdit) {
      setEditTaskName(taskToEdit.task_name);
      setEditTimeWorked(taskToEdit.time_worked);
    }
  }

  function saveTask(task_id: number) {
  if (user) {
    // Supabase code
    supabase
      .from('tasks')
      .update({
        task_name: editTaskName,
        time_worked: editTimeWorked
      })
      .eq('id', task_id)
      .then(() => {
        setEditingTaskId(null);
        fetchTasks();
      });
  } else {
    // localStorage code
    const existingTasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = existingTasks.map(task => 
      task.id === task_id 
        ? { ...task, task_name: editTaskName, time_worked: editTimeWorked }
        : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setEditingTaskId(null);
    fetchTasks();
  }
}

function deleteTask(task_id: number) {
  if (user) {
    // Supabase code
    supabase
      .from('tasks')
      .delete()
      .eq('id', task_id)
      .then(() => fetchTasks());
  } else {
    // localStorage code
    const existingTasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = existingTasks.filter(task => task.id !== task_id);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    fetchTasks(); // Refresh the UI
  }
}
async function migrateLocalStorageToSupabase() {
  const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  if (localTasks.length > 0) {
    const { error } = await supabase
      .from('tasks')
      .insert(localTasks);
    
    if (!error) {
      localStorage.removeItem('tasks'); // Clear after successful migration
    }
  }
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
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          submit();
          start(); // This already starts the timer
        }
      }}
      autoComplete="off"
      name="task"
      type="text"
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
    {/* Login button on the left (only when not logged in) */}
    {!user && (
      <button 
        style={secondaryButtonStyle}
        onClick={() => setShowAuthModal(true)}
      >
        Log in
      </button>
    )}

    {/* Start/Pause/Resume button */}
    <button 
      style={primaryButtonStyle}
      onClick={handleStartPauseResume}
    >
      {timerState === "stopped" ? "Start" :
        timerState === "running" ? "Pause" :
          "Resume"}
    </button>
    
    {/* Other buttons */}
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
            {editingTaskId === task.id ? (
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
                    onClick={() => saveTask(task.id)}
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
                    onClick={() => editTask(task.id)}
                  >
                    Edit
                  </button>
                  <button 
                    style={dangerButtonStyle}
                    onClick={() => deleteTask(task.id)}
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
const authSection = (
  <>
    {showAuthModal && (
      <div style={modalOverlayStyle} onClick={() => setShowAuthModal(false)}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h3>{isSignUp ? 'Sign Up' : 'Sign In'}</h3>
          <div style={modalFormStyle}>
            {isSignUp && (
              <input
                style={inputStyle}
                placeholder="Name"
                value={authForm.name}
                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
              />
            )}
            <input
              style={inputStyle}
              placeholder="Email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
            />
            <input
              style={inputStyle}
              placeholder="Password"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            />
            <button 
              style={primaryButtonStyle}
              onClick={isSignUp ? signUp : signIn}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button 
              style={secondaryButtonStyle}
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
const timerSection = (
  <div style={rightColumnStyle}>
    {/* Welcome message and logout link above session header (only when logged in) */}
    {user && (
      <div style={{
        fontSize: "16px",
        textAlign: "center" as const,
        color: "#666",
        margin: "5px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap" as const
      }}>
        <span>
          👋 Welcome back, <span style={{fontWeight: "bold", color: "#333"}}>{user.user_metadata?.name || user.email.split('@')[0]}</span>!
        </span>
        <span 
          style={{
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px"
          }}
          onClick={signOut}
        >
          Log out
        </span>
      </div>
    )}
    
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
      {authSection}
      {timerSection}
      {taskList}
    </div>
  );
}

// Desktop version
return (
  <div style={webContainerStyle}>
    {authSection}
    <div style={webFrameStyle}>
      {timerSection}
      {taskList}
    </div>
  </div>
);
}

export default App;