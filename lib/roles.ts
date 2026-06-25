// Client-safe constants and types only — no server imports here
export type UserRole = 'admin' | 'operator' | 'client'

export function canWrite(role: UserRole) {
  return role === 'admin' || role === 'operator'
}

export function isAdmin(role: UserRole) {
  return role === 'admin'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operator: 'Operador',
  client: 'Cliente',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  operator: 'bg-blue-100 text-blue-700',
  client: 'bg-gray-100 text-gray-600',
}
