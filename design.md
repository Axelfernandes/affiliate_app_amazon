### Project Plan: "Auto-Niche"

#### 1. Core Architecture (AWS Amplify Gen 2)
*   **Frontend:** React (TypeScript) + Tailwind CSS + Lucide React (icons).
*   **Backend:** AWS Amplify Data (DynamoDB + AppSync).
*   **AI/Compute:** AWS Lambda (Node.js) wrapping the **Gemini API**.

#### 2. Data Models
*   `Product`: { id, name, affiliateLink, description, aiReview, images, status (DRAFT/PUBLISHED) }
*   `Suggestion`: { id, sourceUrl, productName, reasonForSuggestion }

#### 3. Development Roadmap

*   **Phase 1: Foundation (Scaffolding)**
    *   Initialize React app and Amplify backend. (Done)
    *   Set up authentication (Admin login).
*   **Phase 2: The Content Engine**
    *   Build the `generateProductContent` Lambda function: Takes a URL/Name -> Uses Gemini to write title, description, and "Why Buy" points -> Returns data.
*   **Phase 3: The Trend Scout**
    *   Build the `findTrends` Lambda function: Searches the web -> Uses Gemini to parse list of potential products.
    *   Build the Admin UI to display these suggestions.
*   **Phase 4: Deployment**
    *   Deploy to AWS Amplify Hosting.
