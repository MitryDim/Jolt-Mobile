import { formatDistance, formatElapsedTime } from "../utils/Utils";
const apiKey = "5b3ce3597851110001cf624862b0fa8bd3c04b8bbf8de461d61c4193";
const openRouteServiceURL = "https://api.openrouteservice.org";

// export const calculateRoute = async (startCoords, endCoords) => {
//   try {
//     const response = await axios.get(
//       `${openRouteServiceURL}/v2/directions/cycling-regular`,
//       {
//         params: {
//           api_key: apiKey,
//           start: `${startCoords[0]},${startCoords[1]}`,
//           end: `${endCoords[0]},${endCoords[1]}`,
//           profile_params: "class:bicycle,greenway",
//         },
//       }
//     );

//     const routeData = response.data;
//     return routeData;
//     // Traitez les données de l'itinéraire ici
//   } catch (error) {
//     console.error("Erreur lors de la récupération de l'itinéraire :", error);
//   }
// };

export const fetchSuggestions = async (input) => {
  const apiUrl = `https://api.openrouteservice.org/geocode/autocomplete?text=${input}&boundary.country=FR&api_key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error(error);
  }
};

export const geocodeAddress = async (address) => {
  const apiUrl = `${openRouteServiceURL}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
    address
  )}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const firstResult = data.features[0];
    if (firstResult) {
      const coordinates = firstResult.geometry.coordinates;
      return coordinates;
    } else {
      throw new Error("Adresse introuvable");
    }
  } catch (error) {
    console.error("Erreur de géocodage :", error);
    throw error;
  }
};
export const directions = async (
  startCoords,
  endCoords,
  preference,
  maxNBRoute = 3,
  bearing = [[]]
) => {
  console.log("directions", startCoords, endCoords, preference, maxNBRoute);
  let alternative_routes = { target_count: 3 };

  if (maxNBRoute < 2) alternative_routes = {};

  try {
    const response = await fetch(
      `${openRouteServiceURL}/v2/directions/cycling-regular/geojson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          coordinates: [startCoords, endCoords],
          extra_info: [
            "green",
            "traildifficulty",
            "waytype",
            "waycategory",
            "surface",
            "steepness",
          ],
          geometry_simplify: "false",
          instructions: "true",
          instructions_format: "html",
          language: "fr-fr",
          maneuvers: "true",
          preference: preference,
          alternative_routes: alternative_routes,
          attributes: ["avgspeed", "percentage"],
          roundabout_exits: "true",
          elevation: "true",
          bearings: bearing,
          geometry: "true",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const routeData = await response.json();
    return routeData;
  } catch (error) {
    console.error("Erreur de calcul d'itinéraire :", error);
    throw error;
  }
};

export const calculateMultipleRoutes = async (
  startCoords,
  endCoords,
  maxNBRoute = 1,
  bearing = [[]]
) => {
  try {
    const preferences = ["fastest", "shortest", "recommended"]; // Ajoutez ici d'autres préférences si nécessaire

    const uniqueRoutes = new Set(); // Set to store unique route coordinates

    const routeOptions = await calculateRoute(
      startCoords,
      endCoords,
      preferences,
      maxNBRoute,
      bearing
    );

    console.log("routeOptions: ", routeOptions);
    return routeOptions;
  } catch (error) {
    console.error("Erreur lors de la récupération des itinéraires :", error);
  }
};

export const calculateRoute = async (
  startCoords,
  endCoords,
  preferences,
  maxNBRoute = 3,
  bearing
) => {
  try {
    const preferencesSelected = preferences || ["recommended"];

    //  const preferences = ["fastest", "shortest", "recommended"]; // Ajoutez ici d'autres préférences si nécessaire

    const uniqueRoutes = new Set(); // Set to store unique route coordinates

    const routeOptions = [];
    for (const preference of preferencesSelected) {
      const routeData = await directions(
        startCoords,
        endCoords,
        preference,
        maxNBRoute,
        bearing
      );

      const routeCoordinates = routeData.features[0].geometry.coordinates;
      const instructions = routeData.features[0].properties.segments[0].steps;
      const distanceMeter =
        routeData.features[0].properties.segments[0].distance;
      const totalDistanceMeter = formatDistance(distanceMeter);
      const vitesseMeter = 25000 / 3600;
      const durationMeter = formatElapsedTime(distanceMeter / vitesseMeter);

      // Convert route coordinates to a string to check for uniqueness
      const routeCoordinatesString = JSON.stringify(routeCoordinates);

      // Check if the route coordinates are unique
      if (!uniqueRoutes.has(routeCoordinatesString)) {
        // If unique, add to the set and push to routeOptions
        uniqueRoutes.add(routeCoordinatesString);

        // Reformatting routeCoordinates to match the expected format for Polyline
        const formattedRouteCoordinates = routeCoordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
          altitude: coord[2],
        }));
        routeOptions.push({
          coordinates: formattedRouteCoordinates,
          instructions: instructions,
          routeDistance: totalDistanceMeter,
          duration: durationMeter,
        });
      }
    }
    return routeOptions;
  } catch (error) {
    console.error("Erreur lors de la récupération des itinéraires :", error);
  }
};
