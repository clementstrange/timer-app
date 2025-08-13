import React from 'react';
import { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './Login';

// Type declaration for webkit audio context
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

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
  border: "1px solid #e9ecef",
  marginBottom: "13px"
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
  width: "100%",
  marginTop: "11px"
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
  margin: "9px 0"
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
  // Global audio context to maintain across calls
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize audio context on first user interaction
  function initializeAudio() {
    if (audioContext) return;
    
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            setAudioContext(ctx);
          });
        } else {
          setAudioContext(ctx);
        }
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Bell-like tone with natural decay
  function playBellTone(frequency: number, duration: number) {
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      filterNode.type = 'lowpass';
      filterNode.frequency.value = frequency * 3;
      filterNode.Q.value = 2;
      
      const now = audioContext.currentTime;
      const totalDuration = duration / 1000;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);
      
      oscillator.start(now);
      oscillator.stop(now + totalDuration);
    } catch (error) {
      // Silent fail
    }
  }
  
  // Soft beep tone
  function playBeepTone(frequency: number, duration: number) {
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Use sine wave for softer sound
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // Add low-pass filter to make it gentler
      filterNode.type = 'lowpass';
      filterNode.frequency.value = frequency * 1.5;
      filterNode.Q.value = 0.5;
      
      const now = audioContext.currentTime;
      const totalDuration = duration / 1000;
      
      // Gentle envelope - much softer volume
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.05, now + totalDuration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + totalDuration);
      
      oscillator.start(now);
      oscillator.stop(now + totalDuration);
    } catch (error) {
      // Silent fail
    }
  }
  
  // Enhanced Web Audio function for natural-sounding tones
  function playWebAudioTone(frequency: number, duration: number, type: 'work' | 'break' | 'longbreak' = 'work') {
    if (!audioContext) return;
    
    try {      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      filterNode.type = 'lowpass';
      filterNode.frequency.value = frequency * 2;
      filterNode.Q.value = 1;
      
      const now = audioContext.currentTime;
      const attackTime = 0.1;
      const decayTime = duration/1000 - 0.2;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + attackTime);
      gainNode.gain.linearRampToValueAtTime(0.1, now + attackTime + decayTime);
      gainNode.gain.linearRampToValueAtTime(0, now + duration/1000);
      
      oscillator.start(now);
      oscillator.stop(now + duration/1000);
      
    } catch (error) {
      // Silent fail
    }
  }

  // Sound notification functions
  function playWorkEndSound() {
    // Bell sound: Ring three times with decay
    [0, 400, 800].forEach((delay) => {
      setTimeout(() => {
        playBellTone(523, 600 - (delay/10)); // C5 with decreasing duration
      }, delay);
    });
  }
  
  function playBreakEndSound() {
    // Simple beep: Three quick beeps
    [0, 200, 400].forEach((delay) => {
      setTimeout(() => {
        playBeepTone(880, 150); // A5 short beeps
      }, delay);
    });
  }
  
  function playLongBreakEndSound() {
    // Celebratory three-note ascending chord: C4 -> E4 -> G4 (major triad)
    const notes = [
      { freq: 262, delay: 0 },    // C4
      { freq: 330, delay: 200 },  // E4  
      { freq: 392, delay: 400 }   // G4
    ];
    
    notes.forEach(note => {
      setTimeout(() => {
        playWebAudioTone(note.freq, 800, 'longbreak');
      }, note.delay);
    });
  }

  function getSessionDuration(type: SessionType): number {
    switch (type) {
      case SessionType.WORK:
        return 6; // 6 seconds for testing
      case SessionType.BREAK:
        return 3; // 3 seconds for testing
      case SessionType.LONG_BREAK:
        return 4; // 4 seconds for testing
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

  // Stats dashboard state
  const [showStats, setShowStats] = useState(false);
  const [statsTimeframe, setStatsTimeframe] = useState<'today' | 'alltime'>('today');
  
  // Premium/Paywall state
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Handle All Time stats access
  const handleAllTimeClick = () => {
    if (isPremium) {
      setStatsTimeframe('alltime');
    } else {
      setShowPaywall(true);
    }
  };

  // Auth modal state removed - now using routing
  

  // #endregion

  // ==================== LIFECYCLE EFFECTS ====================
  
  React.useEffect(() => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    
    // Load premium status from profiles table
    if (currentUser?.id) {
      console.log('=== LOADING PREMIUM STATUS FROM DATABASE ===');
      const isPremiumUser = await loadPremiumStatus(currentUser.id);
      setIsPremium(isPremiumUser);
    } else {
      console.log('❌ No user, setting isPremium to FALSE');
      setIsPremium(false);
    }
    
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
    
    // Load premium status from profiles table
    if (newUser?.id) {
      console.log('=== AUTH STATE CHANGE - LOADING PREMIUM STATUS FROM DATABASE ===');
      const isPremiumUser = await loadPremiumStatus(newUser.id);
      setIsPremium(isPremiumUser);
    } else {
      console.log('❌ User logged out, setting isPremium to FALSE');
      setIsPremium(false); // Reset when logging out
    }
    
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
        // Play sound when work session ends naturally
        playWorkEndSound();
        
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
        // Play appropriate sound when break ends naturally
        if (sessionType === SessionType.LONG_BREAK) {
          playLongBreakEndSound();
        } else {
          playBreakEndSound();
        }
        
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
    
    // Initialize audio on first user interaction
    initializeAudio();
    
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

// Load user's premium status from Supabase profiles table
async function loadPremiumStatus(userId: string): Promise<boolean> {
  try {
    console.log('Loading premium status for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error loading premium status:', error);
      return false;
    }
    
    const isPremiumUser = data?.is_premium || false;
    console.log('Premium status loaded:', isPremiumUser);
    return isPremiumUser;
  } catch (error) {
    console.error('Error loading premium status:', error);
    return false;
  }
}

// Update user's premium status in Supabase profiles table
async function updatePremiumStatus(userId: string): Promise<boolean> {
  try {
    console.log('Attempting to update premium status for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        is_premium: true,
        premium_since: new Date().toISOString()
      })
      .select();
    
    console.log('Update response:', { data, error });
    
    if (error) {
      console.error('Error updating premium status:', error);
      return false;
    }
    
    console.log('Premium status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating premium status:', error);
    return false;
  }
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
      {sessionType === SessionType.WORK ? "WORK SESSION" : 
       sessionType === SessionType.BREAK ? "☕ BREAK TIME" : 
       "🏖️ LONG BREAK"}
    </div>
  );

  const pomodoroCounter = (
    <div style={sessionHeaderStyle}>
      {[...Array(4)].map((_, index) => (
        <span 
          key={index} 
          style={{ 
            opacity: index < completedPomos ? 1 : 0.3,
            fontSize: '1.05em',
            marginRight: '4px'
          }}
        >
          🍅
        </span>
      ))}
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

  // Stats calculation functions
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return completedTasks.filter(task => {
      const taskDate = new Date(task.created_at).toISOString().split('T')[0];
      return taskDate === today;
    });
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.created_at).toISOString().split('T')[0];
      return taskDate === today;
    });
    
    return calculateStats(todayTasks);
  };

  const getAllTimeStats = () => {
    return calculateStats(completedTasks);
  };

  // CSV Export functionality
  function exportToCSV() {
    const tasksToExport = statsTimeframe === 'today' ? getTodayTasks() : completedTasks;
    
    if (tasksToExport.length === 0) {
      alert('No tasks to export!');
      return;
    }

    // CSV headers with quotes for Excel compatibility
    const headers = ['"Task Name"', '"Time Worked (seconds)"', '"Time Worked (minutes)"', '"Session Date"', '"Session Start Time"', '"Session End Time"'];
    
    // Convert tasks to CSV rows
    const csvRows = tasksToExport.map(task => {
      const startTime = new Date(task.created_at);
      const endTime = new Date(startTime.getTime() + (task.time_worked * 1000));
      
      return [
        `"${task.task_name.replace(/"/g, '""')}"`, // Escape quotes for CSV
        task.time_worked, // seconds
        Math.round(task.time_worked / 60 * 100) / 100, // minutes with 2 decimal places
        `"${startTime.toLocaleDateString()}"`, // session date
        `"${startTime.toLocaleTimeString()}"`, // session start time only
        `"${endTime.toLocaleTimeString()}"` // session end time only
      ];
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\r\n'); // Use Windows line endings for better Excel compatibility
    
    // Add BOM for Excel UTF-8 recognition
    const csvWithBOM = '\uFEFF' + csvContent;
    
    // Create and download file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filename = `lifeinfocusexport-${statsTimeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const calculateStats = (tasks: Task[]) => {
    const totalTime = tasks.reduce((sum, task) => sum + task.time_worked, 0);
    
    // Group by task name (normalized - remove spaces, ignore case)
    const taskGroups: { [key: string]: { name: string; time: number } } = {};
    
    tasks.forEach(task => {
      const normalizedName = task.task_name.replace(/\s+/g, '').toLowerCase();
      if (taskGroups[normalizedName]) {
        taskGroups[normalizedName].time += task.time_worked;
      } else {
        taskGroups[normalizedName] = {
          name: task.task_name, // Keep original name for display
          time: task.time_worked
        };
      }
    });
    
    const taskTimeList = Object.values(taskGroups).sort((a, b) => b.time - a.time);
    
    return { totalTime, taskTimeList, totalPomodoros: completedPomos };
  };

  const taskList = (
    <div style={taskListStyle}>
      <div style={{display: "flex", gap: "10px", marginBottom: "15px"}}>
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: !showStats ? "#007bff" : "transparent",
            color: !showStats ? "white" : "#666",
            border: !showStats ? "none" : "1px solid #ddd",
            padding: "8px 16px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px"
          }}
          onClick={() => setShowStats(false)}
        >
          Recent Tasks
        </button>
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: showStats ? "#007bff" : "transparent",
            color: showStats ? "white" : "#666", 
            border: showStats ? "none" : "1px solid #ddd",
            padding: "8px 16px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px"
          }}
          onClick={() => setShowStats(true)}
        >
          Stats
        </button>
      </div>
      {showStats ? (
        // Stats view - require login
        !user ? (
          <div style={{
            textAlign: "center" as const,
            padding: "40px 20px",
            color: "#666"
          }}>
            <div style={{fontSize: "48px", marginBottom: "20px"}}>📊</div>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#333"
            }}>
              Please Log In to View Stats
            </h3>
            <p style={{
              fontSize: "16px",
              marginBottom: "24px",
              lineHeight: "1.5"
            }}>
              Create an account to track your productivity statistics and see detailed insights about your work sessions.
            </p>
            <Link to="/login" style={{textDecoration: 'none'}}>
              <button style={{
                ...primaryButtonStyle,
                padding: "12px 24px",
                fontSize: "16px"
              }}>
                Log In / Sign Up
              </button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Today/All Time toggle buttons */}
            <div style={{display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center"}}>
              <button 
                style={{
                  ...buttonStyle,
                  backgroundColor: statsTimeframe === 'today' ? "#007bff" : "#f8f9fa",
                  color: statsTimeframe === 'today' ? "white" : "#666",
                  padding: "8px 16px",
                  fontSize: "14px"
                }}
                onClick={() => setStatsTimeframe('today')}
              >
                Today
              </button>
              <button 
                style={{
                  ...buttonStyle,
                  backgroundColor: statsTimeframe === 'alltime' ? "#007bff" : "#f8f9fa", 
                  color: statsTimeframe === 'alltime' ? "white" : "#666",
                  padding: "8px 16px",
                  fontSize: "14px",
                  position: "relative"
                }}
                onClick={handleAllTimeClick}
              >
                All Time {!isPremium && '🔒'}
              </button>
            </div>

            {/* Export button */}
            <div style={{display: "flex", justifyContent: "center", marginBottom: "20px"}}>
              <button 
                style={{
                  ...buttonStyle,
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "8px 16px",
                  fontSize: "14px"
                }}
                onClick={exportToCSV}
              >
                📊 Export CSV
              </button>
            </div>

            {/* Stats content */}
            {(() => {
              const stats = statsTimeframe === 'today' ? getTodayStats() : getAllTimeStats();
              
              return (
                <div>
                  {/* Total sessions time and pomodoros */}
                  <div style={{
                    display: "flex", 
                    justifyContent: "space-around", 
                    alignItems: "center", 
                    marginBottom: "20px"
                  }}>
                    <div style={{textAlign: "center"}}>
                      <div style={{fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "5px"}}>
                        Total Sessions Time
                      </div>
                      <div style={{fontSize: "24px", color: "#007bff", fontWeight: "bold"}}>
                        {formatTime(stats.totalTime)}
                      </div>
                    </div>
                    <div style={{textAlign: "center"}}>
                      <div style={{fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "5px"}}>
                        Sessions Completed
                      </div>
                      <div style={{fontSize: "24px", color: "#28a745", fontWeight: "bold"}}>
                        {stats.totalPomodoros}
                      </div>
                    </div>
                  </div>

                  {/* Time per task */}
                  <div>
                    {stats.taskTimeList.length > 0 ? (
                      stats.taskTimeList.map((taskGroup, index) => (
                        <div key={index} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "6px",
                          marginBottom: "8px"
                        }}>
                          <div style={{fontWeight: "500", color: "#333"}}>
                            {taskGroup.name}
                          </div>
                          <div style={{color: "#007bff", fontWeight: "bold"}}>
                            {formatTime(taskGroup.time)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{textAlign: "center", color: "#666", padding: "20px"}}>
                        No tasks {statsTimeframe === 'today' ? 'today' : 'yet'}.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )
      ) : (
        // Tasks view
        <div>
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
      )}
    </div>
  );

  // ==================== PAYWALL MODAL ====================
  
  const paywallModal = showPaywall && (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        textAlign: "center" as const
      }}>
        <div style={{fontSize: "48px", marginBottom: "20px"}}>🔒</div>
        
        <h2 style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#333"
        }}>
          Premium Feature
        </h2>
        
        <p style={{
          fontSize: "16px",
          color: "#666",
          marginBottom: "24px",
          lineHeight: "1.5"
        }}>
          Access to All Time statistics is available with Premium. 
          Upgrade to see your complete productivity history and unlock advanced insights.
        </p>
        
        <div style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#007bff",
          marginBottom: "8px"
        }}>
          $1 Lifetime
        </div>
        
        <div style={{
          fontSize: "14px",
          color: "#999",
          marginBottom: "24px"
        }}>
          One-time payment • No subscription
        </div>
        
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap" as const
        }}>
          <button 
            style={{
              ...primaryButtonStyle,
              padding: "12px 24px",
              fontSize: "16px"
            }}
            onClick={async () => {
              if (user) {
                // Update premium status in Supabase
                const success = await updatePremiumStatus(user.id);
                if (success) {
                  setIsPremium(true);
                  setShowPaywall(false);
                  setStatsTimeframe('alltime');
                } else {
                  alert('Failed to upgrade. Please try again.');
                }
              } else {
                alert('Please log in first.');
              }
            }}
          >
            Upgrade to Premium
          </button>
          
          <button 
            style={{
              ...secondaryButtonStyle,
              padding: "12px 24px",
              fontSize: "16px"
            }}
            onClick={() => setShowPaywall(false)}
          >
            Maybe Later
          </button>
        </div>
        
        <div style={{
          marginTop: "20px",
          fontSize: "14px",
          color: "#999"
        }}>
          Premium includes unlimited history and export features.
        </div>
      </div>
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
      {paywallModal}
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
    {paywallModal}
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