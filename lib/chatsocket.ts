let socket: WebSocket | null = null;

export function connectChatSocket(userId: number) {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  const socketUrl = "wss://socialsphereb.duckdns.org/chat/ws";

  console.log("Connecting WebSocket:", socketUrl);

  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("Chat socket connected");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected", event.code, event.reason);

    socket = null;
  };

  return socket;
}

export function getChatSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  console.warn("Socket not connected");

  return null;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
