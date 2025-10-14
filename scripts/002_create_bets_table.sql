-- Create bets table for user predictions
CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  prediction BOOLEAN NOT NULL, -- TRUE = yes, FALSE = no
  points INTEGER NOT NULL CHECK (points > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bets_market ON bets(market_id);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);

-- Prevent duplicate bets from same user on same market
CREATE UNIQUE INDEX IF NOT EXISTS idx_bets_user_market ON bets(user_id, market_id);
