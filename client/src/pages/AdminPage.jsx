import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import Badge from '../components/Badge.jsx'
import { useToast } from '../context/ToastContext.jsx'

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  totalTickets: 0,
  availableTickets: 0,
  price: 0,
  category: '',
}

function StatCard({ label, value, gradient, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl ${gradient}`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/80">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value}</p>
        </div>
        <span className="rounded-2xl bg-white/20 p-2 backdrop-blur-sm">{icon}</span>
      </div>
    </motion.div>
  )
}

export default function AdminPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const load = async () => {
    try {
      setError('')
      const [eventsRes, statsRes, usersRes] = await Promise.all([
        api.get('/admin/events'),
        api.get('/admin/stats'),
        api.get('/users', { params: { limit: 50 } }),
      ])
      setEvents(eventsRes.data.items || [])
      setStats(statsRes.data)
      setUsers(usersRes.data.items)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const notify = (msg, type = 'success') => {
    toast(msg, type)
  }

  const create = async (e) => {
    e.preventDefault()
    try {
      await api.post('/events', {
        ...form,
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.availableTickets),
        price: Number(form.price),
      })
      setForm(emptyForm)
      notify('Event created')
      load()
    } catch (err) {
      setError(err.message)
      notify(err.message, 'error')
    }
  }

  const startEdit = (ev) => {
    setEditId(ev._id)
    setError('')
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '',
      location: ev.location || '',
      totalTickets: ev.totalTickets ?? 0,
      availableTickets: ev.availableTickets ?? 0,
      price: ev.price ?? 0,
      category: ev.category || '',
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm(emptyForm)
  }

  const update = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/events/${editId}`, {
        ...form,
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.availableTickets),
        price: Number(form.price),
      })
      notify('Event updated')
      cancelEdit()
      load()
    } catch (err) {
      setError(err.message)
      notify(err.message, 'error')
    }
  }

  const remove = async (id) => {
    try {
      await api.delete(`/events/${id}`)
      notify('Event deleted')
      load()
    } catch (err) {
      setError(err.message)
      notify(err.message, 'error')
    }
  }

  const toggleBlock = async (u) => {
    try {
      await api.patch(`/users/${u._id}/block`, { isBlocked: !u.isBlocked })
      notify(u.isBlocked ? 'User unblocked' : 'User blocked')
      load()
    } catch (err) {
      setError(err.message)
      notify(err.message, 'error')
    }
  }

  return (
    <div className="space-y-12 pb-16">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Admin console</h1>
        <p className="mt-2 text-slate-600">Manage events, users, and revenue at a glance.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Users"
            value={stats.users}
            gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            label="Events"
            value={stats.events}
            gradient="bg-gradient-to-br from-fuchsia-500 to-pink-600"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
          <StatCard
            label="Bookings"
            value={stats.bookingsTotal}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="Revenue (paid)"
            value={`$${Number(stats.revenue || 0).toFixed(0)}`}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

      <section className="glass rounded-3xl p-6 shadow-xl sm:p-8">
        <h2 className="font-display text-xl font-bold text-slate-900">{editId ? 'Edit event' : 'Create event'}</h2>
        <form onSubmit={editId ? update : create} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            className="input-premium !pl-4"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="input-premium !pl-4"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <input
            className="input-premium !pl-4"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <input
            className="input-premium !pl-4"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <input
            className="input-premium !pl-4"
            placeholder="Total tickets"
            type="number"
            value={form.totalTickets}
            onChange={(e) => setForm((f) => ({ ...f, totalTickets: e.target.value }))}
          />
          <input
            className="input-premium !pl-4"
            placeholder="Available tickets"
            type="number"
            value={form.availableTickets}
            onChange={(e) => setForm((f) => ({ ...f, availableTickets: e.target.value }))}
          />
          <input
            className="input-premium !pl-4"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <textarea
            className="input-premium !min-h-[120px] !pl-4 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" className="btn-gradient flex-1 sm:flex-none !px-10">
              {editId ? 'Update event' : 'Create event'}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit} className="btn-gradient-outline">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-bold text-slate-900">All events</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {events.map((ev) => (
            <div key={ev._id} className="glass flex flex-col gap-3 rounded-2xl border border-white/50 p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-bold text-slate-900">{ev.title}</p>
                  <Badge status={ev.status} className="!scale-90" />
                </div>
                <p className="text-sm text-slate-600">
                  {new Date(ev.date).toLocaleString()} · {ev.location}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Available:{' '}
                  <span className="font-semibold text-slate-800">
                    {ev.availableTickets} / {ev.totalTickets}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(ev)} className="btn-gradient-outline !py-2 !text-sm">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(ev._id)}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-bold text-slate-900">Users</h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="glass flex flex-col gap-4 rounded-2xl border border-white/50 p-5 shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {u.name} <span className="text-xs font-normal text-slate-500">({u.role})</span>
                </p>
                <p className="text-sm text-slate-600">{u.email}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    u.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {u.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleBlock(u)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-95 ${
                  u.isBlocked ? 'bg-slate-800' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
              >
                {u.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
