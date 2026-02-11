import { defineFunction, secret } from '@aws-amplify/backend';
import { NodeVersion } from '@aws-amplify/backend-function';

export const findTrends = defineFunction({
  name: 'findTrends',
  entry: './handler.ts',
  runtime: 20 as NodeVersion,
  memorySize: 512,
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
