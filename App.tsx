import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from './types';

// --- ICONS & STATIC COMPONENTS ---

const RightWingSVG = () => (
    <path d="M12.5 7.5a5.5 5.5 0 015.5 5.5v0a.5.5 0 01-1 0 4.5 4.5 0 00-4.5-4.5.5.5 0 010-1z" />
);

const LeftWingSVG = () => (
    <path d="M11.5 7.5a5.5 5.5 0 00-5.5 5.5v0a.5.5 0 001 0A4.5 4.5 0 0111.5 9a.5.5 0 000-1z" />
);

const FlyBodySVG = () => (
    <>
        <path d="M12 2a2 2 0 100 4 2 2 0 000-4z" />
        <path d="M12 15l-3 4h6l-3-4z" />
        <path fillRule="evenodd" d="M12.5 5.5a.5.5 0 00-1 0v11a.5.5 0 001 0v-11z" clipRule="evenodd" />
    </>
);

const FlySVG: React.FC<{ className?: string; flying: boolean }> = ({ className, flying }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <g className={flying ? 'animate-flap-right' : ''} style={{ transformOrigin: '12.5px 8px' }}>
                <RightWingSVG />
            </g>
            <g className={flying ? 'animate-flap-left' : ''} style={{ transformOrigin: '11.5px 8px' }}>
                <LeftWingSVG />
            </g>
            <FlyBodySVG />
        </svg>
    );
};

const BalloonSVG: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        viewBox="0 0 50 80" 
        className={className}
    >
        <g className="text-red-500/90 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" fill="currentColor">
            <path d="M25,5 C12.8,5 5,14.7 5,26 C5,37.3 12.8,47 25,47 C37.2,47 45,37.3 45,26 C45,14.7 37.2,5 25,5 Z" />
            <path d="M22,47 L28,47 L25,55 Z" />
        </g>
        <line x1="25" y1="55" x2="40" y2="70" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
    </svg>
);

const HumanFlyIcon: React.FC<{ crashed: boolean; flying: boolean }> = ({ crashed, flying }) => {
    const isActivelyFlying = flying && !crashed;
    const animationClass = isActivelyFlying ? 'animate-wobble' : '';

    return (
        <div className="relative w-28 h-28 md:w-36 md:h-36">
            {!crashed && flying && (
                <div className="absolute top-0 left-0">
                     <BalloonSVG className="w-12 h-16 md:w-16 md:h-20" />
                </div>
            )}
            <div className="absolute bottom-0 right-0">
                <FlySVG 
                    flying={isActivelyFlying}
                    className={`w-14 h-14 md:w-20 md:h-20 transition-all duration-300 ease-out transform ${animationClass} 
                    ${crashed
                        ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)] rotate-[135deg]'
                        : 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]'
                    } ${!isActivelyFlying && !crashed ? 'rotate-45' : ''}`
                } />
            </div>
        </div>
    );
};


const BackgroundParticles: React.FC = () => (
  <>
    <div className="absolute top-0 left-1/4 w-1 h-1 bg-cyan-200 rounded-full animate-float-up-1"></div>
    <div className="absolute top-0 left-2/3 w-1.5 h-1.5 bg-sky-200 rounded-full animate-float-up-2"></div>
    <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-200 rounded-full animate-float-up-3"></div>
    <div className="absolute top-0 left-3/4 w-0.5 h-0.5 bg-slate-300 rounded-full animate-float-up-1" style={{ animationDelay: '4s' }}></div>
  </>
);

const ProfileIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-400">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);

// --- REUSABLE COMPONENTS ---

type BetControlPanelProps = {
    id: string;
    bet: number;
    setBet: (value: number) => void;
    autoCashOut: number;
    setAutoCashOut: (value: number) => void;
    onCashOut: () => void;
    isCashedOut: boolean;
    winnings: number;
    gameState: GameState;
};

const BetControlPanel: React.FC<BetControlPanelProps> = ({ id, bet, setBet, onCashOut, isCashedOut, winnings, gameState, autoCashOut, setAutoCashOut }) => {
    const isIdle = gameState === GameState.IDLE;
    const isFlying = gameState === GameState.FLYING;
    const isCrashed = gameState === GameState.CRASHED;

    const handleBetChange = (amount: number) => {
        setBet(Math.max(0, bet + amount));
    };

    const hasBet = bet > 0;

    const renderAction = () => {
        if (hasBet) {
            if (isCashedOut) {
                return (
                    <button disabled className="w-full text-lg font-bold py-2 px-4 rounded-lg bg-green-700/80 cursor-not-allowed">
                        WON {winnings.toFixed(2)}
                    </button>
                );
            }
            if (isFlying) {
                return (
                    <button onClick={onCashOut} className="w-full text-lg font-bold py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-all duration-300 animate-pulse">
                        CASH OUT
                    </button>
                );
            }
            if (isCrashed) {
                return (
                    <button disabled className="w-full text-lg font-bold py-2 px-4 rounded-lg bg-red-800 opacity-70 cursor-not-allowed">
                        LOST {bet.toFixed(2)}
                    </button>
                );
            }
        }
        // Placeholder to prevent layout shift
        return <div className="h-[44px] w-full" />;
    };

    return (
        <div className="w-1/3 flex-grow bg-slate-800/50 rounded-lg p-3 flex flex-col items-center gap-2 border border-slate-700">
            <div className="flex items-center gap-2 w-full">
                <button onClick={() => handleBetChange(-10)} disabled={!isIdle} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-md font-bold text-sm">-</button>
                <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={!isIdle}
                    className="w-full bg-slate-900/50 border border-slate-600 text-center text-lg font-semibold rounded-md p-1.5 appearance-none disabled:opacity-50"
                />
                <button onClick={() => handleBetChange(10)} disabled={!isIdle} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-md font-bold text-sm">+</button>
            </div>

            <div className="w-full flex flex-col gap-1">
                <label htmlFor={`auto-cash-out-${id}`} className="text-xs text-slate-400 font-medium px-1">Auto Cash Out</label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">x</span>
                     <input
                        id={`auto-cash-out-${id}`}
                        type="number"
                        value={autoCashOut || ''}
                        onChange={(e) => setAutoCashOut(Math.max(0, parseFloat(e.target.value) || 0))}
                        disabled={!isIdle}
                        placeholder="2.0"
                        className="w-full bg-slate-900/50 border border-slate-600 text-center text-sm font-semibold rounded-md p-1.5 pl-8 appearance-none disabled:opacity-50"
                        step="0.1"
                        min="1.01"
                    />
                </div>
            </div>

            {renderAction()}
        </div>
    )
}

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [timeFlying, setTimeFlying] = useState<number>(0);
  const [balance, setBalance] = useState<number>(1000.00);
  const [message, setMessage] = useState<string>("Place one or two bets and start flying!");
  const [flyPosition, setFlyPosition] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  // State for bet 1
  const [bet1, setBet1] = useState<number>(10);
  const [autoCashOut1, setAutoCashOut1] = useState<number>(0);
  const [isBet1CashedOut, setIsBet1CashedOut] = useState<boolean>(false);
  const [winnings1, setWinnings1] = useState<number>(0);
  
  // State for bet 2
  const [bet2, setBet2] = useState<number>(0);
  const [autoCashOut2, setAutoCashOut2] = useState<number>(0);
  const [isBet2CashedOut, setIsBet2CashedOut] = useState<boolean>(false);
  const [winnings2, setWinnings2] = useState<number>(0);

  const gameLoopRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  const handleCashOut = useCallback((betId: 1 | 2): number => {
    if (gameState !== GameState.FLYING) return 0;

    let winnings = 0;
    if (betId === 1 && bet1 > 0 && !isBet1CashedOut) {
        winnings = bet1 * multiplier;
        setBalance(prev => prev + winnings);
        setIsBet1CashedOut(true);
        setWinnings1(winnings);
    } else if (betId === 2 && bet2 > 0 && !isBet2CashedOut) {
        winnings = bet2 * multiplier;
        setBalance(prev => prev + winnings);
        setIsBet2CashedOut(true);
        setWinnings2(winnings);
    }
    return winnings;
  }, [gameState, bet1, bet2, isBet1CashedOut, isBet2CashedOut, multiplier]);

  useEffect(() => {
    if (gameState !== GameState.FLYING) return;

    if (autoCashOut1 > 1 && !isBet1CashedOut && multiplier >= autoCashOut1) {
        const winnings = handleCashOut(1);
        if (winnings > 0) {
            setMessage(`Bet 1 auto-cashed out at ${autoCashOut1.toFixed(2)}x!`);
        }
    }
     if (autoCashOut2 > 1 && !isBet2CashedOut && multiplier >= autoCashOut2) {
        const winnings = handleCashOut(2);
         if (winnings > 0) {
            setMessage(`Bet 2 auto-cashed out at ${autoCashOut2.toFixed(2)}x!`);
        }
    }

  }, [multiplier, gameState, autoCashOut1, autoCashOut2, isBet1CashedOut, isBet2CashedOut, handleCashOut]);

  const handleStart = () => {
    const totalBet = bet1 + bet2;
    if (totalBet <= 0) {
        setMessage("You must place at least one bet.");
        return;
    }
    if (balance < totalBet) {
      setMessage("Not enough balance to place bet.");
      return;
    }

    setBalance(prev => prev - totalBet);
    setIsBet1CashedOut(false);
    setWinnings1(0);
    setIsBet2CashedOut(false);
    setWinnings2(0);
    
    setGameState(GameState.FLYING);
    setMultiplier(1.00);
    setTimeFlying(0);
    setFlyPosition(0);
    setMessage("Good luck!");
    
    const p = Math.random();
    crashPointRef.current = Math.max(1.01, Math.floor((1 / (1 - p)) * 100) / 100);
    startTimeRef.current = Date.now();

    gameLoopRef.current = setInterval(() => {
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      const currentMultiplier = parseFloat((1 + elapsedTime * 0.2 + Math.pow(elapsedTime, 1.5) * 0.05).toFixed(2));

      if (currentMultiplier >= crashPointRef.current) {
        setGameState(GameState.CRASHED);
        setMessage(`Crashed at ${crashPointRef.current.toFixed(2)}x!`);
        setMultiplier(crashPointRef.current);
        setHistory(prev => [crashPointRef.current, ...prev].slice(0, 20));
        stopGameLoop();
      } else {
        setMultiplier(currentMultiplier);
        setTimeFlying(elapsedTime);
        const visualMaxMultiplier = 15;
        const progressPercentage = Math.min(90, ((currentMultiplier - 1) / (visualMaxMultiplier - 1)) * 100);
        setFlyPosition(progressPercentage);
      }
    }, 50);
  };

  useEffect(() => {
    if (gameState === GameState.CRASHED) {
      const timer = setTimeout(() => {
        setGameState(GameState.IDLE);
        setMessage("Place your bet for the next round.");
        setFlyPosition(0);
        setMultiplier(1.00);
        setTimeFlying(0);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    return () => {
      stopGameLoop();
    };
  }, [stopGameLoop]);

  const isIdle = gameState === GameState.IDLE;
  const isFlying = gameState === GameState.FLYING;
  const isCrashed = gameState === GameState.CRASHED;

  const canStart = isIdle && (bet1 > 0 || bet2 > 0);

  const startOffset = 5;
  const flightPathEnd = 90;
  const travelDistance = flightPathEnd - startOffset;
  const progressRatio = travelDistance / flightPathEnd;
  const currentTop = startOffset + flyPosition * progressRatio;
  const currentLeft = startOffset + flyPosition * progressRatio;

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black p-4 text-sky-100 selection:bg-cyan-500/30">
        
      <header className="w-full max-w-4xl flex justify-between items-center p-4 bg-black/20 rounded-lg backdrop-blur-sm">
        <h1 className="text-xl md:text-3xl font-bold text-sky-300 tracking-wider">HUMAN FLY</h1>
        <div className="flex items-center gap-4">
            <div className="text-right">
            <span className="text-sm text-slate-400 block">Balance</span>
            <span className="text-lg md:text-2xl font-semibold tracking-wider">${balance.toFixed(2)}</span>
            </div>
            <ProfileIcon />
        </div>
      </header>
      
      <div className="w-full max-w-4xl flex justify-center items-center flex-wrap-reverse gap-1.5 p-2 my-2 bg-black/20 rounded-lg backdrop-blur-sm h-auto min-h-[40px]">
          {history.length > 0 ? history.map((m, index) => (
              <div 
                  key={index} 
                  className={`
                      px-2 py-0.5 rounded-full text-xs font-mono font-semibold border
                      ${m < 1.1 ? 'bg-red-900/40 border-red-700/50 text-red-300' :
                      m < 2 ? 'bg-slate-700/50 border-slate-600 text-slate-300' :
                      'bg-green-900/40 border-green-700/50 text-green-300'
                      }
                  `}
              >
                  {m.toFixed(2)}x
              </div>
          )) : (
              <p className="text-sm text-slate-500">Previous rounds will be shown here.</p>
          )}
      </div>

      <main className={`w-full max-w-xl aspect-square bg-black/30 rounded-2xl overflow-hidden relative border border-sky-500/20 flex items-center justify-center transition-all duration-500 ${isCrashed ? 'animate-red-flash' : ''}`}>
        <BackgroundParticles />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
        <div 
          className="absolute top-1/2 left-1/2 h-[142%] w-0.5 bg-gradient-to-t from-sky-500/50 via-sky-500/20 to-transparent"
          style={{ transform: 'translate(-50%, -50%) rotate(135deg)' }}
        ></div>

        <div className="z-10 text-center">
            <h2 className={`font-mono transition-colors duration-300 ${isCrashed ? 'text-red-400' : 'text-white'} text-6xl md:text-8xl font-bold tracking-tighter animate-pulse-glow`}>
                {multiplier.toFixed(2)}x
            </h2>
            <p className="text-slate-300 mt-2 font-mono">
                {timeFlying.toFixed(2)} seconds
            </p>
        </div>

        <div 
            className="absolute transition-all duration-200 ease-linear" 
            style={{ 
                top: `${currentTop}%`,
                left: `${currentLeft}%`,
                transform: 'translate(-50%, -50%)' 
            }}
        >
            <HumanFlyIcon crashed={isCrashed} flying={isFlying} />
        </div>
      </main>

      <footer className="w-full max-w-4xl flex flex-col items-center gap-4 p-4 bg-black/20 rounded-lg backdrop-blur-sm">
        <div className="text-center h-10">
          <p className={`transition-opacity duration-300 text-lg ${isCrashed ? 'text-red-400' : isFlying ? 'text-sky-300' : 'text-slate-200'}`}>{message}</p>
        </div>
        
        <div className="w-full flex justify-center items-start gap-2 md:gap-4">
            <BetControlPanel 
                id="1"
                bet={bet1}
                setBet={setBet1}
                autoCashOut={autoCashOut1}
                setAutoCashOut={setAutoCashOut1}
                onCashOut={() => {
                    const winnings = handleCashOut(1);
                    if (winnings > 0) {
                        setMessage(`Bet 1 cashed out for ${winnings.toFixed(2)}!`);
                    }
                }}
                isCashedOut={isBet1CashedOut}
                winnings={winnings1}
                gameState={gameState}
            />
            
            <div className="flex-shrink-0 pt-20">
                {isIdle && (
                    <button onClick={handleStart} disabled={!canStart} className="w-full text-xl font-bold py-3 px-6 rounded-lg bg-sky-600 hover:bg-sky-500 transition-all duration-300 shadow-[0_5px_30px_-5px_rgba(56,189,248,0.4)] hover:shadow-[0_8px_40px_-5px_rgba(56,189,248,0.6)] disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed">
                        START
                    </button>
                )}
                {isFlying && (
                    <div className="w-full text-center font-bold py-3 px-6 rounded-lg bg-slate-700/50 text-slate-400">
                        IN FLIGHT
                    </div>
                )}
                {isCrashed && (
                    <button disabled className="w-full text-xl font-bold py-3 px-6 rounded-lg bg-red-800 opacity-70 cursor-not-allowed">
                        CRASHED
                    </button>
                )}
            </div>

            <BetControlPanel 
                id="2"
                bet={bet2}
                setBet={setBet2}
                autoCashOut={autoCashOut2}
                setAutoCashOut={setAutoCashOut2}
                onCashOut={() => {
                    const winnings = handleCashOut(2);
                    if (winnings > 0) {
                        setMessage(`Bet 2 cashed out for ${winnings.toFixed(2)}!`);
                    }
                }}
                isCashedOut={isBet2CashedOut}
                winnings={winnings2}
                gameState={gameState}
            />
        </div>
      </footer>

    </div>
  );
};

export default App;