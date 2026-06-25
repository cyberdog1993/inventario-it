import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const headers = [
    'tipo', 'hostname', 'numero_serie', 'marca', 'modelo',
    'ip', 'mac', 'sistema_operativo', 'version_os', 'cpu',
    'ram_gb', 'almacenamiento_gb', 'ubicacion', 'sitio',
    'estado', 'asignado_a', 'fecha_compra', 'garantia_hasta', 'notas'
  ]

  const example = [
    'desktop', 'PC-VENTAS-01', 'ABC123', 'Dell', 'OptiPlex 7010',
    '192.168.1.100', 'AA:BB:CC:DD:EE:FF', 'Windows', '11', 'Intel Core i7',
    '16', '512', 'Piso 2', 'Oficina Central',
    'active', 'Juan Pérez', '2023-01-15', '2026-01-15', 'Equipo de ventas'
  ]

  const validTypes = 'desktop | laptop | server | gateway | firewall | switch | access_point | printer | gaming_console | nvr | camera | devkit | other'
  const validStatuses = 'active | inactive | maintenance | retired | unknown'

  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    example,
    [],
    ['--- Valores válidos para "tipo" ---'],
    [validTypes],
    [],
    ['--- Valores válidos para "estado" ---'],
    [validStatuses],
    [],
    ['--- Formato de fechas: YYYY-MM-DD (ej: 2024-03-15) ---'],
  ])

  ws['!cols'] = headers.map(() => ({ wch: 20 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_inventario.xlsx"',
    },
  })
}
