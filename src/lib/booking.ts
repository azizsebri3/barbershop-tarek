export const salonkeeBookingUrl = process.env.NEXT_PUBLIC_SALONKEE_BOOKING_URL?.trim() || null
export type BookingMode = 'choice' | 'website' | 'salonkee'

export function getBookingHref(locale: string, fallbackHref?: string) {
  return salonkeeBookingUrl || fallbackHref || `/${locale}/booking`
}

export function isSalonkeeBookingConfigured() {
  return Boolean(salonkeeBookingUrl)
}
