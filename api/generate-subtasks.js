// api/generate-subtasks.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { title, desc } = req.body;

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
              category: { type: "STRING", enum: ["design", "dev", "marketing", "other"] }
            },
            required: ["title", "priority", "category"]
          }
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
