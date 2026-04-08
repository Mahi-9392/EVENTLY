import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const linkClass = ({ isActive }) =>
  `relative px-1 py-2 text-sm font-semibold transition after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-indigo-500 after:to-pink-500 after:transition hover:text-indigo-700 ${
    isActive ? 'text-indigo-700 after:scale-x-100' : 'text-slate-600'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to={user ? '/' : '/login'} className="group flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition group-hover:scale-105">
            E
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            Evently
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {user && (
            <>
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/calendar" className={linkClass}>
                Calendar
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80"
              >
                Login
              </Link>
              <Link to="/register" className="btn-gradient text-sm !py-2 !px-5">
                Sign up
              </Link>
            </>
          ) : (
            <>
              <div className="hidden rounded-2xl border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
                {user.name}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {user && (
        <nav className="flex items-center justify-center gap-4 border-t border-white/30 bg-white/50 px-4 py-2 md:hidden">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={linkClass}>
            Calendar
          </NavLink>
          {user.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
