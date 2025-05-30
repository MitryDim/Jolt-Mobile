export default [
  {
    id: 1,
    name: "Paris",
    distance: Math.random() * 100, // Distance aléatoire entre 0 et 100
    elapsedTime: Math.floor(Math.random() * 3600), // Temps écoulé aléatoire entre 0 et 3600 secondes
    maxSpeed: Math.floor(Math.random() * 50), // Vitesse maximale aléatoire entre 0 et 50 km/h
    startTime: new Date().toLocaleString(), // Date et heure actuelles
    stopTime: new Date().toLocaleString(), // Date et heure actuelles
    positions: [
      {
        latitude: 37.7749 + Math.random() * 0.1, // Latitude aléatoire autour de San Francisco
        longitude: -122.4194 + Math.random() * 0.1, // Longitude aléatoire autour de San Francisco
      },
      {
        latitude: 37.7749 + Math.random() * 0.1,
        longitude: -122.4194 + Math.random() * 0.1,
      },
      // Ajoutez plus de positions si nécessaire
    ],
  },
  {
    id: 2,
    name: "Test 2",
    distance: Math.random() * 100, // Distance aléatoire entre 0 et 100
    elapsedTime: Math.floor(Math.random() * 3600), // Temps écoulé aléatoire entre 0 et 3600 secondes
    maxSpeed: Math.floor(Math.random() * 50), // Vitesse maximale aléatoire entre 0 et 50 km/h
    startTime: new Date().toLocaleString(), // Date et heure actuelles
    stopTime: new Date().toLocaleString(), // Date et heure actuelles
    positions: [
      {
        latitude: 37.7749 + Math.random() * 0.1, // Latitude aléatoire autour de San Francisco
        longitude: -122.4194 + Math.random() * 0.1, // Longitude aléatoire autour de San Francisco
      },
      {
        latitude: 37.7749 + Math.random() * 0.1,
        longitude: -122.4194 + Math.random() * 0.1,
      },
      // Ajoutez plus de positions si nécessaire
    ],
  },
];