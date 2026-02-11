import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Robustly extract and parse JSON from AI response
 */
function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e2) {
        throw new Error('Invalid JSON structure');
      }
    }
    throw new Error('No JSON array found in response');
  }
}

export const handler = async (event: any) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

  const query = event.arguments?.query || 'bestselling products';
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const simulatedResults = [
        { title: 'Best Wireless Tech 2024', url: 'https://amazon.com', content: 'Top rated lifestyle tech gadgets.' },
        { title: 'Smart Home Essentials', url: 'https://amazon.com', content: 'Automate your living space with these picks.' }
      ];

      const prompt = `Identify 3 trending products for: "${query}".
      Return ONLY a JSON array: [{"productName": "...", "sourceUrl": "...", "reasonForSuggestion": "..."}]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const parsed = extractJSON(text);
      return JSON.stringify(parsed);
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error?.message);
      lastError = error;
      if (error?.message?.includes('404')) continue;
      break;
    }
  }

  return JSON.stringify([
    { productName: "Error: " + (lastError?.message || "AI Busy"), sourceUrl: "#", reasonForSuggestion: "AI service currently unavailable." }
  ]);
};
