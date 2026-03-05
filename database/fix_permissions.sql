-- =============================================================================
-- SOLO SME Platform — Permission Fix Migration
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lupngqjxofprpojknhez/sql/new
-- =============================================================================
-- ─────────────────────────────────────────────────
-- FIX: Grant schema-level access to Supabase roles
-- Without these, RLS policies cannot be evaluated
-- because the roles can't even access the schema.
-- ─────────────────────────────────────────────────
-- Schema usage
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
-- Table access (RLS still enforces row-level security)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,
    authenticated;
-- Sequence access (for auto-generated UUIDs / serials)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon,
    authenticated;
-- Function execution
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon,
    authenticated;
-- Default privileges for future tables/sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO anon,
    authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO anon,
    authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO anon,
    authenticated;
-- ─────────────────────────────────────────────────
-- VERIFY: Enable RLS on conversations table
-- (was missing from original schema)
-- ─────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
-- =============================================================================
-- DONE — After running this, sign-up and sign-in should work immediately.
-- =============================================================================