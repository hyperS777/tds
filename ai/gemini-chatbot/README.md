# Gemini Chatbot ✨

A beautiful AI chatbot powered by Google's **Gemini 2.0 Flash**, deployed to **Cloudflare Workers**.

![Screenshot](https://img.shields.io/badge/Status-Live-brightgreen)

## 🚀 Quick Deploy

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A free [Gemini API key](https://aistudio.google.com/apikey)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This opens your browser — log in and authorize Wrangler.

### 3. Set your Gemini API key as a secret

```bash
cd frontend
npx wrangler secret put GEMINI_API_KEY
```

Paste your API key when prompted. It's stored encrypted — never in code.

### 4. Deploy!

```bash
npm run deploy
```

Cloudflare will output your live URL:

```
https://aichatbot.<your-subdomain>.workers.dev
```

Share this URL with anyone — it works on any device, any browser! 🎉

---

## 🛠️ Local Development

To run the full stack locally (Python backend + Next.js frontend):

### 1. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\pip.exe install -r requirements.txt
```

Create `backend/.env`:

```
GEMINI_API_KEY=your-api-key-here
```

### 2. Set up the frontend

```bash
cd frontend
npm install
```

Update `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run both servers

From the project root:

```bash
npm run dev
```

This starts the Python backend on port **8000** and Next.js on port **3000**.

---

## 📁 Project Structure

```
gemini-chatbot/
├── backend/              # Python FastAPI backend (local dev)
│   ├── main.py           # API server with Gemini streaming
│   ├── .env              # API key (gitignored)
│   └── requirements.txt
├── frontend/             # Next.js frontend + Cloudflare Worker
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API utilities
│   │   └── worker.js     # Cloudflare Worker (replaces backend)
│   ├── wrangler.toml     # Cloudflare deployment config
│   └── package.json
└── package.json          # Root monorepo scripts
```

## ⚡ Architecture

| Environment | Backend          | Frontend        |
| ----------- | ---------------- | --------------- |
| **Local**   | Python (FastAPI) | Next.js dev     |
| **Deployed**| Cloudflare Worker| Static HTML/JS  |

The Cloudflare Worker serves both the static frontend assets and the `/api/chat` endpoint, so everything runs on a single URL with zero cold starts.

---

## 📝 License

MIT
