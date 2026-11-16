# CertiChain — Blockchain-Based Academic Certificate Verification

A permissioned, privacy-preserving credential registry web application for tamper-evident academic certificate issuance and instant verification.

> **Core Value Proposition:** *"Trust academic credentials without trusting the document."*

---

## 🏛️ System Architecture

CertiChain is structured into **2 clear entities** designed for practical university deployment and academic viva presentation:

```
                            [ CertiChain System ]
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
  [ 🌐 Public Verifiers ]                            [ 🏛️ University Authority ]
  (Companies, Recruiters, Students)                   (Dean / Registrar of VIT Pune)
            │                                                   │
    • Zero Login Required                               • Single Login (/login)
    • Direct Verification on Landing Page (/)           • Overview Dashboard (/institution/dashboard)
    • PDF Drag-and-Drop SHA-256 Check (/verify)         • Issue Certificate (/institution/issue)
    • Instant Valid / Forgery / Revoked Result          • Issued Registry (/institution/certificates)
    • Print Official Verification Proof                 • Blockchain Ledger (/institution/blockchain)
```

---

## 🔐 Core Cryptographic & Blockchain Engine (`backend/blockchain/`)

All core blockchain concepts are cleanly implemented in Python for easy inspection, testing, and viva defense:

1. **Deterministic SHA-256 Hashing (`crypto.py`):**
   - Documents are hashed locally; raw student PDFs are never exposed or stored on-chain.
   - Any modification of a grade or name changes the hash completely due to the cryptographic avalanche effect.

2. **Asymmetric Digital Signatures — ECDSA P-256 (`crypto.py`):**
   - The university generates an elliptic-curve keypair (NIST P-256 / SECP256R1).
   - Certificates are signed with the University's private key (`sign_hash_with_private_key`).
   - Anyone can verify the signature with the public key (`verify_signature_with_public_key`), establishing authentic **Proof of Origin**.

3. **Binary Merkle Tree & Inclusion Proofs (`merkle.py`):**
   - Transactions inside every block are hashed pairwise into a single Merkle Root.
   - Generates and verifies cryptographic **Merkle Audit Paths** proving a certificate's inclusion in a block without downloading the entire chain.

4. **Proof of Authority (PoA) Consensus (`consensus.py`):**
   - 3 Authorized Validator Nodes: *Dean of Academic Affairs*, *Head of Examination Cell*, and *Academic Senate*.
   - Requires a 2/3 threshold quorum approval before any block is sealed onto the ledger.

5. **Append-Only Revocation Registry (`chain.py`):**
   - Revocation never deletes or overwrites historical blocks.
   - Appends an immutable `Certificate Revocation` transaction with reason and timestamp. The verification engine checks the latest state.

---

## 🚀 Clean Routes

| Route | Access | Purpose |
| :--- | :--- | :--- |
| `/` | **Public (No Login)** | Landing page with instant Certificate ID search and How It Works walkthrough. |
| `/verify` | **Public (No Login)** | Full-featured verification studio (PDF Drag-and-drop & Certificate ID lookup) with live cryptographic checks. |
| `/login` | **Public** | Institution administrator sign-in. |
| `/institution/dashboard` | **Institution Only** | Issuance overview, total degrees issued, and recent activity. |
| `/institution/issue` | **Institution Only** | Issue degree wizard: Student Name, Roll No, Degree, CGPA, SHA-256 computation, and on-chain block minting. |
| `/institution/certificates` | **Institution Only** | Searchable registry of all issued degrees, CSV export, and on-chain revocation modal. |
| `/institution/blockchain` | **Institution Only** | Visual sequential block explorer showing block heights, previousHash links, block hashes, and Merkle roots. |

---

## 🔑 Login Credentials

- **Institution Authority (Dean / Registrar):**
  - Email: `admin@certichain.demo`
  - Password: Any password (or click **Auto-Fill** on the login page)
- **Companies, HR Recruiters, Students:**
  - **No login needed!** Use the search bar on `/` or the dropzone on `/verify`.

---

## 💻 Running the Application

### 1. Python Backend (FastAPI Core)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```
API Documentation available at: **[http://localhost:5000/docs](http://localhost:5000/docs)**

### 2. React Client (Vite Dev Server)
```bash
cd client
npm install
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.
