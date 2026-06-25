import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data } = await admin.from('user_roles').select('role').eq('user_id', user.id).single()
  return data?.role === 'admin' ? user : null
}

// POST /api/users — create user
export async function POST(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { email, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

  const admin = createAdminClient()
  const { data: { user }, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !user) return NextResponse.json({ error: error?.message ?? 'Error al crear usuario' }, { status: 500 })

  await admin.from('user_roles').insert({ user_id: user.id, role: role ?? 'client', assigned_by: caller.id })

  return NextResponse.json({ id: user.id, email: user.email, role: role ?? 'client' }, { status: 201 })
}

// DELETE /api/users — delete user
export async function DELETE(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  if (userId === caller.id) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('user_roles').delete().eq('user_id', userId)

  return NextResponse.json({ ok: true })
}

// PATCH /api/users — update role
export async function PATCH(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId, role } = await req.json()
  if (!userId || !role) return NextResponse.json({ error: 'userId y role requeridos' }, { status: 400 })

  const admin = createAdminClient()
  await admin.from('user_roles').upsert({ user_id: userId, role, assigned_by: caller.id, assigned_at: new Date().toISOString() }, { onConflict: 'user_id' })

  return NextResponse.json({ ok: true })
}
