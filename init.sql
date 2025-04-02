CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  email TEXT,
  data TEXT,
  type TEXT,
  created INTEGER,
  updated INTEGER
);

CREATE INDEX IF NOT EXISTS idx_user_id ON user(id); 