import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    // Other attributes can be added here if needed
  },
  // Optionally, configure social providers
  // cfnResources: {
  //   userPool: {
  //     // Add other CfnUserPool properties here
  //   },
  //   userPoolClient: {
  //     // Add other CfnUserPoolClient properties here
  //   },
  // },
});