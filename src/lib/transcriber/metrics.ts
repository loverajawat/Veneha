/**
 * Transcription accuracy and error metrics.
 * Computes Word Error Rate (WER), Character Error Rate (CER),
 * Entity Preservation, Invention Rate, and Unclear Marker Statistics.
 */

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\[\]\?\-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Standard Levenshtein distance dynamic programming.
 */
function levenshtein<T>(a: T[], b: T[]): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Computes Word Error Rate (WER) as edit_distance / reference_word_count.
 * Returns a percentage or float (0.0 to 1.0+).
 */
export function computeWER(reference: string, hypothesis: string): number {
  const refWords = tokenizeWords(reference);
  const hypWords = tokenizeWords(hypothesis);

  if (refWords.length === 0) {
    return hypWords.length === 0 ? 0 : 1;
  }

  const distance = levenshtein(refWords, hypWords);
  return Number((distance / refWords.length).toFixed(4));
}

/**
 * Computes Character Error Rate (CER) as char_edit_distance / reference_char_count.
 */
export function computeCER(reference: string, hypothesis: string): number {
  const refChars = reference.replace(/\s+/g, ' ').trim().split('');
  const hypChars = hypothesis.replace(/\s+/g, ' ').trim().split('');

  if (refChars.length === 0) {
    return hypChars.length === 0 ? 0 : 1;
  }

  const distance = levenshtein(refChars, hypChars);
  return Number((distance / refChars.length).toFixed(4));
}

/**
 * Verifies that all required entity tokens (names, ages, numbers) appear in the text.
 */
export function checkEntityPreservation(
  mustMatch: string[],
  text: string
): { preserved: boolean; missing: string[]; matchedCount: number } {
  const normText = text.toLowerCase();
  const missing: string[] = [];
  let matchedCount = 0;

  for (const entity of mustMatch) {
    const normEntity = entity.trim().toLowerCase();
    if (!normEntity) continue;
    // Check word-boundary or substring match
    if (normText.includes(normEntity)) {
      matchedCount++;
    } else {
      missing.push(entity);
    }
  }

  return {
    preserved: missing.length === 0,
    missing,
    matchedCount,
  };
}

/**
 * Measures invention rate: words in hypothesis that do not appear in reference vocabulary.
 */
export function computeInventionRate(reference: string, hypothesis: string): number {
  const refWords = new Set(tokenizeWords(reference));
  const hypWords = tokenizeWords(hypothesis);

  if (hypWords.length === 0) return 0;

  let inventedCount = 0;
  for (const word of hypWords) {
    // Exclude markers
    if (word.startsWith('[?') || word === '[illegible]') continue;
    if (!refWords.has(word)) {
      inventedCount++;
    }
  }

  return Number((inventedCount / hypWords.length).toFixed(4));
}

/**
 * Analyzes unclear markers: [?word?] and [illegible].
 */
export function countUnclearMarkers(text: string): {
  unclearCount: number;
  illegibleCount: number;
  totalMarkers: number;
  totalWords: number;
  unclearRate: number;
} {
  const unclearMatches = text.match(/\[\?[^\?]+\?\]/g) || [];
  const illegibleMatches = text.match(/\[illegible\]/gi) || [];
  const words = text.split(/\s+/).filter(Boolean);
  const totalMarkers = unclearMatches.length + illegibleMatches.length;
  const totalWords = words.length;
  const unclearRate = totalWords > 0 ? Number((totalMarkers / totalWords).toFixed(4)) : 0;

  return {
    unclearCount: unclearMatches.length,
    illegibleCount: illegibleMatches.length,
    totalMarkers,
    totalWords,
    unclearRate,
  };
}

