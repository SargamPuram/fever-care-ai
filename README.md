FeverAI Frontend
FeverAI is an intelligent fever monitoring, AI-powered triage, and remote outbreak analytics web application. It provides real-time symptom tracking, risk prediction, AI chatbot guidance, critical alerts, and live dashboards for both patients and clinicians. This frontend is built in React 18, focusing on accessibility, multilingual support, and sponsor-grade features for hackathons like YuKeSong 2025.

🚀 Features
AI Voice Chatbot: Voice-enabled chatbot (English/Hindi), powered by Google Gemini Flash API and SiliconFlow, with persistent chat history and clinical context retention.

Symptom Self-Logging: Patients can log and rate symptoms (fever, pain, rash, etc.) using validated severity scales.

Clinician Dashboard: Role-based dashboards with real-time monitoring, patient vitals, symptom timelines, and risk/alert status.

Medication Safety Check: Automated detection of contraindications (e.g., aspirin in dengue/hemophilia), cross-referencing allergy & family history.

Real-time Alerts: Dynamic warnings for critical phases (e.g., dengue day 4), push notifications and alert banners.

Outbreak Hotspot Mapping: Interactive maps (Leaflet.js) showing live fever clusters and resource allocation analytics.

Accessible Design: Clean responsive UI, dark mode, voice input/output, and basic keyboard navigation.

Sponsor Integrations: Gemini, SiliconFlow, and Web Speech APIs seamlessly integrated for competition requirements.

🛠️ Tech Stack
Framework: React 18 + Vite + TypeScript

Styling: Tailwind CSS, Shadcn UI

Charts & Maps: Recharts (trends), Leaflet.js (maps)

Voice & Speech: Web Speech API (input/output), Gemini API (AI NLP)

API Access: Axios for backend REST endpoints

State & Forms: React Context & local state, Zod for validation

Testing: Jest, React Testing Library (recommended for additions)

Icons: react-icons for consistent UI metaphors

💡 Getting Started
Prerequisites
Node.js (v18 or newer)

npm or yarn

Install & Run
bash
# Clone the repo
git clone https://github.com/your-org/feverai-frontend.git
cd feverai-frontend

# Install dependencies
npm install

# Set environment variables (create .env)
cp .env.example .env

# Run the frontend (Vite)
npm run dev
The app will start at http://localhost:5173 (or as configured).

Environment Variables
text
VITE_API_URL=https://your-backend-api-url.com
Edit .env with your production backend API URLs.

🔌 API Endpoints Used
Endpoint	Method	Purpose
/gemini/chat	POST	Conversational AI chatbot (Gemini)
/api/medication/analyze	POST	Medication contraindication check
/api/patients, /api/alerts	GET	Patient and alert data for dashboards
/api/siliconflow/ask	POST	Backup AI for symptom & info extraction
(Backend Node.js repo recommended for full API details)

🖼️ Screenshots
🤖 Sponsor Tracks Implemented
Google Gemini/Gemma API: Primary clinical chatbot and medication check

SiliconFlow: Alternative medical knowledge retrieval for backup/fallback

Web Speech API: Real-time voice input/output for accessibility and doctor UX

📣 To Contribute
Clone, fork, and submit pull-requests with clear feature/fix branches.

Please open an issue before major UI/UX or architectural changes.

Use Prettier/ESLint configs for consistent style.

📜 License
MIT License - see LICENSE for full details.

🏥 About
FeverAI was built as part of YuKeSong 2025 hackathon and is designed for real-world scale-up in clinical and public health settings. For backend, ML code, and deployment, contact the maintainers or see the main repo.

