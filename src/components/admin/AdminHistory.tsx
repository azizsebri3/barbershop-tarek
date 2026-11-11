'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, Mail, Phone, RefreshCw, Search, Users } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import type { Booking } from '@/lib/supabase'

type ClientHistory = { email: string; name: string; phone: string; bookings: Booking[] }

function visitLabel(booking: Booking): string {
  if (booking.status === 'cancelled') return 'Cancelled'
  if (booking.status === 'pending') return 'Pending'
  if (booking.visit_outcome === 'completed') return 'Completed'
  if (booking.visit_outcome === 'no_show') return 'No-show'
  return 'Confirmed · visit not recorded'
}

export default function AdminHistory() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/bookings', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load bookings')
      const { bookings: data } = await response.json() as { bookings: Booking[] }
      setBookings([...(data || [])].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)))
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Unable to load client history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchHistory() }, [fetchHistory])
  useEffect(() => {
    if (!selectedEmail) return
    const controller = new AbortController()
    setNote('')
    setNoteError(false)
    setNoteLoading(true)
    fetch(`/api/admin/client-notes?${new URLSearchParams({ email: selectedEmail })}`, { signal: controller.signal })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load note')
        setNote(result.note)
      })
      .catch(error => {
        if (controller.signal.aborted) return
        console.error('Error loading client note:', error)
        setNoteError(true)
        toast.error('Unable to load private note')
      })
      .finally(() => { if (!controller.signal.aborted) setNoteLoading(false) })
    return () => controller.abort()
  }, [selectedEmail])

  const clients = useMemo(() => {
    const grouped = new Map<string, ClientHistory>()
    for (const booking of bookings) {
      const email = booking.email.trim().toLowerCase()
      if (!email) continue
      const client = grouped.get(email)
      if (client) client.bookings.push(booking)
      else grouped.set(email, { email, name: booking.name, phone: booking.phone, bookings: [booking] })
    }
    return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [bookings])
  const filtered = clients.filter(client => `${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(search.toLowerCase()))
  const completed = bookings.filter(booking => booking.status === 'confirmed' && booking.visit_outcome === 'completed').length

  const saveNote = async () => {
    if (!selectedEmail) return
    setNoteSaving(true)
    try {
      const response = await fetch('/api/admin/client-notes', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmail, note }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save note')
      toast.success('Private note saved')
    } catch (error) {
      console.error('Error saving client note:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to save note')
    } finally {
      setNoteSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-white">Client history</h2><p className="mt-1 text-sm text-gray-400">Clients grouped by email address</p></div>
        <button type="button" onClick={fetchHistory} disabled={loading} className="flex min-h-11 items-center gap-2 rounded-xl bg-accent/15 px-3 text-accent disabled:opacity-50"><RefreshCw size={17} /> Refresh</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-secondary/50 p-4"><Users size={18} className="text-accent" /><p className="mt-2 text-2xl font-bold text-white">{clients.length}</p><p className="text-sm text-gray-400">Clients</p></div>
        <div className="rounded-xl border border-white/10 bg-secondary/50 p-4"><Calendar size={18} className="text-accent" /><p className="mt-2 text-2xl font-bold text-white">{completed}</p><p className="text-sm text-gray-400">Completed visits</p></div>
      </div>
      <p className="text-sm text-gray-400">Older confirmed appointments stay visible; visits are counted only when marked completed.</p>
      <div className="relative"><Search className="absolute left-4 top-3.5 text-gray-400" size={20} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email or phone" className="min-h-12 w-full rounded-xl border border-white/10 bg-secondary/50 pl-12 pr-4 text-white" /></div>
      {loading ? <p className="text-gray-400">Loading clients...</p> : filtered.length === 0 ? <p className="text-gray-400">No clients found.</p> : (
        <div className="space-y-3">
          {filtered.map(client => {
            const visits = client.bookings.filter(booking => booking.status === 'confirmed' && booking.visit_outcome === 'completed')
            const open = selectedEmail === client.email
            return (
              <section key={client.email} className="rounded-2xl border border-white/10 bg-secondary/50 p-4">
                <button type="button" disabled={noteSaving} aria-expanded={open} onClick={() => { setNote(''); setNoteLoading(!open); setSelectedEmail(open ? null : client.email) }} className="w-full text-left disabled:opacity-50">
                  <span className="flex items-start justify-between gap-3"><span className="font-semibold text-white">{client.name}<span className="mt-1 block break-all text-sm font-normal text-gray-400">{client.email}</span></span><span className="shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">{visits.length} completed</span></span>
                </button>
                {open && <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                  <div className="flex flex-wrap gap-4 text-sm"><a className="flex items-center gap-1 text-accent" href={`mailto:${client.email}`}><Mail size={15} /> Email</a><a className="flex items-center gap-1 text-accent" href={`tel:${client.phone}`}><Phone size={15} /> {client.phone}</a></div>
                  <div>
                    <label htmlFor="client-private-note" className="block text-sm font-semibold text-white">Private note</label>
                    <p className="mt-1 text-xs text-gray-400">Visible only to the salon. Shared by clients using this email.</p>
                    <textarea id="client-private-note" value={note} onChange={event => setNote(event.target.value)} disabled={noteLoading || noteSaving || noteError} maxLength={4000} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white disabled:opacity-50" />
                    {noteError && <p role="alert" className="text-sm text-red-300">Note unavailable. Reopen this client to retry.</p>}
                    <button type="button" onClick={saveNote} disabled={noteLoading || noteSaving || noteError} className="mt-2 min-h-11 rounded-xl bg-accent px-4 font-semibold text-primary disabled:opacity-50">{noteSaving ? 'Saving...' : 'Save note'}</button>
                  </div>
                  <div><h3 className="font-semibold text-white">Appointments</h3><div className="mt-2 space-y-2">{client.bookings.map(booking => (
                    <div key={booking.id} className="rounded-xl bg-black/20 p-3 text-sm"><div className="flex justify-between gap-2"><span className="text-white">{booking.date} · {booking.time.slice(0, 5)}</span><span className="text-gray-400">{visitLabel(booking)}</span></div><p className="mt-1 text-accent">{booking.service}</p></div>
                  ))}</div></div>
                </div>}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
