/**
 * ============================================================================
 * ECLIPSE7 NEGATIVE MARKING ENGINE - SECURE SERVER CORE
 * ============================================================================
 * Architecture: Node.js / Express.js / Lowdb Native Persistence
 * System Level: Production Standard
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Layers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Assets (index.html, script.js, style.css, logo.ico)
app.use(express.static(path.join(__dirname, 'public')));

// Persistent Local Database Configuration
const DB_FILE = path.join(__dirname, 'data', 'telemetry_vault.json');

// Ensure Data Directory and Database File Exist
if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ logs: [], configurations: {} }, null, 4));
}

/**
 * HELPER FUNCTIONS: Read / Write Database IO
 */
function readDatabase() {
    try {
        const rawData = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Database Engine Fault (Read):", error);
        return { logs: [], configurations: {} };
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error("Database Engine Fault (Write):", error);
        return false;
    }
}

/**
 * ============================================================================
 * API ROUTING LAYER
 * ============================================================================
 */

/**
 * POST /api/telemetry/submit
 * Receives evaluation data directly from the frontend engine
 */
app.post('/api/telemetry/submit', (req, requireAuth = false) => {
    try {
        const { studentName, testName, examProfile, totalQs, maxMarks, attempted, wrong, scoreMetrics } = req.body;

        if (!studentName || !testName || totalQs === undefined || maxMarks === undefined) {
            return res.status(400).json({ success: false, message: "Missing Required Parameters" });
        }

        const database = readDatabase();
        
        const newRecord = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            studentName: studentName.trim(),
            testName: testName.trim(),
            examProfile,
            totalQs: Number(totalQs),
            maxMarks: Number(maxMarks),
            attempted: Number(attempted),
            wrong: Number(wrong),
            scoreMetrics: scoreMetrics || {}
        };

        database.logs.unshift(newRecord); // Push latest telemetry logs to front
        writeDatabase(database);

        return res.status(201).json({ 
            success: true, 
            message: "Student telemetry payload cataloged securely.",
            recordId: newRecord.id
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Engine Error", error: err.message });
    }
});

/**
 * GET /api/admin/telemetry-stream
 * Retrieves records for admin.html monitoring dashboards
 */
app.get('/api/admin/telemetry-stream', (req, res) => {
    try {
        const database = readDatabase();
        return res.status(200).json({ success: true, logs: database.logs });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to read records." });
    }
});

/**
 * POST /api/admin/purge-logs
 * Destroys all performance index logs
 */
app.post('/api/admin/purge-logs', (req, res) => {
    try {
        const database = readDatabase();
        database.logs = [];
        writeDatabase(database);
        return res.status(200).json({ success: true, message: "Data logs purged completely." });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Purge transaction aborted." });
    }
});

/**
 * Fallback Route handler for sitemap delivery redirection validation
 */
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Boot Master Cluster
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` ECLIPSE7 ENGINE BACKEND DEPLOYED VIA SERVER.JS                  `);
    console.log(` Active Node Platform Listening Node: http://localhost:${PORT}  `);
    console.log(`================================================================`);
});
