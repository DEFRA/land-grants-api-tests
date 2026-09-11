import request from 'supertest'
import fs from 'node:fs'
import path from 'node:path'
import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'
import { union, featureCollection } from '@turf/turf'
import {
  PARCEL_TILES_ENDPOINT_V1,
  PARCEL_TILES_LOCATE_ENDPOINT_V1,
  BEARER_TOKEN,
  API_KEY
} from '../utils/apiEndpoints.js'
import { validateStatusCode } from '../utils/validationsHelper.js'
import { bboxToTiles } from '../utils/tileMathHelper.js'
import { runTestsAndRecordResultsForFiles } from '../utils/recordResults.js'
import { normalizeGeojson } from '../utils/geojsonHelper.js'

const ZOOM_LEVEL = 15
const dataFiles = ['./test/data/sfi/parcelTiles/parcelTiles.csv']

// Buffers the raw MVT bytes instead of letting superagent try to parse them as text/json.
const bufferParser = (res, callback) => {
  const chunks = []
  res.on('data', (chunk) => chunks.push(chunk))
  res.on('end', () => callback(null, Buffer.concat(chunks)))
}

// Converts a test description into a filesystem-safe snapshot file name
const toSnapshotName = (description) =>
  description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

describe('Parcel tiles V1 endpoint', () => {
  it('should locate the requested parcels, fetch their mapbox vector tiles, merge them into GeoJSON and match the saved snapshot', async () => {
    const validateParcelTiles = async (testCase) => {
      const parcelIds = JSON.parse(testCase.parcelIds)
      const testStatus = { expectedStatusCode: '200' }

      // Locate the bbox that contains all of the requested parcels
      const locateResponse = await request(global.baseUrl)
        .post(PARCEL_TILES_LOCATE_ENDPOINT_V1)
        .send({ parcelIds })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', API_KEY || '')
        .set('X-Forwarded-Authorization', 'TestToken')

      validateStatusCode(locateResponse, testStatus)

      // Fetch every tile in the bbox grid at the fixed zoom level, since the
      // parcels may span more than one tile
      const tiles = bboxToTiles(locateResponse.body.bbox, ZOOM_LEVEL)
      const features = []

      for (const { z, x, y } of tiles) {
        const response = await request(global.baseUrl)
          .post(PARCEL_TILES_ENDPOINT_V1(z, x, y))
          .send({ parcelIds })
          .set('Accept', 'application/vnd.mapbox-vector-tile')
          .set('Authorization', `Bearer ${BEARER_TOKEN}`)
          .set('x-api-key', API_KEY || '')
          .set('Accept-Encoding', '*')
          .set('X-Forwarded-Authorization', 'TestToken')
          .buffer(true)
          .parse(bufferParser)

        validateStatusCode(response, testStatus)

        const tileBuffer = response.body
        expect(Buffer.isBuffer(tileBuffer)).toBe(true)
        // A tile in the bbox grid may not intersect any of the requested parcels
        if (tileBuffer.length === 0) {
          continue
        }

        // Decode the binary MVT payload into GeoJSON features
        const tile = new VectorTile(new Pbf(tileBuffer))

        for (const layerName of Object.keys(tile.layers)) {
          const layer = tile.layers[layerName]
          for (let i = 0; i < layer.length; i++) {
            const feature = layer.feature(i).toGeoJSON(x, y, z)
            feature.properties = { ...feature.properties, layer: layerName }
            features.push(feature)
          }
        }
      }

      expect(features.length).toBeGreaterThan(0)

      // A parcel spanning multiple tiles is clipped into a fragment per tile,
      // so merge fragments sharing the same sheet/parcel id back into one feature
      const fragmentsByParcel = new Map()
      for (const feature of features) {
        const key = `${feature.properties.sheet_id}-${feature.properties.parcel_id}`
        const fragments = fragmentsByParcel.get(key) || []
        fragments.push(feature)
        fragmentsByParcel.set(key, fragments)
      }
      const mergedFeatures = [...fragmentsByParcel.values()].map((fragments) =>
        fragments.length > 1
          ? union(featureCollection(fragments), {
              properties: fragments[0].properties
            })
          : fragments[0]
      )

      expect(mergedFeatures.length).toBe(parcelIds.length)

      const geojson = {
        type: 'FeatureCollection',
        features: mergedFeatures
      }

      // Persist the merged GeoJSON as a baseline on first run, then assert
      // against it on every subsequent run to catch unexpected changes
      const outputDir = path.resolve('./test/data/output/PARCEL_TILES')
      const outputFile = path.join(
        outputDir,
        `expectedTiles-${toSnapshotName(testCase.TestDescription)}.geojson`
      )
      if (!fs.existsSync(outputFile)) {
        fs.mkdirSync(outputDir, { recursive: true })
        fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2))
      }
      const expectedGeojson = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
      expect(normalizeGeojson(geojson)).toEqual(
        normalizeGeojson(expectedGeojson)
      )
    }

    await runTestsAndRecordResultsForFiles(dataFiles, validateParcelTiles)
  })
})
