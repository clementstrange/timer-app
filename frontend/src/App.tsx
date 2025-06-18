import React from 'react';
import {useState, useRef} from 'react';

function App() {
  const [count, setCount] = useState(60)
  const [task, setTask] = useState("")
  const [inputValue, setInputValue] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskRef = useRef("")
  const hasStartedRef = useRef(false);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  React.useEffect(() => {
  fetchTasks();
}, []);
  
function reset() {
    saveWorkSession()
      if (timerRef.current) {  
    clearInterval(timerRef.current);
    
  }
  timerRef.current = null;
  setCount(60);
}
  
  function saveWorkSession() {
    const timeWorked = 60 - count;
    const taskName = currentTaskRef.current;
    
    if (taskName && hasStartedRef.current && timeWorked > 0) {
      fetch("http://127.0.0.1:8000/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskName, time: timeWorked })
      });
      hasStartedRef.current = false;
  }
}

  function start() {
    hasStartedRef.current = true;
    console.log("Starting timer")
    if (timerRef.current) {
    clearInterval(timerRef.current);
  }
    timerRef.current = setInterval (() => {
      setCount(prev => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev-1;
      });
    }, 1000);
  };
  
  function pause() {
     if (timerRef.current) {  
    clearInterval(timerRef.current);
  }
  timerRef.current = null;
  }
 
  function submit() {
    saveWorkSession()
    setTask(inputValue)
    currentTaskRef.current = inputValue;
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
  
  // function saveProgress(currentTask:string,currentCount:number) {
  //   const now = Date.now();
  //   if (now - lastCallRef.current < 500) return; // Prevent calls within 500ms
  //   lastCallRef.current = now;
  //   console.log("saveProgress called with:", currentTask, currentCount);
  //   fetch("http://127.0.0.1:8000/task", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({ task: currentTask, time: 60-currentCount })
  //   });
  // }
  
    return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h3>Ultimate Task Timer</h3>
      <h3>Active Task:</h3>
      <h1>{task ? task : "None"}</h1>
      <input placeholder="Enter new task" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <p></p>
      <button onClick={submit}>Submit task</button>
      <h1>Timer</h1>
      <h1>{count}</h1>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={reset}>Reset</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
        <h3>Completed Tasks</h3>
        {completedTasks.length > 0 ? (
          completedTasks.map((task, index) => (
        <div key={index}>
          {task.task_name}: {task.time_worked} seconds
        </div>
          ))
        ) : (
          <div>No past tasks to display</div>
        )}
      </div>
  
    </div>
  );
}

export default App;
