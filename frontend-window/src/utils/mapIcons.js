import { divIcon } from 'leaflet'

export function createGateSquareIcon(isSelected = false) {
  const size = isSelected ? 24 : 16

  return divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${isSelected ? '#faa524' : '#f5a524'};border:2px solid ${isSelected ? '#0a6960' : '#0e6b63'};box-sizing:border-box;border-radius:2px;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function createVehicleIcon() {
  const size = 12
  return divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:#1890ff;border:2px solid #0958d9;box-sizing:border-box;border-radius:50%;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}
