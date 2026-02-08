-- ============================================================================
-- Migration: Custom JWT Claims for Authentication
-- ============================================================================
-- This migration adds a custom JWT claims hook to include role and client_id
-- in JWT tokens for authorization and multi-tenant data isolation
-- ============================================================================

-- ============================================================================
-- CUSTOM JWT CLAIMS FUNCTION
-- ============================================================================

-- Function to add custom claims to JWT tokens
-- This function is called by Supabase Auth when generating access tokens
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_client_id uuid;
BEGIN
  -- Get the claims from the event
  claims := event->'claims';
  
  -- Get user metadata (role is stored in raw_user_meta_data)
  user_role := event->'user_metadata'->>'role';
  
  -- If user has a role in metadata, add it to claims
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    -- Default to 'client' role if not specified
    claims := jsonb_set(claims, '{role}', '"client"');
  END IF;
  
  -- Get client_id from clients table if user is a client
  -- Admins don't have client records, so this will be NULL for them
  IF user_role = 'client' OR user_role IS NULL THEN
    SELECT id INTO user_client_id
    FROM public.clients
    WHERE user_id = (event->>'user_id')::uuid;
    
    -- Add client_id to claims if found
    IF user_client_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{client_id}', to_jsonb(user_client_id::text));
    END IF;
  END IF;
  
  -- Update the event with new claims
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO service_role;

-- ============================================================================
-- UPDATE RLS HELPER FUNCTIONS TO USE JWT CLAIMS
-- ============================================================================

-- Update is_admin function to use JWT claims instead of user_metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'role')::TEXT = '"admin"',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_user_client_id function to use JWT claims
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
BEGIN
  -- First try to get client_id from JWT claims (faster)
  DECLARE
    jwt_client_id TEXT;
  BEGIN
    jwt_client_id := auth.jwt() -> 'client_id';
    
    -- If client_id is in JWT, return it
    IF jwt_client_id IS NOT NULL AND jwt_client_id != 'null' THEN
      RETURN jwt_client_id::UUID;
    END IF;
  END;
  
  -- Fallback: query the clients table
  RETURN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.custom_access_token_hook IS 
'Custom JWT claims hook that adds role and client_id to access tokens. 
This function is called by Supabase Auth when generating JWT tokens.
It adds:
- role: Either "admin" or "client" (defaults to "client")
- client_id: The UUID of the client record (only for client users)

To enable this hook in Supabase Dashboard:
1. Navigate to Authentication > Hooks
2. Enable "Custom Access Token Hook"
3. Set the hook to: pg-functions://postgres/public/custom_access_token_hook';

COMMENT ON FUNCTION is_admin IS 
'Helper function to check if current user has admin role.
Updated to use JWT claims for better performance.';

COMMENT ON FUNCTION get_user_client_id IS 
'Helper function to get client_id for current authenticated user.
Updated to use JWT claims first, with fallback to database query.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- To verify the function is created correctly, run:
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'custom_access_token_hook';

-- To test the function with a sample event:
-- SELECT public.custom_access_token_hook(
--   '{"user_id": "123e4567-e89b-12d3-a456-426614174000", 
--     "user_metadata": {"role": "client"}, 
--     "claims": {"aud": "authenticated"}}'::jsonb
-- );

