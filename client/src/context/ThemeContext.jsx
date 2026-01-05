import React, { createContext, useContext, useState, useEffect } from 'react';
import { themeAPI } from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTheme();
        // Refresh theme every 5 minutes to catch time changes
        const interval = setInterval(fetchTheme, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Apply theme to document root
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, [theme]);

    const fetchTheme = async () => {
        try {
            const response = await themeAPI.getTheme();
            const newTheme = response.data.data.theme;
            const newLocation = response.data.data.location;

            setTheme(newTheme);
            setLocation(newLocation);

            console.log('🎨 Theme applied:', {
                theme: newTheme,
                location: newLocation,
                isSouthIndia: newLocation?.isSouthIndia,
                time: new Date().toLocaleTimeString()
            });
        } catch (error) {
            console.error('Theme fetch failed:', error);
            setTheme('dark'); // Default to dark
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        location,
        loading,
        toggleTheme,
        refreshTheme: fetchTheme
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
