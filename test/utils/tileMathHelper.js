// Converts a lng/lat coordinate into slippy-map tile x/y at a given zoom level
export const lngLatToTile = (lng, lat, zoom) => {
  const latRad = (lat * Math.PI) / 180
  const n = 2 ** zoom
  const x = Math.floor(((lng + 180) / 360) * n)
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  )
  return { x, y }
}

// Derives every tile z/x/y that intersects the given bbox, since a bbox spanning
// multiple parcels can cover more than one tile
export const bboxToTiles = (bbox, zoom) => {
  const min = lngLatToTile(bbox.minLng, bbox.maxLat, zoom)
  const max = lngLatToTile(bbox.maxLng, bbox.minLat, zoom)

  const tiles = []
  for (let x = min.x; x <= max.x; x++) {
    for (let y = min.y; y <= max.y; y++) {
      tiles.push({ z: zoom, x, y })
    }
  }
  return tiles
}
