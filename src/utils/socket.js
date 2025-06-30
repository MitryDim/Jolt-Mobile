import { io } from "socket.io-client";

let socket = null;

export const createSocket = (jwt,userId, onError) => {
  if (socket) {
    console.log("Déconnexion socket existante");
    socket.disconnect();
    socket = null;
  }

  socket = io("http://192.168.1.88:5005", {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    transports: ["websocket", "polling"],
    auth: { token: jwt },
    forceNew: true,
    autoConnect: false, // contrôle manuel
  });

  socket.on("connect", () => {
    console.log("Socket connectée");
    if (userId) {
      socket.emit("join", userId);
    }
  });

  socket.on("connect_error", (err) => {
    if (onError) onError(err);
    console.warn("Erreur de connexion socket :", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("Socket déconnectée :", reason);

  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log("Tentative de reconnexion socket :", attempt);
  });

  socket.on("reconnect_failed", () => {
    console.warn("Échec de reconnexion socket");
  });

  socket.on("reconnect", (attempt) => {
    console.log("Socket reconnectée après", attempt, "tentatives");
  });

  // Important : connecte manuellement
  socket.connect();

  return socket;
};
