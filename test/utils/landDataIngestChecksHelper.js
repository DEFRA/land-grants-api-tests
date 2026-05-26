import 'dotenv/config'
import { Client } from 'pg'

const createPostgresClient = async () => {
  const client = new Client({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USERNAME ?? 'land_grants_api',
    password: process.env.POSTGRES_PASSWORD ?? 'land_grants_api',
    database: process.env.POSTGRES_DATABASE ?? 'land_grants_api'
  })

  await client.connect()
  return client
}

async function getLandDataCounts(db) {
  let client
  let shouldDisconnect = false

  try {
    if (db?.connect) {
      client = await db.connect()
    } else if (db?.query) {
      client = db
    } else {
      client = await createPostgresClient()
      shouldDisconnect = true
    }

    const uniqueParcelsSql = `
      SELECT COUNT(DISTINCT (sheet_id, parcel_id)) AS count FROM land_parcels
    `
    const uniqueCoversSql = `
      SELECT COUNT(DISTINCT (sheet_id, parcel_id)) AS count FROM land_covers
    `
    const duplicateCoversSql = `
      SELECT COUNT(*)
              FROM (
                  SELECT 1
                  FROM land_covers
                  GROUP BY
                      parcel_id,
                      sheet_id,
                      land_cover_class_code,
                      geom
                  HAVING COUNT(*) > 1
            )`

    const parcelsResult = await client.query(uniqueParcelsSql)
    const coversResult = await client.query(uniqueCoversSql)
    const duplicateCoversResult = await client.query(duplicateCoversSql)

    const uniqueParcelsCount = Number(parcelsResult.rows[0]?.count ?? 0)
    const uniqueCoversCount = Number(coversResult.rows[0]?.count ?? 0)
    const duplicateCoversCount = Number(
      duplicateCoversResult.rows[0]?.count ?? 0
    )

    console.log('Unique land parcels count:', uniqueParcelsCount)
    console.log('Unique land covers count:', uniqueCoversCount)
    console.log('Duplicate land covers count:', duplicateCoversCount)

    return { uniqueParcelsCount, uniqueCoversCount, duplicateCoversCount }
  } finally {
    if (shouldDisconnect && client) {
      await client.end()
    } else if (client?.release) {
      await client.release()
    }
  }
}

export { getLandDataCounts }
