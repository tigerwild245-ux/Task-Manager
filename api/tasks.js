// api/tasks.js - Simplified Vercel Blob Storage
import { put, list, del } from '@vercel/blob';

const BLOB_PATH = 'tasks.json';

// Use the correct token name
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.Task_READ_WRITE_TOKEN;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const tasks = await getTasks();
      return res.status(200).json({ success: true, tasks });
    } 
    
    if (req.method === 'POST') {
      const task = req.body;
      
      if (!task || !task.title) {
        return res.status(400).json({ error: 'Invalid task data' });
      }
      
      const tasks = await getTasks();
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.push(task);
      }
      
      await saveTasks(tasks);
      return res.status(200).json({ success: true, task });
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Task ID required' });
      }
      
      const tasks = await getTasks();
      const filteredTasks = tasks.filter(t => t.id !== parseInt(id));
      
      await saveTasks(filteredTasks);
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function getTasks() {
  try {
    // List all blobs with token
    const { blobs } = await list({ token: BLOB_TOKEN });
    
    // Find our tasks file
    const tasksBlob = blobs.find(blob => blob.pathname === BLOB_PATH);
    
    if (!tasksBlob) {
      console.log('No tasks file found, returning empty array');
      return [];
    }
    
    // Fetch the blob content
    const response = await fetch(tasksBlob.url);
    
    if (!response.ok) {
      console.error('Failed to fetch blob:', response.status);
      return [];
    }
    
    const text = await response.text();
    
    if (!text) {
      return [];
    }
    
    const tasks = JSON.parse(text);
    return Array.isArray(tasks) ? tasks : [];
    
  } catch (error) {
    console.error('Error getting tasks:', error.message);
    return [];
  }
}

async function saveTasks(tasks) {
  try {
    if (!Array.isArray(tasks)) {
      throw new Error('Tasks must be an array');
    }
    
    const jsonData = JSON.stringify(tasks, null, 2);
    
    // Delete old blob if it exists
    try {
      const { blobs } = await list({ token: BLOB_TOKEN });
      const oldBlob = blobs.find(blob => blob.pathname === BLOB_PATH);
      if (oldBlob) {
        await del(oldBlob.url, { token: BLOB_TOKEN });
      }
    } catch (delError) {
      console.log('No old blob to delete or delete failed:', delError.message);
    }
    
    // Create new blob with token
    const blob = await put(BLOB_PATH, jsonData, {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN,
    });
    
    console.log('Tasks saved successfully to:', blob.url);
    return blob;
    
  } catch (error) {
    console.error('Error saving tasks:', error.message);
    throw error;
  }
}