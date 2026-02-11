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
    throw new Error('No JSON object found in response');
  }
}

/**
 * AppSync Lambda Resolver Handler
 */
export const handler = async (event: any) => {
  console.log('Received AppSync event:', JSON.stringify(event, null, 2));

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error('Config Error: GEMINI_API_KEY is not set in environment.');
  }

  const { productName, productDescription, productUrl } = event.arguments || {};
  if (!productName) throw new Error('productName is required');

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Standard stable model ID
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a high-end affiliate marketing copywriter. Generate a compelling product title, a 3-sentence persuasive description, and 3 key "Why Buy" points for the following product to drive Amazon affiliate sales.
    
    Product Name: ${productName}
    ${productDescription ? `Product Description: ${productDescription}` : ''}
    ${productUrl ? `Product URL: ${productUrl}` : ''}
    
    IMPORTANT: Return ONLY a valid JSON object. No other text.
    {
      "title": "...",
      "description": "...",
      "whyBuy": ["point 1", "point 2", "point 3"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log('Gemini Raw Text Output:', text);

    const parsed = extractJSON(text);
    return JSON.stringify(parsed);

  } catch (error: any) {
    console.error('Gemini Execution Error:', error);
    return JSON.stringify({
      title: `${productName} (AI Draft)`,
      description: `AI Error: ${error?.message || 'Unknown error'}`,
      whyBuy: ["Service temporarily unavailable", "Check Secret configuration", "Manual entry recommended"]
    });
  }
};
