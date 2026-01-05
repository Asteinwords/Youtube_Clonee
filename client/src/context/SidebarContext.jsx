import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children }) => {
    // Initialize sidebar state based on screen size
    const [isOpen, setIsOpen] = useState(() => {
        // Check if window is defined (for SSR compatibility)
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024; // Open on desktop (lg breakpoint), closed on mobile
        }
        return false; // Default to closed for SSR
    });

    // Handle window resize to auto-close sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    const toggleSidebar = () => {
        setIsOpen(prev => !prev);
    };

    const value = {
        isOpen,
        toggleSidebar
    };

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
