import { React, useState, useEffect } from "react";
import Input from './components/input';
import Board from "./components/Board";

function App() {
  const [taskList, setTaskList] = useState([]);
  const [time, setTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Funcionalidade do método pomodoro
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 50 minutos de foco e 10 de descanso
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === 0) {
            if (isOnBreak) {
              // fim da pausa, iniciar novo ciclo
              setIsOnBreak(false);
              return 50 * 60; // volta ao ciclo
            } else {
              // ciclo termina, iniciar descanso
              setIsOnBreak(true);
              return 10 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isOnBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-8 gap-4 bg-[url('https://i.ibb.co/3TJQ4V1/wallpaper.jpg')] bg-cover bg-center min-h-screen relative">
        {/* Relógio pm/am */}
        <div className="absolute top-4 right-4 text-white text-2xl font-semibold">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>

        <h1 className="text-5xl font-bold text-white">TO-DO LIST</h1>
        <h2 className="text-xl font-medium text-pink-600">@iemstudies</h2>
        <Input taskList={taskList} setTaskList={setTaskList} />

        {/* To-Do List */}
        <div className="flex flex-col gap-2 mt-3 text-white items-center w-full">
          {taskList.map((task, index) => (
            <Board
              key={index}
              task={task}
              index={index}
              taskList={taskList}
              setTaskList={setTaskList}
            />
          ))}
        </div>

        {/* Botão do método pomodoro */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={toggleTimer}
            className="bg-pink-400 hover:bg-pink-600 text-white text-lg font-semibold py-2 px-4 rounded-lg"
          >
            {isRunning ? 'Pause' : 'Start'} Timer
          </button>
          <div className="mt-2 text-white text-lg">
            {isOnBreak ? 'Break' : 'Focus'}: {formatTime(secondsLeft)}
          </div>
        </div>

        {/* Spotify com sons lofi para melhorar os estudos */}
        <div className="absolute bottom-3 left-3">
          <iframe 
            src="https://open.spotify.com/embed/playlist/2LmtPsNX1WQDhsD4DnPwkb?utm_source=generator&theme=0" 
            width="93%" 
            height="152" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default App;