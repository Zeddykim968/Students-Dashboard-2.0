import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `block p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/students" 
              className={({ isActive }) => 
                `block p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Students
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/groups" 
              className={({ isActive }) => 
                `block p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Groups
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/submissions" 
              className={({ isActive }) => 
                `block p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Submissions
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
