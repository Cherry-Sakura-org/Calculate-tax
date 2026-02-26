--liquibase formatted sql

--changeset acheron:005-add-is-within-new-york-to-orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_within_new_york BOOLEAN NOT NULL DEFAULT TRUE;

--rollback ALTER TABLE orders DROP COLUMN IF EXISTS is_within_new_york;

--changeset acheron:005-add-tax-breakdown-fields-to-tax-localities
ALTER TABLE tax_localities ADD COLUMN IF NOT EXISTS state_rate NUMERIC(8, 5);
ALTER TABLE tax_localities ADD COLUMN IF NOT EXISTS county_rate NUMERIC(8, 5);
ALTER TABLE tax_localities ADD COLUMN IF NOT EXISTS city_rate NUMERIC(8, 5);
ALTER TABLE tax_localities ADD COLUMN IF NOT EXISTS special_rates NUMERIC(8, 5);

--rollback ALTER TABLE tax_localities DROP COLUMN IF EXISTS special_rates;
--rollback ALTER TABLE tax_localities DROP COLUMN IF EXISTS city_rate;
--rollback ALTER TABLE tax_localities DROP COLUMN IF EXISTS county_rate;
--rollback ALTER TABLE tax_localities DROP COLUMN IF EXISTS state_rate;

--changeset acheron:005-add-index-orders-within-ny
CREATE INDEX idx_orders_within_ny ON orders(is_within_new_york) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS idx_orders_within_ny;
