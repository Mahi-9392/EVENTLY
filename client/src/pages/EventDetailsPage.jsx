import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Badge from '../components/Badge.jsx'

export default function EventDetailsPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [tickets, setTickets] = useState(1)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setLoadError('')
        const { data } = await api.get(`/events/${id}`)
        if (!cancelled) setEvent(data)
      } catch (e) {
        if (!cancelled) setLoadError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const book = async () => {
    setActionError('')
    if (!user) return nav('/login')
    if (user.role !== 'user') {
      setActionError('Only attendee accounts can book and pay. Sign in with a user account.')
      return
    }
    try {
      const { data: booking } = await api.post('/bookings', { eventId: id, tickets })
      const { data } = await api.post('/payments/create-checkout-session', { bookingId: booking._id })
      if (data?.url) window.location.href = data.url
      else setActionError('Checkout URL missing — check Stripe configuration.')
    } catch (e) {
      setActionError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="glass mx-auto max-w-4xl animate-pulse rounded-3xl p-10">
        <div className="aspect-[21/9] rounded-2xl bg-slate-200/80" />
        <div className="mt-8 h-10 w-2/3 rounded-xl bg-slate-200/80" />
        <div className="mt-4 h-4 w-full rounded-lg bg-slate-100" />
        <div className="mt-2 h-4 w-5/6 rounded-lg bg-slate-100" />
      </div>
    )
  }

  if (loadError || !event) {
    return (
      <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
        <p className="font-display text-lg font-semibold text-rose-700">{loadError || 'Event not found'}</p>
        <Link to="/" className="btn-gradient mt-6 inline-block text-sm">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mx-auto max-w-4xl overflow-hidden rounded-3xl shadow-2xl"
    >
      <div className="relative aspect-[21/9] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge status={event.status} />
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              ${event.price} / ticket
            </span>
          </div>
          <h1 className="font-display mt-4 text-3xl font-extrabold text-white sm:text-4xl">{event.title}</h1>
        </div>
      </div>

      <div className="space-y-6 p-8 sm:p-10">
        <p className="text-lg leading-relaxed text-slate-700">{event.description}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">When</p>
              <p className="font-semibold text-slate-900">{new Date(event.date).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Venue</p>
              <p className="font-semibold text-slate-900">{event.location}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Tickets available</p>
            <p className="font-display text-3xl font-bold text-slate-900">{event.availableTickets}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="qty">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              max={Math.min(10, event.availableTickets)}
              value={tickets}
              onChange={(e) => setTickets(Number(e.target.value))}
              className="w-24 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-semibold shadow-inner outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
            />
            <button
              type="button"
              onClick={book}
              disabled={event.availableTickets <= 0}
              className="btn-gradient !px-8 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Book with Stripe
            </button>
          </div>
        </div>

        {actionError && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {actionError}
          </p>
        )}

        <div className="text-center sm:text-left">
          <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-purple-600">
            ← Browse more events
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
