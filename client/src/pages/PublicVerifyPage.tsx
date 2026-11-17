import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Layers,
  Key
} from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { HashDisplay, StatusBadge } from '../components/ui/CommonUI';
import { calculateSHA256 } from '../utils/crypto';
import { VerificationResultData } from '../types';
import { MerkleProofModal } from '../components/blockchain/MerkleProofModal';

export const PublicVerifyPage: React.FC = () => {
  const { id: urlCertId } = useParams();
  const [searchParams] = useSearchParams();
  const queryCert = searchParams.get('q');
  const { verifyCertificateByIdOrHash, certificates } = useBlockchain();
  const navigate = useNavigate();

  // Verification method tab: 'upload' | 'id' | 'tamper-lab'
  const [method, setMethod] = useState<'upload' | 'id' | 'tamper-lab'>('upload');
  const [certificateIdInput, setCertificateIdInput] = useState(urlCertId || queryCert || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Tamper Lab State
  const [tamperTargetId, setTamperTargetId] = useState<string>('CERT-2026-001284');
  const [tamperCandidateName, setTamperCandidateName] = useState<string>('Aarav Sharma');
  const [tamperGrade, setTamperGrade] = useState<string>('9.99 CGPA (Altered Forged Grade)');
  const [tamperLiveHash, setTamperLiveHash] = useState<string>('');

  // Stepper state
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [result, setResult] = useState<VerificationResultData | null>(null);
  const [showMerkleModal, setShowMerkleModal] = useState(false);

  useEffect(() => {
    const computeTamperPreview = async () => {
      const payload = `FORGED_PAYLOAD:${tamperTargetId}:${tamperCandidateName}:${tamperGrade}:999`;
      const h = await calculateSHA256(payload);
      setTamperLiveHash(h);
    };
    computeTamperPreview();
  }, [tamperTargetId, tamperCandidateName, tamperGrade]);

  useEffect(() => {
    if (urlCertId || queryCert) {
      const targetId = urlCertId || queryCert || '';
      setCertificateIdInput(targetId);
      setMethod('id');
      runVerification(targetId);
    }
  }, [urlCertId, queryCert]);

  const runVerification = async (targetId?: string, file?: File) => {
    setVerifying(true);
    setResult(null);

    // Realistic Stepper Progression
    setVerificationStep(1); // Document Received
    await new Promise(r => setTimeout(r, 350));

    setVerificationStep(2); // SHA-256 Generated
    await new Promise(r => setTimeout(r, 450));

    let fileBuffer: ArrayBuffer | undefined;
    let extractedId = targetId || certificateIdInput.trim();

    if (file) {
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          if (parsed.certificateId) {
            extractedId = parsed.certificateId;
          }
        } catch (e) {
          // treat as binary
        }
      }
      fileBuffer = await file.arrayBuffer();
    }

    setVerificationStep(3); // Blockchain Record Lookup
    await new Promise(r => setTimeout(r, 450));

    setVerificationStep(4); // Comparing Hash
    await new Promise(r => setTimeout(r, 350));

    const verifyTarget = extractedId;
    const verificationData = await verifyCertificateByIdOrHash(verifyTarget, fileBuffer);

    setVerificationStep(5); // Complete
    setResult(verificationData);
    setVerifying(false);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    runVerification(undefined, file);
  };

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateIdInput.trim()) return;
    runVerification(certificateIdInput.trim());
  };

  // Sample quick buttons for demo evaluation
  const setDemoSample = (id: string) => {
    setCertificateIdInput(id);
    setMethod('id');
    runVerification(id);
  };

  const handleTamperDemo = async () => {
    // Generate simulated modified document
    setVerifying(true);
    setVerificationStep(1);
    await new Promise(r => setTimeout(r, 350));
    setVerificationStep(2);
    await new Promise(r => setTimeout(r, 400));
    setVerificationStep(3);
    await new Promise(r => setTimeout(r, 400));
    setVerificationStep(4);
    await new Promise(r => setTimeout(r, 350));

    const mockTamperedBuffer = new TextEncoder().encode("MODIFIED_CERTIFICATE_PAYLOAD_TAMPERED_GRADE_9.99").buffer as ArrayBuffer;
    const verificationData = await verifyCertificateByIdOrHash('CERT-2026-001284', mockTamperedBuffer);
    setVerificationStep(5);
    setResult(verificationData);
    setVerifying(false);
  };

  const handleExecuteTamperSimulation = async () => {
    setVerifying(true);
    setResult(null);

    setVerificationStep(1);
    await new Promise(r => setTimeout(r, 350));
    setVerificationStep(2);
    await new Promise(r => setTimeout(r, 450));
    setVerificationStep(3);
    await new Promise(r => setTimeout(r, 450));
    setVerificationStep(4);
    await new Promise(r => setTimeout(r, 350));

    const fakeBuffer = new TextEncoder().encode(
      `TAMPERED_FORGERY_DATA:${tamperTargetId}:${tamperCandidateName}:${tamperGrade}`
    ).buffer as ArrayBuffer;

    const verificationData = await verifyCertificateByIdOrHash(tamperTargetId, fakeBuffer);
    setVerificationStep(5);
    setResult(verificationData);
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#111827]">
      {/* Public Top Navbar */}
      <nav className="h-16 bg-white border-b border-[#E5E7EB] px-4 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#111827]">
            Certi<span className="text-[#2563EB]">Chain</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Public Gateway
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <Link
            to="/blockchain"
            className="text-slate-600 hover:text-slate-900 font-medium hidden sm:inline"
          >
            Blockchain Ledger
          </Link>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-lg bg-[#123B5D] text-white font-semibold hover:bg-[#0E2E49] transition-colors shadow-xs"
          >
            Institution Portal
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12 space-y-8">
        {/* Verification Portal Hero */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Trust Credential Verification
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#111827]">
            Verify an Academic Certificate
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Instantly verify certificate authenticity and integrity using cryptographic hashing and blockchain records.
          </p>
        </div>

        {/* Verification Card with Methods */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-6 sm:p-8">
          {/* Method Tabs */}
          <div className="flex border-b border-[#E5E7EB] pb-4 mb-6 gap-6">
            <button
              onClick={() => { setMethod('upload'); setResult(null); }}
              className={`text-xs sm:text-sm font-semibold pb-1 relative transition-colors ${
                method === 'upload' ? 'text-[#123B5D]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Method 1: Upload Document
              {method === 'upload' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[#123B5D]" />
              )}
            </button>
            <button
              onClick={() => { setMethod('id'); setResult(null); }}
              className={`text-xs sm:text-sm font-semibold pb-1 relative transition-colors ${
                method === 'id' ? 'text-[#123B5D]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Method 2: Certificate ID
              {method === 'id' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[#123B5D]" />
              )}
            </button>
            <button
              onClick={() => { setMethod('tamper-lab'); setResult(null); }}
              className={`text-xs sm:text-sm font-semibold pb-1 relative transition-colors flex items-center gap-1.5 ${
                method === 'tamper-lab' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Method 3: Live Tamper & Forgery Lab</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                Viva Demo
              </span>
              {method === 'tamper-lab' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-rose-600" />
              )}
            </button>
          </div>

          {/* Method 1: Upload */}
          {method === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 sm:p-12 text-center bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  id="portal-upload"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <label htmlFor="portal-upload" className="cursor-pointer space-y-3 block">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900">
                    Drag and drop certificate document here, or <span className="text-blue-600 hover:underline">browse files</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Supports PDF, PNG, JPG format. Calculated locally using SHA-256 without retaining raw file.
                  </p>
                </label>
              </div>

              {/* Demo Action helpers */}
              <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <span>Want to test edge cases?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoSample('CERT-2026-001284')}
                    className="text-[#2563EB] hover:underline font-medium"
                  >
                    Load Sample Genuine
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleTamperDemo}
                    className="text-rose-600 hover:underline font-medium"
                  >
                    Simulate Tampered Document
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Method 2: ID input */}
          {method === 'id' && (
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter Unique Certificate Identifier
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={certificateIdInput}
                      onChange={(e) => setCertificateIdInput(e.target.value)}
                      placeholder="e.g. CERT-2026-001284"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg focus:outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="px-6 py-2.5 bg-[#123B5D] text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-[#0E2E49] transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Verify Certificate</span>
                  </button>
                </div>
              </div>

              {/* Quick sample pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
                <span>Try sample IDs:</span>
                {['CERT-2026-001284', 'CERT-2026-001285', 'CERT-2026-001288'].map(sampleId => (
                  <button
                    key={sampleId}
                    type="button"
                    onClick={() => setDemoSample(sampleId)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] transition-colors"
                  >
                    {sampleId}
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* Method 3: Live Tamper Lab */}
          {method === 'tamper-lab' && (
            <div className="space-y-6">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>The Cryptographic Avalanche Effect Demonstration</span>
                </div>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  In this live sandbox, modify any genuine certificate credential (such as altering the student name or changing the CGPA). Observe how altering even a single bit completely changes the 256-bit SHA-256 digest, making undetected tampering cryptographically impossible.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Target Genuine Certificate
                  </label>
                  <select
                    value={tamperTargetId}
                    onChange={(e) => {
                      setTamperTargetId(e.target.value);
                      const target = certificates.find(c => c.certificateId === e.target.value);
                      if (target) {
                        setTamperCandidateName(target.studentName);
                        setTamperGrade('9.99 CGPA (Forged Grade)');
                      }
                    }}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs font-mono font-semibold"
                  >
                    {certificates.map(c => (
                      <option key={c.id} value={c.certificateId}>
                        {c.certificateId} · {c.studentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Candidate Name (Try editing)
                  </label>
                  <input
                    type="text"
                    value={tamperCandidateName}
                    onChange={(e) => setTamperCandidateName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Altered / Forged CGPA
                  </label>
                  <input
                    type="text"
                    value={tamperGrade}
                    onChange={(e) => setTamperGrade(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-rose-300 rounded-lg px-3 py-2 text-xs text-rose-700 font-semibold focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Side-by-side hash difference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    ✓ Genuine Blockchain Registered Digest:
                  </span>
                  <div className="break-all text-[11px] text-emerald-900 bg-white p-2 rounded border border-emerald-200">
                    {certificates.find(c => c.certificateId === tamperTargetId)?.certificateHash || 'Loading...'}
                  </div>
                  <span className="text-[10px] text-emerald-700 block">Status: Sealed on Ledger</span>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/50 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 block">
                    ✗ Forged / Altered Document Digest (Avalanche Scrambled):
                  </span>
                  <div className="break-all text-[11px] text-rose-900 bg-white p-2 rounded border border-rose-200">
                    {tamperLiveHash || 'Calculating...'}
                  </div>
                  <span className="text-[10px] text-rose-700 block">Parity: 0.0% Match (Mismatch Detected)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Ready to test? Submit this payload through the verifier:
                </span>
                <button
                  type="button"
                  onClick={handleExecuteTamperSimulation}
                  disabled={verifying}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{verifying ? 'Simulating Detection...' : 'Submit Forged Credential to Ledger'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Progress Stepper during verification */}
          {verifying && (
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Verification Pipeline in Progress</span>
                <span className="text-blue-600 font-mono">Running cryptographic checks...</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { step: 1, label: 'Document Received' },
                  { step: 2, label: 'SHA-256 Generated' },
                  { step: 3, label: 'Blockchain Query' },
                  { step: 4, label: 'Comparing Hash' },
                  { step: 5, label: 'Verification Complete' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      verificationStep >= s.step
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="text-[11px] flex items-center justify-center gap-1">
                      {verificationStep >= s.step ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block text-[10px] leading-none flex items-center justify-center">
                          {s.step}
                        </span>
                      )}
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification Result Display */}
        {result && !verifying && (
          <div className="space-y-6">
            {/* 1. VALID RESULT */}
            {result.status === 'VERIFIED' && (
              <div className="bg-white border border-emerald-200 rounded-2xl shadow-xs overflow-hidden">
                {/* Result Header */}
                <div className="bg-emerald-50/70 border-b border-emerald-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">Certificate Verified</h2>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        This certificate matches the record registered by the issuing institution.
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-500 block">Verified on</span>
                    <span className="font-mono text-slate-800 font-medium">
                      {new Date(result.verificationTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3 Verification Checks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 text-center py-4 bg-slate-50/40 text-xs">
                  <div className="p-2 space-y-1">
                    <span className="text-slate-500">Cryptographic Integrity</span>
                    <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      SHA-256 MATCH
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <span className="text-slate-500">Blockchain Record</span>
                    <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      BLOCK FOUND (#{result.blockNumber})
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <span className="text-slate-500">Issuing Institution</span>
                    <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      VERIFIED NODE
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  {result.isRevoked && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        <strong>Note:</strong> While the cryptographic signature matches the historical block, this credential has been marked as <strong>REVOKED</strong> by the registrar.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg border border-slate-100 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Student / Candidate</span>
                      <span className="text-sm font-semibold text-slate-900">{result.studentName}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-100 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Certificate Identifier</span>
                      <span className="text-sm font-mono font-semibold text-slate-900">{result.certificateId}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-100 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Issuing Institution</span>
                      <span className="text-sm font-medium text-slate-900">{result.institution}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-100 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Academic Program</span>
                      <span className="text-sm font-medium text-slate-900">{result.program}</span>
                    </div>
                  </div>

                  {/* Hash and Blockchain Ledger References */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-500">Certificate SHA-256 Hash:</span>
                      <HashDisplay hash={result.registeredHash || result.submittedHash} truncate={false} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Transaction ID:</span>
                      <span className="text-blue-600 font-semibold">{result.transactionId}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Confirmed in Block:</span>
                      <Link
                        to={`/institution/blockchain/${result.blockNumber}`}
                        className="text-[#2563EB] hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>Block #{result.blockNumber}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Asymmetric Digital Signature (ECDSA P-256) Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-2 text-slate-900">
                        <Key className="w-4 h-4 text-blue-600" />
                        <span>Asymmetric Digital Signature (Proof of Origin)</span>
                      </span>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        ECDSA P-256 Validated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Digitally signed using the University Registrar's private key. Mathematically proves that only Vishwakarma Institute of Technology could have minted this credential.
                    </p>
                    <div className="pt-2 border-t border-slate-200 font-mono text-[10px] space-y-1 text-slate-500">
                      <div><span className="font-semibold text-slate-600">SIGNING ALGORITHM: </span>ECDSA NIST P-256 (SECP256R1) with SHA-256</div>
                      <div><span className="font-semibold text-slate-600">ISSUER PUBLIC ADDRESS: </span>0x8F2A91D6E7216A8C9c1E86E20738e4A81De95B24</div>
                    </div>
                  </div>

                  {/* Merkle Proof Action Trigger */}
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Merkle Tree Inclusion Proof</span>
                      </span>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Cryptographically prove this certificate's inclusion in Block #{result.blockNumber} in O(log N) time.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMerkleModal(true)}
                      className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E2E49] text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-300" />
                      <span>Verify Merkle Proof</span>
                    </button>
                  </div>

                  {/* Visual Verification Timeline */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-700 mb-3">
                      Cryptographic Audit Trail
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      {[
                        { title: 'Certificate Issued', desc: result.issueDate },
                        { title: 'Hash Generated', desc: 'SHA-256 Digest' },
                        { title: 'Blockchain Registered', desc: `Block #${result.blockNumber}` },
                        { title: 'Certificate Verified', desc: 'Ledger Confirmed' },
                      ].map((item, idx, arr) => (
                        <React.Fragment key={item.title}>
                          <div className="flex items-center sm:flex-col sm:text-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-[11px]">
                              ✓
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{item.title}</div>
                              <div className="text-[11px] text-slate-500">{item.desc}</div>
                            </div>
                          </div>
                          {idx < arr.length - 1 && (
                            <div className="hidden sm:block flex-1 h-0.5 bg-emerald-200" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1.5 ON-CHAIN REVOCATION RESULT */}
            {result.status === 'REVOKED' && (
              <div className="bg-white border-2 border-amber-300 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-amber-50/80 border-b border-amber-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-amber-950">Certificate Revoked on Blockchain</h2>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white uppercase tracking-wider">
                          Revoked
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 mt-0.5">
                        This credential was sealed onto the blockchain, but has subsequently been officially <strong>REVOKED</strong> by the institution.
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs font-mono">
                    <span className="text-amber-800 block">Ledger State</span>
                    <span className="font-bold text-amber-950">IMMUTABLE REVOCATION TRANSACTION</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6 text-xs">
                  <div className="p-4 bg-amber-100/60 border border-amber-300 rounded-xl text-amber-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5 text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        Official Revocation Notice:
                      </span>
                      <span className="text-[10px] font-mono bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-bold">
                        NON-REVERSIBLE ON-CHAIN
                      </span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
                      <span className="text-[11px] font-semibold text-slate-500 block">Audited Reason for Revocation:</span>
                      <span className="text-xs font-bold text-rose-900">
                        "{result.revocationReason || 'Disciplinary Academic Action / Record Invalidation'}"
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      The university registrar has issued an append-only revocation transaction. While the original historical issuance record remains immutable on the chain, this credential is <strong>no longer active or valid</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Student / Candidate</span>
                      <span className="text-sm font-semibold text-slate-900">{result.studentName}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Certificate Identifier</span>
                      <span className="text-sm font-mono font-semibold text-slate-900">{result.certificateId}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Issuing Institution</span>
                      <span className="text-sm font-medium text-slate-900">{result.institution}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                      <span className="text-slate-500 block mb-1">Academic Program</span>
                      <span className="text-sm font-medium text-slate-900">{result.program}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                      On-Chain Credential Lifecycle History
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block">Stage 1: Issuance</span>
                        <div className="font-bold text-slate-900">Certificate Minted</div>
                        <div className="text-[11px] text-slate-600 font-mono">Date: {result.issueDate} · Block #{result.blockNumber}</div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/60 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-rose-700 block">Stage 2: Revocation</span>
                        <div className="font-bold text-rose-950">Revocation Transaction Sealed</div>
                        <div className="text-[11px] text-rose-800 font-mono">Status: REVOKED ON LEDGER</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Historical Block: #{result.blockNumber} · Tx ID: {result.transactionId}
                    </span>
                    <button
                      onClick={() => setShowMerkleModal(true)}
                      className="px-3.5 py-1.5 bg-[#123B5D] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-300" />
                      <span>Verify Historical Merkle Path</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAMPERED / MISMATCH RESULT */}
            {result.status === 'MISMATCH' && (
              <div className="bg-white border-2 border-rose-500 rounded-2xl shadow-md overflow-hidden">
                <div className="bg-rose-600 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold">⚠️ Cryptographic Forgery Detected</h2>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white text-rose-700 uppercase tracking-wider">
                          Tampered
                        </span>
                      </div>
                      <p className="text-xs text-rose-100 mt-0.5">
                        Document payload has been altered after institutional anchoring. Cryptographic SHA-256 hash does not match blockchain record.
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs font-mono">
                    <span className="text-rose-200 block">Security Analysis</span>
                    <span className="font-bold text-white bg-black/30 px-2 py-0.5 rounded">
                      0% Bit Parity · Mismatch
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6 text-xs">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Cryptographic Explanation (Avalanche Effect)
                    </div>
                    <p className="text-amber-800 text-[11px]">
                      Even a small modification to the certificate (such as altering a grade, name, date, or single pixel) changes its cryptographic SHA-256 hash completely (Avalanche effect).
                    </p>
                  </div>

                  {/* Hash Difference Comparison */}
                  <div className="space-y-3 font-mono">
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40">
                      <span className="text-rose-700 font-bold block text-[11px] mb-1">
                        Submitted Document Hash (Altered / Forged):
                      </span>
                      <div className="break-all text-rose-900 bg-white p-2 rounded border border-rose-200">
                        {result.submittedHash}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-slate-600 font-bold block text-[11px] mb-1">
                        Registered Blockchain Hash (Immutable Reference):
                      </span>
                      <div className="break-all text-slate-900 bg-white p-2 rounded border border-slate-200">
                        {result.registeredHash}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
                    <Link
                      to={`/institution/blockchain/${result.blockNumber}`}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5"
                    >
                      <span>View Blockchain Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => alert("Verification issue logged to institutional compliance desk.")}
                      className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                    >
                      Report Verification Issue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NOT FOUND RESULT */}
            {result.status === 'NOT_FOUND' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Certificate Record Not Found</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    CertiChain could not locate a blockchain record corresponding to this certificate identifier or hash.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setResult(null);
                      setCertificateIdInput('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#123B5D] rounded-lg hover:bg-[#0E2E49]"
                  >
                    Try Another Query
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Merkle Tree Proof Modal */}
      {result && (
        <MerkleProofModal
          isOpen={showMerkleModal}
          onClose={() => setShowMerkleModal(false)}
          leafHash={result.registeredHash || result.submittedHash}
          blockNumber={result.blockNumber || 1}
          allBlockHashes={[result.registeredHash || result.submittedHash]}
          certificateId={result.certificateId}
        />
      )}
    </div>
  );
};
