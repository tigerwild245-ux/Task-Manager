export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { title, desc } = req.body;

  if (!title || !desc) {
      return res.status(400).json({ error: 'Missing title or description in request body.' });
  }

  try {
    const userQuery = `Break down this project into 3-7 actionable subtasks. Title: "${title}". Description: "${desc}"`;
    const systemPrompt = `You are a professional project manager. Generate structured subtasks as JSON only.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              priority: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
              // Removed enum restriction on category for maximum flexibility
              category: { type: "STRING" }
            },
            required: ["title", "priority", "category"]
          }
        }
      }
    };

    // --- FIX: Updated Model Name to gemini-2.5-flash-preview-09-2025 ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    // Check for API errors (e.g., rate limit, invalid key)
    if (!response.ok) {
        console.error('Gemini API Error:', result);
        // Bubble up the API status code and error message
        return res.status(response.status).json(result);
    }
    
    // Safely extract the JSON text from the model's response structure
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (jsonText) {
        try {
            // Parse the JSON string into an object/array
            const subtasks = JSON.parse(jsonText);
            // Send the clean JSON array back to the client
            return res.status(200).json(subtasks);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return res.status(500).json({ error: 'Failed to parse structured subtasks from model response.' });
        }
    } else {
        return res.status(500).json({ error: 'Model response was empty or could not be processed.' });
    }
  } catch (error) {
    // Catches network errors or issues outside the API call
    console.error('Handler Network/Setup Error:', error);
    res.status(500).json({ error: error.message });
  }
};
