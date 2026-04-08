import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api.js'

function paymentPill(status) {
  const map = {
    paid: 'bg-emerald-100 text-emerald-800 ring-emerald-200/80',
    pending: 'bg-amber-100 text-amber-900 ring-amber-200/80',
    failed: 'bg-rose-100 text-rose-800 ring-rose-200/80',
    refunded: 'bg-slate-100 text-slate-700 ring-slate-200/80',
  }
  return map[status] || map.pending
}

function computeBookingStatus(booking) {
  const eventDate = booking.eventId?.date ? new Date(booking.eventId.date) : null
  const now = new Date()
  if (eventDate && eventDate < now) return 'Completed'
  if (booking.paymentStatus !== 'paid') return 'Pending'
  return 'Confirmed'
}

function daysUntilEvent(booking) {
  const eventDate = booking.eventId?.date ? new Date(booking.eventId.date) : null
  if (!eventDate) return null
  const now = new Date()
  const diffMs = eventDate.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

function splitBookings(bookings) {
  const now = new Date()
  const upcoming = []
  const past = []
  bookings.forEach((b) => {
    const eventDate = b.eventId?.date ? new Date(b.eventId.date) : null
    if (eventDate && eventDate >= now) upcoming.push(b)
    else past.push(b)
  })
  return { upcoming, past }
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { upcoming, past } = useMemo(() => splitBookings(bookings), [bookings])

  useEffect(() => {
    ;(async () => {
      try {
        const [bookingsRes, notificationsRes] = await Promise.all([
          api.get('/bookings/user'),
          api.get('/notifications/me', { params: { limit: 10 } }),
        ])
        setBookings(bookingsRes.data)
        setNotifications(notificationsRes.data.items || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const refreshNotifications = async () => {
    const { data } = await api.get('/notifications/me', { params: { limit: 10 } })
    setNotifications(data.items || [])
  }

  const refreshBookings = async () => {
    const { data } = await api.get('/bookings/user')
    setBookings(data)
  }

  const cancelBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/cancel`)
      await refreshBookings()
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="glass h-40 animate-pulse rounded-3xl" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8 text-center text-rose-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Your dashboard</h1>
        <p className="mt-2 text-slate-600">Notifications, reminders, and detailed booking history.</p>
      </motion.div>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900">Notifications</h2>
          <button
            type="button"
            onClick={async () => {
              await api.post('/notifications/me/read-all')
              await refreshNotifications()
            }}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Mark all read
          </button>
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="glass rounded-2xl px-6 py-10 text-center text-slate-600">
              No new updates. You’ll see booking confirmations, payment updates, and event reminders here.
            </div>
          ) : (
            notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl border p-5 transition ${!n.readAt ? 'border-indigo-200/80 shadow-indigo-500/10' : 'border-white/50'}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {n.type === 'reminder' ? 'Event reminder' : 'Booking update'}
                </p>
                <p className="mt-1 font-display font-semibold text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-bold text-slate-900">Upcoming bookings</h2>
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="glass rounded-2xl px-6 py-12 text-center">
              <p className="font-medium text-slate-700">No upcoming bookings.</p>
              <p className="mt-1 text-sm text-slate-600">Find an event you love and reserve your seats.</p>
            </div>
          ) : (
            upcoming.map((b, i) => {
              const bookingStatus = computeBookingStatus(b)
              const daysLeft = daysUntilEvent(b)
              const canCancel = bookingStatus !== 'Completed' && b.paymentStatus !== 'paid'
              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass group rounded-2xl border border-white/50 p-6 transition hover:border-indigo-200/60 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-slate-900 group-hover:text-indigo-700">
                        {b.eventId?.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(b.eventId?.date).toLocaleString()} · {b.eventId?.location}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">Booking ID: {b._id}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{b.ticketsBooked}</span> tickets ·{' '}
                        <span className="font-semibold text-slate-800">${b.totalPrice}</span> total
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Booking status: <span className="font-semibold text-slate-900">{bookingStatus}</span>
                      </p>
                      {typeof daysLeft === 'number' && (
                        <p className="mt-1 text-sm text-slate-600">
                          Event in <span className="font-semibold text-slate-900">{daysLeft}</span>{' '}
                          {daysLeft === 1 ? 'day' : 'days'}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${paymentPill(b.paymentStatus)}`}
                      >
                        Payment: {b.paymentStatus}
                      </span>
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => cancelBooking(b._id)}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700"
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-bold text-slate-900">Past bookings</h2>
        <div className="space-y-4">
          {past.length === 0 ? (
            <div className="glass rounded-2xl px-6 py-12 text-center">
              <p className="font-medium text-slate-700">No past bookings.</p>
              <p className="mt-1 text-sm text-slate-600">Once events have passed, they’ll appear here as completed.</p>
            </div>
          ) : (
            past.map((b, i) => {
              const bookingStatus = computeBookingStatus(b)
              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass group rounded-2xl border border-white/50 p-6 transition hover:border-indigo-200/60 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-slate-900 group-hover:text-indigo-700">
                        {b.eventId?.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(b.eventId?.date).toLocaleString()} · {b.eventId?.location}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">Booking ID: {b._id}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{b.ticketsBooked}</span> tickets ·{' '}
                        <span className="font-semibold text-slate-800">${b.totalPrice}</span> total
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Booking status: <span className="font-semibold text-slate-900">{bookingStatus}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${paymentPill(b.paymentStatus)}`}
                    >
                      Payment: {b.paymentStatus}
                    </span>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
