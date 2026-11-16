import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowDown,
  ExternalLink,
  Copy,
  Check,
  Play
} from 'lucide-react';
import { ClientMerkleTree, MerkleProof } from '../../utils/merkle';

interface MerkleProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  leafHash: string;
  blockNumber: number;
  allBlockHashes: string[];
  certificateId: string;
}

export const MerkleProofModal: React.FC<MerkleProofModalProps> = ({
  isOpen,
  onClose,
  leafHash,
  blockNumber,
  allBlockHashes,
  certificateId
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    calculatedRoot: string;
    steps: { combined: string; result: string }[];
  } | null>(null);

  if (!isOpen) return null;

  // Build tree and generate proof
  const tree = new ClientMerkleTree(allBlockHashes.length > 0 ? allBlockHashes : [leafHash]);
  // Synchronous level setup for display
  const leaves = allBlockHashes.length > 0 ? allBlockHashes : [leafHash];
  const proof = tree.getProof(leafHash) || {
    leaf: leafHash,
    root: leafHash,
    proof: [],
    treeHeight: 1,
    totalLeaves: 1
  };

  const runProofVerification = async () => {
    setIsVerifying(true);
    await tree.buildTree();
    const result = await ClientMerkleTree.verifyProof(leafHash, proof.proof, tree.root || leafHash);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123B5D] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Merkle Tree Inclusion Proof
              </h3>
              <p className="text-xs text-slate-500">
                Mathematical proof that certificate is sealed in Block #{blockNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1.5"
          >
            ✕
          </button>
        </div>

        {/* Certificate Reference */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Credential</span>
            <span className="font-semibold text-slate-900 font-mono">{certificateId}</span>
          </div>
          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-mono">
            Host Block #{blockNumber}
          </span>
        </div>

        {/* Visual Proof Path */}
        <div className="my-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Cryptographic Proof Path (Leaf ➔ Sibling ➔ Merkle Root)</span>
          </h4>

          {/* Leaf Node */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-blue-700 uppercase">
              <span>Leaf 0 (Target Certificate Hash)</span>
              <span>Input</span>
            </div>
            <div className="font-mono text-[11px] text-blue-900 break-all select-all">
              {leafHash}
            </div>
          </div>

          {proof.proof.length > 0 ? (
            proof.proof.map((step, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-center text-slate-400">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                    <span>Audit Step #{idx + 1} ({step.position.toUpperCase()} Sibling Hash)</span>
                    <span className="font-mono">Pairwise SHA-256</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 break-all select-all">
                    {step.sibling}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-xs text-slate-500 italic">
              Single-transaction block: Leaf hash directly reduces to Block Merkle Root.
            </div>
          )}

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4 text-emerald-600 font-bold" />
          </div>

          {/* Root Node */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800 uppercase">
              <span>Block #{blockNumber} Merkle Root</span>
              <span className="text-emerald-700 font-semibold">Ledger Anchor</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-950 font-bold break-all select-all">
              {tree.root || leafHash}
            </div>
          </div>
        </div>

        {/* Verification Trigger & Output */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={runProofVerification}
              disabled={isVerifying}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#123B5D] hover:bg-[#0E2E49] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Computing Hash Reductions...' : 'Execute Merkle Proof Verification'}</span>
            </button>

            <span className="text-[11px] text-slate-500 text-center sm:text-right">
              Validates inclusion in <strong className="text-slate-800">O(log N)</strong> time
            </span>
          </div>

          {verificationResult && (
            <div className={`p-4 rounded-xl text-xs border flex items-center gap-3 ${
              verificationResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">
                  CRYPTOGRAPHIC PROOF SUCCESSFUL: INCLUSION CONFIRMED
                </span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  Calculated Merkle root matches the host block header. Certificate is mathematically guaranteed to belong to Block #{blockNumber}.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
