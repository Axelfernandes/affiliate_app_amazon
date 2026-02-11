import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Robustly extract and parse JSON from AI response
 */
function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e2) {
        throw new Error('Invalid JSON structure');
      }
    }
    throw new Error('No JSON object found in response");
  }
}

/**
 * AppSync Lambda Resolver Handler
 */
export const handler = async (event: any) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

  const { productName, productDescription, productUrl } = event.arguments || {};
  if (!productName) throw new Error('productName is required');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Preferred models in order
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `You are a professional affiliate marketing copywriter. Generate a compelling product title, a 3-sentence persuasive description, and 3 key "Why Buy" points for the following:
      
      Product Name: ${productName}
      ${productDescription ? `Product Description: ${productDescription}` : ''}
      ${productUrl ? `Product URL: ${productUrl}` : ''}
      
      IMPORTANT: Return ONLY a valid JSON object.
      {
        "title": "...",
        "description": "...",
        "whyBuy": ["point 1", "point 2", "point 3"]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const parsed = extractJSON(text);
      return JSON.stringify(parsed);

    } catch (error: any) {
      console.warn(`Model ${modelName} attempt failed:`, error?.message);
      lastError = error;
      if (error?.message?.includes('404')) continue;
      break;
    }
  }

  // Graceful fallback if all AI attempts fail
  return JSON.stringify({
    title: `${productName} (Draft)`,
    description: "AI generation failed. Please check your configuration or enter details manually.",
    whyBuy: ["Check API Key", "Verify Model Access", "Manual Review Recommended"]
  });
};
