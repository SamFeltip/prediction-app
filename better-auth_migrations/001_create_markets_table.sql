-- Create markets table for binary prediction markets
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  outcome BOOLEAN, -- NULL = unresolved, TRUE = yes, FALSE = no
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_markets_creator ON markets(creator_id);
CREATE INDEX IF NOT EXISTS idx_markets_deadline ON markets(deadline);
CREATE INDEX IF NOT EXISTS idx_markets_resolved ON markets(resolved);
