"""
CertiChain Proof of Authority (PoA) & Multi-Validator Consensus
---------------------------------------------------------------
Implements:
1. Multi-validator registry for the permissioned educational network.
2. Proposal approval cycle: proposals collect cryptographic validator signatures.
3. Threshold enforcement (e.g., 2 of 3 authorized signers required before committing a block).
"""

from typing import List, Dict, Any, Optional
import time
from .crypto import calculate_sha256


class ValidatorNode:
    def __init__(self, node_id: str, name: str, role: str, public_address: str):
        self.node_id = node_id
        self.name = name
        self.role = role
        self.public_address = public_address
        self.status = "ACTIVE"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nodeId": self.node_id,
            "name": self.name,
            "role": self.role,
            "publicAddress": self.public_address,
            "status": self.status,
        }


DEFAULT_VALIDATORS = [
    ValidatorNode(
        node_id="node-val-01",
        name="Dean of Academic Affairs (VIT Pune)",
        role="Primary Institutional Signer",
        public_address="0x8F2A91D6E7216A8C9c1E86E20738e4A81De95B24",
    ),
    ValidatorNode(
        node_id="node-val-02",
        name="Head of Examination & Evaluation Cell",
        role="Exam Authority Signer",
        public_address="0x3B9C4F72E1A80D5E6A7C2B1D4F9E0A2C5B8D1E3F",
    ),
    ValidatorNode(
        node_id="node-val-03",
        name="Academic Senate Compliance Node",
        role="Consortium Auditor",
        public_address="0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
    ),
]


class PoAConsensusEngine:
    def __init__(self, validators: Optional[List[ValidatorNode]] = None, required_approvals: int = 2):
        self.validators = validators or DEFAULT_VALIDATORS
        self.required_approvals = required_approvals

    def validate_proposer(self, signer_address: str) -> bool:
        """Checks if the transaction proposer is an authorized validator."""
        return any(v.public_address.lower() == signer_address.lower() for v in self.validators)

    def collect_approvals(self, block_proposal_hash: str) -> List[Dict[str, Any]]:
        """
        Simulates gathering consensus signatures from authorized validator nodes.
        In a 2/3 threshold network, node 1 and node 2 sign the block proposal.
        """
        approvals = []
        for validator in self.validators[:self.required_approvals]:
            sig_digest = calculate_sha256(block_proposal_hash + validator.public_address + "APPROVED")
            approvals.append({
                "validatorId": validator.node_id,
                "validatorName": validator.name,
                "publicAddress": validator.public_address,
                "approvedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "consensusSignature": f"poa_sig_{sig_digest[:32]}",
            })
        return approvals

    def is_threshold_met(self, approvals: List[Dict[str, Any]]) -> bool:
        """Verifies if the quorum requirement is fulfilled."""
        return len(approvals) >= self.required_approvals

    def get_validators_info(self) -> List[Dict[str, Any]]:
        return [v.to_dict() for v in self.validators]
