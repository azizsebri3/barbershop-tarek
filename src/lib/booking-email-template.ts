export type EmailLanguage = 'fr' | 'en' | 'nl'

export interface BookingDetails {
  id?: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message?: string
  cancelNote?: string
  oldDate?: string
  oldTime?: string
  language?: EmailLanguage
  duration_minutes?: number
  status?: 'pending' | 'confirmed' | 'cancelled'
}

export type EmailKind = 'received' | 'confirmed' | 'rescheduled' | 'adminModified' | 'clientCancelled' | 'salonCancelled'

const copy = {
  fr: {
    received: 'Demande de rendez-vous reçue',
    receivedText: 'Votre demande est enregistrée. Le salon doit encore la confirmer.',
    confirmed: 'Votre rendez-vous est confirmé',
    confirmedText: 'Votre rendez-vous est confirmé. Voici les détails.',
    rescheduled: 'Votre rendez-vous a été déplacé',
    rescheduledText: 'Voici votre nouvel horaire.',
    adminModified: 'Votre rendez-vous a été modifié',
    adminModifiedText: 'Le salon a mis à jour votre réservation. Voici ses détails.',
    clientCancelled: 'Votre rendez-vous est annulé',
    clientCancelledText: 'Votre annulation est confirmée.',
    salonCancelled: 'Votre rendez-vous est annulé',
    salonCancelledText: 'Le salon a dû annuler votre rendez-vous. Nous en sommes désolés.',
    hello: 'Bonjour', date: 'Date', time: 'Heure', service: 'Prestation', address: 'Adresse',
    previous: 'Précédemment', note: 'Note', manage: 'Modifier mon rendez-vous',
    cancel: 'Annuler mon rendez-vous', book: 'Reprendre un rendez-vous', calendar: 'Ajouter au calendrier',
    name: 'Nom', phone: 'Téléphone', changes: 'Modifications', before: 'Avant', after: 'Après',
  },
  en: {
    received: 'Appointment request received',
    receivedText: 'Your request is saved. The salon still needs to confirm it.',
    confirmed: 'Your appointment is confirmed',
    confirmedText: 'Your appointment is confirmed. Here are the details.',
    rescheduled: 'Your appointment has been rescheduled',
    rescheduledText: 'Here is your new appointment time.',
    adminModified: 'Your appointment has been updated',
    adminModifiedText: 'The salon updated your booking. Here are the details.',
    clientCancelled: 'Your appointment is cancelled',
    clientCancelledText: 'Your cancellation is confirmed.',
    salonCancelled: 'Your appointment is cancelled',
    salonCancelledText: 'The salon had to cancel your appointment. We are sorry.',
    hello: 'Hello', date: 'Date', time: 'Time', service: 'Service', address: 'Address',
    previous: 'Previously', note: 'Note', manage: 'Reschedule my appointment',
    cancel: 'Cancel my appointment', book: 'Book another appointment', calendar: 'Add to calendar',
    name: 'Name', phone: 'Phone', changes: 'Changes', before: 'Before', after: 'After',
  },
  nl: {
    received: 'Afspraakaanvraag ontvangen',
    receivedText: 'Uw aanvraag is geregistreerd. Het salon moet deze nog bevestigen.',
    confirmed: 'Uw afspraak is bevestigd',
    confirmedText: 'Uw afspraak is bevestigd. Dit zijn de gegevens.',
    rescheduled: 'Uw afspraak is verplaatst',
    rescheduledText: 'Dit is uw nieuwe afspraak.',
    adminModified: 'Uw afspraak is gewijzigd',
    adminModifiedText: 'Het salon heeft uw afspraak aangepast. Dit zijn de gegevens.',
    clientCancelled: 'Uw afspraak is geannuleerd',
    clientCancelledText: 'Uw annulering is bevestigd.',
    salonCancelled: 'Uw afspraak is geannuleerd',
    salonCancelledText: 'Het salon moest uw afspraak annuleren. Onze excuses.',
    hello: 'Hallo', date: 'Datum', time: 'Tijd', service: 'Behandeling', address: 'Adres',
    previous: 'Voorheen', note: 'Notitie', manage: 'Mijn afspraak wijzigen',
    cancel: 'Mijn afspraak annuleren', book: 'Een nieuwe afspraak maken', calendar: 'Toevoegen aan agenda',
    name: 'Naam', phone: 'Telefoon', changes: 'Wijzigingen', before: 'Voorheen', after: 'Nu',
  },
} as const

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]!)
}

export function renderBookingEmail({
  booking, oldBooking, kind, lang, salonName, address, siteUrl, rescheduleToken,
}: {
  booking: BookingDetails
  oldBooking?: BookingDetails
  kind: EmailKind
  lang: EmailLanguage
  salonName: string
  address: string
  siteUrl: string
  rescheduleToken?: string
}): { subject: string; html: string } {
  const t = copy[lang]
  const cancelled = kind === 'clientCancelled' || kind === 'salonCancelled'
  const base = siteUrl.replace(/\/+$/, '')
  const link = (path: string) => escapeHtml(`${base}/${lang}${path}`)
  const calendarQuery = new URLSearchParams({
    date: booking.date, time: booking.time, service: booking.service, salon: salonName, address,
  })
  if (booking.duration_minutes && Number.isInteger(booking.duration_minutes) && booking.duration_minutes > 0 && booking.duration_minutes <= 1440) {
    calendarQuery.set('duration', String(booking.duration_minutes))
  }
  const button = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;background:#c89555;color:#17120e;text-decoration:none;padding:14px 22px;border-radius:8px;font-size:15px;font-weight:bold;">${escapeHtml(label)}</a>`
  const row = (label: string, value: string) =>
    `<tr><td style="padding:9px 14px;color:#a8a29e;font-size:14px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:9px 14px;color:#fff;font-size:15px;font-weight:bold;overflow-wrap:anywhere;">${escapeHtml(value)}</td></tr>`
  const changes = oldBooking ? ([
    ['date', t.date], ['time', t.time], ['service', t.service],
    ['name', t.name], ['phone', t.phone], ['message', t.note],
  ] as const).filter(([key]) => oldBooking[key] !== booking[key]).map(([key, label]) =>
    `<p style="margin:8px 0;color:#d6d3d1;font-size:14px;">${escapeHtml(label)} — ${escapeHtml(t.before)}: ${escapeHtml(oldBooking[key] || '-')} · ${escapeHtml(t.after)}: ${escapeHtml(booking[key] || '-')}</p>`,
  ).join('') : ''
  const previousDate = oldBooking?.date || booking.oldDate
  const previousTime = oldBooking?.time || booking.oldTime
  const showPrevious = previousDate && (previousDate !== booking.date || previousTime !== booking.time)
  const actions = cancelled
    ? button(link('/booking'), t.book)
    : booking.id
      ? `${rescheduleToken ? button(link(`/booking/reschedule/${encodeURIComponent(booking.id)}#${encodeURIComponent(rescheduleToken)}`), t.manage) : ''}
         <p style="margin:18px 0 0;"><a href="${link(`/booking/cancel/${encodeURIComponent(booking.id)}?email=${encodeURIComponent(booking.email)}`)}" style="color:#e5c08a;">${escapeHtml(t.cancel)}</a></p>`
      : ''
  const calendar = !cancelled
    ? `<p style="margin:18px 0 0;"><a href="${escapeHtml(`${base}/api/booking-calendar?${calendarQuery}`)}" style="color:#e5c08a;">${escapeHtml(t.calendar)}</a></p>`
    : ''
  const heading = t[kind]
  const body = t[`${kind}Text`]
  return {
    subject: `${heading} - ${salonName}`,
    html: `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111111;font-family:Arial,Helvetica,sans-serif;color:#f5f5f4;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111111;"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#1c1c1c;border:1px solid #38312a;border-radius:12px;">
<tr><td style="padding:28px 22px;">
<p style="margin:0 0 22px;color:#c89555;font-size:13px;font-weight:bold;letter-spacing:1px;">${escapeHtml(salonName)}</p>
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:#fff;">${escapeHtml(heading)}</h1>
<p style="margin:0 0 10px;color:#e7e5e4;font-size:16px;">${escapeHtml(t.hello)} ${escapeHtml(booking.name)},</p>
<p style="margin:0 0 22px;color:#d6d3d1;font-size:16px;line-height:1.5;">${escapeHtml(body)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#282522;border-left:3px solid #c89555;border-radius:8px;">
${row(t.date, booking.date)}${row(t.time, booking.time.slice(0, 5))}${row(t.service, booking.service)}${address ? row(t.address, address) : ''}
</table>
${showPrevious ? `<p style="color:#a8a29e;font-size:14px;margin:16px 0 0;">${escapeHtml(t.previous)} : ${escapeHtml(previousDate)}${previousTime ? ` · ${escapeHtml(previousTime.slice(0, 5))}` : ''}</p>` : ''}
${booking.cancelNote ? `<p style="color:#d6d3d1;font-size:14px;white-space:pre-wrap;">${escapeHtml(t.note)} : ${escapeHtml(booking.cancelNote)}</p>` : ''}
${kind === 'received' && booking.message ? `<p style="color:#d6d3d1;font-size:14px;white-space:pre-wrap;">${escapeHtml(t.note)} : ${escapeHtml(booking.message)}</p>` : ''}
${changes ? `<p style="color:#a8a29e;font-size:14px;margin:18px 0 0;">${escapeHtml(t.changes)}</p>${changes}` : ''}
<div style="margin:24px 0 0;">${actions}${calendar}</div>
</td></tr></table></td></tr></table></body></html>`,
  }
}
