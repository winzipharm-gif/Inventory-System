/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    // Close sidebar on route change on mobile devices
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeSidebar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeSidebar]);

    return (
        <div className="app-layout">
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar closeSidebar={closeSidebar} />
            </div>

            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
                onClick={closeSidebar}
                aria-hidden="true"
            />

            <div className="main-content">
                <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
