import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Verifica admin usando el JWT del header Authorization con RPC SECURITY DEFINER
async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null

  // Anon client con JWT del usuario — PostgREST lo usa para auth.uid()
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )

  const { data: role } = await userClient.rpc('get_my_role')
  return role === 'admin' ? token : null
}

// POST /api/users — create user
export async function POST(req: NextRequest) {
  const caller = await requireAdmin(req)
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

  await admin.from('user_roles').insert({ user_id: user.id, role: role ?? 'client' })

  return NextResponse.json({ id: user.id, email: user.email, role: role ?? 'client' }, { status: 201 })
}

// DELETE /api/users — delete user
export async function DELETE(req: NextRequest) {
  const caller = await requireAdmin(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  // Note: self-delete check skipped — admin client would need a separate lookup

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('user_roles').delete().eq('user_id', userId)

  return NextResponse.json({ ok: true })
}

// PATCH /api/users — update role
export async function PATCH(req: NextRequest) {
  const caller = await requireAdmin(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId, role } = await req.json()
  if (!userId || !role) return NextResponse.json({ error: 'userId y role requeridos' }, { status: 400 })

  const admin = createAdminClient()
  await admin.from('user_roles').upsert({ user_id: userId, role, assigned_at: new Date().toISOString() }, { onConflict: 'user_id' })

  return NextResponse.json({ ok: true })
}
