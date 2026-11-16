"""
CertiChain Enterprise Backend API (FastAPI)
-------------------------------------------
Connects the Python Permissioned Blockchain Engine to the React Frontend.
Runs on http://localhost:5000 (proxied via Vite on /api).
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
import time

from blockchain.chain import Blockchain
from blockchain.crypto import calculate_sha256

app = FastAPI(
    title="CertiChain Enterprise Blockchain Engine",
    description="Permissioned Blockchain Core for Academic Credential Verification",
    version="2.0.0",
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate the Blockchain instance
blockchain_engine = Blockchain()

# In-memory verifier logs for tracking candidate screening history
verifier_screening_history = [
    {
        "id": "chk-001",
        "verifierOrg": "Tata Consultancy Services (TCS HR)",
        "verifierUser": "Pooja Verma (Lead Talent Screener)",
        "candidateName": "Aarav Sharma",
        "certificateId": "CERT-2026-001284",
        "program": "B.Tech Computer Engineering",
        "status": "AUTHENTIC",
        "timestamp": "2026-11-14T09:24:10Z",
        "blockNumber": 1,
        "txId": "TX-8C3F4E8B-001284",
    },
    {
        "id": "chk-002",
        "verifierOrg": "Amazon Talent Acquisition",
        "verifierUser": "Vikram Seth (Senior Background Screener)",
        "candidateName": "Ananya Patil",
        "certificateId": "CERT-2026-001285",
        "program": "B.Tech Artificial Intelligence",
        "status": "AUTHENTIC",
        "timestamp": "2026-11-15T14:12:45Z",
        "blockNumber": 2,
        "txId": "TX-4D8A1C9E-001285",
    },
]

audit_system_logs = [
    {
        "id": "log-001",
        "timestamp": "2026-11-16T10:00:00Z",
        "user": "admin@certichain.demo",
        "action": "Institutional Node Initialization",
        "resource": "PoA Consortium Cluster (3 Validators)",
        "ipSession": "192.168.1.100 (Pune Regional Subnet)",
        "status": "Success",
    }
]


@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "engine": "Python 3.12 + Cryptography ECDSA P-256",
        "network": "CertiChain Permissioned Educational Network",
        "activeValidators": 3,
        "blockHeight": len(blockchain_engine.chain),
    }


@app.get("/api/chain")
def get_blockchain():
    """Returns the complete sequential chain with Merkle roots and PoA approvals."""
    return {
        "length": len(blockchain_engine.chain),
        "chain": [block.to_dict() for block in blockchain_engine.chain],
        "isValid": blockchain_engine.is_chain_valid(),
    }


@app.get("/api/chain/validate")
def validate_chain():
    """Runs a deep cryptographic audit of every block and Merkle tree."""
    return blockchain_engine.is_chain_valid()


@app.get("/api/certificates")
def get_all_certificates():
    """Extracts all certificates from the blockchain ledger."""
    certs = []
    # Reverse to show newest first
    for block in reversed(blockchain_engine.chain):
        for tx in block.transactions:
            if tx.type == "Certificate Registration":
                # Check if later revoked
                is_revoked = any(
                    other_tx.certificate_id.lower() == tx.certificate_id.lower() and other_tx.type == "Certificate Revocation"
                    for b in blockchain_engine.chain
                    for other_tx in b.transactions
                )
                certs.append({
                    "id": tx.certificate_id,
                    "certificateId": tx.certificate_id,
                    "studentName": tx.student_name,
                    "studentId": tx.student_identifier.replace("did:certichain:student:", ""),
                    "institution": tx.institution,
                    "program": tx.program,
                    "department": tx.department,
                    "grade": tx.grade,
                    "issueDate": tx.issue_date,
                    "certificateHash": tx.certificate_hash,
                    "blockNumber": tx.block_number,
                    "transactionId": tx.transaction_id,
                    "digitalSignature": tx.digital_signature,
                    "issuer": tx.issuer,
                    "status": "Revoked" if is_revoked else "Verified",
                    "createdAt": tx.timestamp,
                })
    return certs


@app.post("/api/certificates/issue")
def issue_certificate(payload: Dict[str, Any] = Body(...)):
    """Admin-only endpoint: signs with ECDSA private key and mines a new PoA block."""
    try:
        tx = blockchain_engine.register_certificate(payload)
        audit_system_logs.append({
            "id": f"log-{int(time.time()*1000)}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "user": "admin@certichain.demo",
            "action": "Certificate Issued",
            "resource": f"ID {tx['certificateId']} · Block #{tx['blockNumber']}",
            "ipSession": "192.168.1.100 (Authorized Registrar Terminal)",
            "status": "Success",
        })
        return {"success": True, "transaction": tx}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/certificates/revoke")
def revoke_certificate(payload: Dict[str, Any] = Body(...)):
    """Admin-only endpoint: appends a revocation transaction to the ledger."""
    cert_id = payload.get("certificateId")
    reason = payload.get("reason", "Administrative Revocation")
    if not cert_id:
        raise HTTPException(status_code=400, detail="Missing certificateId")

    try:
        rev_tx = blockchain_engine.revoke_certificate(cert_id, reason)
        audit_system_logs.append({
            "id": f"log-{int(time.time()*1000)}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "user": "admin@certichain.demo",
            "action": "Certificate Revoked",
            "resource": f"ID {cert_id} · Revocation Tx {rev_tx['transactionId']}",
            "ipSession": "192.168.1.100 (Dean / Registrar)",
            "status": "Warning",
        })
        return {"success": True, "revocationTransaction": rev_tx}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/certificates/verify")
def verify_certificate(payload: Dict[str, Any] = Body(...)):
    """Public & Verifier endpoint: evaluates integrity, signature, revocation, and Merkle inclusion."""
    identifier = payload.get("identifier") or payload.get("certificateId")
    submitted_hash = payload.get("submittedHash")

    if not identifier and not submitted_hash:
        raise HTTPException(status_code=400, detail="Must provide certificateId or submittedHash")

    result = blockchain_engine.verify_certificate(
        identifier_or_id=identifier or submitted_hash,
        submitted_hash=submitted_hash,
    )

    # If an authenticated verifier performed the check, record in screening history
    verifier_org = payload.get("verifierOrg")
    if verifier_org and result["status"] != "NOT_FOUND":
        status_map = {
            "VERIFIED": "AUTHENTIC",
            "REVOKED": "REVOKED_BY_INSTITUTION",
            "MISMATCH": "FORGERY_DETECTED",
        }
        verifier_screening_history.insert(0, {
            "id": f"chk-{int(time.time()*1000)}",
            "verifierOrg": verifier_org,
            "verifierUser": payload.get("verifierUser", "HR Screener"),
            "candidateName": result.get("studentName", "Unknown Candidate"),
            "certificateId": result["certificateId"],
            "program": result.get("program", "Academic Credential"),
            "status": status_map.get(result["status"], result["status"]),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "blockNumber": result.get("blockNumber", 0),
            "txId": result.get("transactionId", "N/A"),
        })

    return result


@app.get("/api/verifier/history")
def get_verifier_history():
    """Returns candidate screening records for authenticated verifiers."""
    return verifier_screening_history


@app.get("/api/validators")
def get_validators():
    """Returns the list of authorized PoA validator nodes."""
    return blockchain_engine.consensus_engine.get_validators_info()


@app.get("/api/audit-logs")
def get_audit_logs():
    return audit_system_logs


@app.get("/api/issuer-key")
def get_issuer_public_key():
    return {
        "institution": "Vishwakarma Institute of Technology (VIT Pune)",
        "curve": "NIST P-256 / SECP256R1",
        "algorithm": "ECDSA with SHA-256",
        "publicKeyPem": blockchain_engine.issuer_public_key,
    }


@app.post("/api/demo/tamper")
def tamper_demo(payload: Dict[str, Any] = Body(default={})):
    """Simulates an attacker altering student grade in Block #1."""
    block_index = payload.get("blockIndex", 1)
    blockchain_engine.tamper_block_for_demo(block_index)
    audit_system_logs.append({
        "id": f"log-{int(time.time()*1000)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "user": "SYSTEM_SECURITY_AGENT",
        "action": "Tamper Detection Event",
        "resource": f"Unauthorized mutation detected in Block #{block_index}",
        "ipSession": "EXTERNAL_IP_INTERCEPT",
        "status": "Failed",
    })
    return {"message": f"Block #{block_index} data has been corrupted for demonstration."}


@app.post("/api/demo/restore")
def restore_demo():
    """Restores clean state."""
    global blockchain_engine
    blockchain_engine = Blockchain()
    return {"message": "Blockchain state restored to clean canonical state."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
