import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const { data, error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                const isAdmin = 
                    data?.user?.user_metadata?.role === 'admin' || 
                    data?.user?.email === 'admin@winzi.com';
                navigate(isAdmin ? '/' : '/sales', { replace: true });
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
            backgroundColor: '#030712',
            padding: 'var(--space-4)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background blur blobs for depth */}
            <div style={{ position: 'fixed', top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
            <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: '300px', height: '300px', background: '#ec4899', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }}></div>

            <div style={{
                width: '100%',
                maxWidth: '440px',
                padding: 'var(--space-10)',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
                        <div style={{ padding: 'var(--space-3)', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <img src={logo} alt="Logo" style={{ height: '56px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.025em', marginBottom: 'var(--space-2)' }}>Winzi Pharmacy</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem', fontWeight: 500 }}>Sign in to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: 600, marginLeft: 'var(--space-1)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 48px',
                                    borderRadius: '1.25rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(14, 165, 233, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: 600, marginLeft: 'var(--space-1)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 48px',
                                    borderRadius: '1.25rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(14, 165, 233, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#fca5a5',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '1.125rem',
                            borderRadius: '1.25rem',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            marginTop: 'var(--space-2)',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #0284c7 100%)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 20px -5px rgba(14, 165, 233, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.4)';
                        }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 size={22} className="animate-spin" /> : 'Enter Dashboard'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                        <div style={{ display: 'inline-block', padding: 'var(--space-3) var(--space-4)', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', margin: 0, letterSpacing: '0.02em' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Admin:</span> admin@winzi.com | <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Staff:</span> user@winzi.com
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
