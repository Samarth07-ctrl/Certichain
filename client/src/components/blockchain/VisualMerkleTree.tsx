import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  HelpCircle
} from 'lucide-react';

interface LeafLabel {
  title: string;
  subtitle?: string;
  hash: string;
}

interface VisualMerkleTreeProps {
  levels: string[][]; // levels[0] = leaves, levels[levels.length - 1] = [root]
  root: string;
  leafLabels?: LeafLabel[];
  activeLeafHash?: string;
  onNodeClick?: (hash: string, level: number, index: number) => void;
}

export const VisualMerkleTree: React.FC<VisualMerkleTreeProps> = ({
  levels,
  root,
  leafLabels = [],
  activeLeafHash,
  onNodeClick
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    hash: string;
    level: number;
    index: number;
    label?: string;
    leftChild?: string;
    rightChild?: string;
  } | null>(null);

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  if (!levels || levels.length === 0 || !levels[0] || levels[0].length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        No Merkle Tree levels available to visualize.
      </div>
    );
  }

  // Display levels from Root (top) down to Leaves (bottom)
  const reversedLevels = [...levels].reverse();
  const totalLayers = levels.length;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">
              Binary Merkle Tree Interactive Architecture
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {levels[0].length} Leaves · {totalLayers} Tree Levels
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pairwise deterministic SHA-256 reductions. Every parent is the cryptographic digest of its two child nodes.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Root Anchored in Header</span>
        </div>
      </div>

      {/* Interactive Tree Graph Container */}
      <div className="overflow-x-auto py-4">
        <div className="min-w-[650px] flex flex-col items-center space-y-8 relative">
          {reversedLevels.map((levelHashes, revIdx) => {
            const actualLevel = totalLayers - 1 - revIdx;
            const isRootLevel = actualLevel === totalLayers - 1;
            const isLeafLevel = actualLevel === 0;

            let layerTitle = `Layer ${actualLevel}: Intermediate Hashes`;
            if (isRootLevel) layerTitle = `Layer ${actualLevel}: Merkle Root (Anchor)`;
            if (isLeafLevel) layerTitle = `Layer 0: Candidate Leaves (Certificate Hashes)`;

            return (
              <div key={actualLevel} className="w-full flex flex-col items-center space-y-2 relative">
                {/* Layer Label */}
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
                  {layerTitle}
                </div>

                {/* Nodes Row */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap w-full">
                  {levelHashes.map((hash, nodeIdx) => {
                    const isSelected = selectedNode?.hash === hash;
                    const isActiveTarget = activeLeafHash && activeLeafHash.toLowerCase() === hash.toLowerCase();

                    // Find label if leaf
                    let nodeLabel = '';
                    let nodeSub = '';
                    if (isLeafLevel && leafLabels[nodeIdx]) {
                      nodeLabel = leafLabels[nodeIdx].title;
                      nodeSub = leafLabels[nodeIdx].subtitle || '';
                    }

                    // Determine child nodes for parents
                    let leftChild = '';
                    let rightChild = '';
                    if (!isLeafLevel && levels[actualLevel - 1]) {
                      const childLevel = levels[actualLevel - 1];
                      leftChild = childLevel[nodeIdx * 2] || '';
                      rightChild = childLevel[nodeIdx * 2 + 1] || leftChild;
                    }

                    return (
                      <div
                        key={`${actualLevel}-${nodeIdx}`}
                        onClick={() => {
                          const info = {
                            hash,
                            level: actualLevel,
                            index: nodeIdx,
                            label: nodeLabel || (isRootLevel ? 'Block Merkle Root' : `Node [${actualLevel}, ${nodeIdx}]`),
                            leftChild,
                            rightChild
                          };
                          setSelectedNode(info);
                          if (onNodeClick) onNodeClick(hash, actualLevel, nodeIdx);
                        }}
                        className={`cursor-pointer transition-all duration-200 rounded-xl p-3 border text-center relative group min-w-[140px] max-w-[220px] ${
                          isRootLevel
                            ? 'bg-emerald-950/40 border-emerald-500/60 hover:border-emerald-400 shadow-lg shadow-emerald-900/20'
                            : isLeafLevel
                            ? isActiveTarget
                              ? 'bg-blue-900/50 border-blue-400 ring-2 ring-blue-500/50'
                              : 'bg-slate-800/80 border-slate-700 hover:border-blue-400'
                            : 'bg-slate-800/50 border-slate-700/80 hover:border-purple-400'
                        } ${isSelected ? 'ring-2 ring-emerald-400 scale-105' : ''}`}
                      >
                        {/* Node Badge */}
                        <div className="text-[10px] font-bold flex items-center justify-between pb-1 border-b border-slate-700/40 mb-1.5">
                          <span className={isRootLevel ? 'text-emerald-400' : isLeafLevel ? 'text-blue-400' : 'text-purple-300'}>
                            {isRootLevel ? '👑 ROOT' : isLeafLevel ? `LEAF #${nodeIdx + 1}` : `NODE ${nodeIdx}`}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            L{actualLevel}:N{nodeIdx}
                          </span>
                        </div>

                        {/* Student Name / Title if present */}
                        {nodeLabel && (
                          <div className="font-bold text-xs text-white truncate max-w-[190px]" title={nodeLabel}>
                            {nodeLabel}
                          </div>
                        )}
                        {nodeSub && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[190px]">
                            {nodeSub}
                          </div>
                        )}

                        {/* Hash Display */}
                        <div className="font-mono text-[11px] text-slate-300 mt-1 break-all bg-black/40 px-2 py-1 rounded border border-slate-800">
                          {hash.slice(0, 8)}...{hash.slice(-6)}
                        </div>

                        <div className="text-[9px] text-slate-500 mt-1 flex items-center justify-center gap-1 group-hover:text-blue-300 transition-colors">
                          <span>Inspect Node</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting Visual Lines down to next layer (if not leaf) */}
                {!isLeafLevel && (
                  <div className="w-full flex justify-center py-1">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-mono">
                      <span className="text-slate-500">▲</span>
                      <span>SHA-256(Left || Right)</span>
                      <span className="text-slate-500">▲</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Cryptographic Inspection Drawer */}
      {selectedNode && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Code2 className="w-4 h-4" />
              <span>Node Cryptographic Inspector ({selectedNode.label})</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-slate-300 text-xs px-2 py-0.5 rounded hover:bg-slate-800"
            >
              ✕ Close
            </button>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block mb-1">Full 256-Bit SHA-256 Hash:</span>
            <div className="p-2.5 bg-black/60 rounded-lg border border-slate-800 text-emerald-300 text-[11px] break-all flex items-center justify-between gap-2 select-all">
              <span>{selectedNode.hash}</span>
              <button
                type="button"
                onClick={() => handleCopy(selectedNode.hash)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                title="Copy full hash"
              >
                {copiedHash === selectedNode.hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* If parent node, show children derivation formula */}
          {selectedNode.leftChild && (
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[10px] text-blue-400 uppercase font-bold block">
                Mathematical Reduction Formula:
              </span>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div><span className="text-slate-500">Left Child:  </span>{selectedNode.leftChild.slice(0, 16)}...{selectedNode.leftChild.slice(-8)}</div>
                <div><span className="text-slate-500">Right Child: </span>{selectedNode.rightChild?.slice(0, 16)}...{selectedNode.rightChild?.slice(-8)}</div>
                <div className="pt-1 border-t border-slate-800 text-emerald-400 text-[10px]">
                  Formula: Parent Hash = SHA-256( Left_Child + Right_Child )
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
