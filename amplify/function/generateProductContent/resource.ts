import { defineFunction, secret } from '@aws-amplify/backend';
import { NodeVersion } from '@aws-amplify/backend-function';

export const generateProductContent = defineFunction({
  name: 'generateProductContent', // Explicitly name the function
  entry: './handler.ts',
  runtime: 20 as NodeVersion, // Use the correct numeric value for NodeVersion
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
