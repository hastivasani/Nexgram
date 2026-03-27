import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : window.location.origin;

let socket = null;
let currentUserId = null;

export const getSocket = (userId) => {
  if (socket && currentUserId !== userId) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["polling", "websocket"],
    });
    currentUserId = userId;
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};
