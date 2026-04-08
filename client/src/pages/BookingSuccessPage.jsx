import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl p-10 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl shadow-lg">
          ✓
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Payment successful</h1>
        <p className="mt-3 text-slate-600">Your booking is confirmed. Check your dashboard for details.</p>
        <Link to="/dashboard" className="btn-gradient mt-8 inline-block w-full !py-3 text-center text-sm">
          Go to dashboard
        </Link>
      </motion.div>
    </div>
  )
}
