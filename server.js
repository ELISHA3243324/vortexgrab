const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const COBALT_API = 'https://api.cobalt.tools/';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('🌀 Starting VortexGrab...');

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Download via Cobalt
app.post('/api/download', async (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log('📥 Request:', url, '| Type:', type);

    try {
        const response = await fetch(COBALT_API, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                downloadMode: type === 'audio' ? 'audio' : 'auto',
                audioFormat: 'mp3',
                youtubeVideoCodec: 'h264',
                videoQuality: '720'
            })
        });

        const data = await response.json();
        console.log('📤 Cobalt status:', data.status);

        if (data.status === 'error') {
            console.log('❌ Cobalt error:', data.error);
            return res.status(400).json({ 
                error: data.error?.code || 'Could not process this URL'
            });
        }

        if (data.status === 'redirect' || data.status === 'tunnel') {
            return res.json({
                status: 'success',
                url: data.url,
                filename: data.filename || 'download'
            });
        }

        if (data.status === 'picker') {
            const item = data.picker.find(p => 
                type === 'audio' ? p.type === 'audio' : p.type === 'video'
            ) || data.picker[0];
            
            return res.json({
                status: 'success',
                url: item.url,
                filename: item.filename || 'download'
            });
        }

        res.status(400).json({ error: 'Unexpected response from server' });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: 'Server error - please try again' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌀 VortexGrab running on port ${PORT}`);
});
