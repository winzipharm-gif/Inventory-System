import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

/**
 * Verify the caller is an authenticated admin.
 * Returns the callerUser on success, or a Response on failure.
 */
async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const callerToken = authHeader.replace('Bearer ', '');

  const anonClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
  const { data: { user: callerUser }, error: callerError } = await anonClient.auth.getUser(callerToken);

  if (callerError || !callerUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: callerProfile } = await anonClient
    .from('profiles')
    .select('role')
    .eq('id', callerUser.id)
    .single();

  if (!callerProfile || callerProfile.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Only admins can manage users.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return callerUser;
}

/** Build a service-role admin client for privileged operations. */
function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin for all operations
    const authResult = await verifyAdmin(req);
    if (authResult instanceof Response) return authResult;
    const callerUser = authResult;

    const body = await req.json();
    const { action } = body;

    // ── DELETE USER ──────────────────────────────────────────────
    if (action === 'delete' || req.method === 'DELETE') {
      const { userId } = body;
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId is required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Prevent self-deletion
      if (userId === callerUser.id) {
        return new Response(JSON.stringify({ error: 'You cannot delete your own account.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const adminClient = getAdminClient();

      // Delete from auth (this cascades – the profile row will be
      // removed if there is an ON DELETE CASCADE, otherwise we
      // clean it up manually below).
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        return new Response(JSON.stringify({ error: deleteAuthError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Also remove the profile row (safe even if it was already cascaded)
      await adminClient.from('profiles').delete().eq('id', userId);

      return new Response(
        JSON.stringify({ message: 'User deleted successfully.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── CREATE USER (default POST) ──────────────────────────────
    const { email, password, role } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validRole = role === 'admin' ? 'admin' : 'user';

    const adminClient = getAdminClient();

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so the user can log in immediately
      user_metadata: { role: validRole },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upsert the profile with the correct role
    // (The DB trigger should handle this, but we upsert to be safe)
    if (newUser?.user) {
      await adminClient.from('profiles').upsert({
        id: newUser.user.id,
        full_name: email.split('@')[0],
        role: validRole,
      });
    }

    return new Response(
      JSON.stringify({ message: 'User created successfully.', userId: newUser?.user?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
