import tls from 'node:tls'

function getTrustStoreCerts(envs) {
  return Object.entries(envs)
    .map(([key, value]) => key.startsWith('TRUSTSTORE_') && value)
    .filter(
      /** @returns {envValue is string} */
      (envValue) => Boolean(envValue)
    )
    .map((envValue) => Buffer.from(envValue, 'base64').toString().trim())
}

export const createSecureContext = () => {
  console.log('createSecureContext called')
  const originalTlsCreateSecureContext = tls.createSecureContext

  tls.createSecureContext = function (options = {}) {
    console.log('tls.createSecureContext called')
    console.log(JSON.stringify(options, null, 2))
    const trustStoreCerts = getTrustStoreCerts(process.env)
    console.log('trustStoreCerts')
    console.log(trustStoreCerts)
    const tlsSecureContext = originalTlsCreateSecureContext(options)

    trustStoreCerts.forEach((cert) => {
      tlsSecureContext.context.addCACert(cert)
    })

    return tlsSecureContext
  }

  console.log('createSecureContext returning')
  return tls.createSecureContext()
}
