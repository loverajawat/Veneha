# Functional Inventory — Veneha SSB Platform

Baseline functional inventory taken before the redesign to the Notion-style design system.
Date: 2026-11-07
Branch: `redesign-notion-style`

---

## 1. Global & State Features
- **Guest Name & Profile**:
  - Saved in `localStorage` under `ssb_prep_guest`.
  - Displayed in sidebar and mobile header.
  - "Change Name" modal (`GuestModal`) allows updating cadet callsign with instant persistence.
- **Bilingual Support (EN / हिं)**:
  - Global `LanguageContext` toggle (`en` | `hi`).
  - Saved in `localStorage` (`ssb_prep_lang`).
  - Toggles all chrome, navigation, guides, and instructions without clipping.
- **Daily Usage Tracking & Quota Limits**:
  - PPDT limit: 5 attempts/day (`ssb_prep_daily_usage`).
  - WAT limit: 2 attempts/day (`ssb_prep_wat_daily_usage`).
  - Displayed in "Today's Practice" widget with progress bars. Resets daily at midnight.
- **API Key Configuration**:
  - Custom Gemini API key input in `SettingsModal`.
  - Persisted securely in `localStorage` (`ssb_prep_gemini_key`). Never exposed to public endpoints.
- **Privacy Assurance**:
  - Handwriting photos processed in memory, never stored on disk or server.

---

## 2. Routes & Interactive Capabilities

### A. Home (`/`)
- **Hero Section**:
  - Top badge: "Complete SSB practice" / "सम्पूर्ण SSB अभ्यास".
  - Headline: "Practise PPDT and WAT. Get AI feedback.".
  - Primary CTA button: "Start Timed PPDT Practice" -> `/practice`.
  - Secondary CTA button: "Explore 5-Day SSB Guide (हिंदी)" -> `/guide`.
  - Disclaimer note: AI practice guidance only.
- **Three-Step Strip**:
  - 1. Learn (`/guide`), 2. Practise (`/practice`), 3. Get feedback (`/practice`).
- **Choose Your Practice Section**:
  - PPDT Card -> `/practice` (Stage 1 Screening, 30s view, 4 min write).
  - WAT Card -> `/wat` (Stage 2 Psychology, 60 words, 15s each).
- **3 Core Pillars**:
  - Bilingual 5-Day Guide, Timed PPDT Practice Loop, AI Feedback on Handwritten Stories.
- **OLQ Interactive Explorer**:
  - Filter chips: All, Factor 1, Factor 2, Factor 3, Factor 4.
  - Interactive grid displaying all 15 Officer Like Qualities with definitions and traits.

### B. 5-Day SSB Guide (`/guide`)
- Day-by-day navigation for Stages 1 to 5:
  - Stage 1: Screening (OIR & PPDT).
  - Stage 2: Psychological Tests (TAT, WAT, SRT, SDT).
  - Stage 3 & 4: GTO Tasks & Personal Interview.
  - Stage 5: Conference & Final Board.
- Full bilingual English and Hindi translation with seamless toggle.

### C. PPDT Practice Grid (`/practice`)
- 65 exam-style stimulus picture cards in fixed order.
- Filter chips: `All (65)`, `Not attempted`, `Attempted`.
- Random picture button (picks unattempted first).
- Progress indicator: "X of 65 pictures attempted" with progress bar.
- Collapsible "How it works" accordion panel.
- Card state:
  - Not attempted: Shows "Picture N", no bottom bar.
  - Attempted: Shows "Picture N", white bottom bar with Score (e.g. `7/10`), Date, and link to feedback.
- Quota lock: When daily limit is reached, disables starting new attempts and shows warning.

### D. PPDT Single Picture Session (`/practice/[pictureNumber]`)
- **Ready Phase**:
  - Instructions: 30s picture view, 4m writing, 10-75-15 timeline rule, 4 D's audit.
  - Ruled paper guidance.
  - Sound toggle (On/Off).
  - "Begin Practice" button to trigger timer.
- **Phase 1: 30-Second Picture Observation (Focus Mode)**:
  - Hides app chrome (`focus-mode`).
  - High-resolution stimulus picture.
  - 30-second countdown timer (clock-time delta based).
  - Soft warning chime at 5 seconds left.
  - Wake Lock API active.
- **Phase 2: 4-Minute Story Writing (Focus Mode)**:
  - Stimulus picture remains visible as thumbnail or reference.
  - 4-minute countdown timer (clock-time delta based).
  - Amber color shift at last 30 seconds with warning beep.
  - "Finish Early" or automatic redirect upon completion.
  - "Exit" modal with confirmation (does not consume daily attempt).

### E. Photo Upload Screen (`/upload`)
- Allows camera capture (`capture="environment"`) or gallery file upload.
- Client-side image compression (max 1600px edge, JPEG 85%).
- Sharpness / blur analysis check (`checkImageSharpness`) with retake warning.
- Promise notice: "Handwriting photos are deleted immediately after transcription".
- Sends to `/api/transcribe`.

### F. Transcript Review Screen (`/transcribe`)
- Editable textarea showing Gemini OCR transcription.
- Candidate can verify and fix any transcription errors.
- "Assess My Story" button triggers `/api/assess` and records attempt against daily quota.

### G. Results Screen (`/result`)
- Overall score badge (e.g. `7/10`).
- Detailed breakdown:
  - 10-75-15 Timeline adherence (Setup, Action, Resolution).
  - 4 D's Audit (Direct action, Decision, Delegation, Deployment).
  - Key Strengths & Priority Improvements.
  - Model Story & Narration coaching tips.
- Buttons: "Try Another Picture", "Back to Practice Grid".

### H. Past Attempts Screen (`/history`)
- Chronological list of completed attempts.
- Displays Picture number, attempt date, overall score, and direct link to full feedback.
- Empty state when no attempts exist.

### I. API Routes
- `/api/transcribe`: Gemini multimodal OCR.
- `/api/assess`: Gemini psychological story assessor.
- `/api/pictures`: Metadata for active PPDT stimulus pictures.
