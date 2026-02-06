import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { generateProductContent } from '../function/generateProductContent/resource';

const schema = a.schema({
  Product: a
    .model({
      name: a.string().required(),
      affiliateLink: a.string().required(),
      description: a.string(),
      aiReview: a.string(),
      images: a.string().array(), // Store image URLs
      status: a.string().default('DRAFT'), // DRAFT, PUBLISHED
    })
    .authorization((allow) => [allow.owner()]), // Only owner can create, read, update, delete their products
  Suggestion: a
    .model({
      sourceUrl: a.string().required(),
      productName: a.string().required(),
      reasonForSuggestion: a.string(),
      // Add a field to link to a product if it's approved and added
      approvedProductId: a.id(),
    })
    .authorization((allow) => [allow.owner()]), // Only owner can manage suggestions
  
  Mutation: a.query({
    generateProductContent: a
      .string() // The Lambda will return a JSON string
      .arguments({
        productName: a.string().required(),
        productDescription: a.string(),
        productUrl: a.string(),
      })
      .authorization((allow: { owner: () => any }) => [allow.owner()]) // Explicitly type 'allow'
      .resolver(a.resolve.function(generateProductContent)), // Link to Lambda here
  }),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
