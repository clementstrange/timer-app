import React from 'react';
import {useState, useRef} from 'react';

function App() {
  const [count, setCount] = useState(60)
  const [task, setTask] = useState("")
  const [inputValue, setInputValue] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskRef = useRef("")
  const lastCallRef = useRef(0);

  function reset() {
      if (timerRef.current) {  
    clearInterval(timerRef.current);
  }
  timerRef.current = null;
  setCount(60);
}
  function start() {
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
        saveProgress(currentTaskRef.current, prev)
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
    setTask(inputValue)
    currentTaskRef.current = inputValue;
  }
  
  function saveProgress(currentTask:string,currentCount:number) {
    const now = Date.now();
    if (now - lastCallRef.current < 500) return; // Prevent calls within 500ms
    lastCallRef.current = now;
    console.log("saveProgress called with:", currentTask, currentCount);
    fetch("http://127.0.0.1:8000/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ task: currentTask, time: 60-currentCount })
    });
  }
  
    return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>{task}</h1>
      <input placeholder="Enter task" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <p></p>
      <button onClick={submit}>Submit task</button>
      <h1>{count}</h1>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export default App;
