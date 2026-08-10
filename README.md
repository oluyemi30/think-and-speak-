# Off The Cuff — Spontaneous Speaking Gym 🎙️⚡

**Off The Cuff** is an interactive web application and mental gym designed to help speakers, creators, founders, and professionals overcome hesitation, think fast on their feet, and articulate their thoughts clearly on demand.

---

## 🌟 Key Features

### 1. 🎯 Spontaneous Topic Generator (Practice Mode)
- **"Off The Cuff" Mode**: Minimal prep time designed for rapid, spontaneous speaking workouts.
- **"Deep Research" Mode**: Allows a structured research and prep window (1–15 mins) before delivering a presentation or talk.
- **Slot Machine Ticker Animation**: Clicking **"Spin Topic"** triggers a fast-spinning word ticker through creative topics before revealing your assigned challenge.
- **Customizable Timers & Controls**:
  - Adjustable speech durations (1 to 10 minutes).
  - Built-in audio recorder to capture and listen back to your speech.
  - Prep timers with visual countdown progress indicators.

### 2. 💡 Content Creator Engine
- *"I know my niche. I just don't know what to talk about."*
- Enter any niche (e.g., *Web Development, Solana, Personal Finance, AI Tools, Fitness*) to instantly generate high-converting video headlines, hooks, and presentation angles powered by Gemini 3.6 Flash.
- Jump straight from a generated idea into a timed practice session with 1 click.

### 3. 👥 Group Practice Room
- Host live practice rounds with friends, team members, or peer study groups.
- Spin a single topic for everyone in the room.
- 60-second rapid rounds with live peer voting across awards like:
  - 🏆 *Most Compelling Argument*
  - 🎨 *Most Creative Delivery*
  - 😂 *Funniest Answer*

### 4. 📊 Progress & Stats Dashboard
- **Streak Counter**: Track consecutive days of vocal practice.
- **Vocal Metrics**: Monitor total speaking volume, sessions completed, and average self-confidence scores.
- **Practiced Categories**: Visual breakdown across General, Business, Tech, Personal, Philosophy, and Custom niches.
- **Session History Log**: Replay saved audio recordings, view practiced skills, and review self-ratings.

### 5. 🌐 Creator Social Integration
Directly connected with founder & creator **Oluyemi Sopade**:
- **TikTok**: [@oluyemisopade](https://www.tiktok.com/@oluyemisopade)
- **Instagram**: [@oluyemisopade](https://www.instagram.com/oluyemisopade)
- **Facebook**: [Oluyemi Sopade](https://www.facebook.com/share/181PpQgzds/?mibextid=wwXIfr)

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons.
- **Backend API**: Node.js, Express.js server (`server.ts`).
- **AI Integration**: `@google/genai` SDK using `gemini-3.6-flash` with JSON response schemas and structured fallback safeguards.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Gemini API Key from Google AI Studio (`GEMINI_API_KEY`)

### Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:3000` in your browser.

### Building for Production
```bash
# Build Vite frontend and bundle Express server
npm run build

# Start production server
npm start
```

---

## 🎨 Design Philosophy
* Off The Cuff features a custom **Deep Navy & Amber Glow** theme (`#080c14` background with `#f59e0b` golden amber accents).
* Engineered for maximum mobile and desktop responsiveness with fluid typography and glassmorphism UI cards.
