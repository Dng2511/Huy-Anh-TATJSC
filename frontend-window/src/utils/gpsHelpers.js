export const getGpsStatus = (vehicle) => vehicle?.tracking?.liveStatus || '-'

export const isGpsLive = (vehicle) => {
  const liveStatus = vehicle?.tracking?.liveStatus
  return typeof liveStatus === 'string' ? liveStatus.trim().length > 0 && liveStatus.trim() !== '-' : Boolean(liveStatus)
}

export const getMarkerColors = (vehicle) => {
  const gpsLive = isGpsLive(vehicle)

  if (!gpsLive) {
    return { stroke: '#8c8c8c', fill: '#bfbfbf' }
  }

  if (vehicle?.status === 'running') {
    return { stroke: '#0958d9', fill: '#1677ff' }
  }

  if (vehicle?.status === 'idle') {
    return { stroke: '#08979c', fill: '#13c2c2' }
  }

  return { stroke: '#d48806', fill: '#faad14' }
}
