import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { toDateKey, buildDateStatusMap } from '../lib/calendarUtils.js'

function pickDate(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v
  if (Array.isArray(v) && v[0] instanceof Date && !Number.isNaN(v[0].getTime())) return v[0]
  return null
}

export default function CalendarView({ value, onChange, events }) {
  const dateStatusMap = buildDateStatusMap(events || [])
  const hasEvent = (date) => {
    const key = toDateKey(date)
    return (events || []).some((e) => toDateKey(e.date) === key)
  }

  const handleChange = (v) => {
    const d = pickDate(v)
    if (d) onChange(d)
  }

  return (
    <div className="relative z-10 w-full">
      <Calendar
        selectRange={false}
        onChange={handleChange}
        onClickDay={(date) => onChange(date)}
        value={value}
        className="premium-calendar"
        tileClassName={({ date, view }) => {
          if (view !== 'month') return null
          if (!hasEvent(date)) return null
          const st = dateStatusMap[toDateKey(date)]
          if (st === 'SOLD_OUT') return 'cal-tile-sold'
          if (st === 'FAST_SELLING') return 'cal-tile-fast'
          return 'cal-tile-available'
        }}
      />
    </div>
  )
}
