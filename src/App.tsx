import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';

import LoginPage from './features/auth/pages/LoginPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import HomePage from './features/home/pages/HomePage';
import UserListPage from './features/user/pages/UserListPage';
import UserApprovalPage from './features/user/pages/UserApprovalPage';
import MerchantEnginePage from './features/merchant_engine/pages/MerchantEnginePage';
import CreatePromoPage from './features/promo/pages/CreatePromo';
import NotFoundPage from './features/core/pages/NotFoundPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import SplashScreen from './components/Common/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // durasi splash
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading halaman...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><MainLayout><UserListPage /></MainLayout></ProtectedRoute>} />
            <Route path="/user-approval" element={<ProtectedRoute><MainLayout><UserApprovalPage /></MainLayout></ProtectedRoute>} />
            <Route path="/promo/create" element={<ProtectedRoute><MainLayout><CreatePromoPage /></MainLayout></ProtectedRoute>} />
            <Route path="/merchant-engine" element={<ProtectedRoute><MainLayout><MerchantEnginePage /></MainLayout></ProtectedRoute>} />

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
