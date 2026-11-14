export interface UserProfileFull {
  userId: string;
  email: string;
  displayName: string;
  dateOfBirth: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  mobileE164: string | null;
  targetExam: string | null;
  targetExamOther: string | null;
  educationStatus: string | null;
  ssbAttempts: string | null;
  preferredLanguage: string | null;
  avatarVersion: number;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProfileUpdateInput {
  displayName?: string;
  dateOfBirth?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  mobileCountryCode?: string;
  mobileNumber?: string;
  targetExam?: string | null;
  targetExamOther?: string | null;
  educationStatus?: string | null;
  ssbAttempts?: string | null;
  preferredLanguage?: string | null;
}

export interface ProfileValidationErrors {
  displayName?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  mobileNumber?: string;
  targetExam?: string;
  targetExamOther?: string;
  educationStatus?: string;
  ssbAttempts?: string;
  preferredLanguage?: string;
  general?: string;
}
