import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="app-layout">
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar />
            </div>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

            <div className="main-content">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
