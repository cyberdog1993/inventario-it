# Inventario IT — Consultores-IT

Sistema web de inventario de equipos de TI con reporte automático de agentes, carga manual y masiva vía Excel.

## Características

- **Dashboard** con resumen por tipo, estado y equipos recientes
- **Inventario** con búsqueda y filtros por tipo, estado y ubicación
- **Alta manual** con formulario completo por tipo de equipo
- **Importación Excel** con plantilla descargable y validación
- **Agentes automáticos** (PowerShell + Bash) para equipos encendidos
- **API Keys** para autenticar agentes de reporte
- **Ubicaciones/Sitios** para organizar por sucursal o sede
- **Autenticación** con Supabase Auth

## Tipos de equipo soportados

Desktop · Laptop · Servidor · Gateway · Firewall · Switch · Access Point · Impresora · Consola · NVR · Cámara · Devkit · Otro

---

## Despliegue en producción

### 1. Supabase — Crear proyecto y schema

1. Ve a https://dashboard.supabase.com → New Project
2. En el SQL Editor, ejecuta el contenido de `supabase/schema.sql`
3. En Authentication > Settings > Enable Email Auth
4. Crea tu primer usuario en Authentication > Users > Invite user

**Obtén las keys** en Settings > API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Vercel — Despliegue

1. Sube este repo a GitHub
2. Ve a vercel.com → New Project → Import desde GitHub
3. En **Environment Variables**, agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Deploy

### 3. DNS personalizado

En Vercel → Settings → Domains → Agrega `inventario.consultores-it.com`

Vercel te dará un CNAME o A record para agregar en tu proveedor DNS.

---

## Variables de entorno

Copia `.env.local.example` como `.env.local` para desarrollo local:

```bash
cp .env.local.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) |

---

## Agentes de reporte automático

Los scripts están en `scripts/`.

### Windows (PowerShell)

```powershell
# 1. Edita agent-windows.ps1 y reemplaza:
$API_KEY    = "inv_TU_CLAVE_AQUI"
$SERVER_URL = "https://inventario.consultores-it.com/api/report"

# 2. Ejecutar manualmente:
powershell -ExecutionPolicy Bypass -File .\agent-windows.ps1

# 3. Programar cada hora (como SYSTEM):
schtasks /create /tn "InventarioIT" /tr "powershell -ExecutionPolicy Bypass -File C:\Scripts\agent-windows.ps1" /sc hourly /ru SYSTEM
```

### Linux / macOS (Bash)

```bash
# 1. Edita agent-linux.sh y reemplaza:
API_KEY="inv_TU_CLAVE_AQUI"
SERVER_URL="https://inventario.consultores-it.com/api/report"

# 2. Dar permisos y ejecutar:
chmod +x agent-linux.sh
./agent-linux.sh

# 3. Programar con cron (cada hora):
crontab -e
# Agrega: 0 * * * * /opt/scripts/agent-linux.sh
```

### API de reporte — Endpoint

`POST /api/report`

```json
{
  "api_key": "inv_...",
  "hostname": "PC-VENTAS-01",
  "type": "desktop",
  "serial": "ABC123",
  "brand": "Dell",
  "model": "OptiPlex 7010",
  "ip_address": "192.168.1.100",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "os": "Windows",
  "os_version": "11",
  "cpu": "Intel Core i7-12700",
  "ram_gb": 16,
  "storage_gb": 512
}
```

El endpoint hace upsert por MAC address o hostname. Responde `{"status":"created"|"updated","id":"uuid"}`.

---

## Importación masiva Excel

1. Descarga la plantilla en /import → Descargar plantilla
2. Completa con tus equipos (una fila por equipo)
3. Sube el archivo en la misma pantalla
4. El sistema valida tipos/estados y muestra errores antes de importar

---

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local con tus keys de Supabase
npm run dev
```

---

## Estructura del proyecto

```
app/
  (app)/              # Rutas protegidas (requieren auth)
    dashboard/
    inventory/
    import/
    sites/
    api-keys/
  auth/
  api/
    report/           # Endpoint para agentes automáticos
    export/template/  # Descarga plantilla Excel
components/
  inventory/
  layout/
  ui/
lib/supabase/
types/
scripts/              # Agentes PowerShell y Bash
supabase/schema.sql   # Schema completo de la BD
```
