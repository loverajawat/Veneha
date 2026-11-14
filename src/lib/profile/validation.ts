import { TARGET_EXAMS } from '@/data/targetExams';
import { INDIAN_STATES_AND_UTS } from '@/data/indianStates';
import { ProfileUpdateInput, ProfileValidationErrors } from './types';

// Regex allowing letters in any script (Unicode \p{L}), combining vowel/nasal marks (\p{M}), spaces, dots, apostrophes, hyphens
const NAME_REGEX = /^[\p{L}\p{M}\s.'-]+$/u;
const PIN_CODE_REGEX = /^[1-9][0-9]{5}$/;
const INDIA_MOBILE_REGEX = /^[6-9][0-9]{9}$/;

export const VALID_EDUCATION_STATUSES = [
  'class_11_12',
  'undergraduate',
  'graduate',
  'postgraduate',
  'working',
  'other',
] as const;

export const VALID_SSB_ATTEMPTS = ['none', '1', '2', '3', '4_plus'] as const;

export interface ValidatedProfileData {
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
}

export function validateProfileInput(input: ProfileUpdateInput): {
  isValid: boolean;
  errors: ProfileValidationErrors;
  data: ValidatedProfileData;
} {
  const errors: ProfileValidationErrors = {};

  // 1. Full Name (Required)
  let displayName = (input.displayName || '').trim();
  if (!displayName) {
    errors.displayName = 'Full name is required.';
  } else if (displayName.length < 2) {
    errors.displayName = 'Full name must be at least 2 characters.';
  } else if (displayName.length > 60) {
    errors.displayName = 'Full name must be 60 characters or less.';
  } else if (!NAME_REGEX.test(displayName) || !/\p{L}/u.test(displayName)) {
    errors.displayName = "Full name can only contain letters, spaces, hyphens, dots, and apostrophes.";
  }

  // 2. Date of Birth (Optional)
  let dateOfBirth: string | null = null;
  if (input.dateOfBirth && input.dateOfBirth.trim()) {
    const dobStr = input.dateOfBirth.trim();
    const dob = new Date(dobStr);
    const now = new Date();

    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = 'Please enter a valid date in YYYY-MM-DD format.';
    } else if (dob > now) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.';
    } else {
      // Age calculation
      const ageDiffMs = now.getTime() - dob.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      if (age < 10 || age > 70) {
        errors.dateOfBirth = 'Please enter a plausible date of birth (age between 10 and 70).';
      } else {
        dateOfBirth = dobStr;
      }
    }
  }

  // 3. Address Lines & City (Optional)
  let addressLine1: string | null = (input.addressLine1 || '').trim() || null;
  if (addressLine1 && addressLine1.length > 120) {
    errors.addressLine1 = 'Address line 1 must be 120 characters or less.';
  }

  let addressLine2: string | null = (input.addressLine2 || '').trim() || null;
  if (addressLine2 && addressLine2.length > 120) {
    errors.addressLine2 = 'Address line 2 must be 120 characters or less.';
  }

  let city: string | null = (input.city || '').trim() || null;
  if (city && city.length > 60) {
    errors.city = 'City or town must be 60 characters or less.';
  }

  // 4. State or UT (Optional)
  let state: string | null = (input.state || '').trim() || null;
  if (state) {
    const foundState = INDIAN_STATES_AND_UTS.find(
      (s) => s.code === state || s.name.toLowerCase() === state?.toLowerCase()
    );
    if (!foundState) {
      errors.state = 'Please select a valid Indian State or Union Territory.';
    } else {
      state = foundState.code;
    }
  }

  // 5. PIN Code (Optional)
  let pinCode: string | null = (input.pinCode || '').trim() || null;
  if (pinCode) {
    if (!PIN_CODE_REGEX.test(pinCode)) {
      errors.pinCode = 'PIN code must be exactly 6 digits (first digit 1 to 9).';
    }
  }

  // 6. Mobile Number (Optional)
  let mobileE164: string | null = null;
  const rawMobile = (input.mobileNumber || '').trim();
  const countryCode = (input.mobileCountryCode || '+91').trim();

  if (rawMobile) {
    // Strip spaces, dashes, parens
    const cleanDigits = rawMobile.replace(/[\s()-]/g, '');

    if (countryCode === '+91') {
      if (!INDIA_MOBILE_REGEX.test(cleanDigits)) {
        errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
      } else {
        mobileE164 = `+91${cleanDigits}`;
      }
    } else {
      // General international number format
      if (!/^\d{6,14}$/.test(cleanDigits)) {
        errors.mobileNumber = 'Please enter a valid phone number.';
      } else {
        const formattedCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
        mobileE164 = `${formattedCode}${cleanDigits}`;
      }
    }
  }

  // 7. Target Exam (Optional)
  let targetExam: string | null = (input.targetExam || '').trim() || null;
  let targetExamOther: string | null = (input.targetExamOther || '').trim() || null;

  if (targetExam) {
    const validExam = TARGET_EXAMS.find((e) => e.code === targetExam);
    if (!validExam) {
      errors.targetExam = 'Please select a valid target exam.';
    } else if (targetExam === 'OTHER') {
      if (!targetExamOther) {
        errors.targetExamOther = 'Please specify your target exam.';
      } else if (targetExamOther.length > 40) {
        errors.targetExamOther = 'Target exam description must be 40 characters or less.';
      }
    } else {
      targetExamOther = null;
    }
  } else {
    targetExamOther = null;
  }

  // 8. Education Status (Optional)
  let educationStatus: string | null = (input.educationStatus || '').trim() || null;
  if (educationStatus) {
    if (!VALID_EDUCATION_STATUSES.includes(educationStatus as any)) {
      errors.educationStatus = 'Please select a valid education status.';
    }
  }

  // 9. SSB Attempts (Optional)
  let ssbAttempts: string | null = (input.ssbAttempts || '').trim() || null;
  if (ssbAttempts) {
    if (!VALID_SSB_ATTEMPTS.includes(ssbAttempts as any)) {
      errors.ssbAttempts = 'Please select a valid attempts option.';
    }
  }

  // 10. Preferred Language (Optional)
  let preferredLanguage: string | null = (input.preferredLanguage || '').trim() || null;
  if (preferredLanguage && preferredLanguage !== 'en' && preferredLanguage !== 'hi') {
    errors.preferredLanguage = 'Language must be either English or Hindi.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      displayName,
      dateOfBirth,
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      mobileE164,
      targetExam,
      targetExamOther,
      educationStatus,
      ssbAttempts,
      preferredLanguage,
    },
  };
}
