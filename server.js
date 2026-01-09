const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Try multiple free APIs
async function tryDownload(url, type) {
    const videoId = extractVideoId(url);
    
    // API 1: y2mate style endpoint
    try {
        const analyzeRes = await fetch('https://ab.cococococ.com/ajax/download/pre', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `url=${encodeURIComponent(url)}&lang=en`
        });
        const analyzeData = await analyzeRes.json();
        if (analyzeData.url) {
            return { success: true, url: analyzeData.url };
        }
    } catch (e) {
        console.log('API 1 failed:', e.message);
    }

    // API 2: Different endpoint
    try {
        const res = await fetch(`https://cdn50.savetube.su/info?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.data && data.data.video_formats) {
            const format = type === 'audio' 
                ? data.data.audio_formats?.[0] 
                : data.data.video_formats.find(f => f.quality === '720p') || data.data.video_formats[0];
            if (format?.url) {
                return { success: true, url: format.url, title: data.data.title };
            }
        }
    } catch (e) {
        console.log('API 2 failed:', e.message);
    }

    // API 3: Another free service
    try {
        const res = await fetch(`https://api.vevioz.com/api/button/mp4/${videoId}`);
        const html = await res.text();
        const urlMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
        if (urlMatch) {
            return { success: true, url: urlMatch[1] };
        }
    } catch (e) {
        console.log('API 3 failed:', e.message);
    }

    // API 4: Yet another
    try {
        const res = await fetch(`https://p.oceansaver.in/ajax/download.php?format=720&url=${encodeURIComponent(url)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await res.json();
        if (data.url) {
            return { success: true, url: data.url };
        }
    } catch (e) {
        console.log('API 4 failed:', e.message);
    }

    return { success: false, error: 'All download services are currently unavailable. Please try again later.' };
}

// Download endpoint
app.post('/api/download', async (req, res) => {
    const { url, type } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log('Request:', url, '| Type:', type);
    
    const result = await tryDownload(url, type);
    
    if (result.success) {
        console.log('Success!');
        res.json(result);
    } else {
        console.log('Failed:', result.error);
        res.status(400).json({ error: result.error });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`VortexGrab running on port ${PORT}`);
});
