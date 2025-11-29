// api/test.js - Debug endpoint with more details
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Check all possible token names
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const taskToken = process.env.Task_READ_WRITE_TOKEN;
    
    // List all environment variables that contain "BLOB" or "TOKEN"
    const envVars = Object.keys(process.env).filter(key => 
      key.includes('BLOB') || key.includes('TOKEN') || key.includes('Task')
    );
    
    return res.status(200).json({
      status: 'API is working',
      blobConfigured: !!blobToken,
      taskTokenFound: !!taskToken,
      availableEnvVars: envVars,
      env: process.env.NODE_ENV,
      message: blobToken 
        ? 'Blob storage is configured ✓' 
        : taskToken
        ? 'Found Task_READ_WRITE_TOKEN but need BLOB_READ_WRITE_TOKEN'
        : 'No blob tokens found - Check environment variables'
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}