'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Clock, RefreshCw } from 'lucide-react'
import { brusselsDateTime, freeSlotRanges } from '@/lib/admin-today'
import { durationForBooking, toMinutes } from '@/lib/reschedule-availability'
import { useRealtimeBookings } from '@/lib/useRealtimeBookings'
import type { Booking } from '@/lib/supabase'

function openCalendar(booking?: Booking) {
  if (booking) sessionStorage.setItem('admin-open-booking', booking.id)
  window.dispatchEvent(new CustomEvent('changeAdminTab', { detail: 'bookings' }))
}

export default function AdminToday() {
  const { bookings, loading, error: bookingError, refetch } = useRealtimeBookings({ enableNotifications: false })
  const [now, setNow] = useState(() => new Date())
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotsError, setSlotsError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { date, time } = brusselsDateTime(now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setSlotsLoading(true)
    setSlotsError(false)
    fetch(`/api/bookings/availability?${new URLSearchParams({ date, duration: '15' })}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const result = await response.json()
        if (!response.ok || !Array.isArray(result.availableSlots)) throw new Error(result.error || 'Invalid availability response')
        setSlots(result.availableSlots)
      })
      .catch(error => {
        if (controller.signal.aborted) return
        console.error('Unable to load today availability:', error)
        setSlotsError(true)
      })
      .finally(() => { if (!controller.signal.aborted) setSlotsLoading(false) })
    return () => controller.abort()
  }, [date, bookings, refreshKey])

  const today = useMemo(() => bookings.filter(booking => booking.date === date).sort((a, b) => a.time.localeCompare(b.time)), [bookings, date])
  const active = today.filter(booking => booking.status !== 'cancelled')
  const cancelled = today.filter(booking => booking.status === 'cancelled')
  const ongoing = active.find(booking => !booking.visit_outcome &&
    toMinutes(booking.time) <= toMinutes(time) &&
    toMinutes(booking.time) + durationForBooking(booking.duration_minutes, booking.service) > toMinutes(time))
  const next = ongoing || active.find(booking => booking.time.slice(0, 5) >= time && !booking.visit_outcome)
  const ranges = freeSlotRanges(slots.filter(slot => slot >= time))
  const dateLabel = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  return (
    <section className="space-y-4 rounded-2xl border border-accent/25 bg-secondary/60 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-accent">Today · Brussels</p><h2 className="mt-1 text-2xl font-bold capitalize text-white">{dateLabel}</h2><p className="mt-1 flex items-center gap-1 text-sm text-gray-400"><Clock size={14} /> {time}</p></div>
        <button type="button" onClick={() => { void refetch(); setRefreshKey(value => value + 1) }} aria-label="Refresh today" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-gray-300"><RefreshCw size={18} /></button>
      </div>
      {bookingError && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">Unable to load appointments. Refresh to try again.</p>}
      {loading ? <p className="text-sm text-gray-400">Loading today&apos;s appointments...</p> : !bookingError && <>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/5 p-3"><p className="text-xl font-bold text-white">{active.length}</p><p className="text-xs text-gray-400">Appointments</p></div>
          <div className="rounded-xl bg-white/5 p-3"><p className="text-xl font-bold text-amber-300">{active.filter(booking => booking.status === 'pending').length}</p><p className="text-xs text-gray-400">Pending</p></div>
          <div className="rounded-xl bg-white/5 p-3"><p className="text-xl font-bold text-red-300">{cancelled.length}</p><p className="text-xs text-gray-400">Cancelled</p></div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-accent">{ongoing ? 'Current appointment' : 'Next appointment'}</p>{next ? <button type="button" onClick={() => openCalendar(next)} className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 text-left"><span><span className="text-lg font-bold text-white">{next.time.slice(0, 5)} · {next.name}</span><span className="block text-sm text-gray-400">{next.service} · {next.status === 'pending' ? 'Pending' : 'Confirmed'}</span></span><ArrowRight className="shrink-0 text-accent" size={20} /></button> : <p className="mt-2 text-sm text-gray-300">No upcoming appointments today.</p>}</div>
        <div><h3 className="font-semibold text-white">Appointments</h3>{active.length === 0 ? <p className="mt-2 text-sm text-gray-400">No appointments today.</p> : <div className="mt-2 space-y-2">{active.map(booking => <button key={booking.id} type="button" onClick={() => openCalendar(booking)} className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-black/20 p-3 text-left"><span className="font-bold text-accent">{booking.time.slice(0, 5)}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium text-white">{booking.name}</span><span className="block truncate text-xs text-gray-400">{booking.service} · {booking.visit_outcome === 'completed' ? 'Completed' : booking.visit_outcome === 'no_show' ? 'No-show' : booking.status === 'pending' ? 'Pending' : 'Confirmed'}</span></span><ArrowRight size={17} className="text-gray-400" /></button>)}</div>}</div>
        {cancelled.length > 0 && <div><h3 className="font-semibold text-white">Cancelled</h3><div className="mt-2 space-y-2">{cancelled.map(booking => <button key={booking.id} type="button" onClick={() => openCalendar(booking)} className="flex min-h-11 w-full justify-between rounded-xl bg-red-500/10 p-3 text-left text-sm text-red-200"><span>{booking.time.slice(0, 5)} · {booking.name}</span><ArrowRight size={16} /></button>)}</div></div>}
      </>}
      <div><h3 className="font-semibold text-white">Free time today</h3><p className="mt-1 text-xs text-gray-400">Based on availability and appointments, in 15-minute intervals.</p>{slotsLoading ? <p className="mt-2 text-sm text-gray-400">Loading availability...</p> : slotsError ? <p role="alert" className="mt-2 text-sm text-red-300">Unable to load availability. Refresh to try again.</p> : ranges.length ? <div className="mt-2 flex flex-wrap gap-2">{ranges.map(range => <span key={range.start} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{range.start}–{range.end}</span>)}</div> : <p className="mt-2 text-sm text-gray-400">No remaining free time.</p>}</div>
      <button type="button" onClick={() => openCalendar()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 font-semibold text-primary"><CalendarDays size={18} /> Open calendar</button>
    </section>
  )
}
