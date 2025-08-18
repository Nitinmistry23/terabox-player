const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { url } = req.query;
    
    if (!url || url === 'undefined') {
      return res.status(400).json({ error: 'Valid video URL required' });
    }
    
    console.log('Streaming URL:', url);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://xdisk.site/',
        'Range': req.headers.range || ''
      },
      timeout: 60000
    });
    
    // Set headers for video streaming
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
      res.status(206); // Partial content
    }
    
    // Stream the video
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Stream error:', error.message);
    res.status(500).json({ error: 'Stream failed: ' + error.message });
  }
};
