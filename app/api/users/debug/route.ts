import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const results: Record<string, unknown> = {}

  // Check 1: cookie-based session
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: role } = await supabase.rpc('get_my_role')
    results.cookie_session = { user_id: user?.id ?? null, email: user?.email ?? null, role }
  } catch (e: unknown) {
    results.cookie_session = { error: String(e) }
  }

  // Check 2: JWT from Authorization header
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (token) {
    try {
      const { createClient: createSBClient } = await import('@supabase/supabase-js')
      const userClient = createSBClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
      )
      const { data: role, error } = await userClient.rpc('get_my_role')
      results.jwt_header = { role, error: error?.message ?? null }
    } catch (e: unknown) {
      results.jwt_header = { error: String(e) }
    }
  } else {
    results.jwt_header = 'no Authorization header'
  }

  // Check 3: admin client connectivity
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('user_roles').select('count').limit(1)
    results.admin_client = { ok: !error, error: error?.message ?? null, data }
  } catch (e: unknown) {
    results.admin_client = { error: String(e) }
  }

  return NextResponse.json(results)
}
