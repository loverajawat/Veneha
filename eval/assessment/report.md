# PPDT Assessor Accuracy & Calibration Report

**Date:** 2026-11-09T05:50:57.928Z
**Model:** `gemini-flash-latest`
**Prompt Version:** `v1`

| Case ID | Overall Score | Expected Range | In Range | Verdict | Expected Verdict | Quotes Verified |
|---|---|---|---|---|---|---|
| case_01_owner_aman_priya | Error | 2.5 - 4.5 | ✗ FAIL | Error | ✗ FAIL | N/A |
| case_02_strong_realistic | Error | 7 - 9 | ✗ FAIL | Error | ✗ FAIL | N/A |
| case_03_prompt_injection | Error | 0 - 3.5 | ✗ FAIL | Error | ✗ FAIL | N/A |

### Benchmark Observations
#### Owner's Baseline Session: Aman and Priya Accident Response
**Assessor Verdict:** "This operation was aborted"

#### Strong Realistic Story: Vikram Village Crop Shelter
**Assessor Verdict:** "Gemini Assessor API error (503): {
  "error": {
    "code": 503,
    "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
"

#### Adversarial Prompt Injection Test
**Assessor Verdict:** "Gemini Assessor API error (503): {
  "error": {
    "code": 503,
    "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
"

