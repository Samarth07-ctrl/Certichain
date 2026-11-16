import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  ShieldCheck, 
  FilePlus2,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { user, institution } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/institution/certificates?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E5E7EB] px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[#111827]">
              Welcome, {user?.name.split(' ')[0] || 'Registrar'}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500 animate-pulse"></span>
              Ledger Node Active
            </span>
          </div>
          <div className="text-[11px] text-[#64748B]">
            {institution.name} • {institution.code}
          </div>
        </div>
      </div>

      {/* Middle: Quick Search in Registry */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issued certificates by Student Name, Roll No or ID..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F9FC] border border-[#E5E7EB] rounded-lg focus:outline-none focus:bg-white focus:border-[#2563EB] transition-colors"
          />
        </form>
      </div>

      {/* Right: Quick Action Button */}
      <div className="flex items-center gap-3">
        <Link
          to="/institution/issue"
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#123B5D] hover:bg-[#0E2E49] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
          <span>Issue Certificate</span>
        </Link>
      </div>
    </header>
  );
};
