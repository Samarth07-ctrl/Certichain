import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  FileCheck2,
  Blocks,
  LogOut,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  const { user, logout, institution } = useBlockchain();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Strictly the 4 essential Institution navigation items
  const navItems = [
    { label: 'Overview', path: '/institution/dashboard', icon: LayoutDashboard },
    { label: 'Issue Certificate', path: '/institution/issue', icon: FilePlus2 },
    { label: 'Issued Certificates', path: '/institution/certificates', icon: FileCheck2 },
    { label: 'Blockchain Ledger', path: '/institution/blockchain', icon: Blocks },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 w-[250px] bg-white border-r border-[#E5E7EB] z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand / Logo */}
        <div>
          <div className="h-16 px-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <NavLink to="/institution/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg tracking-tight text-[#111827] leading-none">
                  Certi<span className="text-[#2563EB]">Chain</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase mt-1">
                  Institution Portal
                </span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/institution/dashboard' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors
                    ${isActive 
                      ? 'bg-[#123B5D] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F7F9FC]'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Sign Out */}
        <div className="p-3 border-t border-[#E5E7EB]">
          <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB] mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-[#123B5D] flex items-center justify-center font-bold text-xs">
                VIT
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#111827] truncate">
                  {user?.name || 'Dr. Rajesh K. Kulkarni'}
                </p>
                <p className="text-[10px] text-[#64748B] truncate">
                  {institution.name}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
