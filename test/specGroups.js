export const ingestSpecs = [
  'test/specs/ingest/agreementsTransfer.spec.js',
  'test/specs/ingest/landCoversIngest.spec.js',
  'test/specs/ingest/landParcelsIngest.spec.js'
]

export const localAndNonLocalSharedSpecs = [
  'test/specs/100-land-parcels/applicationValidations_for_100_land_parcels.spec.js',
  'test/specs/100-land-parcels/paymentCalculations_for_100_land_parcels.spec.js'
]

export function excludeSpecs(specs) {
  return specs.map((spec) => `!**/${spec}`)
}
