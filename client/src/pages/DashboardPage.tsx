import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Plus,
  ArrowRight,
  Blocks,
  ShieldCheck,
  Building2,
  ExternalLink,
  Award
} from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { StatCard, StatusBadge, HashDisplay, PageHeader } from '../components/ui/CommonUI';

export const DashboardPage: React.FC = () => {
  const { certificates, blocks, institution, verificationCount } = useBlockchain();
  const navigate = useNavigate();

  const totalIssued = certificates.length + 1279;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Overview"
        subtitle={`Academic credential management authority for ${institution.name}`}
        badge="Node Active · VIT-PUNE-6112"
        actions={
          <button
            onClick={() => navigate('/institution/issue')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#123B5D] hover:bg-[#0E2E49] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </button>
        }
      />

      {/* 4 Focused Institutional Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Degrees Issued"
          value={totalIssued.toLocaleString()}
          change="+12.4% this year"
          isPositive={true}
          subtitle="All academic programs registered"
          icon={FileCheck2}
        />
        <StatCard
          title="Public Verifications"
          value={verificationCount.toLocaleString()}
          change="Live Sync"
          isPositive={true}
          subtitle="Portal & Recruiter queries logged"
          icon={ShieldCheck}
        />
        <StatCard
          title="Blockchain Ledger Height"
          value={`Block #${blocks.length}`}
          subtitle="100% Immutable Integrity"
          isPositive={true}
          icon={Blocks}
        />
        <StatCard
          title="Signer Node & Consensus"
          value="PoA 2/3 Quorum"
          change="ECDSA P-256"
          isPositive={true}
          subtitle={institution.code}
          icon={Award}
        />
      </div>

      {/* Quick Issuance Callout Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] to-[#1E4E79] rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-blue-200 border border-white/10">
            <Award className="w-3.5 h-3.5" />
            <span>Authorized Registrar Terminal</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">Ready to Issue New Credentials?</h2>
          <p className="text-xs text-blue-100/80 max-w-xl">
            Input student graduation details, compute a deterministic 256-bit SHA-256 hash, and seal the record into a new cryptographically linked blockchain block.
          </p>
        </div>
        <button
          onClick={() => navigate('/institution/issue')}
          className="px-4 py-2.5 bg-white text-[#123B5D] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#123B5D]" />
          <span>Launch Issuance Wizard</span>
        </button>
      </div>

      {/* Recent Issued Certificates Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Recent Credentials Sealed on Blockchain
            </h2>
            <p className="text-xs text-[#64748B]">
              Latest degrees anchored to the immutable sequential ledger
            </p>
          </div>
          <NavLink
            to="/institution/certificates"
            className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View All Registry ({certificates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] font-semibold">
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student Name & Roll No</th>
                <th className="py-3 px-4">Degree Program</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Block #</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {certificates.slice(0, 5).map((cert) => (
                <tr key={cert.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#111827] font-mono">
                    {cert.certificateId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{cert.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{cert.studentId}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{cert.program}</td>
                  <td className="py-3 px-4 text-slate-600">{cert.issueDate}</td>
                  <td className="py-3 px-4">
                    <HashDisplay hash={cert.certificateHash} />
                  </td>
                  <td className="py-3 px-4">
                    <NavLink
                      to={`/institution/blockchain/${cert.blockNumber}`}
                      className="font-mono text-[#2563EB] hover:underline font-bold"
                    >
                      #{cert.blockNumber}
                    </NavLink>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={cert.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <NavLink
                      to="/institution/certificates"
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-block"
                    >
                      Inspect
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
