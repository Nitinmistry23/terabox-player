const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { url } = req.body;
    const XDISK_API_KEY = '2656ju7rystswrgexesz'; // tumhara API key
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL required' });
    }
    
    console.log('Processing URL:', url);
    
    // XDisk API call
    const response = await axios.post(`https://xdisk.site/api/${XDISK_API_KEY}/process`, {
      url: url,
      type: 'terabox',
      action: 'extract'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    console.log('XDisk Response:', response.data);
    
    if (response.data && (response.data.stream_url || response.data.player_url || response.data.url)) {
      const videoUrl = response.data.stream_url || response.data.player_url || response.data.url;
      
      return res.json({
        success: true,
        data: {
          stream_url: videoUrl,
          filename: response.data.filename || 'TeraBox Video',
          size: response.data.size || '0 MB'
        },
        method: 'XDisk API'
      });
    } else {
      throw new Error('No video URL found in XDisk response');
    }
    
  } catch (error) {
    console.error('Extract error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
