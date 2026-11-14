'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Trash2, 
  Upload, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  Eye, 
  EyeOff, 
  User, 
  TrendingUp, 
  Sliders, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Avatar } from '@/components/ui/Avatar';
import { Button, TextInput, SelectInput, Toast } from '@/components/ui';
import PhotoCropModal from '@/components/profile/PhotoCropModal';
import { TARGET_EXAMS, formatTargetExamDisplay } from '@/data/targetExams';
import { INDIAN_STATES_AND_UTS } from '@/data/indianStates';
import { 
  validateProfileInput, 
  VALID_EDUCATION_STATUSES, 
  VALID_SSB_ATTEMPTS 
} from '@/lib/profile/validation';
import { ProfileValidationErrors } from '@/lib/profile/types';

type ProfileSection = 'personal' | 'practice' | 'preferences' | 'security';

export default function ProfilePage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { isUser, isLoading: isAuthLoading, signOut } = useAuth();
  const { 
    profile, 
    stats, 
    isLoading: isProfileLoading, 
    error: profileError, 
    updateProfile, 
    uploadPhoto, 
    removePhoto 
  } = useProfile();

  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    mobileCountryCode: '+91',
    mobileNumber: '',
    targetExam: '',
    targetExamOther: '',
    educationStatus: '',
    ssbAttempts: '',
    preferredLanguage: 'en',
  });

  const [initialData, setInitialData] = useState({ ...formData });
  const [fieldErrors, setFieldErrors] = useState<ProfileValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Photo state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCropFile, setSelectedCropFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isRemovePhotoConfirmOpen, setIsRemovePhotoConfirmOpen] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account Form State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmWord, setDeleteConfirmWord] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('veneha-theme');
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      }
    } catch {}
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('veneha-theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      window.dispatchEvent(new Event('theme-change'));
    } catch {}
  };

  // Populate form from loaded profile
  useEffect(() => {
    if (profile) {
      // Parse mobile into country code & 10-digit number
      let countryCode = '+91';
      let phoneNum = '';
      if (profile.mobileE164) {
        if (profile.mobileE164.startsWith('+91')) {
          countryCode = '+91';
          phoneNum = profile.mobileE164.slice(3);
        } else {
          phoneNum = profile.mobileE164;
        }
      }

      const populated = {
        displayName: profile.displayName || '',
        dateOfBirth: profile.dateOfBirth || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        state: profile.state || '',
        pinCode: profile.pinCode || '',
        mobileCountryCode: countryCode,
        mobileNumber: phoneNum,
        targetExam: profile.targetExam || '',
        targetExamOther: profile.targetExamOther || '',
        educationStatus: profile.educationStatus || '',
        ssbAttempts: profile.ssbAttempts || '',
        preferredLanguage: profile.preferredLanguage || lang,
      };

      setFormData(populated);
      setInitialData(populated);
    }
  }, [profile, lang]);

  // Check URL hash on mount e.g. #target-exam
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#target-exam') {
      setActiveSection('personal');
      setTimeout(() => {
        const el = document.getElementById('target-exam');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 300);
    }
  }, []);

  // Compute dirty/unsaved state
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // Field change handler with instant validation
  const handleChange = (field: keyof typeof formData, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);

    // Validate on the fly if error was previously shown
    if (fieldErrors[field as keyof ProfileValidationErrors]) {
      const { errors } = validateProfileInput(next);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: errors[field as keyof ProfileValidationErrors],
      }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    const { errors } = validateProfileInput(formData);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: errors[field as keyof ProfileValidationErrors],
    }));
  };

  // Discard changes
  const handleDiscard = () => {
    setFormData({ ...initialData });
    setFieldErrors({});
  };

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const { isValid, errors } = validateProfileInput(formData);
    if (!isValid) {
      setFieldErrors(errors);
      showToast('Please fix the highlighted errors before saving.', 'error');
      return;
    }

    setIsSaving(true);
    const result = await updateProfile(formData);
    setIsSaving(false);

    if (result.success) {
      setInitialData({ ...formData });
      setFieldErrors({});
      showToast('All changes saved successfully.', 'success');

      // If language changed, sync it
      if (formData.preferredLanguage && (formData.preferredLanguage === 'en' || formData.preferredLanguage === 'hi')) {
        setLang(formData.preferredLanguage);
      }
    } else {
      if (result.errors) {
        setFieldErrors(result.errors);
      }
      showToast(result.error || 'Failed to save changes.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Photo handlers
  const handleChoosePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please choose a JPG, PNG or WebP image.', 'error');
      return;
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('That file is too large. Choose one under 5 MB.', 'error');
      return;
    }

    setSelectedCropFile(file);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropModalOpen(false);
    setIsPhotoUploading(true);

    const result = await uploadPhoto(croppedBlob);
    setIsPhotoUploading(false);

    if (result.success) {
      showToast('Photo updated successfully.', 'success');
    } else {
      showToast(result.error || 'Failed to upload photo.', 'error');
    }
  };

  const handleRemovePhoto = async () => {
    setIsRemovePhotoConfirmOpen(false);
    setIsPhotoUploading(true);

    const result = await removePhoto();
    setIsPhotoUploading(false);

    if (result.success) {
      showToast('Photo removed.', 'success');
    } else {
      showToast(result.error || 'Failed to remove photo.', 'error');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password.');
      } else {
        setCurrentPassword('');
        setNewPassword('');
        showToast('Password updated successfully.', 'success');
      }
    } catch {
      setPasswordError('Network error. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmWord !== 'DELETE') {
      setDeleteError('Please type DELETE in all capital letters to confirm.');
      return;
    }

    if (!deletePassword) {
      setDeleteError('Password is required.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/profile/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          confirmWord: deleteConfirmWord,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete account.');
        setIsDeletingAccount(false);
      } else {
        await signOut();
        router.push('/');
      }
    } catch {
      setDeleteError('Network error. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  // Drag and drop photo
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Please choose a JPG, PNG or WebP image.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('That file is too large. Choose one under 5 MB.', 'error');
        return;
      }
      setSelectedCropFile(file);
      setIsCropModalOpen(true);
    }
  };

  // Loading state
  if (isAuthLoading || (isUser && isProfileLoading && !profile)) {
    return (
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-6 text-ink">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-hairline rounded w-32" />
          <div className="flex items-center gap-6 py-4 border-b border-hairline">
            <div className="w-24 h-24 rounded-full bg-hairline" />
            <div className="space-y-2">
              <div className="h-8 bg-hairline rounded w-48" />
              <div className="h-4 bg-hairline rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
            <div className="space-y-2">
              <div className="h-10 bg-hairline rounded" />
              <div className="h-10 bg-hairline rounded" />
              <div className="h-10 bg-hairline rounded" />
            </div>
            <div className="md:col-span-3 space-y-4">
              <div className="h-12 bg-hairline rounded" />
              <div className="h-12 bg-hairline rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest view (Section 6: Profiles are for accounts)
  if (!isUser) {
    return (
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans text-ink">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-steel mb-8" aria-label="Breadcrumb">
          <Link href="/" className="text-link-blue hover:underline">
            Home
          </Link>
          <span className="mx-2 text-hairline-strong">/</span>
          <span className="text-charcoal font-medium">Profile</span>
        </nav>

        <div className="max-w-xl mx-auto py-12 text-center space-y-6">
          <div className="flex justify-center">
            <Avatar size={96} name="Cadet" userId="guest" />
          </div>

          <div className="space-y-3">
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-ink tracking-tight">
              Profiles are for accounts
            </h1>
            <p className="text-[15px] text-slate leading-relaxed">
              Create an account to add your photo, target exam and details, and keep your practice progress across devices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-6">
                Sign in or create account
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto px-6">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetExamText = profile?.targetExam
    ? formatTargetExamDisplay(profile.targetExam, profile.targetExamOther)
    : null;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans text-ink">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChoosePhoto}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Photo Crop Modal */}
      {selectedCropFile && (
        <PhotoCropModal
          isOpen={isCropModalOpen}
          file={selectedCropFile}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Remove Photo Confirmation Modal */}
      {isRemovePhotoConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-canvas rounded-xl shadow-level3 border border-hairline p-5 space-y-4 text-ink">
            <h3 className="text-[17px] font-semibold text-ink">Remove profile photo?</h3>
            <p className="text-[14px] text-slate leading-relaxed">
              Your avatar will return to your initials. Your stored photo file will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsRemovePhotoConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRemovePhoto}
              >
                Remove photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Breadcrumb */}
      <nav className="text-[13px] text-steel mb-4" aria-label="Breadcrumb">
        <Link href="/" className="text-link-blue hover:underline">
          Home
        </Link>
        <span className="mx-2 text-hairline-strong">/</span>
        <span className="text-charcoal font-medium">Profile</span>
      </nav>

      {/* 2. Header Block (Matches Sketch: Large Avatar 96px on left, Name on top, Target Exam & Email under it) */}
      <div className="pb-6 border-b border-hairline">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar with Camera Button & Drag-Drop */}
          <div
            className="relative self-start shrink-0 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title="Click or drag an image to change photo"
          >
            <Avatar
              size={96}
              name={profile?.displayName}
              userId={profile?.userId}
              avatarVersion={profile?.avatarVersion}
              hasPhoto={profile?.hasPhoto}
              className="ring-2 ring-hairline group-hover:ring-primary transition-all"
            />

            {/* Small Round Camera Button at bottom-right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary-pressed text-white flex items-center justify-center shadow-level2 transition-transform hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              aria-label="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Target Exam info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight truncate">
              {profile?.displayName || 'User Profile'}
            </h1>

            {targetExamText ? (
              <div className="text-[14px] text-charcoal font-medium flex items-center gap-1.5">
                <span className="text-steel">Target exam:</span>
                <span className="font-semibold text-primary">{targetExamText}</span>
              </div>
            ) : (
              <div>
                <a
                  href="#target-exam"
                  onClick={() => setActiveSection('personal')}
                  className="text-[14px] text-link-blue hover:underline font-medium"
                >
                  Add your target exam &rarr;
                </a>
              </div>
            )}

            <div className="text-[13px] text-slate truncate pt-0.5">
              {profile?.email}
            </div>

            {/* Photo Action Links and Privacy Copy */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[13px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPhotoUploading}
                className="text-link-blue hover:underline font-medium cursor-pointer"
              >
                {isPhotoUploading ? 'Uploading...' : 'Change photo'}
              </button>

              {profile?.hasPhoto && (
                <>
                  <span className="text-hairline-strong">•</span>
                  <button
                    type="button"
                    onClick={() => setIsRemovePhotoConfirmOpen(true)}
                    disabled={isPhotoUploading}
                    className="text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    Remove photo
                  </button>
                </>
              )}
            </div>

            <p className="text-[12px] text-steel pt-1 max-w-lg leading-relaxed">
              Your photo is stored by Veneha so it can be shown in the app. Only you can see it. You can remove it at any time.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Section List + Content Area */}
      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Section List (desktop: ~240px, mobile: horizontal scrollable tabs) */}
        <aside className="lg:col-span-3 w-full">
          {/* Mobile Tab row (< 1024px) */}
          <div className="flex lg:hidden overflow-x-auto pb-2 gap-2 border-b border-hairline">
            {[
              { id: 'personal', label: 'Personal info' },
              { id: 'practice', label: 'Practice summary' },
              { id: 'preferences', label: 'Preferences' },
              { id: 'security', label: 'Account & security' },
            ].map((tab) => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as ProfileSection)}
                  className={`px-3 py-1.5 text-[14px] font-medium whitespace-nowrap rounded-md transition-colors cursor-pointer ${
                    active
                      ? 'bg-surface text-ink font-semibold border-b-2 border-primary'
                      : 'text-steel hover:text-ink hover:bg-surface/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Section Navigation (>= 1024px) */}
          <nav className="hidden lg:block space-y-1" aria-label="Profile sections">
            {[
              { id: 'personal', label: 'Personal information', icon: User },
              { id: 'practice', label: 'Practice summary', icon: TrendingUp },
              { id: 'preferences', label: 'Preferences', icon: Sliders },
              { id: 'security', label: 'Account and security', icon: ShieldCheck },
            ].map((item) => {
              const active = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as ProfileSection)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[14px] transition-colors cursor-pointer text-left ${
                    active
                      ? 'font-semibold text-ink border-l-2 border-primary bg-surface/70'
                      : 'text-slate hover:text-ink hover:bg-surface font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-steel'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Column: Section Content (max 760px wide) */}
        <main className="lg:col-span-9 max-w-[760px] w-full space-y-8">
          {/* Top Right Status Text: "All changes saved" or "Unsaved changes" */}
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <h2 className="text-[20px] font-semibold text-ink">
              {activeSection === 'personal' && 'Personal information'}
              {activeSection === 'practice' && 'Practice summary'}
              {activeSection === 'preferences' && 'Preferences'}
              {activeSection === 'security' && 'Account and security'}
            </h2>

            {activeSection === 'personal' && (
              <span
                className={`text-[12px] font-medium flex items-center gap-1.5 select-none ${
                  isDirty ? 'text-brand-orange-deep dark:text-brand-orange' : 'text-steel'
                }`}
              >
                {isDirty ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                    Unsaved changes
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-semantic-success" />
                    All changes saved
                  </>
                )}
              </span>
            )}
          </div>

          {/* SECTION 1: Personal Information Form */}
          {activeSection === 'personal' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Full Name (Required) */}
                <div className="sm:col-span-2">
                  <TextInput
                    label="Full name *"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    onBlur={() => handleBlur('displayName')}
                    error={fieldErrors.displayName}
                    helperText="Used on your practice certificates and in the navigation bar."
                    maxLength={60}
                    required
                  />
                </div>

                {/* 2. Date of Birth (Optional) */}
                <div>
                  <TextInput
                    type="date"
                    label="Date of birth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    onBlur={() => handleBlur('dateOfBirth')}
                    error={fieldErrors.dateOfBirth}
                    helperText="Optional. Used only to show age rules for your target exam."
                  />
                </div>

                {/* 3. Mobile Number (Optional) */}
                <div>
                  <label className="block text-[14px] font-medium text-charcoal mb-1.5">
                    Mobile number <span className="text-[12px] text-steel font-normal">(Optional • Not verified)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.mobileCountryCode}
                      onChange={(e) => handleChange('mobileCountryCode', e.target.value)}
                      className="h-[44px] bg-canvas text-ink text-[14px] px-2.5 rounded-md border border-hairline-strong focus:border-primary outline-none"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                    </select>

                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value)}
                      onBlur={() => handleBlur('mobileNumber')}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={`flex-1 h-[44px] bg-canvas text-ink text-[15px] px-[14px] py-[10px] rounded-md border ${
                        fieldErrors.mobileNumber ? 'border-semantic-error' : 'border-hairline-strong focus:border-primary'
                      } outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {fieldErrors.mobileNumber ? (
                    <p className="text-[13px] text-semantic-error font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.mobileNumber}</span>
                    </p>
                  ) : (
                    <p className="text-[13px] text-steel mt-1">Optional. Not used for login.</p>
                  )}
                </div>

                {/* 4. Target Exam (Optional, Anchor #target-exam) */}
                <div id="target-exam" className="sm:col-span-2 space-y-3">
                  <SelectInput
                    label="Target exam"
                    value={formData.targetExam}
                    onChange={(e) => handleChange('targetExam', e.target.value)}
                    onBlur={() => handleBlur('targetExam')}
                    error={fieldErrors.targetExam}
                    helperText="Shown beside your name so the simulator tailors feedback appropriately."
                  >
                    <option value="">Select your target entry / exam...</option>
                    {TARGET_EXAMS.map((exam) => (
                      <option key={exam.code} value={exam.code}>
                        {exam.shortLabel} — {exam.fullName}
                      </option>
                    ))}
                  </SelectInput>

                  {formData.targetExam === 'OTHER' && (
                    <TextInput
                      label="Specify your target exam"
                      value={formData.targetExamOther}
                      onChange={(e) => handleChange('targetExamOther', e.target.value)}
                      onBlur={() => handleBlur('targetExamOther')}
                      error={fieldErrors.targetExamOther}
                      placeholder="e.g. Coast Guard AC, TA, etc."
                      maxLength={40}
                    />
                  )}
                </div>

                {/* 5. Email (Read-only) */}
                <div className="sm:col-span-2">
                  <TextInput
                    label="Email address"
                    value={profile?.email || ''}
                    disabled
                    readOnly
                    className="bg-surface opacity-80 cursor-not-allowed"
                    helperText="Your sign-in email cannot be changed here. See Account and security."
                  />
                </div>

                {/* Structured Address Fields */}
                <div className="sm:col-span-2 pt-2 border-t border-hairline">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">
                    Address <span className="text-[13px] text-steel font-normal">(Optional)</span>
                  </h3>
                  <p className="text-[13px] text-steel mb-4">
                    Veneha uses this only for regional reporting and student verification if required.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <TextInput
                        label="Address line 1"
                        value={formData.addressLine1}
                        onChange={(e) => handleChange('addressLine1', e.target.value)}
                        onBlur={() => handleBlur('addressLine1')}
                        error={fieldErrors.addressLine1}
                        placeholder="House / flat no., building, street"
                        maxLength={120}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <TextInput
                        label="Address line 2"
                        value={formData.addressLine2}
                        onChange={(e) => handleChange('addressLine2', e.target.value)}
                        onBlur={() => handleBlur('addressLine2')}
                        error={fieldErrors.addressLine2}
                        placeholder="Apartment, suite, landmark"
                        maxLength={120}
                      />
                    </div>

                    <div>
                      <TextInput
                        label="City or town"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        error={fieldErrors.city}
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <SelectInput
                        label="State or Union Territory"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        onBlur={() => handleBlur('state')}
                        error={fieldErrors.state}
                      >
                        <option value="">Select State or UT...</option>
                        {INDIAN_STATES_AND_UTS.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.name} {st.isUT ? '(UT)' : ''}
                          </option>
                        ))}
                      </SelectInput>
                    </div>

                    <div>
                      <TextInput
                        label="PIN code"
                        value={formData.pinCode}
                        onChange={(e) => handleChange('pinCode', e.target.value)}
                        onBlur={() => handleBlur('pinCode')}
                        error={fieldErrors.pinCode}
                        placeholder="6 digits (e.g. 110001)"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Optional Fields */}
                <div className="sm:col-span-2 pt-2 border-t border-hairline">
                  <h3 className="text-[15px] font-semibold text-ink mb-3">
                    Educational &amp; SSB Background <span className="text-[13px] text-steel font-normal">(Optional)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <SelectInput
                        label="Education status"
                        value={formData.educationStatus}
                        onChange={(e) => handleChange('educationStatus', e.target.value)}
                      >
                        <option value="">Select education status...</option>
                        <option value="class_11_12">Class 11 or 12</option>
                        <option value="undergraduate">Undergraduate (pursuing)</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="working">Working professional</option>
                        <option value="other">Other</option>
                      </SelectInput>
                    </div>

                    <div>
                      <SelectInput
                        label="SSB attempts so far"
                        value={formData.ssbAttempts}
                        onChange={(e) => handleChange('ssbAttempts', e.target.value)}
                      >
                        <option value="">Select attempts...</option>
                        <option value="none">Not appeared yet (Fresher)</option>
                        <option value="1">1 attempt (Repeater)</option>
                        <option value="2">2 attempts (Repeater)</option>
                        <option value="3">3 attempts (Repeater)</option>
                        <option value="4_plus">4 or more attempts</option>
                      </SelectInput>
                    </div>

                    <div className="sm:col-span-2">
                      <SelectInput
                        label="Preferred language"
                        value={formData.preferredLanguage}
                        onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                        helperText="Keeps your language selection synchronized with the top navigation toggle."
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                      </SelectInput>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* SECTION 2: Practice Summary (Phase B - Real Data Only) */}
          {activeSection === 'practice' && (
            <div className="space-y-6">
              {stats && (stats.ppdtCount > 0 || stats.watCount > 0) ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-hairline bg-surface/50 space-y-1">
                      <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
                        PPDT Attempts
                      </span>
                      <div className="text-[28px] font-bold text-ink">
                        {stats.ppdtCount} <span className="text-[14px] font-normal text-steel">/ 65</span>
                      </div>
                      <div className="text-[12px] text-slate">
                        {stats.ppdtLastDate ? `Last: ${stats.ppdtLastDate}` : 'In progress'}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-hairline bg-surface/50 space-y-1">
                      <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
                        Average Score
                      </span>
                      <div className="text-[28px] font-bold text-ink">
                        {stats.ppdtAvgScore !== null ? `${stats.ppdtAvgScore}` : '—'}{' '}
                        <span className="text-[14px] font-normal text-steel">/ 10</span>
                      </div>
                      <div className="text-[12px] text-slate">Across evaluated sessions</div>
                    </div>

                    <div className="p-4 rounded-lg border border-hairline bg-surface/50 space-y-1">
                      <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
                        Best Score
                      </span>
                      <div className="text-[28px] font-bold text-primary">
                        {stats.ppdtBestScore !== null ? `${stats.ppdtBestScore}` : '—'}{' '}
                        <span className="text-[14px] font-normal text-steel">/ 10</span>
                      </div>
                      <div className="text-[12px] text-slate">Peak evaluation result</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-hairline bg-surface/50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[15px] text-ink">WAT Word Association</div>
                      <div className="text-[13px] text-slate">
                        {stats.watCount} set{stats.watCount === 1 ? '' : 's'} attempted
                      </div>
                    </div>
                    <Link href="/wat">
                      <Button variant="secondary">Go to WAT</Button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link href="/history">
                      <Button variant="secondary">
                        <span>View Past Attempts</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                    <Link href="/practice?filter=chart">
                      <Button variant="secondary">
                        <span>PPDT Score Trajectory Chart</span>
                        <TrendingUp className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-12 px-6 rounded-lg border border-hairline text-center space-y-4">
                  <p className="text-[15px] text-slate">
                    You have not completed any practice sessions yet.
                  </p>
                  <div>
                    <Link href="/practice">
                      <Button variant="primary">Start practice &rarr;</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: Preferences (Phase B) */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              {/* Language selection */}
              <div className="p-5 rounded-lg border border-hairline space-y-3">
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">Interface Language</h3>
                  <p className="text-[13px] text-slate mt-0.5">
                    Choose whether you want prompts, instructions, and feedback in English or Hindi.
                  </p>
                </div>

                <div className="inline-flex items-center rounded-lg border border-hairline p-1 bg-surface">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      handleChange('preferredLanguage', 'en');
                    }}
                    className={`px-4 py-2 text-[14px] font-semibold rounded-md transition-all cursor-pointer ${
                      lang === 'en'
                        ? 'bg-canvas text-ink shadow-sm'
                        : 'text-steel hover:text-ink'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('hi');
                      handleChange('preferredLanguage', 'hi');
                    }}
                    className={`px-4 py-2 text-[14px] font-semibold rounded-md transition-all cursor-pointer ${
                      lang === 'hi'
                        ? 'bg-canvas text-ink shadow-sm'
                        : 'text-steel hover:text-ink'
                    }`}
                  >
                    हिन्दी (HI)
                  </button>
                </div>
              </div>

              {/* Theme toggle */}
              <div className="p-5 rounded-lg border border-hairline flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">Theme Mode</h3>
                  <p className="text-[13px] text-slate mt-0.5">
                    Switch between clean light canvas and dark mode.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-md border border-hairline hover:bg-surface transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="w-4 h-4 text-brand-purple-300" />
                      <span className="text-[14px] font-medium text-ink">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-brand-yellow" />
                      <span className="text-[14px] font-medium text-ink">Light Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: Account and Security (Phase B) */}
          {activeSection === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <div className="p-5 rounded-lg border border-hairline space-y-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">Change Password</h3>
                  <p className="text-[13px] text-slate mt-0.5">
                    Choose a strong password with at least 8 characters.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {passwordError && (
                    <div className="p-3 rounded-md bg-card-tint-rose/40 border border-semantic-error/30 text-semantic-error text-[13px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[14px] font-medium text-charcoal mb-1">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-[44px] bg-canvas text-ink text-[15px] px-[14px] pr-10 rounded-md border border-hairline-strong focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink cursor-pointer"
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-charcoal mb-1">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        className="w-full h-[44px] bg-canvas text-ink text-[15px] px-[14px] pr-10 rounded-md border border-hairline-strong focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink cursor-pointer"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[12px] text-steel mt-1 block">At least 8 characters.</span>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? 'Updating...' : 'Update password'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Download My Data */}
              <div className="p-5 rounded-lg border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">Download My Data</h3>
                  <p className="text-[13px] text-slate mt-0.5">
                    Export your profile details, PPDT attempts, and evaluation scores as a JSON file.
                  </p>
                </div>
                <a href="/api/profile/export" download>
                  <Button variant="secondary" className="shrink-0">
                    <Download className="w-4 h-4 mr-1.5" />
                    <span>Download JSON</span>
                  </Button>
                </a>
              </div>

              {/* Tinted Danger Container: Delete Account (Only tinted container on the page) */}
              <div className="p-5 rounded-lg bg-card-tint-peach/40 border border-brand-orange/30 space-y-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-brand-orange-deep dark:text-brand-orange">
                    Delete account
                  </h3>
                  <p className="text-[13px] text-charcoal mt-1 leading-relaxed">
                    Permanently erase your whole Veneha account. This will immediately delete your profile, avatar photo, practice attempts, transcripts, and evaluation results. This action cannot be undone.
                  </p>
                </div>

                <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md pt-2">
                  {deleteError && (
                    <div className="p-3 rounded-md bg-card-tint-rose/40 border border-semantic-error/30 text-semantic-error text-[13px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[13px] font-medium text-charcoal mb-1">
                      Type <span className="font-mono font-bold text-ink">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmWord}
                      onChange={(e) => setDeleteConfirmWord(e.target.value)}
                      placeholder="DELETE"
                      className="w-full h-[40px] bg-canvas text-ink text-[14px] px-3 rounded-md border border-hairline-strong focus:border-semantic-error outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-charcoal mb-1">
                      Account password
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-[40px] bg-canvas text-ink text-[14px] px-3 rounded-md border border-hairline-strong focus:border-semantic-error outline-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="danger"
                    disabled={isDeletingAccount || deleteConfirmWord !== 'DELETE'}
                  >
                    {isDeletingAccount ? 'Deleting account...' : 'Permanently delete account'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. Sticky Save Bar at Bottom when Form is Dirty */}
      {isDirty && activeSection === 'personal' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-canvas/95 backdrop-blur-sm border-t border-hairline shadow-level3 py-3.5 px-4 sm:px-8 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[14px] text-charcoal font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <span>You have unsaved changes</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDiscard}
                disabled={isSaving}
              >
                Discard
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleSave()}
                disabled={isSaving || Object.values(fieldErrors).some(Boolean)}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
