-- Add timed sale-price support to products
-- Admins can set a sale_price with optional start/end window.
-- When sale_price IS NOT NULL and the current time falls inside the window,
-- the storefront displays the sale price instead of the regular price.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_price      NUMERIC,
  ADD COLUMN IF NOT EXISTS sale_starts_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_ends_at    TIMESTAMPTZ;

COMMENT ON COLUMN products.sale_price     IS 'Promotional price in dollars (numeric). NULL = no active promotion.';
COMMENT ON COLUMN products.sale_starts_at IS 'When the sale begins. NULL = active as soon as sale_price is set.';
COMMENT ON COLUMN products.sale_ends_at   IS 'When the sale expires. NULL = no automatic expiry.';
