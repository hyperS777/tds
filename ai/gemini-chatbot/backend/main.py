"""

Gemini Chatbot — FastAPI Backend
Provides a streaming chat API endpoint powered by Google's Gemini AI.
"""

import os
import json
import asyncio
import logging
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from google import genai

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "your-api-key-here":
    print("[WARNING] GEMINI_API_KEY not set. Update your .env file with a valid key.")
    print("          Get one free at: https://aistudio.google.com/apikey")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# System instruction for the chatbot personality
SYSTEM_INSTRUCTION = (
    "You are Gemini, a helpful and friendly AI assistant. "
    "You provide clear, concise, and accurate answers. "
    "You can help with coding, writing, analysis, math, and general questions. "
    "Format your responses using markdown when appropriate — use code blocks, "
    "bold text, lists, and headers to make your answers easy to read."
)

# FastAPI app
app = FastAPI(
    title="Gemini Chatbot API",
    description="Streaming chat API powered by Google Gemini",
    version="1.0.0",
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request / Response models
class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


# ─── Endpoints ──────────────────────────────────────────────────────────────────


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "model": "gemini-2.0-flash"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Streaming chat endpoint.
    Accepts conversation history and streams Gemini's response as SSE.
    """
    if not client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured. Please set it in your .env file.",
        )

    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    async def event_generator() -> AsyncGenerator[dict, None]:
        max_retries = 3
        retry_delay = 5  # seconds

        try:
            # Build the contents list for Gemini
            contents = []
            for msg in request.messages:
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    genai.types.Content(
                        role=role,
                        parts=[genai.types.Part(text=msg.content)],
                    )
                )

            # Retry loop for rate-limit errors
            for attempt in range(max_retries):
                try:
                    # Stream the response from Gemini
                    async for chunk in client.aio.models.generate_content_stream(
                        model="gemini-2.0-flash",
                        contents=contents,
                        config=genai.types.GenerateContentConfig(
                            system_instruction=SYSTEM_INSTRUCTION,
                            temperature=0.7,
                            max_output_tokens=8192,
                        ),
                    ):
                        if chunk.text:
                            yield {
                                "event": "message",
                                "data": json.dumps({"text": chunk.text}),
                            }

                    # Send a done event
                    yield {
                        "event": "done",
                        "data": json.dumps({"status": "complete"}),
                    }
                    return  # Success — exit the retry loop

                except Exception as e:
                    error_str = str(e)
                    is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str

                    if is_rate_limit and attempt < max_retries - 1:
                        wait = retry_delay * (2 ** attempt)  # exponential backoff
                        logging.warning(
                            f"Rate limited (attempt {attempt + 1}/{max_retries}). "
                            f"Retrying in {wait}s..."
                        )
                        yield {
                            "event": "message",
                            "data": json.dumps(
                                {"text": f"\n⏳ Rate limited — retrying in {wait}s...\n"}
                            ),
                        }
                        await asyncio.sleep(wait)
                        continue
                    else:
                        raise  # Re-raise if not retryable or out of attempts

        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                error_msg = (
                    "Gemini API rate limit exceeded. Your free tier quota may be "
                    "exhausted for today. Please wait a few minutes and try again, "
                    "or upgrade your plan at https://aistudio.google.com/"
                )
            yield {
                "event": "error",
                "data": json.dumps({"error": error_msg}),
            }

    return EventSourceResponse(event_generator())


# ─── Run ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
