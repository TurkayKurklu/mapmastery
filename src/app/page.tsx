'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, ZoomIn, MapPin, Target, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VALORANT_MAPS: Record<string, string[]> = {
  'Abyss': [
    '/valorant/A-1.avif', '/valorant/A-2.avif', '/valorant/A-3.avif', 
    '/valorant/A-5.avif', '/valorant/A-6.avif', '/valorant/Abbys-1.PNG', 
    '/valorant/Abyss-2.PNG', '/valorant/Abyss-3.PNG', '/valorant/Abyss-4.PNG'
  ],
  'Ascent': [
    '/valorant/Ascend-1.avif', '/valorant/Ascend-2.avif', 
    '/valorant/Ascend-3.avif', '/valorant/Ascend-4.avif'
  ],
  'Bind': [
    '/valorant/BIND-1.avif', '/valorant/BIND-2.avif', 
    '/valorant/BIND-3.avif', '/valorant/BIND-4.avif'
  ],
  'Corrode': [
    '/valorant/C-1.avif', '/valorant/C-2.avif', '/valorant/C-3.avif', 
    '/valorant/C-4.avif', '/valorant/C-6.avif', '/valorant/c-5.avif',
    '/valorant/Corrode-1.PNG', '/valorant/Corrode-2.PNG', '/valorant/Corrode-3.PNG', 
    '/valorant/Corrode-4.PNG', '/valorant/Corrode-5.PNG', '/valorant/Corrode-6.PNG'
  ],
  'Fracture': [
    '/valorant/F-1.avif', '/valorant/F-2.avif', '/valorant/F-3.avif', 
    '/valorant/F-4.avif', '/valorant/F-5.avif'
  ],
  'Haven': [
    '/valorant/Haven-1.avif', '/valorant/Haven-2.avif', 
    '/valorant/Haven-3.avif', '/valorant/Haven-4.avif'
  ],
  'Icebox': [
    '/valorant/I-1.avif', '/valorant/I-2.avif', '/valorant/I-3.avif', 
    '/valorant/I-4.avif', '/valorant/I-5.avif'
  ],
  'Lotus': [
    '/valorant/L-1.avif', '/valorant/L-2.avif', '/valorant/L-3.avif'
  ],
  'Pearl': [
    '/valorant/P-1.avif', '/valorant/P-2.avif', '/valorant/P-3.avif', 
    '/valorant/P-4.avif'
  ],
  'Sunset': [
    '/valorant/S-1.avif', '/valorant/S-2.avif', '/valorant/S-3.avif', 
    '/valorant/S-4.avif', '/valorant/S-5.avif', '/valorant/S-6.avif'
  ],
  'Split': [
    '/valorant/Split-1.avif', '/valorant/Split-2.avif', 
    '/valorant/Split-3.avif', '/valorant/Split-4.avif'
  ]
};

const CS2_MAPS: Record<string, string[]> = {
  'Anubis': ['/counter-strike-2/Anubis.webp'],
  'Baggage': ['/counter-strike-2/Baggage.webp'],
  'Basalt': ['/counter-strike-2/Basalt.webp'],
  'Dust 2': ['/counter-strike-2/Dust-2.webp'],
  'Edin': ['/counter-strike-2/Edin.webp'],
  'Italy': ['/counter-strike-2/Italy.webp'],
  'Mirage': ['/counter-strike-2/Mirage.webp'],
  'Office': ['/counter-strike-2/Office.webp'],
  'Overpass': ['/counter-strike-2/Overpass.webp'],
  'Palais': ['/counter-strike-2/Palais.webp'],
  'Pool': ['/counter-strike-2/Pool.webp'],
  'Shoots': ['/counter-strike-2/Shoots.webp'],
  'Train': ['/counter-strike-2/Train.webp'],
  'Vertigo': ['/counter-strike-2/Vertigo.webp'],
  'Whistle': ['/counter-strike-2/Whistle.webp'],
  'Nuke': ['/counter-strike-2/nuke.webp'],
  'Inferno': ['/counter-strike-2/İnferno.webp']
};

type GameMode = 'VALORANT' | 'CS2';
type Screen = 'START' | 'SELECTION' | 'GAME' | 'RESULT';

export default function MapQuiz() {
  const [screen, setScreen] = useState<Screen>('START');
  const [gameMode, setGameMode] = useState<GameMode>('VALORANT');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(10);
  const [score, setScore] = useState(0);
  const [currentMap, setCurrentMap] = useState('');
  const [currentImagePath, setCurrentImagePath] = useState('');
  const [zoomLevel, setZoomLevel] = useState(10);
  const [focus, setFocus] = useState({ x: 50, y: 50 });
  const [options, setOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  const [mapQueue, setMapQueue] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  const getMapData = useCallback(() => {
    return gameMode === 'VALORANT' ? VALORANT_MAPS : CS2_MAPS;
  }, [gameMode]);

  const generateQuestion = useCallback(() => {
    const mapData = getMapData();
    
    let nextMap: string;
    let updatedQueue: string[];

    if (mapQueue.length > 0) {
      nextMap = mapQueue[0];
      updatedQueue = mapQueue.slice(1);
    } else {
      const allMaps = Object.keys(mapData).sort(() => Math.random() - 0.5);
      nextMap = allMaps[0];
      updatedQueue = allMaps.slice(1);
    }
    
    const images = mapData[nextMap];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
    setMapQueue(updatedQueue);
    setCurrentMap(nextMap);
    setCurrentImagePath(randomImage);
    setZoomLevel(10);
    setFocus({
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10
    });
    setAnswered(false);
    setWrongSelections([]);
    
    const mapNames = Object.keys(mapData);
    const newOptions = [nextMap];
    while (newOptions.length < 4) {
      const distractor = mapNames[Math.floor(Math.random() * mapNames.length)];
      if (!newOptions.includes(distractor)) {
        newOptions.push(distractor);
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [getMapData, mapQueue]);

  const startSelection = () => setScreen('SELECTION');

  const startGame = (mode: GameMode) => {
    const mapData = mode === 'VALORANT' ? VALORANT_MAPS : CS2_MAPS;
    const shuffledMaps = Object.keys(mapData).sort(() => Math.random() - 0.5);
    
    setGameMode(mode);
    setScore(0);
    setCurrentStep(1);
    setMapQueue(shuffledMaps);
    setScreen('GAME');
  };

  // Re-generate question when gameMode changes and screen is GAME
  useEffect(() => {
    if (screen === 'GAME' && currentStep === 1 && !currentMap) {
      generateQuestion();
    }
  }, [gameMode, screen, currentStep, currentMap, generateQuestion]);

  const handleAnswer = (selected: string) => {
    if (answered || wrongSelections.includes(selected)) return;

    if (selected === currentMap) {
      setAnswered(true);
      const points = 11 - (zoomLevel / 10);
      setScore(prev => prev + points);
      setZoomLevel(100);
      
      setTimeout(() => {
        if (currentStep < totalSteps) {
          setCurrentStep(prev => prev + 1);
          generateQuestion();
        } else {
          setScreen('RESULT');
        }
      }, 1500);
    } else {
      setWrongSelections(prev => [...prev, selected]);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      if (zoomLevel < 100) {
        setZoomLevel(prev => prev + 10);
      } else {
        setAnswered(true);
        setTimeout(() => {
          if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
            generateQuestion();
          } else {
            setScreen('RESULT');
          }
        }, 1200);
      }
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-transparent p-4 overflow-hidden valorant-font">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-valorant-red)_0%,_transparent_70%)] opacity-5" />
      </div>

      <AnimatePresence mode="wait">
        {screen === 'START' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex w-full max-w-md flex-col items-center gap-8"
          >
            <div className="text-center">
              <h1 className="text-6xl font-black tracking-tighter text-valorant-light drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                MAPMASTERY
              </h1>
            </div>

            <div className="glass w-full rounded-2xl p-6 text-center space-y-2">
              <p className="text-valorant-light/80 font-semibold text-xs uppercase tracking-wider">
                Sahaya İniş Öncesi Son Kontrol: Konum Bilgisi Analizi
              </p>
              <p className="text-valorant-light/80 font-semibold">10 Soru • Maksimum Odak</p>
            </div>

            <button
              onClick={startSelection}
              className="group relative w-full overflow-hidden rounded bg-valorant-red px-12 py-4 text-xl font-black tracking-widest text-white shadow-[0_0_20px_rgba(255,70,85,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">BAŞLA</span>
              <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-0" />
            </button>
          </motion.div>
        )}

        {screen === 'SELECTION' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex w-full max-w-2xl flex-col items-center gap-10"
          >
            <h2 className="text-3xl font-black text-valorant-light tracking-wide uppercase">OYUN SEÇİN</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Valorant Option */}
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 70, 85, 0.5)' }}
                whileTap={{ scale: 0.95, backgroundColor: 'rgba(255, 70, 85, 0.1)' }}
                onClick={() => startGame('VALORANT')}
                className="relative aspect-[4/3] md:aspect-video flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-valorant-light/10 bg-valorant-light/5 transition-all group overflow-hidden p-8"
              >
                <div className="absolute inset-0 bg-valorant-red/[0.03] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <img 
                    src="/valorant.png" 
                    alt="Valorant" 
                    className="h-24 md:h-32 w-auto object-contain transition-transform group-hover:scale-110" 
                  />
                  <span className="text-lg md:text-xl font-bold text-valorant-light tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">VALORANT</span>
                </div>
                {/* Mobile Active State Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-valorant-red/10 opacity-0 pointer-events-none"
                  whileTap={{ opacity: 1 }}
                />
              </motion.button>

              {/* CS2 Option */}
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.95, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => startGame('CS2')}
                className="relative aspect-[4/3] md:aspect-video flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-valorant-light/10 bg-valorant-light/5 transition-all group overflow-hidden p-8"
              >
                <div className="absolute inset-0 bg-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <img 
                    src="/cs-logo.webp" 
                    alt="CS2" 
                    className="h-24 md:h-32 w-auto object-contain transition-transform group-hover:scale-110" 
                  />
                  <span className="text-lg md:text-xl font-bold text-valorant-light tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">CS2</span>
                </div>
                {/* Mobile Active State Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-blue-500/10 opacity-0 pointer-events-none"
                  whileTap={{ opacity: 1 }}
                />
              </motion.button>
            </div>
          </motion.div>
        )}

        {screen === 'GAME' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex h-full w-full max-w-md flex-col gap-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold">
                  <Trophy size={18} />
                  <span className="text-lg font-black">{score}</span>
                </div>
                <div className="text-valorant-light/70 font-bold uppercase tracking-wider text-sm">
                  {gameMode} • Aşama {currentStep} / {totalSteps}
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-valorant-grey">
                <motion.div
                  className={cn("h-full", gameMode === 'VALORANT' ? 'bg-valorant-red' : 'bg-blue-500')}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <motion.div
              animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
              className="glass relative aspect-video w-full overflow-hidden rounded-xl border-2 border-valorant-light/10 p-1"
            >
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-black scanline">
                <motion.div
                  key={currentImagePath}
                  className="h-full w-full bg-no-repeat"
                  initial={{
                    backgroundSize: `${100 / (10 / 100)}%`,
                    backgroundPosition: `${focus.x}% ${focus.y}%`,
                  }}
                  animate={{
                    backgroundSize: `${100 / (zoomLevel / 100)}%`,
                    backgroundPosition: `${focus.x}% ${focus.y}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    backgroundImage: `url('${currentImagePath}')`,
                  }}
                />
                
                <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-[10px] font-black tracking-tighter text-gold flex items-center gap-1 backdrop-blur-sm border border-gold/20">
                  <ZoomIn size={10} />
                  ZOOM: %{zoomLevel}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((option) => {
                const isWrong = wrongSelections.includes(option);
                const isCorrect = answered && option === currentMap;
                
                return (
                  <button
                    key={option}
                    disabled={answered || isWrong}
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      "glass relative flex h-20 items-center justify-center rounded-xl p-4 text-center font-bold transition-all active:scale-95",
                      isCorrect && "bg-green-500/80 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]",
                      isWrong && "bg-valorant-red/80 border-valorant-red text-white opacity-50 grayscale-[0.5]",
                      !isCorrect && !isWrong && "hover:bg-valorant-light/10 hover:border-valorant-light/20"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Instruction removed as per user request */}
          </motion.div>
        )}

        {screen === 'RESULT' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex w-full max-w-md flex-col items-center gap-8 text-center"
          >
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-valorant-light tracking-tighter">GÖREV TAMAMLANDI</h1>
              <p className="text-gold font-bold tracking-[0.3em]">{gameMode} OPERASYON RAPORU</p>
            </div>

            <div className="glass w-full rounded-2xl p-10 py-12 flex flex-col items-center gap-2">
              <span className="text-valorant-light/60 text-sm font-bold tracking-widest uppercase">Toplam Skor</span>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-8xl font-black text-valorant-red"
              >
                {score}
              </motion.span>
              {/* Map Master text removed as per user request */}
            </div>

            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => setScreen('SELECTION')}
                className="flex items-center gap-3 rounded bg-valorant-grey border border-valorant-light/10 px-10 py-4 text-lg font-bold text-valorant-light hover:bg-valorant-light/5 transition-colors active:scale-95"
              >
                <RefreshCw size={20} />
                BAŞKA OYUN SEÇ
              </button>
              
              <button
                onClick={() => setScreen('START')}
                className="text-valorant-light/40 hover:text-valorant-light transition-colors font-bold text-sm uppercase tracking-widest p-2"
              >
                ANA MENÜYE DÖN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
