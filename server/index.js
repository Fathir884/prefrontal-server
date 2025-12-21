const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
// Use /tmp for serverless environments if needed, but we prefer MongoDB
const DATA_DIR = path.join(__dirname, 'data');
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- MongoDB Schema ---
const backupSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    data: { type: Object, required: true },
    deviceId: String,
    lastUpdated: { type: Date, default: Date.now }
});
const Backup = mongoose.model('Backup', backupSchema);

// --- MongoDB Connection (Serverless Pattern) ---
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (!MONGO_URI) return null; // Local mode
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
            bufferCommands: false, // Penting buat serverless
            serverSelectionTimeoutMS: 5000
        }).then((mongoose) => {
            console.log('✅ New MongoDB Connection');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null; // Reset promise on failure
        throw e;
    }
    return cached.conn;
}

// --- Routes ---

// Helper to ensure DB or Dir
async function prepareStorage() {
    if (MONGO_URI) {
        await connectDB();
    } else {
        try { fs.ensureDirSync(DATA_DIR); } catch (e) { }
    }
}

app.get('/', (req, res) => {
    res.json({
        status: 'Online',
        mode: MONGO_URI ? 'Cloud Database (MongoDB Atlas)' : 'Local File System',
        message: 'SuperApp Server is running! 🚀'
    });
});

// PUSH (Backup)
app.post('/api/sync/push', async (req, res) => {
    // Explicit CORS for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

    try {
        await prepareStorage();

        const { username, data, deviceId, timestamp } = req.body;
        if (!username || !data) return res.status(400).json({ error: 'Missing data' });

        if (MONGO_URI) {
            // Cloud Mode (MongoDB)
            // Use findOneAndUpdate with upsert to Create or Update
            await Backup.findOneAndUpdate(
                { username },
                { data, deviceId, lastUpdated: timestamp || new Date() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`[CLOUD PUSH] Saved for ${username}`);
        } else {
            // Local Mode
            const userDir = path.join(DATA_DIR, username);
            await fs.ensureDir(userDir);
            await fs.writeJson(path.join(userDir, 'backup_latest.json'), {
                data,
                lastUpdated: timestamp || new Date().toISOString(),
                deviceId
            });
            console.log(`[LOCAL PUSH] Saved for ${username}`);
        }

        res.json({ success: true, message: 'Backup successful' });
    } catch (error) {
        console.error('Push Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PULL (Restore)
app.get('/api/sync/pull/:username', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Explicit CORS

    try {
        await prepareStorage();

        const { username } = req.params;
        let backup = null;

        if (MONGO_URI) {
            // Cloud Mode
            const doc = await Backup.findOne({ username });
            if (doc) backup = doc.toObject();
        } else {
            // Local Mode
            const backupPath = path.join(DATA_DIR, username, 'backup_latest.json');
            if (await fs.pathExists(backupPath)) {
                backup = await fs.readJson(backupPath);
            }
        }

        if (!backup) {
            return res.status(404).json({ error: 'No backup found' });
        }

        console.log(`[PULL] Sending data for ${username}`);
        res.json({ success: true, backup });

    } catch (error) {
        console.error('Pull Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Local Development
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
