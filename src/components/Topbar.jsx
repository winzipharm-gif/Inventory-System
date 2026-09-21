import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, Menu, AlertTriangle, Package, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);
    const bellRef = useRef(null);
    const { inventory } = useInventory();

    // Calculate drugs expiring within 30 days
    const expiringDrugs = useMemo(() => {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        return inventory
            .filter(item => {
                if (!item.expiryDate) return false;
                const expiry = new Date(item.expiryDate);
                return expiry <= thirtyDaysFromNow && expiry >= now;
            })
            .map(item => {
                const expiry = new Date(item.expiryDate);
                const diffTime = expiry - new Date();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { ...item, daysLeft };
            })
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [inventory]);

    // Also find already expired drugs
    const expiredDrugs = useMemo(() => {
        const now = new Date();
        return inventory
            .filter(item => {
                if (!item.expiryDate) return false;
                return new Date(item.expiryDate) < now;
            })
            .map(item => {
                const expiry = new Date(item.expiryDate);
                const diffTime = new Date() - expiry;
                const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { ...item, daysAgo };
            })
            .sort((a, b) => a.daysAgo - b.daysAgo);
    }, [inventory]);

    const totalAlerts = expiringDrugs.length + expiredDrugs.length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    const getUrgencyColor = (daysLeft) => {
        if (daysLeft <= 7) return { bg: 'rgba(239, 68, 68, 0.12)', text: 'var(--color-error)', label: 'Critical' };
        if (daysLeft <= 14) return { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316', label: 'Urgent' };
        return { bg: 'rgba(234, 179, 8, 0.12)', text: '#eab308', label: 'Warning' };
    };

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

            <div className="topbar-actions" style={{ position: 'relative' }}>
                <button
                    ref={bellRef}
                    className="icon-btn"
                    aria-label="Expiry Notifications"
                    onClick={() => setShowNotifications(prev => !prev)}
                    style={{
                        color: totalAlerts > 0 ? 'var(--color-error)' : undefined,
                    }}
                >
                    <Bell size={20} />
                    {totalAlerts > 0 && (
                        <span className="badge">{totalAlerts > 99 ? '99+' : totalAlerts}</span>
                    )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                    <div
                        ref={dropdownRef}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            width: 'min(400px, 92vw)',
                            maxHeight: '70vh',
                            background: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)',
                            zIndex: 1100,
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'slideDown 0.2s ease-out',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-4) var(--space-5)',
                            borderBottom: '1px solid var(--color-border)',
                            flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <AlertTriangle size={18} color="var(--color-error)" />
                                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                                    Expiry Alerts
                                </h3>
                                {totalAlerts > 0 && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '1px 8px',
                                        borderRadius: '999px',
                                        background: 'rgba(239, 68, 68, 0.12)',
                                        color: 'var(--color-error)',
                                        fontWeight: 700,
                                    }}>
                                        {totalAlerts}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="btn-icon"
                                style={{ width: 28, height: 28 }}
                                aria-label="Close notifications"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{
                            overflowY: 'auto',
                            flex: 1,
                            padding: totalAlerts === 0 ? 'var(--space-8) var(--space-5)' : 0,
                        }}>
                            {totalAlerts === 0 ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Package size={40} color="var(--color-text-muted)" style={{ marginBottom: 'var(--space-3)', opacity: 0.4 }} />
                                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>
                                        All Clear!
                                    </p>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                                        No drugs expiring within the next 30 days.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {/* Expired drugs section */}
                                    {expiredDrugs.length > 0 && (
                                        <>
                                            <div style={{
                                                padding: 'var(--space-2) var(--space-5)',
                                                background: 'rgba(239, 68, 68, 0.06)',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: 'var(--color-error)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '1px solid var(--color-border)',
                                            }}>
                                                Expired ({expiredDrugs.length})
                                            </div>
                                            {expiredDrugs.map(drug => (
                                                <div
                                                    key={drug.id}
                                                    style={{
                                                        padding: 'var(--space-3) var(--space-5)',
                                                        borderBottom: '1px solid var(--color-border)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: 'var(--space-3)',
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <p style={{
                                                            fontWeight: 600,
                                                            fontSize: 'var(--font-size-sm)',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}>
                                                            {drug.name}
                                                        </p>
                                                        <p style={{
                                                            fontSize: 'var(--font-size-xs)',
                                                            color: 'var(--color-text-muted)',
                                                            marginTop: 2,
                                                        }}>
                                                            Expired {drug.daysAgo} day{drug.daysAgo !== 1 ? 's' : ''} ago · {drug.stock} {drug.unit || 'pcs'} in stock
                                                        </p>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '999px',
                                                        fontWeight: 700,
                                                        background: 'rgba(239, 68, 68, 0.12)',
                                                        color: 'var(--color-error)',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                    }}>
                                                        Expired
                                                    </span>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Expiring soon section */}
                                    {expiringDrugs.length > 0 && (
                                        <>
                                            <div style={{
                                                padding: 'var(--space-2) var(--space-5)',
                                                background: 'rgba(249, 115, 22, 0.06)',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: '#f97316',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '1px solid var(--color-border)',
                                            }}>
                                                Expiring Soon ({expiringDrugs.length})
                                            </div>
                                            {expiringDrugs.map(drug => {
                                                const urgency = getUrgencyColor(drug.daysLeft);
                                                return (
                                                    <div
                                                        key={drug.id}
                                                        style={{
                                                            padding: 'var(--space-3) var(--space-5)',
                                                            borderBottom: '1px solid var(--color-border)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            gap: 'var(--space-3)',
                                                            transition: 'background-color 0.15s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <p style={{
                                                                fontWeight: 600,
                                                                fontSize: 'var(--font-size-sm)',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}>
                                                                {drug.name}
                                                            </p>
                                                            <p style={{
                                                                fontSize: 'var(--font-size-xs)',
                                                                color: 'var(--color-text-muted)',
                                                                marginTop: 2,
                                                            }}>
                                                                Expires in {drug.daysLeft} day{drug.daysLeft !== 1 ? 's' : ''} · {drug.stock} {drug.unit || 'pcs'} in stock
                                                            </p>
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 8px',
                                                            borderRadius: '999px',
                                                            fontWeight: 700,
                                                            background: urgency.bg,
                                                            color: urgency.text,
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0,
                                                        }}>
                                                            {drug.daysLeft}d left
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Topbar;
