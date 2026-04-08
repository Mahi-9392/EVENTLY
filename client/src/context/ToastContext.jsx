import { createContext, useCallback, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    setItems((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:right-6">
        <AnimatePresence mode="popLayout">
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl ${
                t.type === 'error'
                  ? 'border-rose-200/80 bg-rose-50/95 text-rose-900'
                  : t.type === 'success'
                    ? 'border-emerald-200/80 bg-emerald-50/95 text-emerald-900'
                    : 'border-indigo-200/80 bg-white/95 text-slate-800'
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
