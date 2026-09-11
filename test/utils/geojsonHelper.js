// Rounds geometry coordinates so insignificant floating-point differences do not fail comparisons
export const normalizeGeojson = (geojson) => {
  const roundCoordinates = (coordinates) =>
    Array.isArray(coordinates)
      ? coordinates.map((coordinate) =>
          Array.isArray(coordinate)
            ? roundCoordinates(coordinate)
            : Number(coordinate.toFixed(6))
        )
      : coordinates

  return {
    ...geojson,
    features: geojson.features.map((feature) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: roundCoordinates(feature.geometry.coordinates)
      }
    }))
  }
}
