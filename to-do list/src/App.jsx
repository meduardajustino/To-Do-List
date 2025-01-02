import { React, useState, useEffect } from "react";
import Input from './components/input';
import Board from "./components/Board";
import Photo from './components/Photo.jsx';
import "./App.css";

function App() {
  const [taskList, setTaskList] = useState([]);
  const [time, setTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  
    // troca de fundo
    const [backgroundImage, setBackgroundImage] = useState("url('https://i.ibb.co/3TJQ4V1/wallpaper.jpg')");
    const backgrounds = [
      "url('https://i.ibb.co/3TJQ4V1/wallpaper.jpg')",
      "url('https://i.ibb.co/Ny5TBr3/photos.jpg')",
      "url('https://i.ibb.co/5FrWYcL/photos-1.jpg')",
      ""
    ];
  
    const changeBackground = (index) => {
      setBackgroundImage(backgrounds[index]);
    };
  
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
    console.log('Timer button');
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <>
        <div
          style={{
            backgroundImage: backgroundImage,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            transition: "background 0.5s ease-in-out",
          }}
          className="relative"
        >
          {/* Componente para troca de fundo */}
          <Photo
            backgrounds={backgrounds}
            onBackgroundChange={changeBackground}
          />

          {/* Relógio pm/am */}
          <div className="absolute top-4 right-4 text-white text-2xl font-semibold">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>

          <h1 className="text-6xl font-bold text-white">TO-DO LIST</h1>
          <h2 className="text-2xl font-medium text-pink-600">@iemstudies</h2>
          <Input taskList={taskList} setTaskList={setTaskList} />

          {/* To-Do List */}
          <div className="flex flex-col gap-2 mt-3 text-white items-center justify-center w-full h-auto">
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

      {/* YouTube Playlist */}  
      <div className="absolute top-3 left-3">
        <iframe
          width="250"
          height="140"
          src="https://www.youtube.com/embed/videoseries?si=arFtdU6K5g_2r1J3&amp;list=PLUAsoNWPBs1GO-JmZuztxoEmawqOYd-Df"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </div>

    </>
  );
}

export default App;