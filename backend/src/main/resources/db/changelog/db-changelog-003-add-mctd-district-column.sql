--liquibase formatted sql

--changeset acheron:003-add-mctd-district-column
ALTER TABLE tax_localities ADD COLUMN IF NOT EXISTS is_mctd_district BOOLEAN DEFAULT FALSE;

--rollback ALTER TABLE tax_localities DROP COLUMN IF EXISTS is_mctd_district;
