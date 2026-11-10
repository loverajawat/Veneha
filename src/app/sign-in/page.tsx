'use client';

import React, { Suspense } from 'react';
import AuthPortal from '@/components/auth/AuthPortal';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full h-[100dvh] bg-brand-navy" />}>
      <AuthPortal initialOpen={true} />
    </Suspense>
  );
}

