--liquibase formatted sql

--changeset acheron:002-create-tax-localities-table
CREATE TABLE IF NOT EXISTS tax_localities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality VARCHAR(100) NOT NULL UNIQUE,
    tax_rate_percent NUMERIC(6, 3),
    reporting_code VARCHAR(10),
    see_reference VARCHAR(100),
    is_special_district BOOLEAN DEFAULT FALSE,
    parent_county VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

--changeset acheron:002-create-tax-localities-indexes
CREATE INDEX idx_tax_localities_locality ON tax_localities(LOWER(locality));
CREATE INDEX idx_tax_localities_parent_county ON tax_localities(LOWER(parent_county));
CREATE INDEX idx_tax_localities_deleted_at ON tax_localities(deleted_at) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS idx_tax_localities_deleted_at;
--rollback DROP INDEX IF EXISTS idx_tax_localities_parent_county;
--rollback DROP INDEX IF EXISTS idx_tax_localities_locality;
--rollback DROP TABLE IF EXISTS tax_localities;
