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
  console.log('Received AppSync event:', JSON.stringify(event, null, 2));

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

  const query = event.arguments?.query || 'bestselling products';
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const simulatedSearchResults = [
        { title: 'Bestselling Wireless Earbuds on Amazon', url: 'https://amazon.com/earbuds', content: 'Top rated noise-cancelling earbuds, long battery life, comfortable fit.' },
        { title: 'Popular Smartwatch for Fitness Tracking', url: 'https://amazon.com/smartwatch', content: 'Measures heart rate, GPS, sleep tracking, waterproof.' },
        { title: 'Gaming Headset for PC and Console', url: 'https://amazon.com/gaming-headset', content: 'Immersive sound, comfortable earcups, detachable mic.' },
      ];

      const prompt = `Identify 3 trending products for: "${query}". Use these results:
      ${JSON.stringify(simulatedSearchResults)}
      
      Return ONLY a JSON array: [{"productName": "...", "sourceUrl": "...", "reasonForSuggestion": "..."}]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const parsed = extractJSON(text);
      return JSON.stringify(parsed);
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error?.message);
      lastError = error;
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        continue;
      }
      break;
    }
  }

  console.error('Trend Scout Error:', lastError);
  return JSON.stringify([
    { productName: "Error: " + (lastError?.message || "Service unreachable"), sourceUrl: "#", reasonForSuggestion: "Please check your AI configuration" }
  ]);
};
