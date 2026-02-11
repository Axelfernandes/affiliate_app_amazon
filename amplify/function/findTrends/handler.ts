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
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

    const query = event.arguments?.query || 'bestselling products';
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // ENFORCED: Must use Gemini 2.x family per user requirement.
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
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
        continue; // Try next 2.x model
      }
    }

    return JSON.stringify([
      { productName: "AI Error", sourceUrl: "#", reasonForSuggestion: "Gemini 2.x unavailable: " + (lastError?.message || "Check logs") }
    ]);
  } catch (fatal: any) {
    console.error('Trend Scout Fatal:', fatal);
    return JSON.stringify([
      { productName: "System Error", sourceUrl: "#", reasonForSuggestion: fatal.message }
    ]);
  }
};
