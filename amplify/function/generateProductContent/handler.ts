import type { APIGatewayProxyHandler } from 'aws-lambda';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual Gemini API Key from environment variables or Secrets Manager
// For development, you can set it directly here:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

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
    const prompt = `Generate a catchy product title, a 3-sentence description, and 3 key "Why Buy" points for the following product. Ensure the content is engaging and suitable for an Amazon affiliate marketing website.
    
    Product Name: ${productName}
    ${productDescription ? `Product Description: ${productDescription}` : ''}
    ${productUrl ? `Product URL: ${productUrl}` : ''}
    
    Format the output as a JSON object with keys: "title", "description", "whyBuy" (an array of strings).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the JSON output from Gemini
    let generatedContent;
    try {
      generatedContent = JSON.parse(text);
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
