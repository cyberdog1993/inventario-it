-- ============================================================
-- Roles de usuario — ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'operator', 'client');

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    user_role NOT NULL DEFAULT 'client',
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer su propio rol
CREATE POLICY "read_own_role" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Solo admins pueden leer todos los roles
CREATE POLICY "admin_read_all_roles" ON user_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Solo admins pueden insertar/actualizar roles
CREATE POLICY "admin_manage_roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Función helper para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Actualizar políticas de devices según rol
-- ============================================================

-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "auth_insert_devices" ON devices;
DROP POLICY IF EXISTS "auth_update_devices" ON devices;
DROP POLICY IF EXISTS "auth_delete_devices" ON devices;

-- Lectura: admin, operator y client
-- (la política auth_read_devices ya existe y vale para todos)

-- Insertar: admin y operator
CREATE POLICY "role_insert_devices" ON devices
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'operator')
    )
  );

-- Actualizar: admin y operator
CREATE POLICY "role_update_devices" ON devices
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'operator')
    )
  );

-- Eliminar: solo admin
CREATE POLICY "role_delete_devices" ON devices
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- API keys: solo admin
DROP POLICY IF EXISTS "auth_insert_api_keys" ON api_keys;
DROP POLICY IF EXISTS "auth_update_api_keys" ON api_keys;
DROP POLICY IF EXISTS "auth_delete_api_keys" ON api_keys;
DROP POLICY IF EXISTS "auth_read_api_keys" ON api_keys;

CREATE POLICY "admin_manage_api_keys" ON api_keys
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Sites: admin y operator pueden gestionar, client solo leer
DROP POLICY IF EXISTS "auth_insert_sites" ON sites;
DROP POLICY IF EXISTS "auth_update_sites" ON sites;
DROP POLICY IF EXISTS "auth_delete_sites" ON sites;

CREATE POLICY "role_write_sites" ON sites
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "role_update_sites" ON sites
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "role_delete_sites" ON sites
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- ============================================================
-- Asignar rol admin al primer usuario (reemplaza el email)
-- ============================================================
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'julio.valdez@consultores-it.com';
