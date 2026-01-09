const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Temp directory
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('🌀 Starting VortexGrab...');

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Test yt-dlp
app.get('/api/test', (req, res) => {
    const ytdlp = spawn('yt-dlp', ['--version']);
    let output = '';
    
    ytdlp.stdout.on('data', (data) => output += data);
    ytdlp.on('close', (code) => {
        if (code === 0) {
            res.json({ status: 'ok', version: output.trim() });
        } else {
            res.status(500).json({ status: 'error', message: 'yt-dlp not working' });
        }
    });
    ytdlp.on('error', () => {
        res.status(500).json({ status: 'error', message: 'yt-dlp not found' });
    });
});

// Get video info
app.post('/api/info', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log('📥 Info:', url);

    const ytdlp = spawn('yt-dlp', [
        '--dump-json',
        '--no-playlist',
        '--no-warnings',
        url
    ]);

    let output = '';
    let error = '';

    ytdlp.stdout.on('data', (data) => output += data);
    ytdlp.stderr.on('data', (data) => error += data);

    ytdlp.on('close', (code) => {
        if (code !== 0) {
            console.log('❌ Error:', error);
            return res.status(400).json({ error: 'Could not fetch video info' });
        }

        try {
            const info = JSON.parse(output);
            res.json({
                title: info.title || 'Unknown',
                thumbnail: info.thumbnail || null,
                duration: info.duration || 0,
                uploader: info.uploader || 'Unknown'
            });
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse info' });
        }
    });

    ytdlp.on('error', () => {
        res.status(500).json({ error: 'yt-dlp failed to start' });
    });
});

// Download
app.post('/api/download', (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log('📥 Download:', url, type);

    const fileId = crypto.randomBytes(8).toString('hex');
    const outputPath = path.join(TEMP_DIR, `${fileId}.%(ext)s`);

    const args = [
        '-o', outputPath,
        '--no-playlist',
        '--no-warnings'
    ];

    if (type === 'audio') {
        args.push('-x', '--audio-format', 'mp3');
    } else {
        args.push('-f', 'best[ext=mp4]/best');
    }

    args.push(url);

    const ytdlp = spawn('yt-dlp', args);
    let error = '';

    ytdlp.stderr.on('data', (data) => error += data);

    ytdlp.on('close', (code) => {
        if (code !== 0) {
            console.log('❌ Download error:', error);
            return res.status(400).json({ error: 'Download failed' });
        }

        // Find downloaded file
        const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(fileId));
        if (files.length === 0) {
            return res.status(500).json({ error: 'File not found' });
        }

        const filePath = path.join(TEMP_DIR, files[0]);
        const ext = path.extname(files[0]);
        const downloadName = `vortexgrab_download${ext}`;

        res.download(filePath, downloadName, () => {
            // Delete file after download
            setTimeout(() => {
                try { fs.unlinkSync(filePath); } catch (e) {}
            }, 5000);
        });
    });

    ytdlp.on('error', () => {
        res.status(500).json({ error: 'yt-dlp failed' });
    });
});

// Cleanup old files every 5 min
setInterval(() => {
    try {
        const files = fs.readdirSync(TEMP_DIR);
        const now = Date.now();
        files.forEach(f => {
            try {
                const fp = path.join(TEMP_DIR, f);
                if (now - fs.statSync(fp).mtimeMs > 300000) {
                    fs.unlinkSync(fp);
                }
            } catch (e) {}
        });
    } catch (e) {}
}, 300000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌀 VortexGrab running on port ${PORT}`);
});
