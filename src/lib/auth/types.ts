export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
  terms_accepted_at: string;
  age_confirmed_18_plus: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  targetExam?: string | null;
  targetExamOther?: string | null;
  avatarVersion?: number;
  hasPhoto?: boolean;
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export type AuthOwner =
  | { type: 'user'; userId: string; user: UserProfile }
  | { type: 'guest'; guestId: string }
  | { type: 'anonymous' };

