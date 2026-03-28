import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES } from '../constants/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        // Remove all theme classes
        THEMES.forEach(t => root.classList.remove(t.id));
        // Apply the new one (only add if not 'light' — light is the default :root)
        if (theme !== 'light') {
            root.classList.add(theme);
        }
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
