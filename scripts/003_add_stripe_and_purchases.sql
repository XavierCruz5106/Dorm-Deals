ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  seller_user_id TEXT NOT NULL,
  buyer_user_id TEXT NOT NULL,
  amount_total_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  stripe_checkout_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON profiles (stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON purchases (item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_user_id ON purchases (seller_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_user_id ON purchases (buyer_user_id);
