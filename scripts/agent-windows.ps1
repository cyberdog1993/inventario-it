# ============================================================
# IT Inventory Agent - Windows (PowerShell)
# Reporta automáticamente la información del equipo al servidor
#
# Uso:
#   1. Edita las variables API_KEY y SERVER_URL
#   2. Ejecuta manualmente o agrega al Task Scheduler
#
# Programar con Task Scheduler (cada hora):
#   schtasks /create /tn "InventarioIT" /tr "powershell -File C:\Scripts\agent-windows.ps1" /sc hourly /ru SYSTEM
# ============================================================

$API_KEY    = "inv_75a38dd87e1e496f9a381c0e4a5dd89d"
$SERVER_URL = "https://inventario-it-self.vercel.app/api/report"

# --- Recopilación de datos ---
$hostname   = $env:COMPUTERNAME
$os         = (Get-CimInstance Win32_OperatingSystem).Caption
$osVersion  = (Get-CimInstance Win32_OperatingSystem).Version

$cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1).Name
$ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
$ramGB = [math]::Round($ramBytes / 1GB, 0)

$disk = Get-CimInstance Win32_DiskDrive | Measure-Object -Property Size -Sum
$storageGB = [math]::Round($disk.Sum / 1GB, 0)

$cs = Get-CimInstance Win32_ComputerSystem
$brand = $cs.Manufacturer
$model = $cs.Model

$serial = (Get-CimInstance Win32_BIOS).SerialNumber

# First active NIC with IP
$nic = Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled -eq $true } | Select-Object -First 1
$ip  = $nic.IPAddress | Where-Object { $_ -notmatch ":" } | Select-Object -First 1
$mac = $nic.MACAddress

$body = @{
    api_key    = $API_KEY
    hostname   = $hostname
    type       = "desktop"
    serial     = $serial
    brand      = $brand
    model      = $model
    ip_address = $ip
    mac_address = $mac
    os         = "Windows"
    os_version = "$os $osVersion"
    cpu        = $cpu
    ram_gb     = $ramGB
    storage_gb = $storageGB
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $SERVER_URL -Method POST -Body $body -ContentType "application/json"
    Write-Host "[OK] Reporte enviado: $($response.status) ID=$($response.id)"
} catch {
    Write-Host "[ERROR] No se pudo enviar el reporte: $_"
    exit 1
}
