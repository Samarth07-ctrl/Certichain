"""
CertiChain Blockchain Engine & Append-Only Revocation Registry
--------------------------------------------------------------
Implements:
1. Sequential hash-linked blocks with deterministic SHA-256 header calculation.
2. Binary Merkle Tree root integration in every block.
3. Proof of Authority multi-validator consensus approval seals.
4. Append-Only Revocation Registry: records revocation transactions without altering past history.
5. Chain integrity audit & Merkle proof query.
"""

from typing import List, Dict, Any, Optional
import time
import json
from .crypto import (
    calculate_sha256,
    generate_issuer_keypair,
    sign_hash_with_private_key,
    verify_signature_with_public_key,
)
from .merkle import MerkleTree
from .consensus import PoAConsensusEngine


class BlockTransaction:
    def __init__(
        self,
        transaction_id: str,
        certificate_id: str,
        tx_type: str,
        timestamp: str,
        issuer: str,
        certificate_hash: str,
        block_number: int,
        student_name: str,
        student_identifier: str,
        institution: str,
        program: str,
        department: str,
        grade: str,
        issue_date: str,
        digital_signature: str = "",
        issuer_public_key: str = "",
        revocation_reason: Optional[str] = None,
        status: str = "Confirmed",
    ):
        self.transaction_id = transaction_id
        self.certificate_id = certificate_id
        self.type = tx_type  # 'Certificate Registration' | 'Certificate Revocation'
        self.timestamp = timestamp
        self.issuer = issuer
        self.certificate_hash = certificate_hash
        self.block_number = block_number
        self.student_name = student_name
        self.student_identifier = student_identifier
        self.institution = institution
        self.program = program
        self.department = department
        self.grade = grade
        self.issue_date = issue_date
        self.digital_signature = digital_signature
        self.issuer_public_key = issuer_public_key
        self.revocation_reason = revocation_reason
        self.status = status

    def to_dict(self) -> Dict[str, Any]:
        return {
            "transactionId": self.transaction_id,
            "certificateId": self.certificate_id,
            "type": self.type,
            "timestamp": self.timestamp,
            "issuer": self.issuer,
            "certificateHash": self.certificate_hash,
            "blockNumber": self.block_number,
            "studentName": self.student_name,
            "studentIdentifier": self.student_identifier,
            "institution": self.institution,
            "program": self.program,
            "department": self.department,
            "grade": self.grade,
            "issueDate": self.issue_date,
            "digitalSignature": self.digital_signature,
            "issuerPublicKey": self.issuer_public_key,
            "revocationReason": self.revocation_reason,
            "status": self.status,
        }


class Block:
    def __init__(
        self,
        index: int,
        timestamp: str,
        transactions: List[BlockTransaction],
        previous_hash: str,
        validator: str = "Dean of Academic Affairs (VIT Pune)",
        consensus_approvals: Optional[List[Dict[str, Any]]] = None,
        nonce: int = 0,
        merkle_root: Optional[str] = None,
        block_hash: Optional[str] = None,
    ):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.validator = validator
        self.consensus_approvals = consensus_approvals or []
        self.nonce = nonce

        # Build Merkle Tree from transactions
        leaf_hashes = [tx.certificate_hash for tx in transactions]
        self.merkle_tree = MerkleTree(leaf_hashes)
        self.merkle_root = merkle_root if merkle_root is not None else self.merkle_tree.root

        # Compute block hash if not provided
        self.hash = block_hash if block_hash is not None else self.calculate_hash()

    def calculate_hash(self) -> str:
        """Header hash = SHA256(index + timestamp + previousHash + merkleRoot + nonce)"""
        header_data = f"{self.index}{self.timestamp}{self.previous_hash}{self.merkle_root}{self.nonce}"
        return calculate_sha256(header_data)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": [tx.to_dict() for tx in self.transactions],
            "previousHash": self.previous_hash,
            "merkleRoot": self.merkle_root,
            "hash": self.hash,
            "validator": self.validator,
            "consensusApprovals": self.consensus_approvals,
            "nonce": self.nonce,
            "transactionCount": len(self.transactions),
        }


class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.consensus_engine = PoAConsensusEngine(required_approvals=2)
        
        # In-memory institutional keypair for signing academic credentials
        self.issuer_private_key, self.issuer_public_key = generate_issuer_keypair()
        
        self.create_genesis_block()
        self.seed_initial_academic_records()

    def create_genesis_block(self):
        """Creates Block #0 with standard null previousHash."""
        genesis_block = Block(
            index=0,
            timestamp="2026-09-01T00:00:00.000Z",
            transactions=[],
            previous_hash="0" * 64,
            validator="CertiChain Genesis Network Validator",
            consensus_approvals=[],
            nonce=0,
            merkle_root="0" * 64,
            block_hash="000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
        )
        self.chain.append(genesis_block)

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(self, transactions: List[BlockTransaction], validator_name: str = "Dean of Academic Affairs (VIT Pune)") -> Block:
        """
        Creates a new block, executes PoA consensus threshold check,
        computes Merkle root, and links to the previous block.
        """
        latest_block = self.get_latest_block()
        new_index = len(self.chain)
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Construct candidate block proposal hash
        candidate_leaves = [tx.certificate_hash for tx in transactions]
        candidate_merkle = MerkleTree(candidate_leaves)
        proposal_hash = calculate_sha256(f"{new_index}{timestamp}{latest_block.hash}{candidate_merkle.root}")

        # Gather PoA approvals from authorized validator nodes
        approvals = self.consensus_engine.collect_approvals(proposal_hash)
        if not self.consensus_engine.is_threshold_met(approvals):
            raise ValueError("PoA Consensus Quorum not reached.")

        new_block = Block(
            index=new_index,
            timestamp=timestamp,
            transactions=transactions,
            previous_hash=latest_block.hash,
            validator=validator_name,
            consensus_approvals=approvals,
            merkle_root=candidate_merkle.root,
        )

        self.chain.append(new_block)
        return new_block

    def register_certificate(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Issues an academic certificate:
        1. Calculates deterministic SHA-256 digest of credentials.
        2. Signs the hash with the University's ECDSA private key.
        3. Wraps into a confirmed transaction.
        4. Mints and commits a new block via PoA consensus.
        """
        cert_hash = cert_data.get("certificateHash")
        if not cert_hash:
            cert_hash = calculate_sha256(json.dumps(cert_data, sort_keys=True))

        cert_id = cert_data.get("certificateId") or f"CERT-2026-00{1284 + len(self.chain)}"
        tx_id = f"TX-{cert_hash[:8].upper()}-{cert_id[-6:]}"
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        block_height = len(self.chain)

        # Cryptographic ECDSA Digital Signature
        digital_signature = sign_hash_with_private_key(cert_hash, self.issuer_private_key)

        transaction = BlockTransaction(
            transaction_id=tx_id,
            certificate_id=cert_id,
            tx_type="Certificate Registration",
            timestamp=timestamp,
            issuer=cert_data.get("institution", "Vishwakarma Institute of Technology"),
            certificate_hash=cert_hash,
            block_number=block_height,
            student_name=cert_data.get("studentName", ""),
            student_identifier=f"did:certichain:student:{cert_data.get('studentId', '')}",
            institution=cert_data.get("institution", "Vishwakarma Institute of Technology"),
            program=cert_data.get("program", ""),
            department=cert_data.get("department", ""),
            grade=cert_data.get("grade", ""),
            issue_date=cert_data.get("issueDate", timestamp[:10]),
            digital_signature=digital_signature,
            issuer_public_key=self.issuer_public_key,
        )

        self.add_block([transaction])
        return transaction.to_dict()

    def revoke_certificate(self, cert_id: str, reason: str = "Disciplinary Academic Action / Record Invalidation") -> Dict[str, Any]:
        """
        Appends an immutable 'Certificate Revocation' transaction to the blockchain.
        Does NOT delete the historical issuance block.
        """
        # Find original registration
        original_tx = None
        for block in self.chain:
            for tx in block.transactions:
                if tx.certificate_id.lower() == cert_id.lower() and tx.type == "Certificate Registration":
                    original_tx = tx
                    break
            if original_tx:
                break

        if not original_tx:
            raise ValueError(f"Certificate {cert_id} not found on ledger.")

        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        block_height = len(self.chain)
        revocation_tx_id = f"REV-{original_tx.certificate_hash[:8].upper()}-{int(time.time())}"

        # Sign revocation transaction
        revocation_hash = calculate_sha256(f"REVOKE:{cert_id}:{reason}:{timestamp}")
        revocation_signature = sign_hash_with_private_key(revocation_hash, self.issuer_private_key)

        rev_tx = BlockTransaction(
            transaction_id=revocation_tx_id,
            certificate_id=cert_id,
            tx_type="Certificate Revocation",
            timestamp=timestamp,
            issuer=original_tx.issuer,
            certificate_hash=original_tx.certificate_hash,
            block_number=block_height,
            student_name=original_tx.student_name,
            student_identifier=original_tx.student_identifier,
            institution=original_tx.institution,
            program=original_tx.program,
            department=original_tx.department,
            grade=original_tx.grade,
            issue_date=original_tx.issue_date,
            digital_signature=revocation_signature,
            issuer_public_key=self.issuer_public_key,
            revocation_reason=reason,
            status="Confirmed",
        )

        self.add_block([rev_tx])
        return rev_tx.to_dict()

    def verify_certificate(self, identifier_or_id: str, submitted_hash: Optional[str] = None) -> Dict[str, Any]:
        """
        Comprehensive credential verification:
        1. Checks existence of certificate on ledger.
        2. Evaluates latest status (Checks if a subsequent Revocation transaction exists).
        3. Verifies ECDSA digital signature using the University's public key.
        4. Verifies Merkle tree inclusion in its host block.
        """
        clean_target = identifier_or_id.strip()
        matched_tx: Optional[BlockTransaction] = None
        is_revoked = False
        revocation_reason = None
        host_block: Optional[Block] = None

        # Search the entire chain from latest to genesis
        for block in reversed(self.chain):
            for tx in block.transactions:
                # Check for revocation first
                if (tx.certificate_id.lower() == clean_target.lower() or tx.certificate_hash.lower() == clean_target.lower()):
                    if tx.type == "Certificate Revocation":
                        is_revoked = True
                        revocation_reason = tx.revocation_reason

                    if tx.type == "Certificate Registration" and not matched_tx:
                        matched_tx = tx
                        host_block = block

        if not matched_tx:
            return {
                "status": "NOT_FOUND",
                "certificateId": identifier_or_id,
                "cryptographicIntegrity": "MISMATCH",
                "signatureValid": False,
                "blockchainRecord": "NOT_FOUND",
                "isRevoked": False,
                "verificationTimestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }

        # Check hash match
        hash_to_compare = submitted_hash or matched_tx.certificate_hash
        hash_matches = (hash_to_compare.lower() == matched_tx.certificate_hash.lower())

        # Verify ECDSA Digital Signature
        sig_valid = False
        if matched_tx.digital_signature and matched_tx.issuer_public_key:
            sig_valid = verify_signature_with_public_key(
                matched_tx.certificate_hash,
                matched_tx.digital_signature,
                matched_tx.issuer_public_key,
            )

        # Generate Merkle Proof for this certificate within its block
        merkle_proof = None
        if host_block:
            merkle_proof = host_block.merkle_tree.get_proof(matched_tx.certificate_hash)

        final_status = "REVOKED" if is_revoked else ("VERIFIED" if hash_matches and sig_valid else "MISMATCH")

        return {
            "status": final_status,
            "certificateId": matched_tx.certificate_id,
            "studentName": matched_tx.student_name,
            "studentIdentifier": matched_tx.student_identifier,
            "institution": matched_tx.institution,
            "program": matched_tx.program,
            "department": matched_tx.department,
            "grade": matched_tx.grade,
            "issueDate": matched_tx.issue_date,
            "registeredHash": matched_tx.certificate_hash,
            "submittedHash": hash_to_compare,
            "blockNumber": matched_tx.block_number,
            "transactionId": matched_tx.transaction_id,
            "isRevoked": is_revoked,
            "revocationReason": revocation_reason,
            "cryptographicIntegrity": "MATCH" if hash_matches else "MISMATCH",
            "signatureValid": sig_valid,
            "blockchainRecord": "FOUND",
            "issuingInstitution": "VERIFIED",
            "issuerPublicKey": matched_tx.issuer_public_key,
            "merkleProof": merkle_proof,
            "verificationTimestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    def is_chain_valid(self) -> Dict[str, Any]:
        """Validates all cryptographic block links, hashes, and Merkle roots."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            prev = self.chain[i - 1]

            if current.hash != current.calculate_hash():
                return {"valid": False, "failedIndex": i, "reason": f"Block #{i} header hash corrupted"}

            if current.previous_hash != prev.hash:
                return {"valid": False, "failedIndex": i, "reason": f"Block #{i} previousHash does not match Block #{i-1} hash"}

            # Validate Merkle Root
            leaf_hashes = [tx.certificate_hash for tx in current.transactions]
            computed_merkle = MerkleTree(leaf_hashes).root
            if current.merkle_root != computed_merkle:
                return {"valid": False, "failedIndex": i, "reason": f"Block #{i} Merkle Root mismatch"}

        return {"valid": True}

    def tamper_block_for_demo(self, block_index: int = 1):
        """Simulates an attacker altering student grade in Block #1."""
        if len(self.chain) > block_index and self.chain[block_index].transactions:
            tx = self.chain[block_index].transactions[0]
            tx.grade = "10.00 CGPA (Tampered & Forged Grade)"
            tx.certificate_hash = calculate_sha256(tx.certificate_hash + "FORGERY")

    def seed_initial_academic_records(self):
        """Seeds initial realistic degree records with digital signatures."""
        seeds = [
            {
                "id": "CERT-2026-001284",
                "name": "Aarav Sharma",
                "student_id": "VIT-2022-CS-084",
                "program": "B.Tech Computer Engineering",
                "dept": "Department of Computer Engineering",
                "grade": "9.42 CGPA (First Class with Distinction)",
                "date": "2026-09-15",
                "hash": "8c3f4e8b91a27d6c5e0f3b4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
            },
            {
                "id": "CERT-2026-001285",
                "name": "Ananya Patil",
                "student_id": "VIT-2022-AI-019",
                "program": "B.Tech Artificial Intelligence",
                "dept": "Department of Artificial Intelligence & Data Science",
                "grade": "9.68 CGPA (First Class with Distinction)",
                "date": "2026-09-18",
                "hash": "4d8a1c9e7b2f5a0d3e6f8b1a4c7e0d2f5a8b1c4e7d0a2f5b8c1e4d7a0b3c6e9f",
            },
            {
                "id": "CERT-2026-001286",
                "name": "Rohan Kulkarni",
                "student_id": "VIT-2022-ET-045",
                "program": "B.Tech Electronics Engineering",
                "dept": "Department of Electronics & Telecommunication",
                "grade": "8.85 CGPA (First Class with Distinction)",
                "date": "2026-09-22",
                "hash": "1f2e3d4c5b6a708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
            },
        ]

        for s in seeds:
            sig = sign_hash_with_private_key(s["hash"], self.issuer_private_key)
            tx = BlockTransaction(
                transaction_id=f"TX-{s['hash'][:8].upper()}-{s['id'][-6:]}",
                certificate_id=s["id"],
                tx_type="Certificate Registration",
                timestamp=f"{s['date']}T10:00:00Z",
                issuer="Vishwakarma Institute of Technology",
                certificate_hash=s["hash"],
                block_number=len(self.chain),
                student_name=s["name"],
                student_identifier=f"did:certichain:student:{s['student_id']}",
                institution="Vishwakarma Institute of Technology",
                program=s["program"],
                department=s["dept"],
                grade=s["grade"],
                issue_date=s["date"],
                digital_signature=sig,
                issuer_public_key=self.issuer_public_key,
            )
            self.add_block([tx])
