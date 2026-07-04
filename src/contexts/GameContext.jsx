import React, { createContext, useState, useEffect } from 'react';
import { UserDatabase } from '../utils/UserDatabase';
import { AudioEngine } from '../utils/AudioEngine';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeProfile, setActiveProfile] = useState(null);
    const [currentMode, setCurrentMode] = useState('beginner');
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    
    // Backgrounds configuration
    const backgrounds = {
        login: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
        beginner: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=2070&auto=format&fit=crop',
        intermediate: 'https://i.pinimg.com/1200x/dc/eb/ef/dcebef49abb89b95b9d3fdb75c168b0a.jpg',
        pro: 'https://i.pinimg.com/1200x/8c/32/0f/8c320fbd9c15f3a2ea34d533f1461ae1.jpg',
        syntax: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
        custom: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'
    };
    const [activeBgId, setActiveBgId] = useState('login');

    const toggleMusic = () => {
        const bgMusic = document.getElementById('bg-music-audio');
        if (isMusicPlaying) {
            bgMusic.pause();
        } else {
            bgMusic.volume = 0.1;
            bgMusic.play().catch(e => console.log("Audio blocked:", e));
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const loginUser = (username, password) => {
        const res = UserDatabase.loginUser(username, password);
        if (res.success) {
            setCurrentUser(username);
            setActiveProfile(res.userData);
            setActiveBgId('login'); // Dashboard uses login bg
        }
        return res;
    };

    const registerUser = (username, password) => {
        const res = UserDatabase.registerUser(username, password);
        if (res.success) {
            setCurrentUser(username);
            setActiveProfile(res.userData);
            setActiveBgId('login');
        }
        return res;
    };

    const loginAsGuest = () => {
        let randomGuestID = "Guest_" + Math.floor(1000 + Math.random() * 9000);
        let res = UserDatabase.registerUser(randomGuestID, "guest_password");
        setCurrentUser(randomGuestID);
        setActiveProfile(res.userData);
        setActiveBgId('login');
    };

    const logoutUser = () => {
        setCurrentUser(null);
        setActiveProfile(null);
        setActiveBgId('login');
    };

    const recordActivity = () => {
        if (!currentUser || !activeProfile) return;
        const today = new Date().toISOString().split('T')[0];
        
        let newProfile = { ...activeProfile };
        if (!newProfile.activityDates) {
            newProfile.activityDates = {};
        }
        newProfile.activityDates[today] = true;
        
        setActiveProfile(newProfile);
        UserDatabase.saveFullProfile(currentUser, newProfile);
    };

    const updateProfile = (newProfile) => {
        setActiveProfile(newProfile);
        UserDatabase.saveFullProfile(currentUser, newProfile);
    };

    const changeMode = (mode) => {
        setCurrentMode(mode);
        if (backgrounds[mode]) {
            setActiveBgId(mode);
        }
    };

    return (
        <GameContext.Provider value={{
            currentUser, 
            activeProfile,
            currentMode,
            changeMode,
            isMusicPlaying,
            toggleMusic,
            loginUser,
            registerUser,
            loginAsGuest,
            logoutUser,
            recordActivity,
            updateProfile,
            activeBgId,
            setActiveBgId,
            backgrounds
        }}>
            {children}
            {/* Global Audio Element */}
            <audio id="bg-music-audio" src="https://www.dropbox.com/scl/fi/cpvwkrl0jlmscw08apqfz/F1_Theme_-Epic_Version-_320k.mp3?rlkey=2gh38vm9bas8nj765xarfpw0g&st=ici9ilzb&raw=1" loop></audio>
        </GameContext.Provider>
    );
};
