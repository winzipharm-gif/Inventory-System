import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, FileText, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const Sidebar = () => {
    const { user, profile, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', adminOnly: true },
        { icon: Package, label: 'Inventory', path: '/inventory', adminOnly: true },
        { icon: ShoppingCart, label: 'Sales / POS', path: '/sales', adminOnly: false },
        { icon: FileText, label: 'Invoices', path: '/invoices', adminOnly: true },
        { icon: Users, label: 'Suppliers', path: '/suppliers', adminOnly: true },
        { icon: Settings, label: 'Settings', path: '/settings', adminOnly: true },
        { icon: Shield, label: 'Audit Trail', path: '/audit', adminOnly: true },
    ];

    const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login', { replace: true });
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <img src={logo} alt="Winzi Pharmacy Logo" className="logo-img" />
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{profile?.full_name || 'User'}</span>
                        <span className="user-role">{profile?.role || 'Staff'}</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-outline"
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        color: 'var(--color-error)'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
