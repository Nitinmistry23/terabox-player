const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'TeraBox URL required' });
    }
    
    console.log('Processing TeraBox URL:', url);
    
    // XDisk API call with your API key
    const XDISK_API_KEY = '2656ju7rystswrgexesz';
    
    const response = await axios.post(`https://xdisk.site/api/${XDISK_API_KEY}/process`, {
      url: url,
      type: 'terabox',
      action: 'extract'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 45000
    });
    
    console.log('XDisk API Response:', response.data);
    
    // Check if we got valid response
    if (response.data && (response.data.stream_url || response.data.direct_url || response.data.url)) {
      const videoUrl = response.data.stream_url || response.data.direct_url || response.data.url;
      
      return res.json({
        success: true,
        data: {
          video_url: videoUrl,
          filename: response.data.filename ||
