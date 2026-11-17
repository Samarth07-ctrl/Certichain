import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { BlockchainExplorerPage } from './BlockchainExplorerPage';

export const PublicBlockchainPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#111827]">
      {/* Public Top Navbar */}
      <nav className="h-16 bg-white border-b border-[#E5E7EB] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#111827]">
            Certi<span className="text-[#2563EB]">Chain</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Public Ledger Explorer
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <Link
            to="/verify"
            className="text-slate-600 hover:text-slate-900 font-medium hidden sm:inline"
          >
            Verify a Certificate
          </Link>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-lg bg-[#123B5D] text-white font-semibold hover:bg-[#0E2E49] transition-colors shadow-xs"
          >
            Institution Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <BlockchainExplorerPage />
      </main>
    </div>
  );
};
