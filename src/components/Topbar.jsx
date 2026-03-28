import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
    return (
        <header className="topbar">
            <button className="menu-toggle" onClick={toggleSidebar}>
                <Menu size={24} />
            </button>

            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Search drugs, generic names..." />
            </div>

            <div className="topbar-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge">3</span>
                </button>
            </div>
        </header>
    );
};

export default Topbar;
