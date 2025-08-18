const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const { url } = req.query;
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://xdisk.site/'
      }
    });
    
    res.setHeader('Content-Type', 'video/mp4');
    response.data.pipe(res);
    
  } catch (error) {
    res.status(500).json({ error: 'Stream failed' });
  }
};
