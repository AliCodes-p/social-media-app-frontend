let socket: WebSocket | null = null;

export function connectChatSocket(userId: number) {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  // Browser automatically includes HttpOnly cookies in WebSocket handshake
  const socketUrl = `ws://localhost:8000/chat/ws`;

  socket = new WebSocket(socketUrl);

  return socket;
}
export function getChatSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  return null;
}

export function disconnectChatSocket() {
  socket?.close();
  socket = null;
}
