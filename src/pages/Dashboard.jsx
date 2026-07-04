import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { TOTAL_LEVELS } from '../constants/textData';

export default function Dashboard({ setScreen, setCustomModalOpen }) {
    const { currentUser, activeProfile, changeMode, toggleMusic, isMusicPlaying, logoutUser } = useContext(GameContext);

    if (!activeProfile) return null;

    const handleOpenMap = (mode) => {
        changeMode(mode);
        setScreen('map');
    };

    // Calculate Heatmap cells
    const heatCells = [];
    for (let i = 29; i >= 0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let dateString = d.toISOString().split('T')[0];
        let isActive = activeProfile.activityDates && activeProfile.activityDates[dateString];
        heatCells.push(
            <div key={i} className={`heat-cell ${isActive ? 'active' : ''}`}></div>
        );
    }

    // Calculate Weak Keys
    let errorsArray = [];
    if (activeProfile.lifetimeErrors) {
        errorsArray = Object.keys(activeProfile.lifetimeErrors).map(key => ({
            character: key,
            count: activeProfile.lifetimeErrors[key]
        }));
    }
    errorsArray.sort((a, b) => b.count - a.count);
    let top3 = errorsArray.slice(0, 3);

    // Achievements Status
    const isBaselineMaster = activeProfile.progress['pro'].level >= TOTAL_LEVELS;
    const isSyntaxMaster = activeProfile.progress['syntax'].level >= TOTAL_LEVELS;

    return (
        <section className="flex-grow flex-col flex z-10 overflow-y-auto w-full min-h-screen">
            <nav className="p-6 flex justify-between items-center glass-card m-4 rounded-xl sticky top-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="logo-container" style={{ width: '36px', height: '36px', borderWidth: '1px' }}>
                        <span className="logo-text" style={{ fontSize: '20px' }}>T</span>
                    </div>
                    <div className="text-xl font-bold tracking-widest hidden md:block">TYPETITAN PRO</div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleMusic} 
                        className={`flex items-center gap-2 border px-3 py-1 rounded text-xs transition font-bold ${isMusicPlaying ? 'bg-green-600 border-green-400' : 'bg-black/50 border-white/30 hover:bg-white hover:text-black'}`}
                    >
                        {isMusicPlaying ? "🎵 MUSIC: ON" : "🔇 MUSIC: OFF"}
                    </button>

                    <div className="text-right border-l border-white/20 pl-4">
                        <div className="text-[10px] text-gray-400 uppercase">OPERATIVE</div>
                        <div className="text-sm font-bold text-blue-400 font-mono">{currentUser?.toUpperCase()}</div>
                    </div>

                    <button 
                        onClick={() => {
                            logoutUser();
                            setScreen('login');
                        }} 
                        className="border border-red-500/50 text-red-300 px-3 py-1 rounded text-xs hover:bg-red-500 hover:text-white transition font-bold ml-2"
                    >
                        LOGOUT
                    </button>
                </div>
            </nav>

            <div className="flex-grow flex flex-col p-8 w-full max-w-6xl mx-auto animate-pop">
                <div className="text-center mb-8">
                    <h2 className="text-5xl font-bold mb-3 tracking-tighter">SELECT PROTOCOL</h2>
                    <p className="text-gray-300 max-w-lg mx-auto">Choose your difficulty, master coding syntax, or create a custom training session.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full mb-16">
                    <div onClick={() => handleOpenMap('beginner')} className="glass-card p-6 cursor-pointer hover:border-green-500 transition hover:-translate-y-2 text-center flex flex-col justify-center">
                        <div className="text-4xl mb-3">🌱</div>
                        <h3 className="text-xl font-bold mb-1">BEGINNER</h3>
                        <p className="text-[10px] text-green-400 font-bold tracking-widest mb-2">4 TASKS / LEVEL</p>
                        <p className="text-xs text-gray-400">Nature facts.</p>
                    </div>

                    <div onClick={() => handleOpenMap('intermediate')} className="glass-card p-6 cursor-pointer hover:border-blue-500 transition hover:-translate-y-2 text-center flex flex-col justify-center">
                        <div className="text-4xl mb-3">🧬</div>
                        <h3 className="text-xl font-bold mb-1">INTERMEDIATE</h3>
                        <p className="text-[10px] text-blue-400 font-bold tracking-widest mb-2">3 TASKS / LEVEL</p>
                        <p className="text-xs text-gray-400">Science data.</p>
                    </div>

                    <div onClick={() => handleOpenMap('pro')} className="glass-card p-6 cursor-pointer hover:border-red-500 transition hover:-translate-y-2 text-center flex flex-col justify-center">
                        <div className="text-4xl mb-3">🏎️</div>
                        <h3 className="text-xl font-bold mb-1">PRO TITAN</h3>
                        <p className="text-[10px] text-red-400 font-bold tracking-widest mb-2">2 TASKS / LEVEL</p>
                        <p className="text-xs text-gray-400">High Speed F1.</p>
                    </div>

                    <div onClick={() => handleOpenMap('syntax')} className="glass-card p-6 cursor-pointer border border-yellow-500/50 hover:border-yellow-400 transition hover:-translate-y-2 text-center bg-yellow-900/10 flex flex-col justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                        <div className="text-4xl mb-3">💻</div>
                        <h3 className="text-xl font-bold mb-1 text-yellow-500">SYNTAX PRO</h3>
                        <p className="text-[10px] text-yellow-400 font-bold tracking-widest mb-2">5 TASKS / LEVEL</p>
                        <p className="text-xs text-gray-400">Code structures.</p>
                    </div>

                    <div onClick={() => setCustomModalOpen(true)} className="glass-card p-6 cursor-pointer hover:border-purple-500 transition hover:-translate-y-2 text-center border-dashed border-2 flex flex-col justify-center">
                        <div className="text-4xl mb-3">🛠️</div>
                        <h3 className="text-xl font-bold mb-1">CUSTOM</h3>
                        <p className="text-[10px] text-purple-400 font-bold tracking-widest mb-2">YOUR RULES</p>
                        <p className="text-xs text-gray-400">Paste text.</p>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-10 w-full">
                    <h2 className="text-2xl font-bold mb-8 text-center tracking-widest text-gray-400 uppercase">Operative Analytics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 border-t-4 border-blue-500">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">🔥 30-Day Activity</h3>
                                <span className="text-xs bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full font-mono border border-blue-500/30">Consistency Tracker</span>
                            </div>
                            <div className="heatmap-grid">{heatCells}</div>
                            <p className="text-xs text-gray-500 mt-4 text-right">Practice daily to build syntax muscle memory.</p>
                        </div>

                        <div className="glass-card p-8 border-t-4 border-red-500 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">🎯 Error Pattern Radar</h3>
                                <span className="text-xs bg-red-900/50 text-red-400 px-3 py-1 rounded-full font-mono border border-red-500/30">Focus Areas</span>
                            </div>
                            <div className="bg-black/60 p-6 rounded-lg border border-white/10 text-center">
                                <p className="text-xs text-gray-400 mb-4">LIFETIME TOP WEAK KEYS:</p>
                                <div className="flex justify-center gap-4">
                                    {top3.length === 0 ? (
                                        <span className="text-2xl font-mono bg-green-900/50 text-green-400 px-6 py-3 rounded border border-green-500/30">CLEAN</span>
                                    ) : (
                                        top3.map((errObj, idx) => (
                                            <span key={idx} className="text-2xl font-mono bg-red-900/50 text-red-400 px-6 py-3 rounded border border-red-500/30">
                                                {errObj.character === " " ? "SPC" : errObj.character}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-10 w-full mb-10">
                    <h2 className="text-2xl font-bold mb-8 text-center tracking-widest text-gray-400 uppercase">Certifications & Awards</h2>

                    <div className="glass-card p-8 flex flex-col md:flex-row gap-6 justify-around items-center">
                        <div className={`flex items-center gap-6 p-6 rounded-xl border-2 w-full transition-all duration-500 ${isBaselineMaster ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 bg-black/40 opacity-50 grayscale'}`}>
                            <div className="text-6xl drop-shadow-lg">🎖️</div>
                            <div>
                                <h4 className={`text-xl font-bold tracking-wide uppercase ${isBaselineMaster ? 'text-yellow-500' : 'text-gray-300'}`}>Baseline Mastery</h4>
                                <p className="text-sm text-gray-500 mt-1">Complete the PRO TITAN final level.</p>
                                <p className={`text-xs font-mono mt-2 ${isBaselineMaster ? 'text-yellow-400' : 'text-gray-600'}`}>STATUS: {isBaselineMaster ? "UNLOCKED" : "LOCKED"}</p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-6 p-6 rounded-xl border-2 w-full transition-all duration-500 ${isSyntaxMaster ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-black/40 opacity-50 grayscale'}`}>
                            <div className="text-6xl drop-shadow-lg">💻</div>
                            <div>
                                <h4 className={`text-xl font-bold tracking-wide uppercase ${isSyntaxMaster ? 'text-blue-400' : 'text-gray-300'}`}>Syntax Master</h4>
                                <p className="text-sm text-gray-500 mt-1">Complete the SYNTAX PRO final level.</p>
                                <p className={`text-xs font-mono mt-2 ${isSyntaxMaster ? 'text-blue-400' : 'text-gray-600'}`}>STATUS: {isSyntaxMaster ? "UNLOCKED" : "LOCKED"}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
