export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${distanceInMeters.toFixed(0)} m`;
  } else {
    const distanceInKilometers = distanceInMeters / 1000;
    return `${distanceInKilometers.toFixed(1)} km`;
  }
};

export const formattedDate = (date) => {
  if (date) {
    // Create a Date object from the current timestamp (in milliseconds)
    const currentDate = new Date(date);


    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    };

    // Format the date and time using the options
    const formattedDateTime = currentDate.toLocaleString(undefined, options);

    return formattedDateTime;
  } else return "Date non disponible";
};

export const formatElapsedTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(0)} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60).toFixed(0);
    return `${minutes} min`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600).toFixed(0);
    const minutes = Math.floor((seconds % 3600) / 60).toFixed(0);
    return `${hours} h  ${minutes > 0 ? `${minutes} min` : ""}`;
  } else {
    const days = Math.floor(seconds / 86400).toFixed(0);
    const hours = Math.floor((seconds % 86400) / 3600).toFixed(0);
    return `${days} j ${hours > 0 ? `${hours} h` : ""}`;
  }
};

export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
