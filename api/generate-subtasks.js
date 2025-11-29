export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // Add this validation
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable not set');
    return res.status(500).json({ error: 'API configuration error' });
  }

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
              category: { type: "STRING" }
            },
            required: ["title", "priority", "category"]
          }
        }
      }
    };

    // ✅ Fixed: Using gemini-2.5-flash without date suffix
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
        const subtasks = JSON.parse(jsonText);
        return res.status(200).json(subtasks);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return res.status(500).json({ error: 'Failed to parse structured subtasks from model response.' });
      }
    } else {
      return res.status(500).json({ error: 'Model response was empty or could not be processed.' });
    }
  } catch (error) {
    console.error('Handler Network/Setup Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
