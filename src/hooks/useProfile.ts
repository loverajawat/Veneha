'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfileFull, ProfileUpdateInput, ProfileValidationErrors } from '@/lib/profile/types';

export interface UserPracticeStats {
  ppdtCount: number;
  ppdtAvgScore: number | null;
  ppdtBestScore: number | null;
  ppdtLastDate: string | null;
  watCount: number;
}

export function useProfile() {
  const { user, isUser, refreshSession, updateUserOptimistic } = useAuth();
  const [profile, setProfile] = useState<UserProfileFull | null>(null);
  const [stats, setStats] = useState<UserPracticeStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isUser) {
      setProfile(null);
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Failed to load profile.');
      }
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  }, [isUser]);

  useEffect(() => {
    fetchProfile();

    const handleUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('profile-updated', handleUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleUpdate);
    };
  }, [fetchProfile]);

  const updateProfileData = async (
    input: ProfileUpdateInput
  ): Promise<{ success: boolean; errors?: ProfileValidationErrors; error?: string }> => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          errors: data.errors,
          error: data.error || 'Failed to update profile.',
        };
      }

      setProfile(data.profile);

      // Optimistically update AuthContext user for instant UI sync
      if (data.profile) {
        updateUserOptimistic({
          displayName: data.profile.displayName,
          targetExam: data.profile.targetExam,
          targetExamOther: data.profile.targetExamOther,
        });
      }

      // Notify all components
      window.dispatchEvent(new Event('profile-updated'));
      await refreshSession();

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const uploadPhoto = async (
    file: Blob
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file, 'avatar.webp');

      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to upload photo.' };
      }

      // Update state
      if (profile) {
        setProfile({
          ...profile,
          avatarVersion: data.avatarVersion,
          hasPhoto: true,
        });
      }

      updateUserOptimistic({
        avatarVersion: data.avatarVersion,
        hasPhoto: true,
      });

      window.dispatchEvent(new Event('profile-updated'));
      await refreshSession();

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const removePhoto = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/profile/photo', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to remove photo.' };
      }

      if (profile) {
        setProfile({
          ...profile,
          avatarVersion: data.avatarVersion,
          hasPhoto: false,
        });
      }

      updateUserOptimistic({
        avatarVersion: data.avatarVersion,
        hasPhoto: false,
      });

      window.dispatchEvent(new Event('profile-updated'));
      await refreshSession();

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  return {
    profile,
    stats,
    user,
    isLoading,
    error,
    reload: fetchProfile,
    updateProfile: updateProfileData,
    uploadPhoto,
    removePhoto,
  };
}

export default useProfile;
