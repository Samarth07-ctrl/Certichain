import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Building2,
  Search
} from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';

export const LoginPage: React.FC = () => {
  const { login } = useBlockchain();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@certichain.demo');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, 'INSTITUTION_ADMIN');
      setLoading(false);
      navigate('/institution/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between">
      {/* Top Header */}
      <header className="h-16 border-b border-[#E5E7EB] bg-white px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#111827]">
            Certi<span className="text-[#2563EB]">Chain</span>
          </span>
        </Link>

        {/* Link back to public verification */}
        <Link
          to="/verify"
          className="text-xs font-semibold text-[#123B5D] hover:text-[#2563EB] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F9FC] hover:bg-slate-100 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Verify Certificate (No Login Needed)</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex items-center justify-center">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 w-full">
          {/* Left Side: Institutional Trust Branding */}
          <div className="bg-[#123B5D] text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-blue-200 border border-white/10">
                <Building2 className="w-3.5 h-3.5" />
                <span>University Authority Portal</span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white leading-tight">
                Academic Credential Issuance Node
              </h1>

              <p className="text-xs text-blue-100/80 leading-relaxed">
                Authorized institutional portal for university deans, registrars, and controllers of examination to register academic degrees on the blockchain.
              </p>
            </div>

            {/* Informational Callout for Companies/Students */}
            <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-xs text-blue-100 mt-6 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-300" />
                <span>Companies, Recruiters & Students:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-200">
                You do <strong>not</strong> need to sign in! Anyone can verify certificates freely using the Public Verification tool on the home page.
              </p>
              <Link
                to="/verify"
                className="text-xs text-white font-semibold underline hover:text-blue-200 inline-block pt-1"
              >
                Go to Public Verification Tool &rarr;
              </Link>
            </div>
          </div>

          {/* Right Side: Institution Sign In Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Institution Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your institutional administrator credentials.
              </p>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Dean & Registrar Demo</span>
                <span className="text-[11px] text-slate-500">Vishwakarma Institute of Technology</span>
              </div>
              <button
                type="button"
                onClick={() => setEmail('admin@certichain.demo')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-[#123B5D] rounded hover:bg-slate-100"
              >
                Auto-Fill
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Private Keystore Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0E2E49] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                <span>{loading ? 'Authenticating Node...' : 'Access Institution Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
