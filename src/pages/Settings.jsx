import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../constants/themes';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabaseClient';
import { Palette, Check, Building2, Save, Users, Plus, Trash2, ShieldCheck, User } from 'lucide-react';

const Settings = () => {
    const { theme, setTheme } = useTheme();
    const { businessContact, setBusinessContact } = useInventory();
    const { isAdmin } = useAuth();
    const [contactForm, setContactForm] = useState(businessContact);
    const [saved, setSaved] = useState(false);

    // User management state
    const [users, setUsers] = useState([]);
    const [newUserForm, setNewUserForm] = useState({ email: '', password: '', role: 'user' });
    const [userFormError, setUserFormError] = useState('');
    const [userFormSuccess, setUserFormSuccess] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        setContactForm(businessContact);
    }, [businessContact]);

    useEffect(() => {
        if (!isAdmin) return;
        const fetchUsers = async () => {
            const { data } = await supabase.from('profiles').select('id, role');
            if (data) setUsers(data);
        };
        fetchUsers();
    }, [isAdmin]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setUserFormError('');
        setUserFormSuccess('');
        if (!newUserForm.email || !newUserForm.password) {
            setUserFormError('Email and password are required.');
            return;
        }
        setIsCreatingUser(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('https://vivbsrvnrlqwbnmnhrrb.supabase.co/functions/v1/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(newUserForm)
            });
            const result = await res.json();
            if (!res.ok) {
                setUserFormError(result.error || 'Failed to create user.');
            } else {
                setUserFormSuccess(`✓ User "${newUserForm.email}" created successfully!`);
                setNewUserForm({ email: '', password: '', role: 'user' });
                // Refresh the list
                const { data } = await supabase.from('profiles').select('id, role');
                if (data) setUsers(data);
            }
        } catch {
            setUserFormError('Network error. Please try again.');
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleContactSave = () => {
        setBusinessContact(contactForm);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header */}
            <div>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Settings</h2>
                <p className="text-muted">Customize your application preferences.</p>
            </div>

            {/* Appearance */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Palette size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Appearance</h3>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Choose a theme. Changes apply instantly and are saved automatically.
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 'var(--space-4)'
                }}>
                    {THEMES.map((t) => {
                        const isActive = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                style={{
                                    border: isActive
                                        ? `2px solid ${t.preview.primary}`
                                        : '2px solid var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '0',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    transition: 'all var(--transition-fast)',
                                    transform: isActive ? 'scale(1.04)' : 'scale(1)',
                                    boxShadow: isActive
                                        ? `0 0 0 4px ${t.preview.primary}33`
                                        : 'var(--shadow-sm)',
                                }}
                            >
                                {/* Theme Preview */}
                                <div style={{
                                    background: t.preview.bg,
                                    padding: '12px',
                                    position: 'relative',
                                    height: 70,
                                }}>
                                    {/* Mini app preview */}
                                    <div style={{ display: 'flex', gap: 5, height: '100%' }}>
                                        {/* Sidebar */}
                                        <div style={{
                                            width: 18,
                                            background: t.preview.surface,
                                            borderRadius: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 3,
                                            padding: 3,
                                        }}>
                                            <div style={{ height: 4, background: t.preview.primary, borderRadius: 2 }} />
                                            <div style={{ height: 3, background: t.preview.primary, borderRadius: 2, opacity: 0.4 }} />
                                            <div style={{ height: 3, background: t.preview.primary, borderRadius: 2, opacity: 0.4 }} />
                                        </div>
                                        {/* Content */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ height: 12, background: t.preview.surface, borderRadius: 2 }} />
                                            <div style={{ height: 8, background: t.preview.primary, borderRadius: 2, width: '60%', opacity: 0.7 }} />
                                            <div style={{ height: 8, background: t.preview.surface, borderRadius: 2, opacity: 0.5 }} />
                                            <div style={{ height: 8, background: t.preview.surface, borderRadius: 2, width: '80%', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                    {/* Active checkmark */}
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute', top: 6, right: 6,
                                            width: 20, height: 20,
                                            background: t.preview.primary,
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Check size={12} color="white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                {/* Theme label */}
                                <div style={{
                                    padding: '8px 10px',
                                    background: 'var(--color-bg-surface)',
                                    textAlign: 'left',
                                    borderTop: `2px solid ${isActive ? t.preview.primary : 'transparent'}`,
                                }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-main)', margin: 0 }}>{t.name}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{t.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Business Contact */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Building2 size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Business Contact</h3>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Appears on all receipts and invoices.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {[
                        { label: 'Postal Address', key: 'address', placeholder: 'e.g. 123 Health Ave, Medical District' },
                        { label: 'Telephone Number', key: 'phone', placeholder: 'e.g. +233 24 000 0000' },
                        { label: 'Email Address', key: 'email', placeholder: 'e.g. info@winzipharmacy.com' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                                {label}
                            </label>
                            <input
                                className="input-field"
                                type={key === 'email' ? 'email' : 'text'}
                                value={contactForm[key]}
                                placeholder={placeholder}
                                onChange={(e) => setContactForm(prev => ({ ...prev, [key]: e.target.value }))}
                            />
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleContactSave}
                            style={{ gap: 'var(--space-2)', minWidth: 120 }}
                        >
                            <Save size={16} />
                            {saved ? '✓ Saved!' : 'Save Contact'}
                        </button>
                    </div>
                </div>
            </div>

            {/* User Management (Admin only) */}
            {isAdmin && (
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="var(--color-primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>User Management</h3>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Create new system users. Only visible to admins.</p>
                        </div>
                    </div>

                    {/* Create User Form */}
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create New User</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Email Address</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={newUserForm.password}
                                    onChange={(e) => setNewUserForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Access Role</label>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                {[{ value: 'user', label: 'Staff (POS Only)', Icon: User }, { value: 'admin', label: 'Admin (Full Access)', Icon: ShieldCheck }].map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setNewUserForm(f => ({ ...f, role: value }))}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                                            border: `2px solid ${newUserForm.role === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            background: newUserForm.role === value ? 'var(--color-primary-light)' : 'transparent',
                                            cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                                            color: newUserForm.role === value ? 'var(--color-primary)' : 'var(--color-text-muted)'
                                        }}
                                    >
                                        <Icon size={16} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {userFormError && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', margin: 0 }}>{userFormError}</p>}
                        {userFormSuccess && <p style={{ color: 'var(--color-success)', fontSize: '0.875rem', margin: 0 }}>{userFormSuccess}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={isCreatingUser} style={{ gap: 'var(--space-2)', minWidth: 150 }}>
                                <Plus size={16} /> {isCreatingUser ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>

                    {/* Existing Users List */}
                    <div>
                        <h4 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                            System Users ({users.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {users.map((u) => (
                                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        {u.role === 'admin' ? <ShieldCheck size={16} color="var(--color-primary)" /> : <User size={16} color="var(--color-text-muted)" />}
                                        <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>{u.id.slice(0, 8)}...</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', padding: '2px 10px', borderRadius: '999px', fontWeight: 600, background: u.role === 'admin' ? 'var(--color-primary-light)' : 'var(--color-bg-surface)', color: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                        {u.role === 'admin' ? 'Admin' : 'Staff'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* About */}
            <div className="card">
                <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>About</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        ['Application', 'Winzi Pharmacy POS'],
                        ['Version', '1.0.0'],
                        ['Contact', 'businesstribeconsult@gmail.com'],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
                            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{label}</span>
                            <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
