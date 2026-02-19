const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeDb } = require('./db');
const { Parser } = require('json2csv');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Initialize Database on server start
initializeDb().then((database) => {
    db = database;
    console.log("Connected to SQLite Database");
}).catch((err) => {
    console.error("Database initialization failed:", err);
});

// Helper for Weather API logic (Existing route proxy)
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;
    const API_KEY = process.env.API_KEY || 'e5fc8874aeb5c3f379872955c4c8d051';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// CREATE: Save location, date range, and temperature data
app.post('/api/weather/history', async (req, res) => {
    try {
        const { location, startDate, endDate, temperatureData } = req.body;

        // Basic validation
        if (!location || !startDate || !endDate || !temperatureData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await db.run(
            `INSERT INTO weather_history (location, start_date, end_date, temperature_data) VALUES (?, ?, ?, ?)`,
            [location, startDate, endDate, JSON.stringify(temperatureData)]
        );

        res.status(201).json({ id: result.lastID, message: 'Record created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save weather history' });
    }
});

// READ: Get all history
app.get('/api/weather/history', async (req, res) => {
    try {
        const records = await db.all(`SELECT * FROM weather_history ORDER BY created_at DESC`);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve history' });
    }
});

// UPDATE: Modify a history record
app.put('/api/weather/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { location, startDate, endDate, temperatureData } = req.body;

        if (!location || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = `
            UPDATE weather_history 
            SET location = ?, start_date = ?, end_date = ?, temperature_data = ?
            WHERE id = ?
        `;

        await db.run(query, [location, startDate, endDate, JSON.stringify(temperatureData), id]);
        res.json({ message: 'Record updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update record' });
    }
});

// DELETE: Remove a record
app.delete('/api/weather/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.run(`DELETE FROM weather_history WHERE id = ?`, [id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

// DATA EXPORT: Export records as CSV
app.get('/api/weather/export/csv', async (req, res) => {
    try {
        const records = await db.all(`SELECT * FROM weather_history`);
        if (records.length === 0) {
            return res.status(404).send('No records found to export');
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(records);

        res.header('Content-Type', 'text/csv');
        res.attachment('weather_history.csv');
        return res.send(csv);
    } catch (error) {
        res.status(500).send('Failed to export data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});