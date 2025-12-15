import { React, useState, useEffect } from "react";
import Input from './components/input';
import Board from "./components/Board";
import Photo from './components/Photo.jsx';
import Stats from './components/Stats.jsx';
import sino from './components/sounds/sino.mp3';
import "./App.css";

// ============ SETUP INDEXEDDB ============
const initDatabase = () => {
  return new Promise((resolve) => {
    const request = indexedDB.open('StudyTrackerDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
  });
};

const saveToIndexedDB = async (key, value) => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    store.put({ id: key, data: value });
  } catch (error) {
    console.error('IndexedDB error:', error);
  }
};

const getFromIndexedDB = async (key) => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data);
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return null;
  }
};

function App() {
  const getTasksFromLocalStorage = () => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  };

  const [taskList, setTaskList] = useState(getTasksFromLocalStorage());
  const [time, setTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // ============ NOVOS ESTADOS DE USUÁRIO ============
  const [userName, setUserName] = useState('');
  const [showUserSetup, setShowUserSetup] = useState(true);

  // ============ CARREGAR NOME DO INDEXEDDB ============
  useEffect(() => {
    const loadUserName = async () => {
      const savedName = await getFromIndexedDB('userName');
      if (savedName) {
        setUserName(savedName);
        setShowUserSetup(false);
      }
    };
    loadUserName();
  }, []);

  const [horasEstudadas, setHorasEstudadas] = useState({});
  // ============ CARREGAR HORAS DO INDEXEDDB ============
  useEffect(() => {
    const loadHoras = async () => {
      const savedHoras = await getFromIndexedDB('horasEstudadas');
      if (savedHoras) {
        setHorasEstudadas(savedHoras);
      }
    };
    loadHoras();
  }, []);
  
  const [estudoHoje, setEstudoHoje] = useState(() => {
    const hoje = new Date().toISOString().split('T');
    const saved = localStorage.getItem(`estudo_${hoje}`);
    return saved ? JSON.parse(saved) : { minutos: 0, ciclos: 0 };
  });
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(
    localStorage.getItem('ultimaAtualizacao') || new Date().toISOString().split('T')
  );
  const [showStats, setShowStats] = useState(false);

  // Troca de fundo
  const [backgroundImage, setBackgroundImage] = useState("url('https://i.ibb.co/QFrGgRHR/my-aura.jpg')");
  const backgrounds = [
    "url('https://i.ibb.co/QFrGgRHR/my-aura.jpg')",
    "url('https://i.ibb.co/Ny5TBr3/photos.jpg')",
    "url('https://i.ibb.co/5FrWYcL/photos-1.jpg')",
    "url('https://i.ibb.co/QQXK42b/c89312ee02d8daef1bb8b0804cbfdf2e-1.jpg')",
    "url('https://i.ibb.co/2NMVSWD/bub.jpg')",
    "url('https://i.ibb.co/mFq7CyTx/10-things.jpg')",
    "url('https://i.pinimg.com/1200x/f8/dc/7e/f8dc7e7256c8efea5e11ae30e966901b.jpg')",
  ];

  const changeBackground = (index) => {
    setBackgroundImage(backgrounds[index]);
  };

  const playSound = () => {
    const audio = new Audio(sino);
    audio.play();
  };

  // ============ FUNÇÕES DE USUÁRIO ============
  const handleSetUserName = (name) => {
    if (name.trim()) {
      localStorage.setItem('userName', name);
      saveToIndexedDB('userName', name);
      setUserName(name);
      setShowUserSetup(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('horasEstudadas');
    localStorage.removeItem('ultimaAtualizacao');
    setUserName('');
    setShowUserSetup(true);
    // Limpar também do IndexedDB
    try {
      const db = await initDatabase();
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      store.delete('userName');
      store.delete('horasEstudadas');
    } catch (error) {
      console.error('Erro ao limpar IndexedDB:', error);
    }
  };

  const registrarCicloEstudo = () => {
    if (!userName) return;
    const hoje = new Date().toISOString().split('T');
    const novoEstudo = {
      minutos: estudoHoje.minutos + 50,
      ciclos: estudoHoje.ciclos + 1
    };
    localStorage.setItem(`estudo_${hoje}`, JSON.stringify(novoEstudo));
    saveToIndexedDB(`estudo_${hoje}`, novoEstudo);
    setEstudoHoje(novoEstudo);
    const novasHoras = { ...horasEstudadas };
    if (!novasHoras[userName]) {
      novasHoras[userName] = {};
    }
    if (!novasHoras[userName][hoje]) {
      novasHoras[userName][hoje] = { minutos: 0, ciclos: 0 };
    }
    novasHoras[userName][hoje].minutos += 50;
    novasHoras[userName][hoje].ciclos += 1;
    localStorage.setItem('horasEstudadas', JSON.stringify(novasHoras));
    saveToIndexedDB('horasEstudadas', novasHoras);
    setHorasEstudadas(novasHoras);
  };

  // Funcionalidade do método pomodoro
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    if (ultimaAtualizacao !== hoje && userName) {
      localStorage.setItem(`estudo_${hoje}`, JSON.stringify({ minutos: 0, ciclos: 0 }));
      setEstudoHoje({ minutos: 0, ciclos: 0 });
      setUltimaAtualizacao(hoje);
      localStorage.setItem('ultimaAtualizacao', hoje);
    }
  }, [userName, ultimaAtualizacao]);

  // 50 minutos de foco e 10 de descanso
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === 0) {
            if (isOnBreak) {
              setIsOnBreak(false);
              playSoundThreeTimes();
              registrarCicloEstudo();
              return 50 * 60;
            } else {
              setIsOnBreak(true);
              playSound();
              playSound();
              return 10 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isOnBreak, userName]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(taskList));
  }, [taskList]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      playSound();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const playSoundThreeTimes = () => {
    playSound();
    setTimeout(() => playSound(), 250);
    setTimeout(() => playSound(), 500);
  };

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  const entrarEmTelaCheia = () => {
    let docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const sairDeTelaCheia = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  return (
    <>
      {/* Modal de Boas-vindas */}
      {showUserSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-35 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-80">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Bem-vinda! 💕</h2>
            <p className="text-gray-600 mb-6">Digite seu nome para começar a rastrear suas horas de estudo:</p>
            <input
              type="text"
              placeholder="Seu nome"
              className="border-2 border-pink-300 rounded-lg py-3 px-4 w-full mb-4 focus:outline-none focus:border-pink-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetUserName(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                handleSetUserName(input.value);
                input.value = '';
              }}
              className="bg-gradient-to-r from-pink-400 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold w-full hover:shadow-lg transition"
            >
              Começar a estudar
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          backgroundImage: backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          transition: "background 0.5s ease-in-out",
        }}
        className="relative flex flex-col justify-center items-center"
      >
        {/* Componente para troca de fundo */}
        <Photo
          backgrounds={backgrounds}
          onBackgroundChange={changeBackground}
        />
        
        {/* PAINEL FLUTUANTE DIREITO - Relógio + Stats */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          
          {/* Relógio pm/am - Sem fundo e sem bordas */}
          <div className="text-white text-2xl font-semibold text-center">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>

          {/* Botão Stats - Compacto, Expandível para Baixo com largura dinâmica */}
          {userName && (
            <div className={`transition-all duration-300 ${showStats ? 'w-[320px]' : 'w-[150px]'}`}>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                  showStats 
                    ? 'bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:shadow-lg'
                }`}
              >
                {showStats ? '▲ Stats' : '▼ Stats'}
              </button>

              {/* Painel Stats Expandível - Abre para Baixo */}
              {showStats && (
                <div className="mt-2 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-30 max-h-96 overflow-y-auto">
                  <Stats userName={userName} horasEstudadas={horasEstudadas} />
                </div>
              )}
            </div>
          )}

        </div>

        {/* PAINEL FLUTUANTE ESQUERDO */}
        <div className="absolute top-4 left-4 w-[170px] flex flex-col gap-3 z-10">
          {/* Card do usuário - Largura menor com opacidade de 20% */}
          {userName && (
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-white border border-white border-opacity-30">
              <h3 className="text-xl font-bold">{userName}</h3>
              <p className="text-sm mt-1">Hoje: <span className="font-semibold">{estudoHoje.minutos} min</span></p>
              <p className="text-sm">Ciclos: <span className="font-semibold">{estudoHoje.ciclos}</span></p>
              <p className="text-xs text-gray-300 mt-2">Total: {(estudoHoje.minutos / 60).toFixed(1)}h</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="text-xs bg-pink-400 px-3 py-1 rounded hover:bg-pink-600 transition"
                >
                  {showStats ? 'Ocultar' : 'Ver'} Stats
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-400 px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
        {/* YouTube Playlist - Posicionado abaixo do painel do usuário */}
        <div className="absolute top-40 left-4 w-[280px] z-10">
          <iframe
            width="280"
            height="158"
            src="https://www.youtube.com/embed/videoseries?si=arFtdU6K5g_2r1J3&amp;list=PLUAsoNWPBs1GO-JmZuztxoEmawqOYd-Df"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded-lg w-full"
          ></iframe>
        </div>

        {/* Spotify - Posicionado no canto inferior */}
        <div className="absolute bottom-4 left-4 w-[280px] z-10">
          <iframe 
            src="https://open.spotify.com/embed/playlist/2LmtPsNX1WQDhsD4DnPwkb?utm_source=generator&theme=0" 
            width="280" 
            height="152" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            className="rounded-lg w-full"
          ></iframe>
        </div>

        {/* Títulos Centralizados */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white">TO-DO LIST</h1>
          <h2 className="text-1xl font-medium text-pink-600">@iemstudies</h2>
        </div>
        
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
            className="bg-pink-400 hover:bg-pink-600 text-white text-lg font-semibold py-2 px-4 rounded-lg transition"
          >
            {isRunning ? 'Pause' : 'Start'} Timer
          </button>
          <div className="mt-2 text-white text-lg font-semibold">
            {isOnBreak ? '☕ Break' : 'Focus'}: {formatTime(secondsLeft)}
          </div>
        </div>
        <button
          onClick={isFullscreen ? sairDeTelaCheia : entrarEmTelaCheia}
          className="bg-pink-300 hover:bg-pink-400 text-white py-1 px-3 rounded absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-40"
        >
          {isFullscreen ? "Not Fullscreen" : "Fullscreen"}
        </button>
      </div>
    </>
  );
}

export default App;