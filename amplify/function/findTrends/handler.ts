import type { APIGatewayProxyHandler } from 'aws-lambda';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual Gemini API Key from environment variables or Secrets Manager
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // In a real scenario, this would involve calling a web search API (e.g., Google Custom Search, SerpApi)
  // or scraping curated "best seller" lists. For this example, we'll simulate a search result.
  const simulatedSearchResults = [
    { title: 'Bestselling Wireless Earbuds on Amazon', url: 'https://amazon.com/earbuds', content: 'Top rated noise-cancelling earbuds, long battery life, comfortable fit.' },
    { title: 'Popular Smartwatch for Fitness Tracking', url: 'https://amazon.com/smartwatch', content: 'Measures heart rate, GPS, sleep tracking, waterproof.' },
    { title: 'Gaming Headset for PC and Console', url: 'https://amazon.com/gaming-headset', content: 'Immersive sound, comfortable earcups, detachable mic.' },
  ];

  const searchQueries = (event.queryStringParameters?.query || 'bestselling products').split(',');

  // Construct a prompt for Gemini to extract product information from search results
  const prompt = `You are a trend analyst for an affiliate marketing site. Analyze the following search results for trending products in the category: "${searchQueries.join(', ')}". 
  For each result, identify a single main product, extract its name, and a concise reason why it's trending.
  
  Search results:
  ${simulatedSearchResults.map((result, i) => (i + 1) + '. Title: ' + result.title + '\nURL: ' + result.url + '\nContent: ' + result.content).join('\n\n')}
  
  IMPORTANT: Return ONLY a valid JSON array of objects. No other text or markdown formatting.
  Format your response EXACTLY like this:
  [
    {"productName": "Product A", "sourceUrl": "...", "reasonForSuggestion": "..."},
    {"productName": "Product B", "sourceUrl": "...", "reasonForSuggestion": "..."}
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Remove potential markdown code blocks
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    let suggestions;
    try {
      suggestions = JSON.parse(jsonString);
    } catch (parseError: unknown) {
      console.error('Failed to parse Gemini output as JSON for findTrends:', text, parseError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ message: 'Error parsing Gemini output for suggestions', error: parseError instanceof Error ? parseError.message : String(parseError) }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify(suggestions),
    };
  } catch (error: unknown) {
    console.error('Error finding trends with Gemini:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'Error finding trends', error: error instanceof Error ? error.message : String(error) }),
    };
  }
};
