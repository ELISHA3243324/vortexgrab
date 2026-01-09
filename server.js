const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Public Cobalt instances that don't require auth
const COBALT_INSTANCES = [
    'https://cobalt.api.timelessnesses.me/',
    'https://api.cobalt.best/',
    'https://cobalt.canine.tools/'
];

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('🌀 Starting VortexGrab...');

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Try a Cobalt instance
async function tryCobalt(instance, url, type) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
        const response = await fetch(instance, {
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
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        return await response.json();
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
}

// Download endpoint
app.post('/api/download', async (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log('📥 Request:', url, '| Type:', type);

    for (const instance of COBALT_INSTANCES) {
        try {
            console.log('🔄 Trying:', instance);
            const data = await tryCobalt(instance, url, type);
            console.log('📤 Status:', data.status);

            if (data.status === 'error') {
                console.log('❌ Error:', data.error?.code || data.error);
                continue;
            }

            if (data.status === 'redirect' || data.status === 'tunnel' || data.status === 'stream') {
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

        } catch (error) {
            console.log('❌ Failed:', instance, '-', error.message);
            continue;
        }
    }

    res.status(400).json({ error: 'Could not process this URL. Try again later.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌀 VortexGrab running on port ${PORT}`);
});
