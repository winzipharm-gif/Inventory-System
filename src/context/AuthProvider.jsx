import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);

    /**
     * Fetch the user's profile from the `profiles` table.
     * Retries up to `maxRetries` times with a delay to handle the race condition
     * where the DB trigger hasn't inserted the profile row yet when auth fires.
     */
    const fetchProfile = useCallback(async (userId, retries = 5, delayMs = 600) => {
        if (!userId) return null;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .eq('id', userId)
                    .single();

                if (!error && data) {
                    if (isMounted.current) setProfile(data);
                    return data;
                }
                // If the profile isn't ready yet, wait and retry
                if (attempt < retries) {
                    console.warn(`Auth: Profile not found for ${userId}, retrying (${attempt}/${retries})...`);
                    await new Promise((res) => setTimeout(res, delayMs));
                } else {
                    console.error('Auth: Could not fetch profile after retries:', error?.message);
                    const fallback = { id: userId, role: 'user', error: true };
                    if (isMounted.current) setProfile(fallback);
                    return fallback;
                }
            } catch (err) {
                console.error('Unexpected error in fetchProfile:', err);
                if (attempt === retries) {
                    const fallback = { id: userId, role: 'user', error: true };
                    if (isMounted.current) setProfile(fallback);
                    return fallback;
                }
                await new Promise((res) => setTimeout(res, delayMs));
            }
        }
        return null;
    }, []);

    useEffect(() => {
        isMounted.current = true;

        const initializeAuth = async () => {
            console.log('Auth: Initializing...');
            const timeout = setTimeout(() => {
                if (isMounted.current && loading) {
                    console.warn('Auth: Initialization timed out, forcing loading=false');
                    setLoading(false);
                }
            }, 10000);

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user ?? null;
                console.log('Auth: Current user:', currentUser?.email || 'none');
                setUser(currentUser);

                if (currentUser) {
                    await fetchProfile(currentUser.id);
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error('Auth: Initialization error:', err);
            } finally {
                clearTimeout(timeout);
                if (isMounted.current) {
                    console.log('Auth: Initialization complete');
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted.current) return;

            // Only process meaningful auth changes after initial load
            if (event === 'INITIAL_SESSION') return;

            const currentUser = session?.user ?? null;

            // Set loading while we resolve the profile so that
            // ProtectedRoute shows a spinner instead of bouncing
            // admins to /sales before their role is known.
            if (isMounted.current) setLoading(true);

            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }

            if (isMounted.current) setLoading(false);
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProfile]);


    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    }, []);

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signIn,
        signOut,
        isAdmin: profile?.role === 'admin',
    }), [user, profile, loading, signIn, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
