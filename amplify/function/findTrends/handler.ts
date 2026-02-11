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
  const query = event.arguments?.query || 'bestselling products';
  const searchQueries = query.split(',');

  // In a real scenario, this would involve calling a web search API
  const simulatedSearchResults = [
    { title: 'Bestselling Wireless Earbuds on Amazon', url: 'https://amazon.com/earbuds', content: 'Top rated noise-cancelling earbuds, long battery life, comfortable fit.' },
    { title: 'Popular Smartwatch for Fitness Tracking', url: 'https://amazon.com/smartwatch', content: 'Measures heart rate, GPS, sleep tracking, waterproof.' },
    { title: 'Gaming Headset for PC and Console', url: 'https://amazon.com/gaming-headset', content: 'Immersive sound, comfortable earcups, detachable mic.' },
  ];

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

    console.log('Gemini Raw Text Output:', text);
    // Remove potential markdown code blocks
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    // Validate JSON before returning
    try {
      JSON.parse(jsonString);
      return jsonString;
    } catch (parseError: unknown) {
      console.error('Failed to parse Gemini output as JSON for findTrends:', text, parseError);
      throw new Error('Invalid JSON returned from AI');
    }
  } catch (error: unknown) {
    console.error('Error finding trends with Gemini:', error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

