import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <button 
                    className="menu-toggle" 
                    onClick={toggleSidebar}
                    aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isSidebarOpen}
                >
                    <Menu size={22} />
                </button>

                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="search" 
                        placeholder="Search medicines, inventory..." 
                        aria-label="Search"
                    />
                </div>
            </div>

            <div className="topbar-actions">
                <button className="icon-btn" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="badge">3</span>
                </button>
            </div>
        </header>
    );
};

export default Topbar;
