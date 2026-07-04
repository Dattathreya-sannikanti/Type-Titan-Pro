import React, { useState, useContext } from 'react';
import { GameContext } from './contexts/GameContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CampaignMap from './pages/CampaignMap';
import Game from './pages/Game';
import { LevelPreviewModal, CustomSetupModal, SuccessModal, LeaderboardModal, CertificateModal } from './components/Modals';
import { TEXT_CONTENT, GAME_CONFIG, TOTAL_LEVELS } from './constants/textData';
import { LeaderboardSystem } from './utils/LeaderboardSystem';
import { AudioEngine } from './utils/AudioEngine';

function App() {
    const { activeBgId, setActiveBgId, backgrounds, currentMode, currentUser, activeProfile, recordActivity, updateProfile, changeMode } = useContext(GameContext);
    
    const [screen, setScreen] = useState('login');
    const [customModalOpen, setCustomModalOpen] = useState(false);
    
    // Add useEffect to auto-sync background
    React.useEffect(() => {
        if (screen === 'login' || screen === 'dashboard') {
            setActiveBgId('login');
        }
    }, [screen, setActiveBgId]);
    
    // Preview level state
    const [previewLevel, setPreviewLevel] = useState(null); 
    // Format: { level: 0, sub: 0, maxSub: 4, setSub: (v)=>... }
    
    // Game state
    const [gameState, setGameState] = useState(null);

    // Modals state
    const [successResult, setSuccessResult] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [certificateData, setCertificateData] = useState(null);

    // Dynamic setSub for preview
    const activePreviewLevel = previewLevel ? {
        ...previewLevel,
        setSub: (newSub) => setPreviewLevel(prev => ({...prev, sub: newSub}))
    } : null;

    const getLevelText = (mode, level, sub) => {
        if (mode === 'custom' && gameState?.customText) {
            return gameState.customText;
        }
        const seed = (level * 10) + sub;
        const textArray = TEXT_CONTENT[mode];
        return textArray[seed % textArray.length];
    };

    const startGame = (levelIndex, subIndex, isCustom = false, customText = "", initialTime = 60) => {
        setPreviewLevel(null);
        setCustomModalOpen(false);

        let textToType = isCustom ? customText : getLevelText(currentMode, levelIndex, subIndex);

        setGameState({
            level: levelIndex,
            sub: subIndex,
            initialTime: initialTime,
            isCustom: isCustom,
            customText: customText,
            text: textToType
        });
        setScreen('game');
    };

    const handleGameFinish = (reason, finalWpm, finalAccuracy, errorKeys) => {
        recordActivity();
        
        let resultData = { wpm: finalWpm, acc: finalAccuracy, weakKeys: errorKeys, reason, isCustom: gameState.isCustom };
        
        if (reason === 'timeout' || finalAccuracy < 75) {
            AudioEngine.fail();
            setSuccessResult(resultData);
        } else {
            AudioEngine.win();
            
            if (gameState.isCustom) {
                setSuccessResult(resultData);
            } else {
                if (finalAccuracy >= 75) {
                    LeaderboardSystem.saveScore(currentMode, gameState.level, gameState.sub, currentUser, finalWpm, finalAccuracy);

                    const playerStats = activeProfile.progress[currentMode];
                    const maxSubs = GAME_CONFIG[currentMode].subLevels;

                    const isPlayingHighestLevel = (gameState.level === playerStats.level && gameState.sub === playerStats.sub);
                    const isEndOfTheLevel = (gameState.sub + 1 >= maxSubs);
                    const isAbsoluteFinalLevel = (isEndOfTheLevel && gameState.level === TOTAL_LEVELS - 1);

                    if (isPlayingHighestLevel) {
                        let newProfile = { ...activeProfile };
                        if (isEndOfTheLevel) {
                            newProfile.progress[currentMode].level++;
                            newProfile.progress[currentMode].sub = 0;
                        } else {
                            newProfile.progress[currentMode].sub++;
                        }
                        updateProfile(newProfile);
                    }

                    if (isAbsoluteFinalLevel && isPlayingHighestLevel) {
                        AudioEngine.certPop();
                        setCertificateData({
                            name: currentUser.toUpperCase(),
                            wpm: finalWpm,
                            acc: finalAccuracy,
                            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                            date: new Date().toLocaleDateString(),
                            isSyntax: currentMode === 'syntax'
                        });
                        setScreen('dashboard');
                        return; // Don't show success modal, go straight to certificate
                    }
                }
                setSuccessResult(resultData);
            }
        }
    };

    const retryMission = () => {
        let level = gameState.level;
        let sub = gameState.sub;
        setSuccessResult(null);
        startGame(level, sub, gameState.isCustom, gameState.customText, gameState.initialTime);
    };

    const nextMission = () => {
        setSuccessResult(null);
        if (gameState.reason === 'timeout' || successResult.acc < 75) {
            retryMission(); // retry
        } else {
            const isEnd = (gameState.sub + 1 >= GAME_CONFIG[currentMode].subLevels);
            if (isEnd) {
                setScreen('map');
            } else {
                startGame(gameState.level, gameState.sub + 1, false, "", 60);
            }
        }
    };

    const viewLeaderboard = (level, sub) => {
        setSuccessResult(null);
        setPreviewLevel(null);
        setLeaderboardData({ mode: currentMode, level, sub });
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            <div className="overlay"></div>
            {Object.keys(backgrounds).map(key => (
                <div 
                    key={key} 
                    className={`background-image ${activeBgId !== key ? 'hidden-screen' : ''}`}
                    style={{ backgroundImage: `url(${backgrounds[key]})` }}
                ></div>
            ))}

            {screen === 'login' && <Login setScreen={setScreen} />}
            {screen === 'dashboard' && <Dashboard setScreen={setScreen} setCustomModalOpen={setCustomModalOpen} />}
            {screen === 'map' && <CampaignMap setScreen={setScreen} setPreviewLevel={setPreviewLevel} />}
            {screen === 'game' && <Game gameState={gameState} onFinish={handleGameFinish} />}

            <LevelPreviewModal 
                previewLevel={activePreviewLevel} 
                closePreview={() => setPreviewLevel(null)} 
                startGame={(l, s) => startGame(l, s)}
                viewLeaderboard={viewLeaderboard}
            />

            {customModalOpen && (
                <CustomSetupModal 
                    closeSetup={() => setCustomModalOpen(false)}
                    startCustomRace={(text, time) => {
                        changeMode('custom');
                        startGame('C', 0, true, text, time);
                    }}
                />
            )}

            {successResult && (
                <SuccessModal 
                    result={successResult} 
                    nextLevel={nextMission}
                    exitMap={() => { setSuccessResult(null); setScreen('map'); }}
                    viewLeaderboard={() => viewLeaderboard(gameState.level, gameState.sub)}
                    retryParagraph={retryMission}
                />
            )}

            {leaderboardData && (
                <LeaderboardModal 
                    closeLeaderboard={() => { setLeaderboardData(null); setScreen('map'); }}
                    mode={leaderboardData.mode}
                    level={leaderboardData.level}
                    sub={leaderboardData.sub}
                />
            )}

            {certificateData && (
                <CertificateModal 
                    certificateData={certificateData} 
                    closeCertificate={() => setCertificateData(null)} 
                />
            )}
        </div>
    );
}

export default App;
