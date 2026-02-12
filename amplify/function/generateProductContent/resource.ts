import { defineFunction, secret } from "@aws-amplify/backend";
import { NodeVersion } from "@aws-amplify/backend-function";

export const generateProductContent = defineFunction({
  name: "generateProductContent",
  entry: "./handler.ts",
  runtime: 20 as NodeVersion,
  memoryMB: 512,
  timeoutSeconds: 60, // Give AI plenty of time to "think"
  environment: {
    GEMINI_API_KEY: secret("GEMINI_API_KEY"),
    BEST_BUY_API_KEY: secret("BEST_BUY_API_KEY"),
    RAINFOREST_API_AMAZON: secret("RAINFOREST_API_AMAZON"),
  },
});
