import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import webpush from 'web-push'

type BookingPush =
  | { kind: 'created' | 'cancelled'; name: string; service: string; date: string; time: string }
  | { kind: 'rescheduled'; name: string; service: string; date: string; time: string; oldDate: string; oldTime: string }

export async function sendAdminBookingPush(supabase: SupabaseClient, booking: BookingPush): Promise<void> {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      console.error('Admin booking push not sent: VAPID keys are not configured')
      return
    }
    webpush.setVapidDetails('mailto:admin@elitebarbershop.com', publicKey, privateKey)

    const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('endpoint,subscription')
    if (error) {
      console.error('Unable to load admin push subscriptions:', error)
      return
    }
    if (!subscriptions?.length) return

    const title = booking.kind === 'created' ? '🔔 New booking'
      : booking.kind === 'cancelled' ? 'Appointment cancelled by client'
      : 'Appointment rescheduled by client'
    const dateTime = (date: string, time: string) => `${date} at ${time.slice(0, 5)}`
    const body = booking.kind === 'rescheduled'
      ? `${booking.name} - ${booking.service}\nPrevious: ${dateTime(booking.oldDate, booking.oldTime)}\nNow: ${dateTime(booking.date, booking.time)}`
      : `${booking.name} - ${booking.service}\n${dateTime(booking.date, booking.time)}`
    const payload = JSON.stringify({
      title, body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `booking-${randomUUID()}`,
      data: { url: '/admin/dashboard' },
    })

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, payload)
      } catch (error) {
        console.error('Admin booking push delivery failed:', error)
        const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error ? error.statusCode : undefined
        if (statusCode === 404 || statusCode === 410) {
          const result = await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          if (result.error) console.error('Unable to remove expired push subscription:', result.error)
        }
      }
    }
  } catch (error) {
    console.error('Unable to send admin booking push:', error)
  }
}
