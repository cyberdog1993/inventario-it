import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Terminal, Monitor, Info } from 'lucide-react'

const RAW_BASE = 'https://raw.githubusercontent.com/cyberdog1993/inventario-it/main/scripts'

export default function AgentsPage() {
  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agentes de reporte</h1>
        <p className="text-gray-500 text-sm mt-1">
          Scripts para que los equipos reporten su información automáticamente al inventario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Windows */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Script PowerShell compatible con Windows 7/8/10/11 y Windows Server.
            </p>
            <Button asChild className="w-full">
              <a href={`${RAW_BASE}/agent-windows.ps1`} download="agent-windows.ps1">
                <Download className="h-4 w-4 mr-2" />
                Descargar agent-windows.ps1
              </a>
            </Button>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700">Instalación rápida:</p>
              <code className="text-xs text-gray-600 block">
                1. Guarda el archivo en C:\Scripts\<br />
                2. Ejecuta como Administrador:<br />
                <span className="text-blue-700">powershell -ExecutionPolicy Bypass -File C:\Scripts\agent-windows.ps1</span>
              </code>
              <p className="text-xs font-medium text-gray-700 mt-2">Programar cada hora:</p>
              <code className="text-xs text-blue-700 break-all block">
                schtasks /create /tn "InventarioIT" /tr "powershell -ExecutionPolicy Bypass -File C:\Scripts\agent-windows.ps1" /sc hourly /ru SYSTEM
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Linux / macOS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-600" />
              Linux / macOS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Script Bash compatible con Ubuntu, Debian, CentOS, RHEL y macOS.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href={`${RAW_BASE}/agent-linux.sh`} download="agent-linux.sh">
                <Download className="h-4 w-4 mr-2" />
                Descargar agent-linux.sh
              </a>
            </Button>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700">Instalación rápida:</p>
              <code className="text-xs text-gray-600 block">
                1. Dale permisos y ejecuta:<br />
                <span className="text-green-700">chmod +x agent-linux.sh && ./agent-linux.sh</span>
              </code>
              <p className="text-xs font-medium text-gray-700 mt-2">Programar con cron:</p>
              <code className="text-xs text-green-700 block">
                crontab -e<br />
                0 * * * * /opt/scripts/agent-linux.sh
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Endpoint de reporte (API)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Los agentes envían un <code className="bg-gray-100 px-1 rounded text-xs">POST</code> a{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">/api/report</code> con el siguiente formato:
          </p>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">{`{
  "api_key":    "inv_...",
  "hostname":   "PC-VENTAS-01",
  "type":       "desktop",
  "serial":     "ABC123",
  "brand":      "Dell",
  "model":      "OptiPlex 7010",
  "ip_address": "192.168.1.100",
  "mac_address":"AA:BB:CC:DD:EE:FF",
  "os":         "Windows",
  "os_version": "11",
  "cpu":        "Intel Core i7",
  "ram_gb":     16,
  "storage_gb": 512
}`}</pre>
          <p className="text-xs text-gray-500">
            El sistema hace upsert automático por MAC address o hostname. Genera tu API Key en la sección{' '}
            <a href="/api-keys" className="text-blue-600 hover:underline">API Keys</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
