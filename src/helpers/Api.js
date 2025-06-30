import { formatDistance, formatElapsedTime } from "../utils/Utils";
import { EXPO_API_KEY_OPENROUTESERVICE, EXPO_OPENROUTESERVICE_URL } from "@env";



export const geocodeAddress = async (address) => {
  const apiUrl = `${EXPO_OPENROUTESERVICE_URL}/geocode/search?api_key=${EXPO_API_KEY_OPENROUTESERVICE}&text=${encodeURIComponent(
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
  bearing = [[]],
  allCoords = null,
  continue_straight = null
) => {
  let alternative_routes = { target_count: 3 };

  try {
    const coordinates = allCoords || [startCoords, endCoords]; // <-- utilise tous les points si fournis

    const body = {
      coordinates: coordinates,
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
      preference: preference, // "fastest", "shortest", "recommended"
      attributes: ["avgspeed", "percentage"],
      roundabout_exits: "true",
      elevation: "true",
      geometry: "true",
    };

    if (continue_straight) {
      body.continue_straight = continue_straight;
    }
    //"Parameter 'alternative_routes' is incompatible with parameter '(number of waypoints > 2)'."
    if (maxNBRoute > 1) {
      body.alternative_routes = alternative_routes;
    }

    if (bearing && bearing.length > 0) {
      body.bearings = bearing;
    }


    const response = await fetch(
      `${EXPO_OPENROUTESERVICE_URL}/v2/directions/cycling-regular/geojson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${EXPO_API_KEY_OPENROUTESERVICE}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.error(
        "Erreur lors de la récupération des directions :",
        response
      );
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
    const preferences = ["fastest", "shortest", "recommended"];

    const uniqueRoutes = new Set();

    const routeOptions = await calculateRoute(
      startCoords,
      endCoords,
      preferences,
      maxNBRoute,
      bearing
    );

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
  bearing,
  allCoords = null,
  continue_straight = null
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
        bearing,
        allCoords,
        continue_straight
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
          segments: routeData.features[0].properties.segments,
        });
      }
    }
    return routeOptions;
  } catch (error) {
    console.error("Erreur lors de la récupération des itinéraires :", error);
  }
};
