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
  try {
    console.log('Handler invoked for:', event.arguments?.productName);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

    const { productName, productDescription, productUrl } = event.arguments || {};
    if (!productName) throw new Error('productName is required');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // ENFORCED: Must use gemini-2.5-flash as the primary choice
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-1.5-flash"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Starting generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are a professional affiliate marketing copywriter. Generate a compelling product title, a 3-sentence persuasive description, and 3 key "Why Buy" points for:
        
        Product: ${productName}
        ${productDescription ? `Details: ${productDescription}` : ''}
        ${productUrl ? `URL: ${productUrl}` : ''}
        
        Return ONLY valid JSON:
        {"title": "...", "description": "...", "whyBuy": ["...", "...", "..."]}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log(`Model ${modelName} success.`);
        const parsed = extractJSON(text);
        return JSON.stringify(parsed);

      } catch (error: any) {
        console.error(`Attempt with ${modelName} failed:`, error?.message || error);
        lastError = error;
        if (error?.message?.includes('404') || error?.message?.includes('not found')) {
          continue;
        }
        // If it's a model specific crash (like 2.5 flash being unavailable or buggy), try the fallback
        continue;
      }
    }

    throw lastError || new Error('All models failed');

  } catch (topLevelError: any) {
    console.error('CRITICAL TOP-LEVEL LAMBDA ERROR:', topLevelError);
    // Return a structured error response that the frontend can handle gracefully
    return JSON.stringify({
      title: `${event.arguments?.productName || 'Product'} (Draft)`,
      description: `AI Fail: ${topLevelError.message || 'The AI service encountered an error'}. Check terminal logs for details.`,
      whyBuy: ["Try again in a moment", "Verify Gemini API access", "Manual edit recommended"]
    });
  }
};
