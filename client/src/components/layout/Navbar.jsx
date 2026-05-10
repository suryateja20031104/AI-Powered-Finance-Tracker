
import { useSelector } from 'react-redux'

function Navbar({ onOpenSidebar }) {
  const { user } = useSelector(state => state.auth)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="px-4 py-4 flex items-center justify-between md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Finance Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden text-right md:block">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar