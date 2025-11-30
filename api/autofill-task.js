// api/autofill-task.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable not set');
    return res.status(500).json({ error: 'API configuration error' });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Missing title in request body.' });
  }

  try {
    const userQuery = `Based on the task title "${title}", suggest appropriate details for this task.`;
    const systemPrompt = `You are a professional project manager. Based on the task title, suggest a professional 2-sentence description, appropriate priority level (low/medium/high/critical), and category. Return ONLY valid JSON.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            desc: { type: "STRING" },
            priority: { 
              type: "STRING", 
              enum: ["low", "medium", "high", "critical"] 
            },
            category: { type: "STRING" }
          },
          required: ["desc", "priority", "category"]
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', result);
      return res.status(response.status).json(result);
    }

    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (jsonText) {
      try {
        const suggestion = JSON.parse(jsonText);
        return res.status(200).json(suggestion);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return res.status(500).json({ 
          error: 'Failed to parse AI suggestion.' 
        });
      }
    } else {
      return res.status(500).json({ 
        error: 'AI response was empty or could not be processed.' 
      });
    }
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
