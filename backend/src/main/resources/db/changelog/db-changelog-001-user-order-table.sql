--liquibase formatted sql

--changeset acheron:1
--comment Initial schema for Users, Orders, and Tax Breakdowns with Soft Delete

-- =================================================================================================
-- 1. USERS TABLE (Admins)
-- =================================================================================================
CREATE TABLE IF NOT EXISTS users
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auditing fields
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP WITHOUT TIME ZONE,
    deleted_at    TIMESTAMP WITHOUT TIME ZONE,

    -- Core fields
    email         VARCHAR(255)                NOT NULL,
    username      VARCHAR(255)                NOT NULL,
    password_hash VARCHAR(255)                NOT NULL,
    role          VARCHAR(50)                 NOT NULL DEFAULT 'ADMIN'
);

COMMENT ON TABLE users IS 'Stores system users, primarily administrators managing orders';
COMMENT ON COLUMN users.role IS 'User permission level (e.g., ADMIN, SUPER_ADMIN)';

-- =================================================================================================
-- 2. ORDERS TABLE
-- =================================================================================================
CREATE TABLE IF NOT EXISTS orders
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auditing fields
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,

    -- Relations
    created_by_admin_id UUID                        NOT NULL,

    -- Core fields (Input data)
    latitude            NUMERIC(10, 7)              NOT NULL,
    longitude           NUMERIC(10, 7)              NOT NULL,
    subtotal            NUMERIC(12, 2)              NOT NULL,
    ordered_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL, -- Original order timestamp

    -- Calculated fields (Output data)
    composite_tax_rate  NUMERIC(8, 5)               NOT NULL,
    tax_amount          NUMERIC(12, 2)              NOT NULL,
    total_amount        NUMERIC(12, 2)              NOT NULL,

    CONSTRAINT fk_orders_created_by
        FOREIGN KEY (created_by_admin_id)
            REFERENCES users (id)
            -- Restrict deletion of an admin if they have associated orders
            ON DELETE RESTRICT
);

COMMENT ON TABLE orders IS 'Stores drone delivery orders for Instant Wellness Kits';
COMMENT ON COLUMN orders.created_by_admin_id IS 'Tracks which admin manually created or imported this order via CSV';

-- =================================================================================================
-- 3. ORDER TAX BREAKDOWNS TABLE (1-to-1 relation)
-- =================================================================================================
CREATE TABLE IF NOT EXISTS order_tax_breakdowns
(
    order_id      UUID PRIMARY KEY,

    -- Breakdown rates
    state_rate    NUMERIC(8, 5) NOT NULL DEFAULT 0,
    county_rate   NUMERIC(8, 5) NOT NULL DEFAULT 0,
    city_rate     NUMERIC(8, 5) NOT NULL DEFAULT 0,
    special_rates NUMERIC(8, 5) NOT NULL DEFAULT 0,

    -- Bonus: Applied jurisdictions
    jurisdictions JSONB,

    CONSTRAINT fk_order_tax_breakdown_order
        FOREIGN KEY (order_id)
            REFERENCES orders (id)
            ON DELETE CASCADE
);

COMMENT ON TABLE order_tax_breakdowns IS '1-to-1 relation storing the detailed tax breakdown for an order';

-- =================================================================================================
-- 4. INDEXES
-- =================================================================================================

-- Users Indexes
CREATE UNIQUE INDEX idx_users_email_unique_active
    ON users (email) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_users_username_unique_active
    ON users (username) WHERE deleted_at IS NULL;

-- Orders Indexes
CREATE INDEX idx_orders_ordered_at
    ON orders (ordered_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX idx_orders_admin_id
    ON orders (created_by_admin_id);

CREATE INDEX idx_orders_active
    ON orders (deleted_at) WHERE deleted_at IS NULL;

-- Tax Breakdowns Index
CREATE INDEX idx_tax_breakdown_jurisdictions_gin
    ON order_tax_breakdowns USING gin (jurisdictions);