export interface TargetExamOption {
  code: string;
  shortLabel: string;
  fullName: string;
}

export const TARGET_EXAMS: TargetExamOption[] = [
  {
    code: 'NDA',
    shortLabel: 'NDA',
    fullName: 'National Defence Academy (Army, Navy, Air Force)',
  },
  {
    code: 'CDS',
    shortLabel: 'CDS',
    fullName: 'Combined Defence Services (IMA, INA, AFA, OTA)',
  },
  {
    code: 'AFCAT',
    shortLabel: 'AFCAT',
    fullName: 'Air Force Common Admission Test',
  },
  {
    code: 'TES',
    shortLabel: 'TES',
    fullName: '10+2 Technical Entry Scheme (Army)',
  },
  {
    code: 'TGC',
    shortLabel: 'TGC',
    fullName: 'Technical Graduate Course (Army)',
  },
  {
    code: 'SSC_TECH',
    shortLabel: 'SSC Tech',
    fullName: 'Short Service Commission (Technical)',
  },
  {
    code: 'JAG',
    shortLabel: 'JAG Entry',
    fullName: 'Judge Advocate General (Army)',
  },
  {
    code: 'NCC_SPECIAL',
    shortLabel: 'NCC Special Entry',
    fullName: 'NCC Special Entry',
  },
  {
    code: 'UES',
    shortLabel: 'UES',
    fullName: 'University Entry Scheme (Army)',
  },
  {
    code: 'NAVY_10_PLUS_2',
    shortLabel: 'Navy 10+2 B.Tech',
    fullName: 'Indian Navy 10+2 B.Tech Cadet Entry',
  },
  {
    code: 'NAVY_SSC',
    shortLabel: 'Navy SSC',
    fullName: 'Indian Navy Short Service Commission',
  },
  {
    code: 'TERRITORIAL_ARMY',
    shortLabel: 'Territorial Army',
    fullName: 'Territorial Army Officer',
  },
  {
    code: 'OTHER',
    shortLabel: 'Other',
    fullName: 'Other (please specify)',
  },
  {
    code: 'NOT_DECIDED',
    shortLabel: 'Not decided',
    fullName: 'Not decided yet',
  },
];

export function getTargetExamByCode(code?: string | null): TargetExamOption | undefined {
  if (!code) return undefined;
  return TARGET_EXAMS.find((e) => e.code === code);
}

export function formatTargetExamDisplay(code?: string | null, otherText?: string | null): string {
  if (!code) return '';
  if (code === 'OTHER' && otherText && otherText.trim()) {
    return otherText.trim();
  }
  const exam = getTargetExamByCode(code);
  return exam ? exam.shortLabel : code;
}
