// api/tasks.js - Using Vercel Blob Storage (Correct API)
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'tasks/data.json';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all tasks from blob storage
      const tasks = await getTasks();
      res.status(200).json({ success: true, tasks });
    } 
    else if (req.method === 'POST') {
      // Add or update task
      const task = req.body;
      const tasks = await getTasks();
      
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        // Update existing task
        tasks[existingIndex] = task;
      } else {
        // Add new task
        tasks.push(task);
      }
      
      await saveTasks(tasks);
      res.status(200).json({ success: true, task });
    }
    else if (req.method === 'DELETE') {
      // Delete task
      const { id } = req.query;
      const tasks = await getTasks();
      const filteredTasks = tasks.filter(t => t.id !== parseInt(id));
      
      await saveTasks(filteredTasks);
      res.status(200).json({ success: true });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Helper function to get tasks from blob storage
async function getTasks() {
  try {
    // List blobs to find our tasks file
    const { blobs } = await list({ prefix: 'tasks/' });
    
    if (blobs.length === 0) {
      return []; // No tasks file exists yet
    }
    
    // Get the tasks file URL
    const tasksBlob = blobs.find(blob => blob.pathname === BLOB_FILENAME);
    
    if (!tasksBlob) {
      return [];
    }
    
    // Fetch the content from the blob URL
    const response = await fetch(tasksBlob.url);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('Error reading from blob:', error);
    return [];
  }
}

// Helper function to save tasks to blob storage
async function saveTasks(tasks) {
  try {
    // Put the tasks as a JSON string
    const blob = await put(BLOB_FILENAME, JSON.stringify(tasks, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });
    
    console.log('Saved to blob:', blob.url);
    return blob;
  } catch (error) {
    console.error('Error saving to blob:', error);
    throw error;
  }
}
