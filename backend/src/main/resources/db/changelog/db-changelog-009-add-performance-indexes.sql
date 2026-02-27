--liquibase formatted sql

--changeset acheron:009-add-sort-filter-indexes
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_subtotal ON orders(subtotal) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_composite_tax_rate ON orders(composite_tax_rate) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS idx_orders_composite_tax_rate;
--rollback DROP INDEX IF EXISTS idx_orders_subtotal;
--rollback DROP INDEX IF EXISTS idx_orders_total_amount;

--changeset acheron:009-add-county-trigram-index
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_orders_county_trgm ON orders USING gin (LOWER(county) gin_trgm_ops) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS idx_orders_county_trgm;
