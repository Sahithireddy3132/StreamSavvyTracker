# 🎥📊 StreamSavvyTracker

**StreamSavvyTracker** is a full-stack analytics platform that empowers creators and analysts to **monitor**, **visualize**, and **compare** content performance across major streaming platforms like **YouTube**, **Spotify**, **Twitch**, and **Google Podcasts** — all from a single dashboard.

---

## 🚀 Features

- 🔗 **Multi-platform Integration** — Unified stats from YouTube, Spotify, Twitch, and more
- 📊 **Visual Analytics** — Charts, summaries, and historical trends via Recharts/D3.js
- 🧠 **Smart Insights** — Aggregated metrics, comparisons, and growth over time
- ⚛️ **React + Vite** — Lightning-fast frontend with modern UI/UX
- ⚙️ **FastAPI Backend** — Efficient and scalable API handling
- 💬 **RESTful APIs** — Clean and modular endpoints per platform
- 📈 **Scalable Architecture** — Easily add new streaming platforms
- 🧪 **Tested** — Basic test coverage using `pytest` and `React Testing Library`

---

## 🛠️ Tech Stack

| Frontend             | Backend           | Data Visualization | Styling       |
|----------------------|-------------------|---------------------|----------------|
| React 18 + Vite      | FastAPI (Python)  | Recharts, D3.js     | Tailwind CSS   |
| React Router v6      | HTTPX + Pydantic  | Chart.js (optional) | CSS Modules    |
| Axios                | Async/Await       |                     |                |

---

## 📁 Project Structure

StreamSavvyTracker/
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Dashboard pages per platform
│ │ ├── services/ # API calls using axios
│ │ ├── App.jsx # Main routing and layout
│ │ └── main.jsx # App entry point
│ └── public/ # Static assets
│
├── backend/
│ ├── routers/ # API routes (youtube.py, spotify.py, etc.)
│ ├── services/ # Logic to fetch stats from APIs
│ ├── models/ # Pydantic models for response schemas
│ ├── utils/ # Helper functions (auth, formatting, etc.)
│ └── main.py # FastAPI app initializer
│
├── docs/ # Architecture diagrams and API reference
├── .env # Environment variables (not committed)
├── README.md # Project documentation
└── requirements.txt # Backend dependencies

## 🚦 Setup Instructions

### 🖥️ Frontend

```bash
cd frontend
npm install
npm run dev
⚙️ Backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload
📌 Add .env in backend/:

YOUTUBE_API_KEY=your_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
🌐 API Routes (Example)
Method	Endpoint	Description
GET	/youtube/stats	Get YouTube channel metrics
GET	/spotify/stats	Get Spotify artist/track data
GET	/twitch/stats	Get Twitch streamer info

📊 Dashboard Pages
Page	URL Path	Description
Home	/	Overview and platform summaries
YouTube	/youtube	YouTube stats, video views, subscribers
Spotify	/spotify	Stream counts, follower stats, playlists
Twitch	/twitch	Live stats, followers, avg view time

📦 Deployment
➤ Build frontend for production:
bash
Copy
Edit
npm run build
➤ Run backend in production:

uvicorn main:app --host 0.0.0.0 --port 8000
📤 Deploy using:
Frontend: Vercel, Netlify

Backend: Render, Heroku, Docker + Cloud

📈 Future Enhancements
OAuth 2.0 support for authenticated dashboards

MongoDB/PostgreSQL integration for historical storage

Scheduled fetch with Celery and Redis

Add support for TikTok, LinkedIn Live, Instagram Reels

Notification system (email/slack alerts for sudden spikes)

🧪 Testing

# Frontend (Jest)
npm run test

# Backend (pytest)
pytest

🙌 Acknowledgments

React
FastAPI
YouTube Data API
Spotify Web API
Twitch API
