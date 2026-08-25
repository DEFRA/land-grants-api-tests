/**
 * Centralised action version source for SFI tests.
 *
 * This helper keeps the latest version for each action in one place so tests
 * can validate if APIs are using the latest config versions. For the explicit
 * historical "existing application" scenarios, we keep the CSV value so the test
 * continues to validate the saved action configuration for that case.
 */
const LATEST_ACTION_VERSIONS = {
  CMOR1: '2.0.0',
  UPL1: '3.1.0',
  UPL2: '3.1.0',
  UPL3: '3.1.0',
  UPL8: '1.0.0',
  UPL10: '1.0.0',
  CLIG3: '1.1.0',
  CSAM3: '1.2.0',
  SCR2: '1.1.0',
  CNUM2: '1.0.1',
  WBD1: '1.0.0'
}

/**
 * Decides whether a test case should keep the version from the CSV fixture.
 *
 * These are the historical or explicitly configured scenarios where the saved
 * action version is part of the business expectation, rather than the latest
 * version in the central map.
 */
export function shouldUseCsvVersion(testCase = {}) {
  const description = String(testCase.TestDescription || '').trim()

  return (
    description.includes('existing application') ||
    description.includes('Application with configs provided') ||
    description.includes(
      'Application with configs provided for a new application'
    )
  )
}

/**
 * Returns the expected version for a given action.
 *
 * For standard scenarios it uses the latest version. For the explicit
 * historical configuration cases it keeps the CSV version when one is provided.
 */
export function getExpectedActionVersion(
  actionCode,
  testCase = {},
  csvVersion
) {
  if (!actionCode) {
    return csvVersion
  }

  const normalizedCode = String(actionCode).trim()
  const explicitVersion =
    csvVersion === undefined || csvVersion === null || csvVersion === ''
      ? undefined
      : String(csvVersion)

  if (shouldUseCsvVersion(testCase) && explicitVersion) {
    return explicitVersion
  }

  return String(LATEST_ACTION_VERSIONS[normalizedCode] ?? explicitVersion ?? '')
}

/**
 * Exposes the shared action-version map for other helpers and tests.
 */
export const ACTION_VERSIONS = LATEST_ACTION_VERSIONS
