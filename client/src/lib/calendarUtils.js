export function toDateKey(d) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

const rank = (s) => (s === 'SOLD_OUT' ? 3 : s === 'FAST_SELLING' ? 2 : 1)

/** When multiple events share a date, show the most urgent status (sold out > fast selling > available). */
export function buildDateStatusMap(events) {
  const map = {}
  for (const ev of events) {
    const key = toDateKey(ev.date)
    const st = ev.status || 'AVAILABLE'
    if (!map[key] || rank(st) > rank(map[key])) map[key] = st
  }
  return map
}
