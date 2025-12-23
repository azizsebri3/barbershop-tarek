import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase credentials. Bookings will be stored locally only.')
  console.warn('To enable database storage, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

// Create Supabase client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message?: string
  created_at: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  created_at: string
}
