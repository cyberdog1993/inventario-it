import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

// Verifica admin: primero por cookies (mismo origen), fallback a JWT header
async function requireAdmin(req: NextRequest): Promise<boolean> {
  // Intento 1: sesión por cookies (peticiones same-origin)
  try {
    const supabase = await createClient()
    const { data: role } = await supabase.rpc('get_my_role')
    if (role === 'admin') return true
  } catch {}

  // Intento 2: JWT en Authorization header
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (token) {
    const { createClient: createSBClient } = await import('@supabase/supabase-js')
    const userClient = createSBClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
    )
    const { data: role } = await userClient.rpc('get_my_role')
    if (role === 'admin') return true
  }

  return false
}

// POST /api/users — create user
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { email, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

  const admin = createAdminClient()
  const { data: { user }, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !user) {
    return NextResponse.json({
      error: error?.message ?? 'Error al crear usuario',
      code: (error as { code?: string } | null)?.code ?? null,
      status: (error as { status?: number } | null)?.status ?? null,
    }, { status: 500 })
  }

  await admin.from('user_roles').insert({ user_id: user.id, role: role ?? 'client' })

  return NextResponse.json({ id: user.id, email: user.email, role: role ?? 'client' }, { status: 201 })
}

// DELETE /api/users — delete user
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('user_roles').delete().eq('user_id', userId)

  return NextResponse.json({ ok: true })
}

// PATCH /api/users — update role
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId || !role) return NextResponse.json({ error: 'userId y role requeridos' }, { status: 400 })

  const admin = createAdminClient()
  await admin.from('user_roles').upsert(
    { user_id: userId, role, assigned_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )

  return NextResponse.json({ ok: true })
}
