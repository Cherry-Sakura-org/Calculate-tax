--liquibase formatted sql

--changeset acheron:006-create-import-files-table
CREATE TABLE IF NOT EXISTS import_files
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,

    original_filename   VARCHAR(500)                NOT NULL,
    file_size_bytes     BIGINT                      NOT NULL,
    total_records       INTEGER                     NOT NULL DEFAULT 0,
    successful_records  INTEGER                     NOT NULL DEFAULT 0,
    failed_records      INTEGER                     NOT NULL DEFAULT 0,
    out_of_ny_records   INTEGER                     NOT NULL DEFAULT 0,
    duration_ms         BIGINT,
    records_per_second  DOUBLE PRECISION,
    imported_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    imported_by_user_id UUID                        NOT NULL,
    status              VARCHAR(20)                 NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT fk_import_files_user
        FOREIGN KEY (imported_by_user_id)
            REFERENCES users (id)
            ON DELETE RESTRICT
);

--rollback DROP TABLE IF EXISTS import_files;

--changeset acheron:006-add-county-region-to-orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS county VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS region VARCHAR(50);

--rollback ALTER TABLE orders DROP COLUMN IF EXISTS region;
--rollback ALTER TABLE orders DROP COLUMN IF EXISTS county;

--changeset acheron:006-add-import-file-id-to-orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS import_file_id UUID;
ALTER TABLE orders ADD CONSTRAINT fk_orders_import_file
    FOREIGN KEY (import_file_id) REFERENCES import_files (id) ON DELETE SET NULL;

--rollback ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_import_file;
--rollback ALTER TABLE orders DROP COLUMN IF EXISTS import_file_id;

--changeset acheron:006-add-indexes-county-region-import
CREATE INDEX idx_orders_county ON orders(LOWER(county)) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_region ON orders(LOWER(region)) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_import_file_id ON orders(import_file_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_import_files_imported_at ON import_files(imported_at DESC);

--rollback DROP INDEX IF EXISTS idx_import_files_imported_at;
--rollback DROP INDEX IF EXISTS idx_orders_import_file_id;
--rollback DROP INDEX IF EXISTS idx_orders_region;
--rollback DROP INDEX IF EXISTS idx_orders_county;
