import React from 'react';
import { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './Login';

// #region TypeScript Interfaces and Types

export enum SessionType {
  WORK = 'work',
  BREAK = 'break',
  LONG_BREAK = 'longBreak'
}

export type TimerState = 'stopped' | 'running' | 'paused';

export interface Task {
  id: number;
  task_name: string;
  time_worked: number;
  created_at: string;
  user_id?: string;
  sync_pending?: boolean;
}

export interface AuthForm {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

// #endregion

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
  minHeight: "200px"  // Let content determine height
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
  marginTop: "10px"
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
  textAlign: "left" as const, // Changed from center to left
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


// Modal styles removed - now using separate Login page


// #endregion

function Timer() {
  function getSessionDuration(type: SessionType): number {
    switch (type) {
      case SessionType.WORK:
        return 25; // 25 minutes in seconds
      case SessionType.BREAK:
        return 5; // 5 minutes in seconds
      case SessionType.LONG_BREAK:
        return 10; // 10 minutes in seconds
      default:
        throw new Error(`Unknown session type: ${type}`);
    }
  }

  // #region State Variables
  // Timer state
  const [count, setCount] = useState(getSessionDuration(SessionType.WORK));
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.WORK);
  const [completedPomos, setCompletedPomos] = useState(0);

  // Task state  
  // const [baseInputId] = useState(Date.now()); // Reserved for future autofill prevention
  const [task, setTask] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  

  // Edit mode state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTimeWorked, setEditTimeWorked] = useState(0);
  
  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const currentTaskRef = useRef("");
  const hasStartedRef = useRef(false);
  const currentSessionTypeRef = useRef<SessionType>(SessionType.WORK);
  const prevTimerStateRef = useRef(timerState);
  
  // Detect if we're on mobile or desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect login state
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Auth modal state removed - now using routing
  

  // #endregion

  // ==================== LIFECYCLE EFFECTS ====================
  
  React.useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setIsAuthResolved(true);
    fetchTasks(); // Fetch after auth state is set
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const wasLoggedOut = !user;
    const isNowLoggedIn = !!session?.user;
    const newUser = session?.user ?? null;

    if (hasStartedRef.current) {
      saveWorkSession();
    }
    
    setUser(newUser);
    
    if (wasLoggedOut && isNowLoggedIn && newUser && !hasMigrated) {
      // User just logged in - attempt migration (only once)
      const migrationSuccess = await migrateLocalStorageToSupabase(newUser as User);
      setHasMigrated(true); // Mark as attempted to prevent multiple migrations
      
      if (migrationSuccess) {
        // Show user-friendly notification about successful migration
        setTimeout(() => {
          alert('📝 Your previous tasks have been imported to your account!');
        }, 1000);
      }
      fetchTasks();
    } else {
      fetchTasks();
    }
  });

  return () => subscription.unsubscribe();
}, []);
  
  // Add this useEffect to show timer in title (debounced)
  React.useEffect(() => {
    const baseTitle = "Life in Focus";
    let timeoutId: NodeJS.Timeout;
    
    const updateTitle = () => {
      if (timerState === "running") {
        document.title = `${formatTime(count)} - ${sessionType === "work" ? "Work" : "Break"} | ${baseTitle}`;
      } else {
        document.title = baseTitle;
      }
    };
    
    // Debounce title updates to reduce frequency
    if (timerState === "running") {
      timeoutId = setTimeout(updateTitle, 1000);
    } else {
      updateTitle();
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [count, timerState, sessionType]);
  
  // Keep session type ref in sync
  React.useEffect(() => {
    currentSessionTypeRef.current = sessionType;
  }, [sessionType]);

  // Handle manual session type changes (like reset button)
  React.useEffect(() => {
    const newDuration = getSessionDuration(sessionType);
    
    // Only reset count and timer if we're in stopped state (manual changes)
    // Automatic transitions handle their own timing
    if (timerState === "stopped") {
      setCount(newDuration);
      pausedTimeRef.current = 0;
    }
  }, [sessionType, timerState]);

  // Handle session transitions when timer reaches 0
  React.useEffect(() => {
    if (count === 0 && timerState === "running") {
      // Clear timer immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (sessionType === SessionType.WORK) {
        saveWorkSession().then(() => {
          fetchTasks();
        });
        setCompletedPomos(prev => {
          const newCount = prev + 1;
          const nextSessionType = newCount === 4 ? SessionType.LONG_BREAK : SessionType.BREAK;
          const breakDuration = getSessionDuration(nextSessionType);
          
          // Set new session type and start break timer immediately
          setSessionType(nextSessionType);
          setTimerState("running");
          setCount(breakDuration);
          
          // Start the break timer with proper timing
          startTimeRef.current = Date.now();
          pausedTimeRef.current = 0;
          
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
            const remaining = Math.max(0, breakDuration - elapsed);
            setCount(remaining);
            
            if (remaining === 0) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }
          }, 100);
          
          return newCount === 4 ? 0 : newCount;
        });
      } else if (sessionType === SessionType.BREAK || sessionType === SessionType.LONG_BREAK) {
        // Break finished, return to work (but don't auto-start)
        setSessionType(SessionType.WORK);
        setTimerState("stopped"); 
        setCount(getSessionDuration(SessionType.WORK)); // Reset to 25 minutes
      }
      
      // Reset timing refs
      pausedTimeRef.current = 0;
      startTimeRef.current = null;
    }
  }, [count, timerState, sessionType]);

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
  if (isAuthResolved) { // Only run after initial auth check
    fetchTasks();
  }
}, [user, isAuthResolved]);

// Cleanup on unmount
React.useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, []);

// Monitor for autofill attempts and clear them
React.useEffect(() => {
  const interval = setInterval(() => {
    const taskInputElement = document.querySelector('input[aria-label="Task name input"]') as HTMLInputElement;
    if (taskInputElement && taskInputElement.value !== inputValue) {
      // Autofill detected, clear it
      console.log('Autofill detected and cleared');
      taskInputElement.value = inputValue;
    }
  }, 100);

  return () => clearInterval(interval);
}, [inputValue]);

// Keyboard shortcuts: Enter to start/finish, Space to pause/resume (only when running)
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Only trigger if not typing in an input field
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      (activeElement as HTMLElement).contentEditable === 'true'
    );
    
    // Spacebar only works when timer is running or paused (not when stopped)
    if (event.code === 'Space' && !isInputFocused && timerState !== 'stopped') {
      event.preventDefault(); // Prevent page scroll
      if (timerState === 'running') {
        // Pause logic (inline)
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Calculate and store paused time
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          pausedTimeRef.current += elapsed;
        }
        
        setTimerState("paused");
      } else if (timerState === 'paused') {
        // Resume logic (inline)
        hasStartedRef.current = true;
        setTimerState("running");
        
        // Clear existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Start timer with accurate timing
        startTimeRef.current = Date.now();
        const sessionDuration = getSessionDuration(sessionType);
        
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000) + pausedTimeRef.current;
          const remaining = Math.max(0, sessionDuration - elapsed);
          setCount(remaining);
          
          if (remaining === 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }, 100);
      }
    }
    
    // Enter key: only for finishing running/paused work sessions
    // When stopped, ALL Enter key handling should be done by the task input field
    if (event.code === 'Enter' && !isInputFocused && timerState !== 'stopped') {
      event.preventDefault();
      if (sessionType === SessionType.WORK && (timerState === 'running' || timerState === 'paused')) {
        // Finish work session (inline implementation)
        saveWorkSession().then(() => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Reset timer state properly
          setTimerState("stopped");
          setSessionType(SessionType.WORK);
          pausedTimeRef.current = 0;
          startTimeRef.current = null;
          
          fetchTasks();
        });
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [timerState, sessionType, saveWorkSession, fetchTasks, getSessionDuration]); // Dependencies for inline implementations
  // ==================== TIMER LOGIC ====================
  
  function start() {
    hasStartedRef.current = true;
    setTimerState("running");
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start timer with accurate timing
    startTimeRef.current = Date.now();
    const sessionDuration = getSessionDuration(sessionType);
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000) + pausedTimeRef.current;
      const remaining = Math.max(0, sessionDuration - elapsed);
      setCount(remaining);
      
      if (remaining === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 100);
  }

  function pause() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Calculate and store paused time
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      pausedTimeRef.current += elapsed;
    }
    
    setTimerState("paused");
  }

  async function reset() {
    await saveWorkSession();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset timer state properly
    setTimerState("stopped");
    setSessionType(SessionType.WORK); // Return to work session, useEffect will reset count
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
    
    fetchTasks();
  }

  // ==================== TASK MANAGEMENT ====================
  
  function submit() {
    saveWorkSession();
    const trimmedValue = inputValue.trim();
    const taskName = trimmedValue !== "" ? trimmedValue : "Work Session";
    setTask(taskName);
    currentTaskRef.current = taskName;
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
      // if (!task) {
      //   submit(); // Set the task first
      // }
      // start(); // Then start the timer
      submit(); // Always call submit to update the current task
      start(); // Then start the timer

    } else if (timerState === "running") {
      pause();
    } else if (timerState === "paused") {
      start();
    }
  };

  const handleSkip = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerState("stopped");
    setSessionType(SessionType.WORK);
  };

  // #region API Calls
  async function saveWorkSession() {
  const timeWorked = getSessionDuration(sessionType) - count;
  const taskName = currentTaskRef.current;
  

  if (taskName && hasStartedRef.current && timeWorked > 0) {
    if (user) {


  
  const { error } = await supabase
    .from('tasks')
    .insert([
      {
        task_name: taskName,
        time_worked: timeWorked,
        user_id: user.id
      }
    ]);
  
  if (error) {
    console.error('Error saving task:', error);
    // Fallback to localStorage if Supabase fails
    const existingTasks = JSON.parse(localStorage.getItem('failed_tasks') || '[]');
    const failedTask = { 
      id: Date.now(),
      task_name: taskName, 
      time_worked: timeWorked,
      created_at: new Date().toISOString(),
      user_id: user.id,
      sync_pending: true
    };
    existingTasks.push(failedTask);
    localStorage.setItem('failed_tasks', JSON.stringify(existingTasks));
  }
} else {


      // localStorage code with error handling
      try {
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const newTask = { 
          id: Date.now(),
          task_name: taskName, 
          time_worked: timeWorked,
          created_at: new Date().toISOString()
        };
        existingTasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(existingTasks));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    
    hasStartedRef.current = false;
  }
}
  async function fetchTasks() {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching tasks:', error);
          // Try to load from localStorage as fallback
          try {
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            setCompletedTasks(tasks);
          } catch (localError) {
            console.error('Error loading from localStorage:', localError);
            setCompletedTasks([]);
          }
        } else {
          setCompletedTasks(data || []);
        }
      } catch (networkError) {
        console.error('Network error fetching tasks:', networkError);
        setCompletedTasks([]);
      }
    } else {
      try {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const sortedTasks = tasks.sort((a: Task, b: Task) => {
          const getTimestamp = (task: Task): number => {
            if (task.created_at) {
              const date = new Date(task.created_at);
              return isNaN(date.getTime()) ? task.id || 0 : date.getTime();
            }
            return task.id || 0;
          };
          
          const dateA = getTimestamp(a);
          const dateB = getTimestamp(b);
          return dateB - dateA;
        });
        setCompletedTasks(sortedTasks);
      } catch (error) {
        console.error('Error parsing localStorage tasks:', error);
        localStorage.removeItem('tasks'); // Clear corrupted data
        setCompletedTasks([]);
      }
    }
  }

// Auth functions moved to Login component

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

  function saveTask(task_id: number): void {
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
    const existingTasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
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

function deleteTask(task_id: number): void {
  if (user) {
    // Supabase code
    supabase
      .from('tasks')
      .delete()
      .eq('id', task_id)
      .then(() => fetchTasks());
  } else {
    // localStorage code
    const existingTasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = existingTasks.filter(task => task.id !== task_id);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    fetchTasks(); // Refresh the UI
  }
}

async function migrateLocalStorageToSupabase(currentUser: User): Promise<boolean> {
  try {
    const localTasksString = localStorage.getItem('tasks');
    if (!localTasksString || !currentUser?.id) {
      return false; // Nothing to migrate
    }
    
    const localTasks: Task[] = JSON.parse(localTasksString);
    if (localTasks.length === 0) {
      return false; // No tasks to migrate
    }
    
    console.log(`Migrating ${localTasks.length} tasks from localStorage to Supabase...`);
    
    const tasksWithUserId = localTasks.map((task: Task) => ({
      task_name: task.task_name,
      time_worked: task.time_worked,
      user_id: currentUser.id,
      created_at: task.created_at || new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('tasks')
      .insert(tasksWithUserId);
    
    if (!error) {
      localStorage.removeItem('tasks');
      console.log('✅ Migration successful! Local tasks moved to your account.');
      return true;
    } else {
      console.error('❌ Migration failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}
  // Get session type color
  function getSessionColor(): string {
    switch (sessionType) {
      case SessionType.WORK:
        return "#007bff";
      case SessionType.BREAK:
        return "#28a745";
      case SessionType.LONG_BREAK:
        return "#17a2b8";
      default:
        return "#007bff";
    }
  }

  // ==================== SHARED COMPONENTS ====================
  
  const sessionHeader = (
    <div style={{...sessionHeaderStyle, color: getSessionColor()}}>
      {sessionType === SessionType.WORK ? "🍅 WORK SESSION" : 
       sessionType === SessionType.BREAK ? "☕ BREAK TIME" : 
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
    {/* Hidden honeypot input to confuse autofill */}
    <input
      style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
      type="text"
      name="username"
      autoComplete="username"
      tabIndex={-1}
      aria-hidden="true"
    />
    <input
      style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
      type="password"
      name="password"
      autoComplete="current-password"
      tabIndex={-1}
      aria-hidden="true"
    />
    
    <input 
      style={taskInputStyle}
      placeholder="Enter new task"
      value={inputValue} 
      onChange={(e) => {
        // Clear any autofilled value and use only user input
        if (e.target.value !== inputValue) {
          setInputValue(e.target.value);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Prevent default browser behavior
          e.stopPropagation(); // Prevent event from bubbling to global handler
          
          // Use the same logic as Start button: submit() then start()
          submit();
          start();
        }
      }}
      onInput={(e) => {
        // Additional protection against autofill
        const target = e.target as HTMLInputElement;
        if (target.value !== inputValue) {
          setInputValue(target.value);
        }
      }}
      
      // Comprehensive autofill prevention
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      
      // Unique identifiers that change frequently
      name={`task-field-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`}
      id={`task-field-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`}
      
      // Field type and input mode
      type="text"
      inputMode="text"
      enterKeyHint="go"
      
      // Prevent all major password managers and autofill systems
      data-lpignore="true"
      data-form-type="other"
      data-1p-ignore="true"
      data-bitwarden-ignore="true"
      data-dashlane-ignore="true"
      data-keeper-ignore="true"
      data-lastpass-ignore="true"
      
      // Browser-specific prevention
      data-chrome-autofill="false"
      data-firefox-autofill="false"
      data-safari-autofill="false"
      
      // React to autofill attempts
      onFocus={(e) => {
        const target = e.target as HTMLInputElement;
        
        // Clear any autofilled content on focus
        setTimeout(() => {
          if (target.value !== inputValue) {
            target.value = inputValue;
          }
        }, 10);
        
        // Style reset
        target.style.color = '#000';
        
        // Placeholder fix for Safari
        const placeholder = target.placeholder;
        target.placeholder = '';
        setTimeout(() => {
          target.placeholder = placeholder;
        }, 1);
      }}
      
      onBlur={(e) => {
        const target = e.target as HTMLInputElement;
        // Final check for autofill on blur
        setTimeout(() => {
          if (target.value !== inputValue) {
            target.value = inputValue;
          }
        }, 10);
        
        // Style reset
        if (!target.value) {
          target.style.color = '';
        }
      }}
      
      // Prevent browser from storing this field
      autoSave="off"
      aria-label="Task name input"
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
    {/* Login link on the left (only when not logged in) */}
    {!user && (
      <Link to="/login" style={{textDecoration: 'none'}}>
        <button style={secondaryButtonStyle}>
          Log in
        </button>
      </Link>
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
    {sessionType === SessionType.WORK && (timerState === "running" || timerState === "paused") ? (
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
        completedTasks.map((task) => (
        <div key={task.id} style={taskItemStyle}>
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

// Auth section removed - now using routing
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
          👋 Welcome back, <span style={{fontWeight: "bold", color: "#333"}}>{user.user_metadata?.name || user.email?.split('@')[0] || 'User'}</span>!
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
    
    {/* Keyboard shortcuts hints - only show on desktop */}
    {!isMobile && (
      <div style={{
        fontSize: "12px",
        color: "#999",
        textAlign: "center" as const,
        margin: "5px 0 20px 0",
        opacity: 0.7
      }}>
        {timerState === "stopped" ? (
          <div>
            Press <kbd style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #ccc",
              borderRadius: "3px",
              padding: "2px 6px",
              fontSize: "11px",
              fontFamily: "monospace"
            }}>Enter</kbd> to Start
          </div>
        ) : timerState === "running" ? (
          <div style={{display: "flex", flexDirection: "column" as const, gap: "8px"}}>
            <div>
              Press <kbd style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "3px",
                padding: "2px 6px",
                fontSize: "11px",
                fontFamily: "monospace"
              }}>Space</kbd> to Pause
            </div>
            {sessionType === SessionType.WORK && (
              <div>
                Press <kbd style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontFamily: "monospace"
                }}>Enter</kbd> to Finish
              </div>
            )}
          </div>
        ) : (
          <div style={{display: "flex", flexDirection: "column" as const, gap: "8px"}}>
            <div>
              Press <kbd style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "3px",
                padding: "2px 6px",
                fontSize: "11px",
                fontFamily: "monospace"
              }}>Space</kbd> to Resume
            </div>
            {sessionType === SessionType.WORK && (
              <div>
                Press <kbd style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontFamily: "monospace"
                }}>Enter</kbd> to Finish
              </div>
            )}
          </div>
        )}
      </div>
    )}
    
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Timer />} />
      </Routes>
    </Router>
  );
}

export default App;