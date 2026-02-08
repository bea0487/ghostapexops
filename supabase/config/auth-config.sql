-- ============================================================================
-- Supabase Auth Configuration for Ghost Apex Operations Portal
-- ============================================================================
-- This file contains SQL commands to configure Supabase Auth settings
-- These commands should be run in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- JWT CONFIGURATION
-- ============================================================================

-- Configure JWT expiration time to 24 hours (86400 seconds)
-- This is set in the Supabase Dashboard under Authentication > Settings
-- JWT expiry: 86400 seconds (24 hours)

-- Note: The actual JWT expiry configuration is done through the Supabase Dashboard
-- or through the Supabase CLI configuration file (config.toml)
-- This file documents the required settings

-- ============================================================================
-- CUSTOM JWT CLAIMS FUNCTION
-- ============================================================================

-- Function to add custom claims to JWT tokens
-- This function adds client_id and role to the JWT token
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_client_id uuid;
BEGIN
  -- Get the claims from the event
  claims := event->'claims';
  
  -- Get user metadata
  user_role := event->'user_metadata'->>'role';
  
  -- If user has a role in metadata, add it to claims
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    -- Default to 'client' role if not specified
    claims := jsonb_set(claims, '{role}', '"client"');
  END IF;
  
  -- Get client_id from clients table if user is a client
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
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.custom_access_token_hook IS 
'Custom JWT claims hook that adds role and client_id to access tokens. 
This function is called by Supabase Auth when generating JWT tokens.
It adds:
- role: Either "admin" or "client" (defaults to "client")
- client_id: The UUID of the client record (only for client users)';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- To verify the function is created correctly, run:
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'custom_access_token_hook';

