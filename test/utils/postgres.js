import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { Signer } from '@aws-sdk/rds-signer'
import { Pool } from 'pg'
import { createSecureContext } from './secure-context.js'

const port = 5432
const isLocal = process.env.ENVIRONMENT === 'local'
const passwordForLocalDev = process.env.POSTGRES_PASSWORD
const host = process.env.POSTGRES_HOST
const user = process.env.POSTGRES_USERNAME
const database = process.env.POSTGRES_DATABASE
const region = process.env.POSTGRES_REGION

async function getToken(options) {
  if (isLocal) {
    return options.password
  } else {
    const signer = new Signer({
      hostname: options.host,
      port: options.port,
      username: options.user,
      credentials: fromNodeProviderChain(),
      region: options.region
    })
    return signer.getAuthToken()
  }
}

export function getDBOptions() {
  return {
    host,
    user,
    database,
    password: passwordForLocalDev,
    port,
    region
  }
}

export function createDBPool(options) {
  if (isLocal) {
    return new Pool({
      port: options.port,
      user: options.user,
      password: options.password,
      host: options.host,
      database: options.database
    })
  }

  const context = createSecureContext()
  return new Pool({
    port: options.port,
    user: options.user,
    password: async () => {
      return await getToken(options)
    },
    host: options.host,
    database: options.database,
    maxLifetimeSeconds: 60 * 10, // This should be set to less than the RDS Token lifespan (15 minutes)
    min: 2, // Minimum number of connections to keep warm, Reduces cold-start latency and connection churn
    max: 10, // Maximum number of connections the pool can create, we keep this at 10, as we use aurora, which scales number of connections automatically
    keepAlive: true, // Enable OS-level TCP keepalive probes, detects dead connections early (no SELECT 1 needed)
    keepAliveInitialDelayMillis: 10000, // Wait 10s after a connection becomes idle before sending first probe, balances early detection vs unnecessary network traffic
    idleTimeoutMillis: 0, // Prevent pg from closing idle connections, Aurora networks handle idle sockets better with keepalive
    connectionTimeoutMillis: 10000, // How long to wait for a free connection before failing, prevents requests from hanging under load
    allowExitOnIdle: false, // Keep Node.js process alive even when pool is idle, required for servers / APIs
    ...(!isLocal &&
      context && {
        ssl: {
          secureContext: context
        }
      })
  })
}
