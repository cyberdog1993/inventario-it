'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS } from '@/types'

const VALID_TYPES = Object.keys(DEVICE_TYPE_LABELS)
const VALID_STATUSES = Object.keys(DEVICE_STATUS_LABELS)

interface RowError { row: number; message: string }

export function ImportExcelForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [errors, setErrors] = useState<RowError[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function handleFile(f: File) {
    setFile(f)
    setErrors([])
    setDone(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
      setPreview(rows.slice(0, 5))
    }
    reader.readAsArrayBuffer(f)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

      const rowErrors: RowError[] = []
      const records = rows.map((row, i) => {
        const type = row.tipo?.trim() || 'other'
        const status = row.estado?.trim() || 'unknown'
        if (!VALID_TYPES.includes(type)) {
          rowErrors.push({ row: i + 2, message: `Tipo inválido: "${type}"` })
        }
        if (!VALID_STATUSES.includes(status)) {
          rowErrors.push({ row: i + 2, message: `Estado inválido: "${status}"` })
        }
        return {
          type,
          hostname: row.hostname?.trim() || null,
          serial: row.numero_serie?.trim() || null,
          brand: row.marca?.trim() || null,
          model: row.modelo?.trim() || null,
          ip_address: row.ip?.trim() || null,
          mac_address: row.mac?.trim() || null,
          os: row.sistema_operativo?.trim() || null,
          os_version: row.version_os?.trim() || null,
          cpu: row.cpu?.trim() || null,
          ram_gb: row.ram_gb ? Number(row.ram_gb) : null,
          storage_gb: row.almacenamiento_gb ? Number(row.almacenamiento_gb) : null,
          location: row.ubicacion?.trim() || null,
          status,
          assigned_to: row.asignado_a?.trim() || null,
          purchase_date: row.fecha_compra?.trim() || null,
          warranty_until: row.garantia_hasta?.trim() || null,
          notes: row.notas?.trim() || null,
          auto_reported: false,
        }
      })

      if (rowErrors.length > 0) {
        setErrors(rowErrors)
        setLoading(false)
        return
      }

      // Insert in batches of 100
      for (let i = 0; i < records.length; i += 100) {
        const { error } = await supabase.from('devices').insert(records.slice(i, i + 100))
        if (error) {
          toast.error(`Error al importar fila ~${i + 1}: ${error.message}`)
          setLoading(false)
          return
        }
      }

      toast.success(`${records.length} equipos importados correctamente`)
      setDone(true)
      setLoading(false)
      router.refresh()
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">{file ? file.name : 'Arrastra tu archivo o haz clic para seleccionar'}</p>
        <p className="text-xs text-gray-400 mt-1">.xlsx únicamente</p>
        <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-red-700 flex items-center gap-2"><AlertCircle className="h-4 w-4" />Errores encontrados — corrige el archivo y vuelve a subirlo</p>
          {errors.map((e, i) => <p key={i} className="text-xs text-red-600">Fila {e.row}: {e.message}</p>)}
        </div>
      )}

      {done && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">Importación completada.</p>
          <a href="/inventory" className="text-sm text-green-700 underline ml-auto">Ver inventario →</a>
        </div>
      )}

      {preview.length > 0 && !done && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Vista previa (primeras 5 filas):</p>
          <div className="overflow-x-auto rounded border text-xs">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>{Object.keys(preview[0]).map((k) => <th key={k} className="px-2 py-1 text-left font-medium text-gray-600 whitespace-nowrap">{k}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {preview.map((row, i) => (
                  <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="px-2 py-1 whitespace-nowrap max-w-32 truncate">{String(v)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {file && !done && (
        <Button onClick={handleImport} disabled={loading || errors.length > 0}>
          {loading ? 'Importando...' : 'Importar equipos'}
        </Button>
      )}
    </div>
  )
}
