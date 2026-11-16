"""
CertiChain Cryptographic Utilities
----------------------------------
Provides:
1. Deterministic SHA-256 hashing for documents, certificates, and block headers.
2. Asymmetric Cryptography (ECDSA with NIST P-256 curve / SECP256R1) for digital signatures.
3. Issuer Keypair generation, signing, and public key verification.
"""

import hashlib
import json
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization


def calculate_sha256(data: bytes | str) -> str:
    """Computes deterministic 256-bit SHA-256 digest in hex."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def canonical_certificate_hash(cert_data: Dict[str, Any]) -> str:
    """
    Computes canonical SHA-256 digest for academic metadata.
    Sorted keys and stripped strings guarantee deterministic reproducibility.
    """
    normalized = {
        "name": str(cert_data.get("studentName", "")).strip(),
        "id": str(cert_data.get("studentId", "")).strip(),
        "inst": str(cert_data.get("institution", "")).strip(),
        "prog": str(cert_data.get("program", "")).strip(),
        "dept": str(cert_data.get("department", "")).strip(),
        "grade": str(cert_data.get("grade", "")).strip(),
        "date": str(cert_data.get("issueDate", "")).strip(),
    }
    canonical_json = json.dumps(normalized, sort_keys=True, separators=(",", ":"))
    return calculate_sha256(canonical_json)


def generate_issuer_keypair() -> Tuple[str, str]:
    """
    Generates an Elliptic Curve keypair (ECDSA SECP256R1 / P-256).
    Returns (private_key_pem_str, public_key_pem_str).
    """
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    return priv_pem, pub_pem


def sign_hash_with_private_key(hash_hex: str, private_key_pem: str) -> str:
    """
    Signs a 32-byte hash using the University Issuer's private key.
    Returns the signature in hexadecimal format.
    """
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode("utf-8"),
        password=None,
    )
    # Sign the raw hash bytes using ECDSA with SHA-256
    hash_bytes = bytes.fromhex(hash_hex)
    signature = private_key.sign(
        hash_bytes,
        ec.ECDSA(hashes.SHA256()),
    )
    return signature.hex()


def verify_signature_with_public_key(
    hash_hex: str, signature_hex: str, public_key_pem: str
) -> bool:
    """
    Cryptographically verifies whether `signature_hex` was produced for `hash_hex`
    by the holder of `public_key_pem`. Returns True if valid, False otherwise.
    """
    try:
        public_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
        hash_bytes = bytes.fromhex(hash_hex)
        sig_bytes = bytes.fromhex(signature_hex)
        public_key.verify(
            sig_bytes,
            hash_bytes,
            ec.ECDSA(hashes.SHA256()),
        )
        return True
    except Exception:
        return False
