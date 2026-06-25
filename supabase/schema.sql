-- ============================================================
-- IT Inventory - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Sites / Locations
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device types enum
CREATE TYPE device_type AS ENUM (
  'desktop', 'laptop', 'server', 'gateway', 'firewall',
  'switch', 'access_point', 'printer', 'gaming_console',
  'nvr', 'camera', 'devkit', 'other'
);

-- Device status enum
CREATE TYPE device_status AS ENUM (
  'active', 'inactive', 'maintenance', 'retired', 'unknown'
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type device_type NOT NULL DEFAULT 'other',
  hostname TEXT,
  serial TEXT,
  brand TEXT,
  model TEXT,
  ip_address TEXT,
  mac_address TEXT,
  os TEXT,
  os_version TEXT,
  cpu TEXT,
  ram_gb NUMERIC,
  storage_gb NUMERIC,
  location TEXT,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  status device_status NOT NULL DEFAULT 'unknown',
  notes TEXT,
  assigned_to TEXT,
  purchase_date DATE,
  warranty_until DATE,
  last_seen TIMESTAMPTZ,
  auto_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for agent reporting
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  changes JSONB,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write devices and sites
CREATE POLICY "auth_read_devices" ON devices FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_devices" ON devices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_devices" ON devices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_devices" ON devices FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_read_sites" ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_sites" ON sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_sites" ON sites FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_sites" ON sites FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_read_api_keys" ON api_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_api_keys" ON api_keys FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_api_keys" ON api_keys FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_api_keys" ON api_keys FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_read_audit" ON audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_audit" ON audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_site_id ON devices(site_id);
CREATE INDEX idx_devices_mac ON devices(mac_address);
CREATE INDEX idx_devices_hostname ON devices(hostname);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);
