/**
 * Cloudflare Worker — AI Chat API (Groq)
 * Streams AI responses as SSE to the frontend.
 * Uses Groq's free API with Llama 3.3 70B.
 */

const SYSTEM_INSTRUCTION =
  "You are a helpful and friendly AI assistant. " +
  "You provide clear, concise, and accurate answers. " +
  "You can help with coding, writing, analysis, math, and general questions. " +
  "Format your responses using markdown when appropriate — use code blocks, " +
  "bold text, lists, and headers to make your answers easy to read.";

const GROQ_MODEL = "llama-3.3-70b-versatile";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check
    if (url.pathname === "/api/health" && request.method === "GET") {
      return Response.json(
        { status: "ok", model: GROQ_MODEL },
        { headers: corsHeaders }
      );
    }

    // Chat endpoint
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    // Fallback: serve static assets (handled by Cloudflare Workers Assets)
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};

async function handleChat(request, env) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { detail: "GROQ_API_KEY not configured. Add it as a secret in your Cloudflare Worker." },
      { status: 500, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { detail: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { detail: "Messages list cannot be empty." },
      { status: 400, headers: corsHeaders }
    );
  }

  // Build the Groq API request (OpenAI-compatible format)
  const groqMessages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    ...messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
  ];

  const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

  const groqBody = {
    model: GROQ_MODEL,
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 8192,
    stream: true,
  };

  try {
    const groqResponse = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return Response.json(
        { detail: `Groq API error: ${groqResponse.status} — ${errorText}` },
        { status: 502, headers: corsHeaders }
      );
    }

    // Stream the Groq SSE response, re-formatting it for our frontend
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process in background
    (async () => {
      const reader = groqResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (!dataStr || dataStr === "[DONE]") continue;

              try {
                const data = JSON.parse(dataStr);
                const text = data?.choices?.[0]?.delta?.content;
                if (text) {
                  await writer.write(
                    encoder.encode(
                      `event: message\ndata: ${JSON.stringify({ text })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        // Send done event
        await writer.write(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({ status: "complete" })}\n\n`
          )
        );
      } catch (err) {
        await writer.write(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return Response.json(
      { detail: `Failed to connect to Groq API: ${err.message}` },
      { status: 502, headers: corsHeaders }
    );
  }
}
