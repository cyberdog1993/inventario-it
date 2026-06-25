export type DeviceType =
  | 'desktop'
  | 'laptop'
  | 'server'
  | 'gateway'
  | 'firewall'
  | 'switch'
  | 'access_point'
  | 'printer'
  | 'gaming_console'
  | 'nvr'
  | 'camera'
  | 'devkit'
  | 'other'

export type DeviceStatus = 'active' | 'inactive' | 'maintenance' | 'retired' | 'unknown'

export interface Device {
  id: string
  type: DeviceType
  hostname: string | null
  serial: string | null
  brand: string | null
  model: string | null
  ip_address: string | null
  mac_address: string | null
  os: string | null
  os_version: string | null
  cpu: string | null
  ram_gb: number | null
  storage_gb: number | null
  location: string | null
  site_id: string | null
  status: DeviceStatus
  notes: string | null
  assigned_to: string | null
  purchase_date: string | null
  warranty_until: string | null
  last_seen: string | null
  auto_reported: boolean
  created_at: string
  updated_at: string
  sites?: Site | null
}

export interface Site {
  id: string
  name: string
  address: string | null
  created_at: string
}

export interface DeviceFormData {
  type: DeviceType
  hostname: string
  serial: string
  brand: string
  model: string
  ip_address: string
  mac_address: string
  os: string
  os_version: string
  cpu: string
  ram_gb: string
  storage_gb: string
  location: string
  site_id: string
  status: DeviceStatus
  notes: string
  assigned_to: string
  purchase_date: string
  warranty_until: string
}

export interface ReportPayload {
  api_key: string
  hostname: string
  type?: DeviceType
  serial?: string
  brand?: string
  model?: string
  ip_address?: string
  mac_address?: string
  os?: string
  os_version?: string
  cpu?: string
  ram_gb?: number
  storage_gb?: number
  location?: string
}

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  desktop: 'Desktop',
  laptop: 'Laptop',
  server: 'Servidor',
  gateway: 'Gateway',
  firewall: 'Firewall',
  switch: 'Switch',
  access_point: 'Access Point',
  printer: 'Impresora',
  gaming_console: 'Consola',
  nvr: 'NVR',
  camera: 'Cámara',
  devkit: 'Devkit',
  other: 'Otro',
}

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  maintenance: 'Mantenimiento',
  retired: 'Retirado',
  unknown: 'Desconocido',
}
