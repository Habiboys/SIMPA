import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoutButton from './Logout';
import PropTypes from 'prop-types';
import { 
  Home, 
  FileText, 
  Users, 
  Settings,
  BarChart2,
  X,
  Building2,
  Briefcase,
  ChevronRight,
  Wrench,
  ClipboardCheck,
  Boxes,
  Thermometer
} from 'lucide-react';

const menuItems = [
  {
    title: 'Main Menu',
    items: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Briefcase, label: 'Proyek', path: '/proyek' },
      { icon: FileText, label: 'Documents', path: '/documents' },
    ]
  },
  {
    title: 'Managemen Aset',
    items: [
      { icon: Building2, label: 'Ruangan', path: '/ruangan' },
      { icon: Boxes, label: 'Model / Merek', path: '/model' },
      { icon: Thermometer, label: 'Unit AC', path: '/unit' },
    ]
  },
  {
    title: 'Maintenance',
    items: [
      { icon: ClipboardCheck, label: 'Laporkan Pemeriksaan', path: '/laporan' },
      { icon: BarChart2, label: 'Hasil Pemeriksaan', path: '/hasil' },
      { icon: Wrench, label: 'Jenis Maintenance', path: '/maintenance' },
    ]
  }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState(() => {
    // Set active group berdasarkan path saat ini
    const currentPath = location.pathname;
    const group = menuItems.find(group => 
      group.items.some(item => item.path === currentPath)
    );
    return group ? group.title : 'Main Menu';
  });

  const isMenuActive = (path) => {
    return location.pathname === path;
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) { // lg breakpoint
      toggleSidebar();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 w-80 bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-50 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <img src="/images/logosuralaya.jpg" alt="Logo Suralaya" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="font-bold text-2xl">SIMPA</h1>
              <p className="text-xs text-base-content/60">Management System</p>
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-sm lg:hidden" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems.map((group) => (
            <div key={group.title} className="mb-6">
              <div 
                className="px-4 mb-2 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveGroup(group.title)}
              >
                <span className="text-xs font-semibold text-base-content/60">{group.title}</span>
                <ChevronRight 
                  size={16} 
                  className={`transform transition-transform ${
                    activeGroup === group.title ? 'rotate-90' : ''
                  }`}
                />
              </div>
              <div className={`${activeGroup === group.title ? 'block' : 'hidden lg:block'}`}>
                {group.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors
                      ${isMenuActive(item.path) ? 'bg-primary/10 text-primary font-medium' : 'text-base-content/70'}
                    `}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired
};

export default Sidebar;