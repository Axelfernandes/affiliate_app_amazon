import type { APIGatewayProxyHandler } from 'aws-lambda';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual Gemini API Key from environment variables or Secrets Manager
// For development, you can set it directly here:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Extract product details from the event body
  const { productName, productDescription, productUrl } = JSON.parse(event.body || '{}');

  if (!productName) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'productName is required' }),
    };
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

    let generatedContent;
    try {
      generatedContent = JSON.parse(jsonString);
      console.log('Gemini Parsed Content:', generatedContent);
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', text, parseError);
      // Fallback if Gemini doesn't return perfect JSON
      generatedContent = {
        title: `AI Generated: ${productName}`,
        description: text.substring(0, 150) + '...', // Take first 150 chars as description
        whyBuy: ['AI could not format points', 'Please review manually'],
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify(generatedContent),
    };
  } catch (error: unknown) {
    console.error('Error generating content with Gemini:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'Error generating content', error: error instanceof Error ? error.message : String(error) }),
    };
  }
};
