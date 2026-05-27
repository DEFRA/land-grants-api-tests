import 'dotenv/config'
import { createDBPool, getDBOptions } from './postgres.js'

async function getLandDataCounts() {
  const options = getDBOptions()
  const pool = createDBPool(options)

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

  const parcelsResult = await pool.query(uniqueParcelsSql)
  const coversResult = await pool.query(uniqueCoversSql)
  const duplicateCoversResult = await pool.query(duplicateCoversSql)

  pool.end()

  const uniqueParcelsCount = Number(parcelsResult.rows[0]?.count ?? 0)
  const uniqueCoversCount = Number(coversResult.rows[0]?.count ?? 0)
  const duplicateCoversCount = Number(duplicateCoversResult.rows[0]?.count ?? 0)

  console.log('Unique land parcels count:', uniqueParcelsCount)
  console.log('Unique land covers count:', uniqueCoversCount)
  console.log('Duplicate land covers count:', duplicateCoversCount)

  return { uniqueParcelsCount, uniqueCoversCount, duplicateCoversCount }
}

export { getLandDataCounts }
