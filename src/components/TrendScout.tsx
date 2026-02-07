import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type Suggestion = {
  productName: string;
  sourceUrl: string;
  reasonForSuggestion: string;
}

export default function TrendScout() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const handleFindTrends = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const { data, errors } = await client.queries.findTrends({ query: 'bestselling tech gadgets' });
      if (data) {
        const trends = JSON.parse(data);
        setSuggestions(trends);
      }
      if (errors) {
        console.error('Error finding trends:', errors);
        alert(`Error finding trends: ${errors[0].message}`);
      }
    } catch (e) {
      console.error('Error:', e);
      alert('An unexpected error occurred while finding trends.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestionAsProduct = async (suggestion: Suggestion) => {
    // This could be enhanced to pre-fill the "Add Product" form,
    // or directly trigger the generateProductContent mutation.
    // For now, we'll save it as a Suggestion model and show an alert.
    try {
      await client.models.Suggestion.create({
        productName: suggestion.productName,
        sourceUrl: suggestion.sourceUrl,
        reasonForSuggestion: suggestion.reasonForSuggestion,
      });
      alert(`Suggestion for "${suggestion.productName}" saved! You can now manage it from a separate suggestions list (to be built).`);
    } catch (e) {
      console.error('Error saving suggestion:', e);
      alert('Error saving suggestion.');
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={handleFindTrends} disabled={isLoading} className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300">
        {isLoading ? 'Searching for Trends...' : 'Find Trending Products'}
      </button>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Trending Product Suggestions:</h4>
          <ul className="divide-y divide-gray-200">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{suggestion.productName}</p>
                  <p className="text-sm text-gray-600">{suggestion.reasonForSuggestion}</p>
                  <a href={suggestion.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    Source
                  </a>
                </div>
                <button 
                  onClick={() => handleAddSuggestionAsProduct(suggestion)} 
                  className="ml-4 px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  Add to Page
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
