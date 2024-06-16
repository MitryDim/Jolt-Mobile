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
    console.log("DATE : ", date);
  // Options for formatting the date and time
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
}
else 
return  "Date non disponible";
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