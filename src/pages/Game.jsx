import React, { useState, useEffect, useRef, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { AudioEngine } from '../utils/AudioEngine';
import { GAME_CONFIG } from '../constants/textData';

export default function Game({ gameState, onFinish }) {
    const { currentMode, activeProfile } = useContext(GameContext);
    
    const [charIndex, setCharIndex] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [errorKeys, setErrorKeys] = useState({});
    
    const [timeLeft, setTimeLeft] = useState(gameState.initialTime);
    const [liveWpm, setLiveWpm] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [showCountdown, setShowCountdown] = useState(true);
    const [inputVal, setInputVal] = useState("");
    
    const inputRef = useRef(null);
    const timerRef = useRef(null);
    
    const textChars = gameState.text.split('');

    useEffect(() => {
        // Start countdown
        setShowCountdown(true);
        setCountdown(3);
        AudioEngine.countdownBeep();

        let count = 3;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                setCountdown(count);
                AudioEngine.countdownBeep();
            } else if (count === 0) {
                setCountdown("GO!");
                AudioEngine.countdownGo();
            } else {
                clearInterval(countdownInterval);
                setShowCountdown(false);
                if (inputRef.current) {
                    inputRef.current.disabled = false;
                    inputRef.current.focus();
                }
            }
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
            clearInterval(timerRef.current);
        };
    }, []);

    const focusInput = () => {
        if (!showCountdown && inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleInput = (e) => {
        if (showCountdown || timeLeft <= 0) return;

        const val = e.target.value;
        const i = charIndex;

        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleFinish('timeout');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        const char = val.split('')[i];

        if (char == null) {
            // Backspace
            if (i > 0) {
                setCharIndex(prev => prev - 1);
            }
        } else {
            if (textChars[i] === char) {
                AudioEngine.click();
            } else {
                AudioEngine.error();
                
                let badKey = textChars[i];
                setErrorKeys(prev => ({ ...prev, [badKey]: (prev[badKey] || 0) + 1 }));
                
                // Track in global active profile
                if (!activeProfile.lifetimeErrors[badKey]) {
                    activeProfile.lifetimeErrors[badKey] = 0;
                }
                activeProfile.lifetimeErrors[badKey]++;
                
                setMistakes(prev => prev + 1);
            }
            setCharIndex(prev => prev + 1);
        }
        setInputVal(val);
    };

    // Calculate live speed whenever time or index changes
    useEffect(() => {
        let safeTimeDivisor = (gameState.initialTime - timeLeft) || 1;
        let displayWPM = Math.round(((charIndex / 5) / (safeTimeDivisor / 60)) - mistakes);
        if (displayWPM < 0) displayWPM = 0;
        setLiveWpm(displayWPM);
    }, [timeLeft, charIndex, mistakes]);

    useEffect(() => {
        if (charIndex > 0 && charIndex === textChars.length) {
            clearInterval(timerRef.current);
            handleFinish('completed');
        }
    }, [charIndex]);

    const handleFinish = (reason) => {
        if (inputRef.current) inputRef.current.disabled = true;
        
        let displayWPM = liveWpm;
        let displayAcc = Math.round(((charIndex - mistakes) / (charIndex || 1)) * 100);
        
        onFinish(reason, displayWPM, displayAcc, errorKeys);
    };

    const handleAbort = () => {
        clearInterval(timerRef.current);
        onFinish('abort', 0, 0, {});
    };

    let speedAngle = -90 + (liveWpm * 1.8);
    if (speedAngle > 90) speedAngle = 90;

    return (
        <section className="flex-grow flex-col h-screen p-6 max-w-5xl mx-auto w-full relative z-10 flex">
            <div className="glass-card p-6 rounded-2xl mb-6 flex justify-between items-end border-b-4 border-blue-500">
                <div>
                    <p className="text-xs font-bold opacity-70">MISSION STATUS</p>
                    {gameState.isCustom ? (
                        <>
                            <div className="text-2xl font-bold">CUSTOM <span className='text-purple-400'>RACE</span></div>
                            <div className="text-xs text-blue-300 font-mono mt-1">Free Play</div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold">LEVEL <span>{gameState.level + 1}</span></div>
                            <div className="text-xs text-blue-300 font-mono mt-1">Task {gameState.sub + 1}/{GAME_CONFIG[currentMode]?.subLevels}</div>
                        </>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <div className="speedometer-wrapper">
                        <div className="speedometer-arc"></div>
                        <div className="speedometer-needle" style={{ transform: `rotate(${speedAngle}deg)` }}></div>
                        <div className="speedometer-center"></div>
                    </div>
                    <div className="text-xl font-bold mt-[-20px]"><span>{liveWpm}</span> WPM</div>
                </div>

                <div className="text-right">
                    <div className="text-4xl font-mono font-bold text-gray-300">{timeLeft}</div>
                    <div className="text-xs font-bold opacity-70">SEC</div>
                </div>
            </div>

            <div className="glass-card flex-grow rounded-2xl p-12 relative cursor-text shadow-2xl flex flex-col justify-center overflow-hidden" onClick={focusInput}>
                
                <input 
                    type="text" 
                    ref={inputRef}
                    className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default" 
                    autoComplete="off"
                    value={inputVal}
                    onChange={handleInput}
                    disabled={showCountdown}
                />

                <div id="text-display" className="select-none text-gray-300">
                    {textChars.map((c, index) => {
                        let className = "";
                        if (index < charIndex) {
                            className = inputVal[index] === c ? "char-correct" : "char-wrong";
                        } else if (index === charIndex) {
                            className = "char-active";
                        }
                        return <span key={index} className={className}>{c}</span>;
                    })}
                </div>

                <p className="absolute bottom-6 w-full left-0 text-center text-xs opacity-50 animate-pulse uppercase tracking-widest pointer-events-none">[ START TYPING ]</p>

                {showCountdown && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-md">
                        <div className="text-blue-400 font-bold tracking-[0.5em] mb-4">PREPARE TO RACE</div>
                        <div key={countdown} className="text-[12rem] font-bold text-white drop-shadow-[0_0_40px_rgba(59,130,246,1)] animate-pop">
                            {countdown}
                        </div>
                    </div>
                )}
            </div>

            <button onClick={handleAbort} className="absolute top-10 right-10 text-xs text-red-400 border border-red-900/50 px-4 py-2 rounded hover:bg-red-900 font-bold">
                ABORT
            </button>
        </section>
    );
}
