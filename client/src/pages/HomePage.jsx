import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import EventCard from '../components/EventCard.jsx'
import Hero from '../components/Hero.jsx'
import FilterBar from '../components/FilterBar.jsx'
import EventGridSkeleton from '../components/EventGridSkeleton.jsx'

const emptyQuery = { search: '', category: '', minPrice: '', maxPrice: '', startDate: '', endDate: '' }

export default function HomePage() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState(emptyQuery)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await api.get('/events', { params: query })
        if (cancelled) return
        setUpcoming(data.upcoming || [])
        setPast(data.past || [])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [query])

  const resetFilters = () => setQuery(emptyQuery)

  return (
    <div className="pb-16">
      <Hero
        search={query.search}
        onSearchChange={(v) => setQuery((q) => ({ ...q, search: v }))}
        onSubmit={() => setQuery((q) => ({ ...q }))}
      />

      <FilterBar query={query} setQuery={setQuery} onReset={resetFilters} />

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass mb-8 rounded-2xl border border-rose-200/80 bg-rose-50/80 p-4 text-rose-800"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <EventGridSkeleton count={6} />
      ) : (
        <>
          <section className="mb-16">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Upcoming events</h2>
                <p className="mt-1 text-slate-600">Happening soon — grab tickets before they’re gone.</p>
              </div>
              <span className="rounded-full bg-indigo-100/80 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                {upcoming.length} events
              </span>
            </div>
            {upcoming.length === 0 ? (
              <div className="glass rounded-3xl px-8 py-16 text-center">
                <p className="font-display text-lg font-semibold text-slate-800">No upcoming events match your filters</p>
                <p className="mt-2 text-slate-600">Try broadening search or clear filters to see everything.</p>
                <button type="button" onClick={resetFilters} className="btn-gradient mt-6 text-sm">
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((ev, i) => (
                  <EventCard key={ev._id} event={ev} index={i} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Past events</h2>
                <p className="mt-1 text-slate-600">Relive moments from earlier shows.</p>
              </div>
            </div>
            {past.length === 0 ? (
              <div className="glass rounded-3xl px-8 py-12 text-center text-slate-600">No past events yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((ev, i) => (
                  <EventCard key={ev._id} event={ev} index={i} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
