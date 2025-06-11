import React from 'react';
import {useState, useRef} from 'react';

function App() {
  const [count, setCount] = useState(60)
  const [task, setTask] = useState("")
  const [inputValue, setInputValue] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function reset() {
      if (timerRef.current) {  
    clearInterval(timerRef.current);
  }
  timerRef.current = null;
  setCount(60);
}
  function start() {

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
    setTask(inputValue)
  }
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <h1>{task}</h1>
    <input placeholder = "Enter task" value = {inputValue} onChange={(e)=>setInputValue(e.target.value)}></input>
    <p></p>
    <button onClick={submit}>Submit task</button>
    <h1>{count}</h1>
    <button onClick={start}>Start</button>
    <button onClick={pause}>Pause</button>
    <button onClick={reset}>Reset</button>
    
    </div>
  );
}

export default App;
