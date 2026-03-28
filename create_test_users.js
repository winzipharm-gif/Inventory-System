import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createUsers() {
    console.log('Registering users...');

    // Register Admin
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: 'admin@winzi.com',
        password: 'password123',
        options: {
            data: {
                full_name: 'Admin User',
                role: 'admin'
            }
        }
    });

    if (adminError) console.error('Admin signup error:', adminError.message);
    else console.log('Admin registered:', adminData.user.id);

    // Register User
    const { data: userData, error: userError } = await supabase.auth.signUp({
        email: 'user@winzi.com',
        password: 'password123',
        options: {
            data: {
                full_name: 'Staff Member',
                role: 'user'
            }
        }
    });

    if (userError) console.error('User signup error:', userError.message);
    else console.log('User registered:', userData.user.id);
}

createUsers();
