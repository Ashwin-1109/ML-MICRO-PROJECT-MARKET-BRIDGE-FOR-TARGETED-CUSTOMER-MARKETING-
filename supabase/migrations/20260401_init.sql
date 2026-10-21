-- ===========================================================================
-- MarketBridge AI — PostgreSQL Database Schema & Security Policies (Supabase)
-- Academic Research: Purchasing Behavior for Targeted Marketing
-- ===========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    display_name TEXT NOT NULL,
    account_type TEXT CHECK (account_type IN ('merchant', 'customer', 'researcher', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (cost >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_threshold INTEGER NOT NULL DEFAULT 5,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_store_sku UNIQUE(store_id, sku)
);

-- 4. Inventory Movements Ledger (Append-Only)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    movement_type VARCHAR(32) NOT NULL CHECK (movement_type IN ('initial', 'sale', 'restock', 'adjustment', 'refund', 'damage')),
    quantity_delta INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id TEXT,
    actor_id UUID REFERENCES profiles(id),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    linked_user_id UUID REFERENCES profiles(id),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    segment_id TEXT,
    recency_days INTEGER DEFAULT 0,
    frequency INTEGER DEFAULT 0,
    monetary_total NUMERIC(12, 2) DEFAULT 0.0,
    average_order_value NUMERIC(10, 2) DEFAULT 0.0,
    risk_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_band VARCHAR(16) DEFAULT 'Low' CHECK (risk_band IN ('Low', 'Medium', 'High')),
    marketing_consent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    payment_method VARCHAR(32) DEFAULT 'card',
    notes TEXT,
    ordered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    line_total NUMERIC(10, 2) NOT NULL
);

-- 8. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    target_segment TEXT,
    target_risk_band VARCHAR(16) DEFAULT 'All',
    discount_percent NUMERIC(5, 2) DEFAULT 0.0,
    promo_code VARCHAR(32),
    message_draft TEXT,
    start_at TIMESTAMPTZ DEFAULT NOW(),
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ML Datasets & Models
CREATE TABLE IF NOT EXISTS ml_datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    record_count INTEGER NOT NULL DEFAULT 0,
    schema_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ml_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES ml_datasets(id),
    config_key VARCHAR(16) NOT NULL,
    feature_config VARCHAR(32) NOT NULL,
    classifier VARCHAR(32) NOT NULL,
    hyperparameters JSONB,
    metrics_json JSONB,
    status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ml_model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(32) UNIQUE NOT NULL,
    experiment_id UUID REFERENCES ml_experiments(id),
    name TEXT NOT NULL,
    is_deployed BOOLEAN DEFAULT FALSE,
    metrics_json JSONB,
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 11. Security Policies
-- Merchant isolation: Merchants can only see and mutate their own store records
CREATE POLICY merchant_store_access ON stores
    FOR ALL USING (auth.uid() = owner_user_id);

CREATE POLICY merchant_products_access ON products
    FOR ALL USING (
        store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
    );

CREATE POLICY customer_read_active_products ON products
    FOR SELECT USING (active = TRUE);

CREATE POLICY merchant_orders_access ON orders
    FOR ALL USING (
        store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
    );
