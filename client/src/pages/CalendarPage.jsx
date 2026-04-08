import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import EventCard from '../components/EventCard.jsx'
import CalendarView from '../components/CalendarView.jsx'
import EventGridSkeleton from '../components/EventGridSkeleton.jsx'
import { toDateKey } from '../lib/calendarUtils.js'

export default function CalendarPage() {
  const [value, setValue] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [allEvents, setAllEvents] = useState([])

  const selectedDate = useMemo(() => toDateKey(value), [value])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/events')
        setAllEvents([...(data.upcoming || []), ...(data.past || [])])
      } catch {
        /* optional */
      }
    })()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await api.get('/events', { params: { date: selectedDate } })
        if (cancelled) return
        setEvents([...(data.upcoming || []), ...(data.past || [])])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  return (
    <div className="space-y-10 pb-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Event calendar</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Dates highlight availability — green for open seats, amber when selling fast, red when sold out.
        </p>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        <div className="glass rounded-3xl p-4 shadow-xl">
          <CalendarView value={value} onChange={setValue} events={allEvents} />
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-900">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Fast selling
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-900">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Sold out
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Events on{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              {selectedDate}
            </span>
          </h2>
          {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
          {loading ? (
            <div className="mt-6">
              <EventGridSkeleton count={3} />
            </div>
          ) : events.length === 0 ? (
            <div className="glass mt-6 rounded-3xl px-8 py-14 text-center text-slate-600">
              No events scheduled for this day.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {events.map((ev, i) => (
                <EventCard key={ev._id} event={ev} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
