import React, { useState, useContext, useEffect } from 'react';
import { GameContext } from '../contexts/GameContext';

export default function Login({ setScreen }) {
    const { loginUser, registerUser, loginAsGuest } = useContext(GameContext);
    
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const toggleLoginMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setErrorMsg('');
    };

    const handleLoginSubmit = (event) => {
        event.preventDefault();
        setErrorMsg('');

        if (!username || !password) {
            setErrorMsg('Credentials Required');
            return;
        }

        let res;
        if (isRegisterMode) {
            res = registerUser(username.trim(), password.trim());
        } else {
            res = loginUser(username.trim(), password.trim());
        }

        if (res.success) {
            setScreen('dashboard');
        } else {
            setErrorMsg(res.message);
        }
    };

    const handleGuest = () => {
        loginAsGuest();
        setScreen('dashboard');
    };

    return (
        <section className="flex-grow flex items-center justify-center p-4 z-10 w-full h-screen">
            <div className="glass-card p-10 w-full max-w-sm text-center border-t-4 border-white animate-pop">
                <div className="flex justify-center mb-6">
                    <div className="logo-container">
                        <span className="logo-text">T</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-2 tracking-tighter">TYPETITAN PRO</h1>
                <p className="text-gray-400 mb-8 text-xs uppercase tracking-widest font-bold">
                    {isRegisterMode ? "Register Profile" : "Authorized Access Only"}
                </p>

                <form className="text-left space-y-4" onSubmit={handleLoginSubmit}>
                    <div>
                        <label className="text-xs font-bold text-gray-300 ml-1">AGENT ID</label>
                        <input 
                            type="text" 
                            className="custom-input" 
                            placeholder="Enter Username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-300 ml-1">ACCESS CODE</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="custom-input pr-10" 
                                placeholder="••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    {showPassword ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    ) : (
                                        <>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-red-400 text-xs font-bold flex items-center gap-2 mt-2">
                            ⚠️ <span>{errorMsg}</span>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg">
                        {isRegisterMode ? "REGISTER AGENT" : "ENTER SYSTEM"}
                    </button>
                </form>

                <p className="mt-4 text-xs text-gray-400">
                    <span>{isRegisterMode ? "Already an Agent?" : "New Agent?"}</span>
                    <button type="button" onClick={toggleLoginMode} className="text-blue-400 font-bold hover:underline ml-1">
                        {isRegisterMode ? "Login Here" : "Initialize Profile"}
                    </button>
                </p>

                <div className="flex items-center my-6">
                    <div className="flex-grow h-px bg-gray-600"></div>
                    <span className="px-3 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow h-px bg-gray-600"></div>
                </div>

                <button onClick={handleGuest} className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                    <img src="https://i.pinimg.com/736x/ea/50/80/ea508059e1a6d2f2439c7fac89590526.jpg" width="18" alt="Guest" /> Continue As Guest
                </button>
            </div>
        </section>
    );
}
