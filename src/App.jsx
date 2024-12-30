import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import song from "./assets/song.mp4";

const useAudioPreload = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.src = song;
    audio.preload = "auto";
    audio.load();
    audioRef.current = audio;

    // Create buffer
    const context = new (window.AudioContext || window.webkitAudioContext)();
    fetch(song)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        audioRef.current.source = source;
      });

    return () => {
      if (audioRef.current?.source) {
        audioRef.current.source.stop();
      }
      context.close();
    };
  }, []);

  const play = () => {
    if (audioRef.current?.source) {
      audioRef.current.source.start(0);
    } else {
      audioRef.current?.play();
    }
  };

  return play;
};


const ParticleSystem = ({ mousePosition }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 6 + 2,
      color: [
        "bg-red-500",
        "bg-yellow-400",
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
      ][Math.floor(Math.random() * 5)],
    });

    setParticles(Array.from({ length: 50 }, createParticle));

    const updateParticles = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          let { x, y, vx, vy } = particle;

          // Move towards cursor when it's available
          if (mousePosition.x && mousePosition.y) {
            const dx = mousePosition.x - x;
            const dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
              vx += (dx / distance) * 0.5;
              vy += (dy / distance) * 0.5;
            }
          }

          x += vx;
          y += vy;

          // Bounce off walls
          if (x < 0 || x > window.innerWidth) vx *= -0.9;
          if (y < 0 || y > window.innerHeight) vy *= -0.9;

          return { ...particle, x, y, vx, vy };
        })
      );
    };

    const interval = setInterval(updateParticles, 16);
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${particle.color} transition-transform duration-75`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
};

const CursorEffect = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return (
    <div
      className="pointer-events-none fixed w-8 h-8 mix-blend-difference"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="absolute inset-0 bg-white rounded-full animate-ping" />
      <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
    </div>
  );
};


const useInstantAudio = (audioUrl) => {
  const audioRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.src = audioUrl;
    audio.preload = "auto";
    audio.load();
    
    const handleCanPlay = () => setIsReady(true);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.pause();
    };
  }, [audioUrl]);

  const play = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isReady) {
        await audioRef.current.play();
      } else {
        const tempAudio = new Audio(audioUrl);
        await tempAudio.play();
      }
    } catch (error) {
      console.error('Playback failed:', error);
    }
  };

  return play;
};

const NewYearScene = () => {
  const [started, setStarted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const play = useInstantAudio(song);

  const handleStart = () => {
    play();
    setStarted(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-black to-purple-900 overflow-hidden">
      <CursorEffect />
      <ParticleSystem mousePosition={mousePosition} />

      {!started ? (
        <button
          onClick={handleStart}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-white text-purple-900 px-6 py-3 rounded-lg shadow-lg 
                     hover:bg-purple-100 transition-colors z-50"
        >
          Start Celebration
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold text-white mb-8 animate-bounce">
            Happy New Year!
          </div>
          <div className="text-8xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text animate-pulse">
            2025
          </div>
        </div>
      )}
    </div>
  );
};



export default NewYearScene;
