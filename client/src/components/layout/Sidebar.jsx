import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'

function Sidebar({ sidebarOpen, onClose }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Budget', path: '/budget' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Profile', path: '/profile' }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto bg-primary text-white transition-transform duration-300 md:relative md:translate-x-0 md:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-gray-700 p-6 md:block">
          <div>
            <h1 className="text-2xl font-bold">FinTrack</h1>
            <p className="text-sm text-gray-400">AI Finance Tracker</p>
          </div>
          <button type="button" className="inline-flex items-center justify-center rounded-lg border border-white/30 p-2 text-white md:hidden" onClick={onClose}>
            <span className="sr-only">Close sidebar</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 md:p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`block rounded-lg px-4 py-2 mb-2 transition-colors ${isActive(item.path) ? 'bg-secondary text-white' : 'hover:bg-gray-700'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar