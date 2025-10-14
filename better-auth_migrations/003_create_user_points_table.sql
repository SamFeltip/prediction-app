-- Create user_points table to track user points
CREATE TABLE IF NOT EXISTS user_points (
  user_id TEXT PRIMARY KEY,
  points INTEGER DEFAULT 1000, -- Starting points
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to initialize user points
CREATE OR REPLACE FUNCTION initialize_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_points (user_id, points)
  VALUES (NEW.id, 1000)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create points for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_points ON neon_auth.users_sync;
CREATE TRIGGER trigger_initialize_user_points
AFTER INSERT ON neon_auth.users_sync
FOR EACH ROW
EXECUTE FUNCTION initialize_user_points();
