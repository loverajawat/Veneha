'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, AuthOwner } from '@/lib/auth/types';
import { getGuest, saveGuest, clearGuest, getAttempts } from '@/lib/guestStorage';

interface AuthContextType {
  user: UserProfile | null;
  guest: { id: string; name: string } | null;
  owner: AuthOwner;
  isAuthenticated: boolean; // True if signed in with an account OR in active guest mode
  isUser: boolean;
  isGuest: boolean;
  isLoading: boolean;
  allowGuestMode: boolean;
  // Actions
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, pass: string, ageConfirmed18Plus: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: (name?: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  // Guest claim dialog state
  claimDialogOpen: boolean;
  claimAttemptsCount: number;
  handleClaimHistory: () => Promise<void>;
  dismissClaimDialog: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [guest, setGuest] = useState<{ id: string; name: string } | null>(null);
  const [allowGuestMode, setAllowGuestMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Claim dialog state
  const [claimDialogOpen, setClaimDialogOpen] = useState<boolean>(false);
  const [claimAttemptsCount, setClaimAttemptsCount] = useState<number>(0);
  const [claimGuestId, setClaimGuestId] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAllowGuestMode(data.allowGuestMode ?? true);
        if (data.owner?.type === 'user') {
          setUser(data.owner.user);
          setGuest(null);
        } else if (data.owner?.type === 'guest') {
          setUser(null);
          const localGuest = getGuest();
          setGuest({
            id: data.owner.guestId,
            name: localGuest?.name || 'Cadet',
          });
        } else {
          // Check if there is a local guest in localStorage
          const localGuest = getGuest();
          if (localGuest && data.allowGuestMode !== false) {
            setGuest({ id: localGuest.id, name: localGuest.name });
            // Sync guest cookie with server
            fetch('/api/auth/guest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guestId: localGuest.id, name: localGuest.name }),
            }).catch(() => {});
          } else {
            setUser(null);
            setGuest(null);
          }
        }
      }
    } catch (e) {
      console.error('Failed to check auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Read local guest immediately on client mount (post-hydration) for zero-latency UI
    const local = getGuest();
    if (local) {
      setGuest({ id: local.id, name: local.name });
      setIsLoading(false);
    }
    checkSession();
  }, [checkSession]);

  const checkForGuestHistoryClaim = (currentGuestId?: string) => {
    const localGuest = getGuest();
    const guestIdToCheck = currentGuestId || localGuest?.id;
    if (!guestIdToCheck) return;

    const localAttempts = getAttempts();
    if (localAttempts && localAttempts.length > 0) {
      setClaimAttemptsCount(localAttempts.length);
      setClaimGuestId(guestIdToCheck);
      setClaimDialogOpen(true);
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const prevGuest = getGuest();
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Email or password is incorrect.' };
      }

      setUser(data.user);
      setGuest(null);

      // Check if this browser has guest attempts to claim
      if (prevGuest?.id) {
        checkForGuestHistoryClaim(prevGuest.id);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    pass: string,
    ageConfirmed18Plus: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const prevGuest = getGuest();
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: pass,
          ageConfirmed18Plus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      setUser(data.user);
      setGuest(null);

      if (prevGuest?.id) {
        checkForGuestHistoryClaim(prevGuest.id);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch {}
    setUser(null);
    setGuest(null);
    clearGuest();
    router.push('/');
  };

  const continueAsGuest = async (name: string = 'Cadet') => {
    const saved = saveGuest(name);
    try {
      await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: saved.id, name: saved.name }),
      });
    } catch {}
    setGuest({ id: saved.id, name: saved.name });
    setUser(null);
  };

  const updateDisplayName = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (user) {
      // In a real account, update local state
      setUser({ ...user, displayName: cleanName });
    } else {
      saveGuest(cleanName);
      setGuest((prev) => (prev ? { ...prev, name: cleanName } : { id: 'cadet', name: cleanName }));
    }
  };

  const handleClaimHistory = async () => {
    if (!claimGuestId) {
      setClaimDialogOpen(false);
      return;
    }
    try {
      const localAttempts = getAttempts();
      const res = await fetch('/api/auth/claim-guest-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: claimGuestId,
          clientAttempts: localAttempts,
        }),
      });
      if (res.ok) {
        clearGuest();
      }
    } catch (e) {
      console.error('Failed to claim guest attempts:', e);
    } finally {
      setClaimDialogOpen(false);
      setClaimGuestId(null);
    }
  };

  const dismissClaimDialog = () => {
    setClaimDialogOpen(false);
    setClaimGuestId(null);
  };

  const isAuthenticated = !!user || !!guest;
  const isUser = !!user;
  const isGuest = !user && !!guest;

  const owner: AuthOwner = user
    ? { type: 'user', userId: user.id, user }
    : guest
    ? { type: 'guest', guestId: guest.id }
    : { type: 'anonymous' };

  return (
    <AuthContext.Provider
      value={{
        user,
        guest,
        owner,
        isAuthenticated,
        isUser,
        isGuest,
        isLoading,
        allowGuestMode,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
        updateDisplayName,
        claimDialogOpen,
        claimAttemptsCount,
        handleClaimHistory,
        dismissClaimDialog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

