export const CenterRegion = (coordinates) => {
  if (coordinates.length === 0) {
    return {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }
  const minLat = Math.min(...coordinates.map((pos) => pos.latitude));
  const maxLat = Math.max(...coordinates.map((pos) => pos.latitude));
  const minLon = Math.min(...coordinates.map((pos) => pos.longitude));
  const maxLon = Math.max(...coordinates.map((pos) => pos.longitude));
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: (maxLat - minLat + 0.01) * 1.5,
    longitudeDelta: (maxLon - minLon + 0.01) * 1.5,
  };
};
