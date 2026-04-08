import { motion } from 'framer-motion'

export default function Hero({ search, onSearchChange, onSubmit }) {
  return (
    <section className="relative mb-12 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.35),transparent)]" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />

      <div className="relative px-6 py-14 text-center sm:px-10 sm:py-18 md:py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80"
        >
          Live experiences
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Discover Amazing Events Around You
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg"
        >
          Concerts, sports, culture, and more — curated for you with real-time availability and secure checkout.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.()
          }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="flex flex-col gap-3 rounded-2xl bg-white/15 p-2 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search artists, venues, categories..."
                className="w-full rounded-xl border border-white/20 bg-white/95 py-4 pl-12 pr-4 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-white px-8 py-4 font-display font-semibold text-indigo-600 shadow-lg transition hover:bg-slate-50 active:scale-[0.98]"
            >
              Search
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}
