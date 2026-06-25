import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { api_key, hostname, ...specs } = body

    if (!api_key) return NextResponse.json({ error: 'api_key required' }, { status: 401 })
    if (!hostname) return NextResponse.json({ error: 'hostname required' }, { status: 400 })

    // Validate API key
    const keyHash = crypto.createHash('sha256').update(api_key).digest('hex')
    const { data: keyRecord } = await supabase
      .from('api_keys')
      .select('id, active')
      .eq('key_hash', keyHash)
      .single()

    if (!keyRecord?.active) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 })
    }

    // Upsert by hostname (or mac_address if provided)
    const payload = {
      hostname,
      type: specs.type ?? 'desktop',
      serial: specs.serial ?? null,
      brand: specs.brand ?? null,
      model: specs.model ?? null,
      ip_address: specs.ip_address ?? null,
      mac_address: specs.mac_address ?? null,
      os: specs.os ?? null,
      os_version: specs.os_version ?? null,
      cpu: specs.cpu ?? null,
      ram_gb: specs.ram_gb ?? null,
      storage_gb: specs.storage_gb ?? null,
      location: specs.location ?? null,
      status: 'active' as const,
      auto_reported: true,
      last_seen: new Date().toISOString(),
    }

    // Try to find existing device by MAC or hostname
    let existingId: string | null = null
    if (specs.mac_address) {
      const { data } = await supabase.from('devices').select('id').eq('mac_address', specs.mac_address).single()
      existingId = data?.id ?? null
    }
    if (!existingId) {
      const { data } = await supabase.from('devices').select('id').eq('hostname', hostname).single()
      existingId = data?.id ?? null
    }

    if (existingId) {
      await supabase.from('devices').update(payload).eq('id', existingId)
      return NextResponse.json({ status: 'updated', id: existingId })
    } else {
      const { data, error } = await supabase.from('devices').insert([payload]).select('id').single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ status: 'created', id: data.id }, { status: 201 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
