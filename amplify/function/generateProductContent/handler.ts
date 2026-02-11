/**
 * Minimalist Test Handler
 */
export const handler = async (event: any) => {
  console.log('Received AppSync event:', JSON.stringify(event, null, 2));

  const { productName } = event.arguments || {};

  // Return a static success response to see if bundling is the issue
  return JSON.stringify({
    title: `Static Test: ${productName}`,
    description: "If you see this, the Lambda is running but the AI library had a bundling issue.",
    whyBuy: ["Test point 1", "Test point 2", "Test point 3"]
  });
};
