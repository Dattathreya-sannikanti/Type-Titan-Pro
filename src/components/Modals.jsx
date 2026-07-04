import React, { useContext, useState } from 'react';
import { GameContext } from '../contexts/GameContext';
import { LeaderboardSystem } from '../utils/LeaderboardSystem';

export function LevelPreviewModal({ previewLevel, closePreview, startGame, viewLeaderboard }) {
    const { currentMode, activeProfile } = useContext(GameContext);
    
    if (!previewLevel) return null;
    
    const { level, sub, maxSub } = previewLevel;
    const playerStats = activeProfile.progress[currentMode];
    
    const isCompleted = level < playerStats.level || (level === playerStats.level && sub < playerStats.sub);

    const changePreviewSub = (directionValue) => {
        let newSubIndex = sub + directionValue;
        if (newSubIndex < 0) newSubIndex = maxSub - 1;
        if (newSubIndex >= maxSub) newSubIndex = 0;
        
        if (level === playerStats.level && newSubIndex > playerStats.sub) {
            newSubIndex = playerStats.sub;
        }
        
        previewLevel.setSub(newSubIndex);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
            <div className="glass-card p-8 rounded-2xl w-full max-w-sm text-center border-t-4 border-blue-500">
                <p className="text-xs text-blue-400 font-bold tracking-widest mb-1">{currentMode.toUpperCase()} PROTOCOL</p>
                <h2 className="text-4xl font-bold mb-6 text-white">LEVEL {level + 1}</h2>

                <div className="flex justify-between items-center mb-6 bg-black/50 rounded-lg p-2 border border-white/10">
                    <button onClick={() => changePreviewSub(-1)} className="px-4 py-2 hover:bg-white hover:text-black rounded transition font-bold text-xl">&lt;</button>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold font-mono text-gray-300">TASK {sub + 1}/{maxSub}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: isCompleted ? 'var(--success-green)' : 'var(--primary-blue)' }}>
                            {isCompleted ? 'COMPLETED' : 'UNLOCKED (NEXT)'}
                        </span>
                    </div>
                    <button onClick={() => changePreviewSub(1)} className="px-4 py-2 hover:bg-white hover:text-black rounded transition font-bold text-xl">&gt;</button>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={() => startGame(level, sub)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white shadow-lg transition flex justify-center items-center gap-2">
                        ▶️ START MISSION
                    </button>
                    <button onClick={() => viewLeaderboard(level, sub)} className="w-full py-3 bg-yellow-600/20 text-yellow-500 border border-yellow-600 hover:bg-yellow-600 hover:text-white rounded font-bold transition flex justify-center items-center gap-2">
                        🏆 VIEW LEADERBOARD
                    </button>
                    <button onClick={closePreview} className="w-full py-3 border border-gray-500 hover:bg-white hover:text-black rounded font-bold text-gray-300 transition mt-2">
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CustomSetupModal({ closeSetup, startCustomRace }) {
    const [text, setText] = useState("");
    const [timeLimit, setTimeLimit] = useState(60);

    const handleStart = () => {
        if (!text.trim()) {
            alert("Please enter text.");
            return;
        }
        startCustomRace(text, timeLimit);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
            <div className="glass-card p-8 rounded-2xl w-full max-w-lg border-t-4 border-purple-500">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🛠️ CREATE CUSTOM RACE</h2>

                <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400">YOUR TEXT PARAGRAPH</label>
                    <textarea 
                        className="custom-input h-32 mt-1 resize-none text-sm font-mono" 
                        placeholder="Paste the text you want to practice here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                </div>

                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-400">TIME LIMIT (SECONDS)</label>
                    <input 
                        type="number" 
                        className="custom-input mt-1" 
                        value={timeLimit} 
                        min="10" max="300" 
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                    />
                </div>

                <div className="flex gap-4">
                    <button onClick={closeSetup} className="w-1/2 py-3 border border-gray-600 hover:bg-gray-800 rounded font-bold transition">
                        CANCEL
                    </button>
                    <button onClick={handleStart} className="w-1/2 py-3 bg-purple-600 hover:bg-purple-500 rounded font-bold shadow-lg transition">
                        START RACE
                    </button>
                </div>
            </div>
        </div>
    );
}

export function SuccessModal({ result, nextLevel, exitMap, viewLeaderboard, retryParagraph }) {
    const { wpm, acc, weakKeys, reason, isCustom } = result;

    const isFail = reason === 'timeout' || acc < 75;
    const titleColor = isFail ? "var(--error-red)" : "white";
    const subtitleColor = isFail ? "var(--error-red)" : "var(--success-green)";
    const borderColor = isFail ? "border-red-500" : "border-green-500";
    
    let title = "SUCCESS";
    let subtitle = "TASK CLEARED";
    
    if (isFail) {
        if (reason === 'timeout') {
            title = "TIME UP!";
            subtitle = "MISSION FAILED: OUT OF TIME";
        } else {
            title = "MISSION FAILED";
            subtitle = "MINIMUM ACCURACY 75% REQUIRED";
        }
    } else if (isCustom) {
        title = "RACE COMPLETE";
        subtitle = "CUSTOM DATA CLEARED";
    }

    let weakestKeyString = "None";
    let maxMisses = 0;
    for (let key in weakKeys) {
        if (weakKeys[key] > maxMisses) {
            maxMisses = weakKeys[key];
            weakestKeyString = key === " " ? "Spacebar" : key;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
            <div className={`glass-card p-10 rounded-2xl text-center max-w-sm w-full border-t-4 ${borderColor}`}>
                <h2 className="text-4xl font-bold mb-2" style={{ color: titleColor }}>{title}</h2>
                <p className="text-xs font-bold tracking-widest mb-6" style={{ color: subtitleColor }}>{subtitle}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/80 p-4 rounded border border-white/10">
                        <div className="text-3xl font-bold text-white">{wpm}</div>
                        <div className="text-xs text-gray-400 font-bold">SPEED</div>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded border border-white/10">
                        <div className="text-3xl font-bold text-green-400">{acc}%</div>
                        <div className="text-xs text-gray-400 font-bold">ACCURACY</div>
                    </div>
                </div>

                <div className="bg-black/50 p-3 rounded mb-6 text-left border-l-2 border-red-500">
                    <p className="text-xs text-gray-400 font-bold">⚠️ WEAK KEYS DETECTED:</p>
                    <p className="text-white font-mono text-sm mt-1">{weakestKeyString}</p>
                </div>

                <div className="flex flex-col gap-3">
                    {!isCustom && (
                        <button onClick={viewLeaderboard} className="w-full py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600 hover:bg-yellow-600 hover:text-white rounded font-bold text-sm transition flex justify-center items-center gap-2">
                            🏆 VIEW LEADERBOARD
                        </button>
                    )}
                    <button onClick={isFail ? nextLevel : (isCustom ? retryParagraph : nextLevel)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white shadow-lg transition">
                        {isFail ? "RETRY" : (isCustom ? "RETRY PARAGRAPH" : "CONTINUE")}
                    </button>
                    <button onClick={exitMap} className="w-full py-3 border border-gray-500 hover:bg-white hover:text-black rounded font-bold text-gray-300 transition">
                        {isCustom ? "RETURN TO DASHBOARD" : "EXIT TO MAP"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function LeaderboardModal({ closeLeaderboard, mode, level, sub }) {
    const scores = LeaderboardSystem.getScores(mode, level, sub);

    return (
        <div className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center">
            <div className="glass-card p-8 rounded-2xl w-full max-w-md border-t-4 border-yellow-500 relative">
                <h2 className="text-2xl font-bold mb-1 text-yellow-500 flex items-center gap-2">🏆 TOP OPERATIVES</h2>
                <p className="text-xs text-gray-400 mb-6 font-mono">PROTOCOL: {mode?.toUpperCase()} | LVL {level + 1} | TSK {sub + 1}</p>

                <div className="space-y-2 mb-6 min-h-[150px]">
                    {scores.length === 0 ? (
                        <p className='text-center text-gray-400 mt-10 text-sm'>No records yet.</p>
                    ) : (
                        scores.map((score, index) => {
                            let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖️';
                            return (
                                <div key={index} className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/10">
                                    <div className="font-bold flex items-center gap-2">{medal} {score.user.toUpperCase()}</div>
                                    <div className="text-right font-mono">
                                        <span className="text-blue-400 font-bold">{score.wpm} WPM</span>
                                        <span className="text-xs text-gray-500 block">{score.acc}% ACC</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <button onClick={closeLeaderboard} className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-white transition">
                    CLOSE LEADERBOARD
                </button>
            </div>
        </div>
    );
}

export function CertificateModal({ certificateData, closeCertificate }) {
    if (!certificateData) return null;
    const { name, wpm, acc, id, date, isSyntax } = certificateData;

    return (
        <div className="fixed inset-0 bg-black/95 z-[120] flex items-center justify-center flex-col">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-50">
                <div className="w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse" style={{ backgroundColor: isSyntax ? 'var(--primary-blue)' : '#eab308' }}></div>
            </div>

            <div className="glass-card p-12 rounded-lg w-full max-w-2xl border-4 bg-white/10 text-center relative z-10 animate-pop" style={{ borderColor: isSyntax ? 'var(--primary-blue)' : '#eab308' }}>
                <div className="text-6xl mb-4">{isSyntax ? "💻" : "🎖️"}</div>
                <h4 className="font-mono tracking-[0.3em] uppercase text-sm mb-2" style={{ color: '#94a3b8' }}>
                    {isSyntax ? "Engineering Dept." : "TypeTitan Authority"}
                </h4>
                <h1 className="text-5xl font-extrabold mb-8 border-b border-gray-500 pb-6" style={{ color: isSyntax ? 'var(--primary-blue)' : '#eab308' }}>
                    {isSyntax ? "SYNTAX MASTER" : "BASELINE MASTERY"}
                </h1>

                <p className="text-gray-400 text-lg mb-2">This certifies that</p>
                <h2 className="text-4xl font-bold text-blue-400 font-mono mb-8 bg-black/40 inline-block px-8 py-2 rounded">{name}</h2>

                <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                    {isSyntax ? "Has achieved logic-flow typing fluency and mastered mechanical keystroke patterns for professional software development." : "Has successfully completed the rigorous training regimen and achieved professional-grade typing speed and accuracy."}
                </p>

                <div className="flex justify-center gap-8 mb-8 border-t border-gray-600 pt-6">
                    <div>
                        <p className="text-xs text-gray-400 font-bold tracking-widest">FINAL SPEED</p>
                        <p className="text-3xl font-bold text-white"><span>{wpm}</span> WPM</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold tracking-widest">FINAL ACCURACY</p>
                        <p className="text-3xl font-bold text-green-400"><span>{acc}</span>%</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 font-mono">ID: <span>{id}</span> | Date: <span>{date}</span></p>
            </div>

            <button onClick={closeCertificate} className="mt-8 z-10 bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                ACCEPT CREDENTIALS & RETURN
            </button>
        </div>
    );
}
