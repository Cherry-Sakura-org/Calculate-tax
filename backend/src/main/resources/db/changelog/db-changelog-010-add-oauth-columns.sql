--liquibase formatted sql

--changeset acheron:10
--comment Add OAuth provider columns to users table and make password_hash nullable

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255);

CREATE INDEX idx_users_oauth_provider
    ON users (oauth_provider, oauth_provider_id) WHERE deleted_at IS NULL;
