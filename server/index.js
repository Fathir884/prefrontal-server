const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Allow large payloads for backups

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// --- Routes ---

// 1. Health Check
app.get('/', (req, res) => {
    res.json({ status: 'Online', message: 'SuperApp Cloud Server is running! 🚀' });
});

// 2. Push Data (Backup)
app.post('/api/sync/push', async (req, res) => {
    try {
        const { username, data, deviceId, timestamp } = req.body;

        if (!username || !data) {
            return res.status(400).json({ error: 'Missing username or data' });
        }

        const userDir = path.join(DATA_DIR, username);
        await fs.ensureDir(userDir);

        // Save latest data
        await fs.writeJson(path.join(userDir, 'backup_latest.json'), {
            data,
            lastUpdated: timestamp || new Date().toISOString(),
            deviceId
        });

        // Save history (optional, keep last 5 backups per user?)
        // For now, simple overwrite model is enough for MVP

        console.log(`[PUSH] Data received for user: ${username}`);
        res.json({ success: true, message: 'Data synced to cloud successfully.' });

    } catch (error) {
        console.error('Push Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Pull Data (Restore)
app.get('/api/sync/pull/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userDir = path.join(DATA_DIR, username);
        const backupPath = path.join(userDir, 'backup_latest.json');

        if (!await fs.pathExists(backupPath)) {
            return res.status(404).json({ error: 'No backup found for this user.' });
        }

        const backup = await fs.readJson(backupPath);

        console.log(`[PULL] Data sent for user: ${username}`);
        res.json({ success: true, backup });

    } catch (error) {
        console.error('Pull Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`
    ☁️  SuperApp Cloud Server running on http://localhost:${PORT}
    📂  Data Storage: ${DATA_DIR}
    `);
});
