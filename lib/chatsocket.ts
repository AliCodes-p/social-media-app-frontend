let socket: WebSocket | null = null;

export async function connectChatSocket(userId: number) {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  const response = await fetch("/backend/chat/ws-token", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get websocket token");
  }

  const data = await response.json();

  const socketUrl = `wss://socialsphereb.duckdns.org/chat/ws?token=${data.token}`;

  console.log("Connecting WebSocket:", socketUrl);

  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("Chat socket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected:", event.code, event.reason);

    socket = null;
  };

  return socket;
}

export function getChatSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  return null;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
