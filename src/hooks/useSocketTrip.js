import io from "socket.io-client";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { useEffect } from "react";

const socket = io("http://192.168.1.88:5006");

export function useTripSocket(
  roomId,
  userId,
  profilePicture,
  onOtherUserPosition
) {
  useEffect(() => {
    socket.emit("joinTrip", { roomId, userId, profilePicture });

    socket.on("userPosition", ({ userId, position, profilePicture }) => {
      onOtherUserPosition(userId, position, profilePicture);
    });

    socket.on("userLeft", ({ userId }) => {
      if (typeof onOtherUserPosition === "function") {
        onOtherUserPosition(userId, null, null, true); // true = suppression
      }
    });

    return () => {
      socket.off("userPosition");
      socket.off("userLeft");
      socket.emit("leaveTrip", { roomId, userId });
    };
  }, [roomId, userId, profilePicture]);

  const sendPosition = (position) => {
    socket.emit("position", { roomId, userId, position, profilePicture });
  };

  return { sendPosition };
}
