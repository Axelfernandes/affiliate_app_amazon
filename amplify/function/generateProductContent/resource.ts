import { defineFunction, secret } from '@aws-amplify/backend';
import { NodeVersion } from '@aws-amplify/backend-function';

export const generateProductContent = defineFunction({
  name: 'generateProductContent',
  entry: './handler.ts',
  runtime: 20 as NodeVersion,
  memoryMb: 512, // Correct property name for Amplify Gen 2
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
