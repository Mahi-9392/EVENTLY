import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api.js'

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')
  const [bookingInfo, setBookingInfo] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('unknown')
      return
    }
    let cancelled = false
    let retries = 0
    const maxRetries = 6

    const check = async () => {
      try {
        const { data } = await api.get(`/payments/session-status/${sessionId}`)
        if (cancelled) return
        setBookingInfo(data)
        if (data.paymentStatus === 'paid') {
          setStatus('paid')
          return
        }
        if (data.paymentStatus === 'failed') {
          setStatus('failed')
          return
        }
        if (retries < maxRetries) {
          retries += 1
          setTimeout(check, 1500)
        } else {
          setStatus('pending')
        }
      } catch (e) {
        if (cancelled) return
        setError(e.message)
        setStatus('unknown')
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl p-10 text-center shadow-2xl"
      >
        {status === 'paid' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl shadow-lg">
              ✓
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Payment successful</h1>
            <p className="mt-3 text-slate-600">
              Booking confirmed{bookingInfo?.event?.title ? ` for ${bookingInfo.event.title}` : ''}.
            </p>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white shadow-lg">
              ...
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Payment processing</h1>
            <p className="mt-3 text-slate-600">
              Your payment is being confirmed. Please check your dashboard in a moment.
            </p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-2xl font-bold text-white shadow-lg">
              !
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Payment failed</h1>
            <p className="mt-3 text-slate-600">
              Transaction failed. You can retry payment from event details.
            </p>
          </>
        )}
        {status === 'checking' && (
          <>
            <h1 className="font-display text-2xl font-bold text-slate-900">Checking payment status...</h1>
            <p className="mt-3 text-slate-600">Please wait while we verify your transaction.</p>
          </>
        )}
        {status === 'unknown' && (
          <>
            <h1 className="font-display text-2xl font-bold text-slate-900">Unable to verify payment</h1>
            <p className="mt-3 text-slate-600">{error || 'Please check your dashboard for latest payment status.'}</p>
          </>
        )}
        <Link to="/dashboard" className="btn-gradient mt-8 inline-block w-full !py-3 text-center text-sm">
          Go to dashboard
        </Link>
      </motion.div>
    </div>
  )
}
