const axios = require('axios');

module.exports = async (req, res) => {
  // Set proper JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed - Use POST' 
    });
  }
  
  try {
    console.log('Extract API called');
    console.log('Request body:', req.body);
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'TeraBox URL is required' 
      });
    }
    
    if (!url.includes('terabox.com') && !url.includes('1024tera')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid TeraBox URL format' 
      });
    }
    
    console.log('Processing URL:', url);
    
    // XDisk API call with your API key
    const XDISK_API_KEY = '2656ju7rystswrgexesz';
    
    console.log('Calling XDisk API...');
    
    const xdiskResponse = await axios({
      method: 'POST',
      url: `https://xdisk.site/api/${XDISK_API_KEY}/process`,
      data: {
        url: url,
        type: 'terabox',
        action: 'extract'
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000,
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });
    
    console.log('XDisk API Status:', xdiskResponse.status);
    console.log('XDisk API Response:', xdiskResponse.data);
    
    // Check if XDisk API returned valid data
    if (xdiskResponse.status !== 200) {
      throw new Error(`XDisk API returned ${xdiskResponse.status}: ${xdiskResponse.statusText}`);
    }
    
    const responseData = xdiskResponse.data;
    
    // Check for various possible response formats
    let videoUrl = null;
    let filename = 'TeraBox Video';
    let size = 'Unknown Size';
    
    if (responseData) {
      // Try different possible field names
      videoUrl = responseData.stream_url || 
                 responseData.direct_url || 
                 responseData.url || 
                 responseData.download_url ||
                 responseData.video_url;
      
      filename = responseData.filename || 
                 responseData.name || 
                 responseData.title || 
                 'TeraBox Video';
      
      size = responseData.size || 
             responseData.file_size || 
             'Unknown Size';
    }
    
    if (!videoUrl) {
      console.error('No video URL in XDisk response:', responseData);
      return res.status(404).json({
        success: false,
        error: 'Video URL not found in XDisk response',
        debug: responseData
      });
    }
    
    console.log('Video URL extracted:', videoUrl);
    
    // Return success response in proper JSON format
    return res.status(200).json({
      success: true,
      data: {
        video_url: videoUrl,
        filename: filename,
        size: size,
        direct_stream: true
      },
      method: 'XDisk API',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Extract API Error:', error);
    
    // Always return JSON, never HTML
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Unknown extraction error';
    
    const statusCode = error.response?.status || 500;
    
    return res.status(statusCode).json({
      success: false,
      error: `Video extraction failed: ${errorMessage}`,
      debug: {
        originalUrl: req.body?.url,
        errorType: error.name,
        statusCode: statusCode
      },
      timestamp: new Date().toISOString()
    });
  }
};
