export default function formatLicensePlate(licensePlate) {
  if (typeof licensePlate !== 'string') return licensePlate || '-'

  const normalized = licensePlate.trim()
  const match = normalized.match(/^([0-9A-Za-z]*?[A-Za-z]+)([0-9].*)$/)

  return match ? `${match[1]}-${match[2]}` : normalized
}
