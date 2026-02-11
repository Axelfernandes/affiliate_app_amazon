import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * AppSync Lambda Resolver Handler
 */
export const handler = async (event: any) => {
  console.log('Received AppSync event:', JSON.stringify(event, null, 2));

  // AppSync passes arguments in event.arguments
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
    // Remove potential markdown code blocks if Gemini includes them
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    // Validate JSON before returning
    try {
      JSON.parse(jsonString);
      return jsonString;
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', text, parseError);
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
