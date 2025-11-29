// api/test.js - Debug endpoint with more details
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Check all possible token names
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const taskToken = process.env.Task_READ_WRITE_TOKEN;
    const anyToken = blobToken || taskToken;
    
    // List all environment variables that contain "BLOB" or "TOKEN"
    const envVars = Object.keys(process.env).filter(key => 
      key.includes('BLOB') || key.includes('TOKEN') || key.includes('Task')
    );
    
    return res.status(200).json({
      status: 'API is working',
      tokenConfigured: !!anyToken,
      blobTokenFound: !!blobToken,
      taskTokenFound: !!taskToken,
      usingToken: blobToken ? 'BLOB_READ_WRITE_TOKEN' : taskToken ? 'Task_READ_WRITE_TOKEN' : 'none',
      availableEnvVars: envVars,
      env: process.env.NODE_ENV,
      message: anyToken 
        ? `Blob storage is configured ✓ (using ${blobToken ? 'BLOB_READ_WRITE_TOKEN' : 'Task_READ_WRITE_TOKEN'})` 
        : 'No blob tokens found - Check environment variables'
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}