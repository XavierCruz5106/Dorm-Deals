CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  major TEXT,
  year TEXT,
  housing_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  reviewer_user_id TEXT NOT NULL,
  reviewee_user_id TEXT NOT NULL,
  reviewer_name TEXT,
  reviewer_image_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (item_id, reviewer_user_id)
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles (display_name);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewee_user_id ON ratings (reviewee_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_item_id ON ratings (item_id);
