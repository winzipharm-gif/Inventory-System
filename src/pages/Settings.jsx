/* eslint-disable no-unused-vars */
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
    const { isAdmin, user } = useAuth();
    const [contactForm, setContactForm] = useState(businessContact);
    const [saved, setSaved] = useState(false);

    // User management state
    const [users, setUsers] = useState([]);
    const [newUserForm, setNewUserForm] = useState({ email: '', password: '', role: 'user' });
    const [userFormError, setUserFormError] = useState('');
    const [userFormSuccess, setUserFormSuccess] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);

    useEffect(() => {
        setContactForm(businessContact);
    }, [businessContact]);

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('id, full_name, role');
        if (data) setUsers(data);
    };

    useEffect(() => {
        if (!isAdmin) return;
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
            if (!session) {
                setUserFormError('Your session has expired. Please log in again.');
                return;
            }
            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
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
                await fetchUsers();
            }
        } catch {
            setUserFormError('Network error. Please try again.');
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
        setDeletingUserId(userId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ action: 'delete', userId })
            });
            const result = await res.json();
            if (!res.ok) {
                alert(result.error || 'Failed to delete user.');
            } else {
                await fetchUsers();
            }
        } catch {
            alert('Network error. Please try again.');
        } finally {
            setDeletingUserId(null);
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
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Settings</h2>
                <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Customize pharmacy theme, contact information, and users.</p>
            </div>

            {/* Appearance */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Palette size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Appearance & Theme</h3>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Choose your preferred visual theme across all devices.
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))',
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
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: isActive
                                        ? `0 0 0 3px ${t.preview.primary}33`
                                        : 'var(--shadow-sm)',
                                }}
                            >
                                {/* Theme Preview */}
                                <div style={{
                                    background: t.preview.bg,
                                    padding: '12px',
                                    position: 'relative',
                                    height: 64,
                                }}>
                                    {/* Mini app preview */}
                                    <div style={{ display: 'flex', gap: 5, height: '100%' }}>
                                        {/* Sidebar */}
                                        <div style={{
                                            width: 16,
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
                                            <div style={{ height: 10, background: t.preview.surface, borderRadius: 2 }} />
                                            <div style={{ height: 6, background: t.preview.primary, borderRadius: 2, width: '60%', opacity: 0.7 }} />
                                            <div style={{ height: 6, background: t.preview.surface, borderRadius: 2, opacity: 0.5 }} />
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
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-main)', margin: 0 }}>{t.name}</p>
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
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Building2 size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Business Contact Info</h3>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Printed automatically on receipts and invoices.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {[
                        { label: 'Pharmacy Address', key: 'address', placeholder: 'e.g. 123 Health Ave, Medical District' },
                        { label: 'Telephone Number', key: 'phone', placeholder: 'e.g. +233 24 000 0000' },
                        { label: 'Email Address', key: 'email', placeholder: 'e.g. info@winzipharmacy.com' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
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
                            style={{ gap: 'var(--space-2)', minWidth: 140, minHeight: '44px' }}
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
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={20} color="var(--color-primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>User Management</h3>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Create and manage staff accounts and roles.</p>
                        </div>
                    </div>

                    {/* Create User Form */}
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create New Account</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-3)' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Email Address</label>
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
                                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Password</label>
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
                            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Access Level</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 'var(--space-2)' }}>
                                {[{ value: 'user', label: 'Staff (POS Only)', Icon: User }, { value: 'admin', label: 'Admin (Full Access)', Icon: ShieldCheck }].map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setNewUserForm(f => ({ ...f, role: value }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                                            padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                                            border: `2px solid ${newUserForm.role === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            background: newUserForm.role === value ? 'var(--color-primary-light)' : 'var(--color-bg-surface)',
                                            cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                                            color: newUserForm.role === value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            minHeight: '44px'
                                        }}
                                    >
                                        <Icon size={16} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {userFormError && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>{userFormError}</p>}
                        {userFormSuccess && <p style={{ color: 'var(--color-success)', fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>{userFormSuccess}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={isCreatingUser} style={{ gap: 'var(--space-2)', minWidth: 150, minHeight: '44px' }}>
                                <Plus size={16} /> {isCreatingUser ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    {/* Existing Users List */}
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                            System Accounts ({users.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {users.map((u) => {
                                const isSelf = u.id === user?.id;
                                return (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                                            {u.role === 'admin' ? <ShieldCheck size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} /> : <User size={18} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />}
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || u.id.slice(0, 8) + '...'}</span>
                                            {isSelf && <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: '999px', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, flexShrink: 0 }}>You</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                                            <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '999px', fontWeight: 700, background: u.role === 'admin' ? 'var(--color-primary-light)' : 'var(--color-bg-surface)', color: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                                {u.role === 'admin' ? 'Admin' : 'Staff'}
                                            </span>
                                            {!isSelf && (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id, u.full_name || u.id.slice(0, 8))}
                                                    disabled={deletingUserId === u.id}
                                                    title="Delete user"
                                                    aria-label="Delete user"
                                                    className="btn-icon"
                                                    style={{
                                                        color: 'var(--color-error)',
                                                        opacity: deletingUserId === u.id ? 0.5 : 1
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* About */}
            <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>About Application</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        ['Application', 'Winzi Pharmacy Management & POS'],
                        ['Version', '1.0.0 (Production)'],
                        ['Contact Support', 'businesstribeconsult@gmail.com'],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}>
                            <span className="text-muted">{label}</span>
                            <span style={{ fontWeight: 600 }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
