import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/roles-server'
import { canWrite } from '@/lib/roles'
import { ImportExcelForm } from '@/components/inventory/import-excel-form'
import { Button } from '@/components/ui/button'
import { Download, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function ImportPage() {
  const role = await getUserRole()
  if (!canWrite(role)) redirect('/inventory')
  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar desde Excel</h1>
        <p className="text-gray-500 text-sm mt-1">Carga masiva de equipos mediante archivo .xlsx</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Paso 1: Descargar plantilla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Descarga la plantilla Excel, completa la información de tus equipos y luego sube el archivo.
          </p>
          <Button asChild variant="outline">
            <a href="/api/export/template">
              <Download className="h-4 w-4 mr-2" />
              Descargar plantilla_inventario.xlsx
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Paso 2: Subir archivo completado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImportExcelForm />
        </CardContent>
      </Card>

      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 font-medium">Tipos de equipo válidos</p>
          <p className="text-xs text-blue-700 mt-1">
            desktop · laptop · server · gateway · firewall · switch · access_point · printer · gaming_console · nvr · camera · devkit · other
          </p>
          <p className="text-sm text-blue-800 font-medium mt-3">Estados válidos</p>
          <p className="text-xs text-blue-700 mt-1">
            active · inactive · maintenance · retired · unknown
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
