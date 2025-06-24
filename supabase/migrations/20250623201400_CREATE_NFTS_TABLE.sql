-- supabase/migrations/YYYYMMDDHHMMSS_create_nfts_table.sql
-- This is the "up" migration that creates the table.
CREATE TABLE public.nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL,
    achievement_type TEXT NOT NULL,
    hunt_id TEXT NOT NULL,
    metadata JSONB,
    mint_date TEXT NOT NULL,
    transaction_id TEXT
);

COMMENT ON TABLE public.nfts IS 'Table containing user NFTs';
COMMENT ON COLUMN public.nfts.id IS 'Primary key, UUID';
COMMENT ON COLUMN public.nfts.user_wallet IS 'User''s wallet address';
COMMENT ON COLUMN public.nfts.achievement_type IS 'Type of achievement, e.g., first_discovery';
COMMENT ON COLUMN public.nfts.hunt_id IS 'Link to game_sessions';
COMMENT ON COLUMN public.nfts.metadata IS 'JSONB column for flexible metadata';
COMMENT ON COLUMN public.nfts.mint_date IS 'ISO timestamp of mint date';
COMMENT ON COLUMN public.nfts.transaction_id IS 'Optional transaction ID if minted on-chain';

-- You might also want a "down" migration to revert the change if needed.
-- This is typically in a separate file named YYYYMMDDHHMMSS_create_nfts_table.down.sql
-- or within the same file if your migration tool supports it.
-- For now, you can just add it as a comment or create a separate file.
-- DROP TABLE public.nfts;
