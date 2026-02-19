# Product Manager Accelerator - Weather App Assessment

A Full-Stack Weather Application built for the PM Accelerator Engineering Internship assessment. It merges **Tech Assessment #1 (Frontend)** and **Tech Assessment #2 (Backend)** into a single, cohesive, modern project. 

## Features
- **Frontend (React + TypeScript + Tailwind CSS):**
  - **Modern UI:** Glassmorphism design, animated backgrounds, and beautiful Lucide-react icons.
  - **Comprehensive Search:** Search weather by City, ZIP Code (`10001,US`), or Coordinates (`40.7128, -74.0060`).
  - **Geolocation Integration:** Fetch weather directly at your current location using the "Use Current Location" button.
  - **5-Day Forecast:** Displays daily highs & lows and conditions intuitively.
  - **Google Maps Extra API:** Embeds an interactive Google Map of the searched location.
  - **Responsive Layout:** fully optimized for desktops, tablets, and mobile devices.
  - **Robust Error Handling:** Alerts for invalid inputs and API errors.

- **Backend (Express + Node.js + SQLite):**
  - **Data Persistence:** Uses a lightweight SQLite database (zero setup required).
  - **History Tracking/CREATE:** Auto-logs weather queries (location, dates, temperature data) directly to the database.
  - **Full CRUD Support:** `GET`, `POST`, `PUT`, `DELETE` operations on `/api/weather/history` endpoints.
  - **Exporting Feature:** A dedicated `GET /api/weather/export/csv` endpoint lets users export their search history to CSV.

---

## Prerequisites
- Node.js (v16.0 or higher recommended)
- `npm`

---

## How to Run the App

This is a monorepo setup containing both a Server (backend) and a Frontend.

### 1. Run the Backend Service
The backend uses an included SQLite DB which doesn't require extra software.

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express backend:
   ```bash
   node index.js
   ```
   *The server will start on `http://localhost:5000` and automatically create the SQLite database.*

### 2. Run the Frontend Service

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173` to view the app!

---

## Data Export

To preview the CSV Export feature, run the React App, do some weather searches, and then navigate to:
[http://localhost:5000/api/weather/export/csv](http://localhost:5000/api/weather/export/csv)

---

**Built by Candidate Name**
*For the Product Manager Accelerator - Real-World Product Management Internship.* 
