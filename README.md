# Weather Insight (PMA Assessment)

![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

A responsive, real-time weather application built for the Product Manager Accelerator AI Engineer Intern technical assessment.

🔗 [Try the Live Demo →](https://pma-weather-app-assessment.vercel.app/)

## Project Structure
weather-app/
├─ src/
│   ├─ components/       # Reusable UI components
│   ├─ hooks/            # Custom React hooks (API fetching)
│   ├─ services/         # OpenWeatherMap API integration
│   └─ App.tsx           # Main application logic
├─ public/               # Static assets
└─ README.md

## Quick Start

### 1. Clone and Install
git clone https://github.com/koushik2117/pma-weather-app-assessment.git
cd pma-weather-app-assessment
npm install

### 2. Set Up Environment Variables
Create a `.env` file in the root and add your API key:
VITE_OPENWEATHER_API_KEY=your_api_key_here

### 3. Run Development Server
npm run dev

## Key Features

| Feature | Description |
| :--- | :--- |
| **Real-time Search** | Instant weather updates for any city worldwide. |
| **Dynamic Icons** | Visual weather representation based on current conditions. |
| **Responsive Design** | Optimized for mobile, tablet, and desktop views. |
| **Error Handling** | Graceful handling of invalid city names or API failures. |

## Tech Stack
- **Frontend:** React with TypeScript
- **Bundler:** Vite
- **API:** OpenWeatherMap
- **Deployment:** Vercel
