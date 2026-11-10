'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import TopNavigation from '@/components/TopNavigation';
import Footer from '@/components/Footer';
import GuestClaimModal from '@/components/auth/GuestClaimModal';

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Full-screen takeover routes:
  // 1. /sign-in is ALWAYS a full-screen takeover
  // 2. / is a full-screen takeover ONLY when unauthenticated (Splash screen)
  const isTakeover = 
    pathname === '/sign-in' || 
    (pathname === '/' && !isAuthenticated && !isLoading);

  if (isTakeover) {
    return (
      <>
        {children}
        <GuestClaimModal />
      </>
    );
  }

  return (
    <>
      <TopNavigation />
      <main className="flex-1 flex flex-col min-w-0 bg-canvas">
        {children}
      </main>
      <Footer />
      <GuestClaimModal />
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellInner>{children}</ShellInner>
    </AuthProvider>
  );
}

