import { defineFunction, secret } from '@aws-amplify/backend';
import { NodeVersion } from '@aws-amplify/backend-function';

export const findTrends = defineFunction({
  name: 'findTrends', // Explicitly name the function
  entry: './handler.ts',
  runtime: 20 as NodeVersion,
  environment: {
    // We'll add any necessary environment variables here, e.g., for Google Search API
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
