import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BlockchainProvider } from './context/BlockchainContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';

// Institution Pages
import { DashboardPage } from './pages/DashboardPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { IssueCertificatePage } from './pages/IssueCertificatePage';
import { BlockchainExplorerPage } from './pages/BlockchainExplorerPage';

export function App() {
  return (
    <BlockchainProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Unauthenticated Routes (For Companies, Recruiters, Students, and Public) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<PublicVerifyPage />} />
          <Route path="/verify/:id" element={<PublicVerifyPage />} />
          
          {/* Single Login (Exclusively for University / Institution) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Institution Portal */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN', 'SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/institution/dashboard" element={<DashboardPage />} />
            <Route path="/institution/issue" element={<IssueCertificatePage />} />
            <Route path="/institution/certificates" element={<CertificatesPage />} />
            <Route path="/institution/blockchain" element={<BlockchainExplorerPage />} />
            <Route path="/institution/blockchain/:blockId" element={<BlockchainExplorerPage />} />

            {/* Aliases for clean backward-compatibility */}
            <Route path="/dashboard" element={<Navigate to="/institution/dashboard" replace />} />
            <Route path="/certificates" element={<Navigate to="/institution/certificates" replace />} />
            <Route path="/certificates/issue" element={<Navigate to="/institution/issue" replace />} />
            <Route path="/blockchain" element={<Navigate to="/institution/blockchain" replace />} />
            <Route path="/admin/*" element={<Navigate to="/institution/dashboard" replace />} />
          </Route>

          {/* Any other old or verifier routes redirect to home */}
          <Route path="/verifier/*" element={<Navigate to="/verify" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </BlockchainProvider>
  );
}

export default App;
