import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);
    const signingOut = useRef(false);

    const getInitialProfileFromUser = (u) => {
        if (!u) return null;
        return {
            id: u.id,
            full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
            role: u.user_metadata?.role || (u.email === 'admin@winzi.com' ? 'admin' : 'user'),
        };
    };

    const fetchProfile = useCallback(async (userId, initialFallbackUser = null) => {
        if (!userId) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', userId)
                .maybeSingle();

            if (!error && data && data.role) {
                if (isMounted.current) setProfile(data);
                return data;
            }

            const fallback = getInitialProfileFromUser(initialFallbackUser) || { id: userId, role: 'user', full_name: 'User' };
            if (isMounted.current) setProfile(prev => prev || fallback);
            return fallback;
        } catch (err) {
            console.error('Unexpected error in fetchProfile:', err);
            const fallback = getInitialProfileFromUser(initialFallbackUser) || { id: userId, role: 'user', full_name: 'User' };
            if (isMounted.current) setProfile(prev => prev || fallback);
            return fallback;
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;

        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    const initialProfile = getInitialProfileFromUser(currentUser);
                    setProfile(initialProfile);
                    await fetchProfile(currentUser.id, currentUser);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error('Auth: Initialization error:', err);
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted.current) return;

            if (event === 'SIGNED_OUT' || signingOut.current) {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const fallbackProfile = getInitialProfileFromUser(currentUser);
                setProfile(prev => prev || fallbackProfile);
                await fetchProfile(currentUser.id, currentUser);
            } else {
                setProfile(null);
            }

            if (isMounted.current) {
                setLoading(false);
            }
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
            const initialProfile = getInitialProfileFromUser(data.user);
            setUser(data.user);
            setProfile(initialProfile);
            fetchProfile(data.user.id, data.user);
        }
        return { data, error };
    }, [fetchProfile]);

    const signOut = useCallback(async () => {
        // Immediately clear state so the UI redirects right away
        signingOut.current = true;
        setUser(null);
        setProfile(null);
        try {
            // scope: 'local' clears the session locally without a network call,
            // so logout always works even with poor connectivity
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            return { error };
        } catch (err) {
            return { error: err };
        } finally {
            signingOut.current = false;
        }
    }, []);

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signIn,
        signOut,
        isAdmin: profile?.role === 'admin' || user?.user_metadata?.role === 'admin' || user?.email === 'admin@winzi.com',
    }), [user, profile, loading, signIn, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
