import io from "socket.io-client";
import {EXPO_GATEWAY_SERVICE_URL} from "@env"
import { useEffect } from "react";

const socket = io("http://192.168.1.88:5006");

export function useTripSocket(roomId, userId, onOtherUserPosition) {
  useEffect(() => {
    socket.emit("joinTrip", { roomId, userId });

    socket.on("userPosition", ({ userId, position }) => {
      onOtherUserPosition(userId, position);
    });

    return () => {
      socket.off("userPosition");
      socket.emit("leaveTrip", { roomId, userId });
    };
  }, [roomId, userId]);

  const sendPosition = (position) => {
    socket.emit("position", { roomId, userId, position });
  };

  return { sendPosition };
}
