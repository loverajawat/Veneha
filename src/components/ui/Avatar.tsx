'use client';

import React, { useState } from 'react';

export type AvatarSize = 32 | 44 | 96;

interface AvatarProps {
  size?: AvatarSize;
  name?: string | null;
  userId?: string | null;
  avatarVersion?: number;
  hasPhoto?: boolean;
  className?: string;
  alt?: string;
}

const TINT_PALETTE = [
  { bg: 'bg-card-tint-peach', text: 'text-brand-orange-deep' },
  { bg: 'bg-card-tint-rose', text: 'text-brand-pink-deep' },
  { bg: 'bg-card-tint-mint', text: 'text-brand-green' },
  { bg: 'bg-card-tint-lavender', text: 'text-brand-purple-800' },
  { bg: 'bg-card-tint-sky', text: 'text-link-blue' },
  { bg: 'bg-card-tint-yellow', text: 'text-brand-brown' },
];

function getStableTintIndex(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % TINT_PALETTE.length;
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  size = 32,
  name,
  userId,
  avatarVersion = 0,
  hasPhoto = false,
  className = '',
  alt = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Size styling
  let sizeClasses = 'w-8 h-8 text-[12px]';
  if (size === 44) sizeClasses = 'w-11 h-11 text-[15px]';
  if (size === 96) sizeClasses = 'w-24 h-24 text-[28px]';

  // Stable deterministic soft pastel tint from palette
  const seed = userId || name || 'default';
  const tint = TINT_PALETTE[getStableTintIndex(seed)];
  const initials = getInitials(name);

  const showImage = hasPhoto && !imgError && avatarVersion !== undefined;
  const photoUrl = `/api/profile/photo?v=${avatarVersion}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden ${sizeClasses} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-bold tracking-tight ${tint.bg} ${tint.text}`}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export default Avatar;
