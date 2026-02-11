import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('LAMBDA LOADED - Global scope initialization success');

/**
 * Robustly extract and parse JSON from AI response
 */
function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('JSON.parse failed. Attempting cleanup on string of length:', text.length);
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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] HANDLER INVOKED for:`, event.arguments?.productName);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('FATAL: GEMINI_API_KEY is missing from environment');
      throw new Error('GEMINI_API_KEY not configured.');
    }

    const { productName, productDescription, productUrl } = event.arguments || {};
    if (!productName) throw new Error('productName is required');

    console.log('Initializing GoogleGenerativeAI SDK...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // ENFORCED: Must use Gemini 2.x family.
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-001",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite-preview",
      "gemini-2.0-pro-exp"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[MODEL START] Attempting: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are a professional affiliate marketing copywriter. Generate a compelling product title, a 3-sentence persuasive description, and 3 key "Why Buy" points for:
        
        Product: ${productName}
        ${productDescription ? `Details: ${productDescription}` : ''}
        ${productUrl ? `URL: ${productUrl}` : ''}
        
        Return ONLY valid JSON:
        {"title": "...", "description": "...", "whyBuy": ["...", "...", "..."]}`;

        console.log(`[GENERATE START] Calling model.generateContent for ${modelName}...`);
        const result = await model.generateContent(prompt);
        console.log(`[GENERATE END] Received response from ${modelName}`);

        const response = await result.response;
        const text = response.text().trim();
        console.log('Raw AI Output length:', text.length);

        const parsed = extractJSON(text);
        console.log(`[SUCCESS] Generation complete using ${modelName}`);
        return JSON.stringify(parsed);

      } catch (error: any) {
        console.error(`[ERROR] Model ${modelName} failed:`, error?.message || error);
        lastError = error;
        // Continue to try the next 2.x model in the chain
        continue;
      }
    }

    console.error('CRITICAL: All Gemini 2.x models failed initialization or generation.');
    throw lastError || new Error('All Gemini 2.x models failed');

  } catch (topLevelError: any) {
    console.error('FATAL LAMBDA CRASH:', topLevelError);
    // Return a structured error response that the frontend can handle gracefully
    // We stringify it so that AppSync receives a string (as defined in the schema)
    return JSON.stringify({
      title: `${event.arguments?.productName || 'Product'} (Draft)`,
      description: `AI Fail (2.x Models): ${topLevelError.message || 'The AI service encountered a fatal error'}.`,
      whyBuy: ["Verify Gemini 2.x account access", "Check AWS Lambda logs", "Manual edit recommended"]
    });
  }
};
