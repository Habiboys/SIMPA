import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ProjectDropdown from './ProjectDropdown';
import ThemeToggle from './ThemeToggle';
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Home, 
  Calendar, 
  FileText, 
  ChevronDown,
  X
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil data user dari localStorage
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUser(userData);
    }
  }, []);

  // Fungsi untuk mendapatkan inisial dari username
  const getInitials = (username) => {
    return username
      ? username.slice(0, 2).toUpperCase()
      : 'U';
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-80 z-30">
      {/* Main Navbar */}
      <div className="navbar bg-base-100 shadow-md h-16">
        <div className="flex-1 items-center gap-4">
          <button className="btn btn-ghost lg:hidden" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          
          {/* Mobile Title - Show only on mobile */}
          <div className="flex items-center lg:hidden">
            <h1 className="text-lg font-bold">SIMPA</h1>
          </div>

          {/* Desktop Search Bar */}
          {/* <div className="hidden lg:block relative w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              className="input input-bordered w-full pl-10 pr-4 h-12"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div> */}

          {/* Project Dropdown Container */}
          <div className="flex-none">
            <ProjectDropdown />
          </div>

          {/* Mobile Search Trigger */}
          <button 
            className="btn btn-ghost btn-circle lg:hidden ml-auto"
            onClick={() => setIsSearchActive(true)}
          >
            <Search size={20} />
          </button>
        </div>

        <div className="flex-none gap-2">
          <ThemeToggle />
          
          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost gap-2 normal-case">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">{user ? getInitials(user.username) : 'U'}</span>
                </div>
              </div>
              <span className="hidden md:inline">{user?.username || 'User'}</span>
              <ChevronDown size={16} />
            </label>
            <ul tabIndex={0} className="dropdown-content menu menu-lg bg-base-100 rounded-box w-72 mt-4 shadow-xl p-0 [&_li>*]:rounded-none">
              <div className="p-4 border-b text-center">
                <div className="avatar placeholder mb-3">
                  <div className="bg-neutral text-neutral-content rounded-full w-16">
                    <span>{user ? getInitials(user.username) : 'U'}</span>
                  </div>
                </div>
                <p className="font-semibold">{user?.username || 'User'}</p>
                <div className="badge badge-neutral mt-2 capitalize">{user?.role || 'Guest'}</div>
              </div>
              {user?.role === 'admin' && (
                <li><a className="gap-4"><Home size={18} /> Dashboard</a></li>
              )}
              <li><a className="gap-4"><User size={18} /> My Profile</a></li>
              <li><a className="gap-4"><Calendar size={18} /> My Schedule</a></li>
              <li><a className="gap-4"><FileText size={18} /> My Documents</a></li>
              <div className="divider my-0"></div>
              <li><a className="gap-4"><Settings size={18} /> Settings</a></li>
              <li><a onClick={handleLogout} className="gap-4 text-error hover:bg-error/10 active:!bg-error/20"><LogOut size={18} /> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchActive && (
        <div className="fixed inset-0 bg-base-100 lg:hidden z-50">
          <div className="flex items-center h-16 px-4 gap-2">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setIsSearchActive(false)}
            >
              <X size={20} />
            </button>
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search..." 
                className="input input-bordered w-full pl-10"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          {/* Search Results Area */}
          <div className="p-4">
            <p className="text-sm text-gray-500">Recent Searches</p>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="btm-nav lg:hidden">
        {user?.role === 'admin' && (
          <button className="active">
            <Home size={20} />
            <span className="btm-nav-label">Dashboard</span>
          </button>
        )}
        <button>
          <Calendar size={20} />
          <span className="btm-nav-label">Schedule</span>
        </button>
        <button>
          <FileText size={20} />
          <span className="btm-nav-label">Documents</span>
        </button>
        <button>
          <Settings size={20} />
          <span className="btm-nav-label">Settings</span>
        </button>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired
};

export default Navbar;