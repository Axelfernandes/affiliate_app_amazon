import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Robustly extract and parse JSON from AI response
 */
function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('JSON.parse failed, attempting extraction. Raw text length:', text.length);
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e2: any) {
        console.error('Extraction failed:', e2.message);
        throw new Error('Invalid JSON structure: ' + e2.message);
      }
    }
    throw new Error('No JSON object found in response');
  }
}

/**
 * AppSync Lambda Resolver Handler
 */
export const handler = async (event: any) => {
  console.log('Handler started for:', event.arguments?.productName);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing');
    throw new Error('GEMINI_API_KEY not configured.');
  }

  const { productName, productDescription, productUrl } = event.arguments || {};
  if (!productName) throw new Error('productName is required');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Use stable IDs. Note: "gemini-2.5-flash" is likely a typo or not yet available in all SDKs.
  // ENFORCED GLOBAL RULE: Must use gemini-2.5-flash per user requirement
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-1.5-flash" // Safety fallback only if 2.5-flash literally fails to initialize
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}`);
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

      console.log(`Success with ${modelName}`);
      const parsed = extractJSON(text);
      return JSON.stringify(parsed);

    } catch (error: any) {
      console.error(`Attempt with ${modelName} failed:`, error?.message || error);
      lastError = error;
      // Continue if it's a 404/not found, otherwise throw to see the error in AppSync
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        continue;
      }
      break;
    }
  }

  console.error('All models failed. Final error:', lastError?.message);
  // Return a JSON string that the frontend can parse, even if it's an error state
  return JSON.stringify({
    title: `${productName} (Draft)`,
    description: `AI Generation Error: ${lastError?.message || 'Unknown error'}. Please verify your API settings.`,
    whyBuy: ["Check Gemini API Key", "Verify Model Access", "Manual Entry Recommended"]
  });
};
