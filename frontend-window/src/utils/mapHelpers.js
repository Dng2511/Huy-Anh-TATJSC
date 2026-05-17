export const DEFAULT_CENTER = [21.0, 105.5]
export const DEFAULT_ZOOM = 6

export function getValidCoordinatesFromGates(gates = []) {
  return (gates || [])
    .map((g) => ({ lat: Number(g?.locate?.lat), lng: Number(g?.locate?.lng) }))
    .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
}

export function getAllCoordinates(gates = [], vehicles = []) {
  const gateCoords = getValidCoordinatesFromGates(gates)
  const vehicleCoords = (vehicles || [])
    .map((v) => ({ lat: Number(v?.tracking?.lat), lng: Number(v?.tracking?.lng) }))
    .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))

  return [...gateCoords, ...vehicleCoords]
}

export function computeCenter(coords = []) {
  if (!coords || !coords.length) return DEFAULT_CENTER
  const totals = coords.reduce(
    (acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }),
    { lat: 0, lng: 0 },
  )
  return [totals.lat / coords.length, totals.lng / coords.length]
}

export function fitMapToCoordinates(map, coords = [], options = {}) {
  if (!map) return
  const { fallbackCenter = DEFAULT_CENTER, fallbackZoom = DEFAULT_ZOOM, singleZoom = 15 } = options

  if (!coords || !coords.length) {
    map.setView(fallbackCenter, fallbackZoom)
    return
  }

  if (coords.length === 1) {
    map.setView([coords[0].lat, coords[0].lng], singleZoom)
    return
  }

  const latlngs = coords.map((c) => [c.lat, c.lng])
  map.fitBounds(latlngs, { padding: [50, 50] })
}
