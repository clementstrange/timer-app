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
  const [timerState, setTimerState] = useState("stopped") // "stopped", "running", "paused"
  React.useEffect(() => {
  fetchTasks();
}, []);
  
function reset() {
    saveWorkSession()
      if (timerRef.current) {  
    clearInterval(timerRef.current);
    
  }
  timerRef.current = null;
  fetchTasks();
  setTimerState("stopped")
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
    setTimerState("running")
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
  setTimerState("paused")
  }
 
  function submit() {
    saveWorkSession()
    setTask(inputValue)
    currentTaskRef.current = inputValue;
  }

  function deleteTask(task_id: number) {
    fetch(`http://127.0.0.1:8000/task/${task_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
    .then(() => fetchTasks());
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
  
    return (
 <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", padding: "20px", gap: "20px" }}>
   {/* Left side - Task entry and history */}
   <title>Ultimate Task Timer</title>
   <div style={{ flex: 0.4, display: "flex", flexDirection: "column", alignItems: "center" }}>
     <h3>Ultimate Task Timer</h3>
     
     <input placeholder="Enter new task" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
     <p></p>
     <button onClick={submit}>Submit task</button>
     
     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%", marginTop: "20px" }}>
       <h3>Completed Tasks</h3>
       {completedTasks.length > 0 ? (
         completedTasks.map((task, index) => (
             <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             {task.task_name}: {task.time_worked} seconds     
             <button onClick={() => deleteTask(task.task_id)}>Delete</button>
           </div>
         ))
       ) : (
         <div>No past tasks to display</div>
       )}
     </div>
   </div>

   {/* Right side - Timer and controls */}
   <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
     <h1>Active Task:</h1>
     <h1>{task ? task : "None"}</h1>
     <h1>{count}</h1>
     <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
       <button onClick = {()=>{
        if (timerState === "stopped"){
          start();
        } else if (timerState === "running"){
          pause();
        } else if (timerState === "paused"){
          start();
        }
      }}>
        {timerState === "stopped" ? "Start":
        timerState === "running" ? "Pause":
        "Resume"}
       </button>
       <button onClick={reset}>Reset</button>
     </div>
   </div>
 </div>
);
}

export default App;
