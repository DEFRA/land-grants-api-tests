import tls from 'node:tls'

function getTrustStoreCerts(envs) {
  console.log(
    'Extracting trust store certificates from environment variables',
    envs
  )
  return Object.entries(envs)
    .map(([key, value]) => key.startsWith('TRUSTSTORE_') && value)
    .filter(
      /** @returns {envValue is string} */
      (envValue) => Boolean(envValue)
    )
    .map((envValue) => Buffer.from(envValue, 'base64').toString().trim())
}

export const createSecureContext = () => {
  const originalTlsCreateSecureContext = tls.createSecureContext

  tls.createSecureContext = function (options = {}) {
    const trustStoreCerts = getTrustStoreCerts(process.env)

    const tlsSecureContext = originalTlsCreateSecureContext(options)

    trustStoreCerts.forEach((cert) => {
      tlsSecureContext.context.addCACert(cert)
    })

    return tlsSecureContext
  }

  return tls.createSecureContext()
}
