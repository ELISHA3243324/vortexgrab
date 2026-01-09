const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Temp directory for downloads
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Clean old files every 10 minutes
setInterval(() => {
    try {
        const files = fs.readdirSync(TEMP_DIR);
        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > 10 * 60 * 1000) {
                fs.unlinkSync(filePath);
            }
        });
    } catch (e) {
        console.log('Cleanup error:', e.message);
    }
}, 10 * 60 * 1000);

// Get video info
app.post('/api/info', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const args = [
            '--dump-json',
            '--no-warnings',
            '--no-playlist',
            url
        ];

        const ytdlp = spawn('yt-dlp', args);
        let output = '';
        let errorOutput = '';

        ytdlp.stdout.on('data', (data) => {
            output += data.toString();
        });

        ytdlp.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        ytdlp.on('close', (code) => {
            if (code !== 0) {
                return res.status(400).json({ error: 'Could not fetch video info', details: errorOutput });
            }

            try {
                const info = JSON.parse(output);
                res.json({
                    title: info.title || 'Unknown',
                    thumbnail: info.thumbnail || null,
                    duration: info.duration || 0,
                    uploader: info.uploader || 'Unknown',
                    formats: (info.formats || [])
                        .filter(f => f.ext && (f.vcodec !== 'none' || f.acodec !== 'none'))
                        .map(f => ({
                            format_id: f.format_id,
                            ext: f.ext,
                            quality: f.format_note || f.resolution || 'Unknown',
                            filesize: f.filesize || f.filesize_approx || null,
                            hasVideo: f.vcodec !== 'none',
                            hasAudio: f.acodec !== 'none'
                        }))
                        .slice(0, 15)
                });
            } catch (e) {
                res.status(500).json({ error: 'Failed to parse video info' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Download video
app.post('/api/download', async (req, res) => {
    const { url, format, type } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const fileId = uuidv4();
    const outputTemplate = path.join(TEMP_DIR, `${fileId}.%(ext)s`);

    let args = [
        '-o', outputTemplate,
        '--no-warnings',
        '--no-playlist',
    ];

    if (type === 'audio') {
        args.push('-x', '--audio-format', 'mp3');
    } else if (format) {
        args.push('-f', format);
    } else {
        args.push('-f', 'best[ext=mp4]/best');
    }

    args.push(url);

    try {
        const ytdlp = spawn('yt-dlp', args);
        let errorOutput = '';

        ytdlp.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        ytdlp.on('close', (code) => {
            if (code !== 0) {
                return res.status(400).json({ error: 'Download failed', details: errorOutput });
            }

            const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(fileId));
            if (files.length === 0) {
                return res.status(500).json({ error: 'File not found after download' });
            }

            const filePath = path.join(TEMP_DIR, files[0]);
            const fileName = files[0].replace(fileId + '.', 'vortexgrab_download.');

            res.download(filePath, fileName, (err) => {
                setTimeout(() => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }, 5000);
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check for UptimeRobot
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌀 VortexGrab running on port ${PORT}`);
});
