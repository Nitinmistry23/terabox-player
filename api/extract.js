const axios = require('axios');

module.exports = async (req, res) => {
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
    
    // XDisk API call
    const response = await axios.post(`https://xdisk.site/api/${XDISK_API_KEY}/process`, {
      url: url,
      type: 'terabox'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    return res.json({
      success: true,
      data: response.data,
      method: 'XDisk API'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
