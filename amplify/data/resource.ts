import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateProductContent } from "../function/generateProductContent/resource";
import { findTrends } from "../function/findTrends/resource";

const schema = a.schema({
  Product: a
    .model({
      name: a.string().required(),
      affiliateLink: a.string().required(),
      description: a.string(),
      aiReview: a.string(),
      images: a.string().array(), // Store image URLs
      category: a.string(),
      store: a.string(),
      status: a.string().default("DRAFT"), // DRAFT, PUBLISHED
      currentPrice: a.float(),
      originalPrice: a.float(),
      priceHistory: a.json(), // Stores array of {date: string, price: number}
    })
    .authorization((allow) => [allow.owner()]), // Only owner can create, read, update, delete their products
  Suggestion: a
    .model({
      sourceUrl: a.string().required(),
      productName: a.string().required(),
      reasonForSuggestion: a.string(),
      category: a.string(),
      store: a.string(),
      // Add a field to link to a product if it's approved and added
      approvedProductId: a.id(),
    })
    .authorization((allow) => [allow.owner()]), // Only owner can manage suggestions

  // Define the custom mutation directly as a top-level field in the schema
  generateProductContent: a
    .mutation() // This defines a mutation *field*
    .arguments({
      // Arguments are defined here
      productName: a.string().required(),
      productDescription: a.string(),
      productUrl: a.string(),
    })
    .returns(a.string()) // Return type: JSON string with title, description, whyBuy, price, etc.
    .handler(a.handler.function(generateProductContent))
    .authorization((allow: { authenticated: () => any }) => [
      allow.authenticated(),
    ]),

  // Define a custom query for finding trending products
  findTrends: a
    .query()
    .arguments({
      query: a.string(), // Optional search query for trends
    })
    .returns(a.string()) // Lambda will return a JSON string of suggestions
    .handler(a.handler.function(findTrends))
    .authorization((allow: { authenticated: () => any }) => [
      allow.authenticated(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
