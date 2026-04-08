const styles = {
  SOLD_OUT: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30',
  FAST_SELLING: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md shadow-amber-500/25',
  AVAILABLE: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25',
}

const labels = {
  SOLD_OUT: 'Sold Out',
  FAST_SELLING: 'Fast Selling',
  AVAILABLE: 'Available',
}

export default function Badge({ status = 'AVAILABLE', className = '' }) {
  const key = status in styles ? status : 'AVAILABLE'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[key]} ${className}`}
    >
      {labels[key]}
    </span>
  )
}
