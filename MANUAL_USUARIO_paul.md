# Manual de acceso — Inventario IT
## Consultores-IT

---

## Acceso al sistema

**URL:** https://inventario-it-self.vercel.app
*(próximamente: https://inventario.consultores-it.com)*

**Usuario:** paul.chugden@consultores-it.com
**Contraseña:** Consultores00!

---

## ¿Qué puedo hacer en el sistema?

### Dashboard
Vista general del inventario: total de equipos, activos, en mantenimiento, retirados y equipos vistos recientemente por agente automático.

### Inventario
Lista completa de equipos. Puedes:
- **Buscar** por hostname, serial, IP o marca
- **Filtrar** por tipo, estado o ubicación
- **Ver el detalle** de cualquier equipo haciendo clic en su nombre
- **Editar** o **eliminar** equipos

### Agregar equipo (manual)
Formulario para registrar un equipo que no puede reportarse automáticamente. Campos disponibles: tipo, hostname, serial, marca, modelo, IP, MAC, OS, CPU, RAM, almacenamiento, ubicación, asignado a, fechas de compra y garantía.

### Importar Excel
Para cargar muchos equipos a la vez:
1. Descarga la plantilla haciendo clic en **"Descargar plantilla_inventario.xlsx"**
2. Llena la información (una fila por equipo)
3. Sube el archivo — el sistema valida y avisa si hay errores

### Ubicaciones
Gestión de sitios o sucursales. Agrega las oficinas o sedes de la organización para asociar equipos a cada una.

### API Keys
Claves para que los agentes automáticos (scripts en los equipos) reporten su información al servidor.

---

## Agente de reporte automático

Para que un equipo reporte automáticamente su información, instala el script correspondiente:

### Windows (PowerShell)

Descarga: https://raw.githubusercontent.com/cyberdog1993/inventario-it/main/scripts/agent-windows.ps1

```powershell
# Ejecutar manualmente:
powershell -ExecutionPolicy Bypass -File agent-windows.ps1

# Programar cada hora (ejecutar como Administrador):
schtasks /create /tn "InventarioIT" /tr "powershell -ExecutionPolicy Bypass -File C:\Scripts\agent-windows.ps1" /sc hourly /ru SYSTEM
```

### Linux / macOS (Bash)

Descarga: https://raw.githubusercontent.com/cyberdog1993/inventario-it/main/scripts/agent-linux.sh

```bash
chmod +x agent-linux.sh
./agent-linux.sh

# Programar con cron (cada hora):
crontab -e
# Agregar: 0 * * * * /opt/scripts/agent-linux.sh
```

---

## Tipos de equipo disponibles

| Código | Nombre |
|---|---|
| desktop | Desktop |
| laptop | Laptop |
| server | Servidor |
| gateway | Gateway |
| firewall | Firewall |
| switch | Switch |
| access_point | Access Point |
| printer | Impresora |
| gaming_console | Consola |
| nvr | NVR |
| camera | Cámara |
| devkit | Devkit |
| other | Otro |

---

## Estados de equipo

| Estado | Descripción |
|---|---|
| active | En uso y funcionando |
| inactive | Apagado o sin uso |
| maintenance | En reparación o mantenimiento |
| retired | Dado de baja |
| unknown | Estado desconocido |

---

*Sistema desarrollado para Consultores-IT*
