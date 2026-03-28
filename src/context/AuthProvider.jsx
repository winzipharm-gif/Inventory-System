import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);

    const fetchProfile = useCallback(async (userId) => {
        if (!userId) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error.message);
                return null;
            }
            if (isMounted.current) setProfile(data);
            return data;
        } catch (err) {
            console.error('Unexpected error in fetchProfile:', err);
            return null;
        }
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
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
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
