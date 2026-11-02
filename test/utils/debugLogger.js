const isDebugEnabled = () =>
  process.env.DEBUG === 'true' || process.env.DEBUG_LOGS === 'true'

export function debugLog(label, data) {
  if (isDebugEnabled()) {
    console.debug(label, JSON.stringify(data, null, 2))
  }
}
