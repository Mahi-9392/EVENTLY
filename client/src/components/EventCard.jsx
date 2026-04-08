import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from './Badge.jsx'

function gradientForEvent(event) {
  const str = `${event.title || ''}${event._id || ''}`
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = str.charCodeAt(i) + ((h << 5) - h)
  const hue = Math.abs(h) % 360
  return `linear-gradient(135deg, hsl(${hue}, 70%, 45%) 0%, hsl(${(hue + 40) % 360}, 65%, 35%) 100%)`
}

export default function EventCard({ event, index = 0 }) {
  const imgUrl = event.imageUrl || event.coverImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/events/${event._id}`}
        className="group block overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-slate-200/80 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:scale-105 hover:border-indigo-200/60 hover:shadow-2xl hover:shadow-indigo-500/15"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {imgUrl ? (
            <img src={imgUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
          ) : (
            <div
              className="flex h-full w-full items-end justify-start p-5 text-white"
              style={{ background: gradientForEvent(event) }}
            >
              <span className="font-display text-2xl font-bold leading-tight drop-shadow-md line-clamp-2">
                {event.title}
              </span>
            </div>
          )}
          <div className="absolute right-3 top-3">
            <Badge status={event.status} className="!text-[10px]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>

        <div className="space-y-3 p-5">
          {imgUrl && (
            <h3 className="font-display text-lg font-bold text-slate-900 transition group-hover:text-indigo-700 line-clamp-2">
              {event.title}
            </h3>
          )}
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.date).toLocaleString()}
            </p>
            <p className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.location}</span>
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="font-display text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
              ${event.price}
            </p>
            <p className="text-sm font-medium text-slate-500">
              <span className="font-semibold text-slate-800">{event.availableTickets}</span> left
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
