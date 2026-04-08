import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BookingCancelPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl p-10 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white shadow-lg">
          !
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Payment cancelled</h1>
        <p className="mt-3 text-slate-600">
          Your payment was not completed, so this booking remains unpaid. You can retry checkout anytime.
        </p>
        <Link to="/dashboard" className="btn-gradient mt-8 inline-block w-full !py-3 text-center text-sm">
          Check dashboard status
        </Link>
      </motion.div>
    </div>
  )
}
