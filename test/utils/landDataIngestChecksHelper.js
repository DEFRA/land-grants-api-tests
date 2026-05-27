import 'dotenv/config'
import { createDBPool, getDBOptions } from './postgres.js'

async function getLandDataCounts() {
  const options = getDBOptions()
  console.log('Database connection options:')
  console.log(options.host)
  console.log(options.user)
  console.log(options.database)
  console.log(options.password)
  console.log(options.port)
  console.log(options.region)
  const pool = createDBPool(options)
  const client = await pool.connect()
  const testQuery = 'SELECT 1'
  await client.query(testQuery)
  client.end()
  console.log('Successfully connected to the database')

  // const uniqueParcelsSql = `
  //     SELECT COUNT(DISTINCT (sheet_id, parcel_id)) AS count FROM land_parcels
  //   `
  // const uniqueCoversSql = `
  //     SELECT COUNT(DISTINCT (sheet_id, parcel_id)) AS count FROM land_covers
  //   `
  // const duplicateCoversSql = `
  //     SELECT COUNT(*)
  //             FROM (
  //                 SELECT 1
  //                 FROM land_covers
  //                 GROUP BY
  //                     parcel_id,
  //                     sheet_id,
  //                     land_cover_class_code,
  //                     geom
  //                 HAVING COUNT(*) > 1
  //           )`

  // const parcelsResult = await pool.query(uniqueParcelsSql)
  // const coversResult = await pool.query(uniqueCoversSql)
  // const duplicateCoversResult = await pool.query(duplicateCoversSql)

  // pool.end()

  // const uniqueParcelsCount = Number(parcelsResult.rows[0]?.count ?? 0)
  // const uniqueCoversCount = Number(coversResult.rows[0]?.count ?? 0)
  // const duplicateCoversCount = Number(duplicateCoversResult.rows[0]?.count ?? 0)

  // console.log('Unique land parcels count:', uniqueParcelsCount)
  // console.log('Unique land covers count:', uniqueCoversCount)
  // console.log('Duplicate land covers count:', duplicateCoversCount)

  // return { uniqueParcelsCount, uniqueCoversCount, duplicateCoversCount }
  return 1
}

export { getLandDataCounts }
