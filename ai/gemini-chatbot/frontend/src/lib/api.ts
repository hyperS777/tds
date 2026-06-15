/**
 * API utility for communicating with the Python backend.
 * Handles SSE streaming for real-time chat responses.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/**
 * Send a chat message and stream the response token by token.
 */
export async function sendMessage(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Server error: ${response.status}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response stream available");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from the buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      let eventType = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const dataStr = line.slice(5).trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === "message" && data.text) {
              callbacks.onToken(data.text);
            } else if (eventType === "done") {
              callbacks.onDone();
              return;
            } else if (eventType === "error") {
              callbacks.onError(data.error || "Unknown error");
              return;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    // If we reach here without a done event, still call onDone
    callbacks.onDone();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      callbacks.onDone();
      return;
    }
    callbacks.onError(
      error instanceof Error ? error.message : "Failed to connect to the server"
    );
  }
}

/**
 * Check if the backend is healthy.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
