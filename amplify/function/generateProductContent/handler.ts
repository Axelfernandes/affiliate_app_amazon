import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Robustly extract and parse JSON from AI response
 */
function extractJSON(text: string) {
  try {
    // Try a direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Attempt to extract content between first { and last }
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e2) {
        console.error('Failed to parse candidate JSON:', jsonCandidate);
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

  const { productName, productDescription, productUrl } = event.arguments || {};

  if (!productName) {
    throw new Error('productName is required');
  }

  try {
    const prompt = `You are a high-end affiliate marketing copywriter. Generate a compelling product title, a 3-sentence persuasive description, and 3 key "Why Buy" points for the following product. 
    The goal is to drive Amazon affiliate sales. Make the "Why Buy" points focused on user benefits.
    
    Product Name: ${productName}
    ${productDescription ? `Product Description: ${productDescription}` : ''}
    ${productUrl ? `Product URL: ${productUrl}` : ''}
    
    IMPORTANT: Return ONLY a valid JSON object. No other text or markdown formatting.
    Format your response EXACTLY like this:
    {
      "title": "...",
      "description": "...",
      "whyBuy": ["point 1", "point 2", "point 3"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log('Gemini Raw Text Output:', text);

    try {
      const parsed = extractJSON(text);
      // Normalize back to a string for the AppSync String return type
      return JSON.stringify(parsed);
    } catch (parseError) {
      console.error('Failed to parse Gemini output:', text, parseError);
      return JSON.stringify({
        title: `AI Generated: ${productName}`,
        description: text.substring(0, 150) + '...',
        whyBuy: ['AI could not format points', 'Please review manually'],
      });
    }
  } catch (error: unknown) {
    console.error('Error generating content with Gemini:', error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};
