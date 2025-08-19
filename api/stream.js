const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const { url } = req.query;
    
    if (!url || url === 'undefined' || url === 'null') {
      return res.status(400).json({ error: 'Valid video URL required for streaming' });
    }
    
    console.log('Streaming video from URL:', url);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://xdisk.site/',
        'Accept': '*/*',
        'Range': req.headers.range || ''
      },
      timeout: 120000
    });
    
    // Set proper headers for video streaming
    const contentType = response.headers['content-type'] || 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
      res.status(206); // Partial content for video seeking
    }
    
    // Stream the video data
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Stream API Error:', error.message);
    res.status(500).json({ 
      error: 'Video streaming failed: ' + error.message 
    });
  }
};
