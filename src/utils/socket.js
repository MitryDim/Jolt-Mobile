import { io } from "socket.io-client";

export const createSocket = (jwt, onError) => {
  const socket = io("http://192.168.1.88:5005", {
    transports: ["websocket"],
    auth: { token: jwt },
  });

  socket.on("connect_error", (err) => {
    if (onError) onError(err);
    // Tu peux aussi afficher une notification ou logger l’erreur ici
    console.warn("Erreur de connexion socket :", err.message);
  });

  return socket;
};
