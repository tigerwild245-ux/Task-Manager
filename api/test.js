// api/test.js - Test if Blob is configured
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Check environment variables
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    
    return res.status(200).json({
      status: 'API is working',
      blobConfigured: hasToken,
      env: process.env.NODE_ENV,
      message: hasToken 
        ? 'Blob storage is configured ✓' 
        : 'Blob storage NOT configured ✗ - Check Vercel Storage settings'
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}