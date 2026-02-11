import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

type Suggestion = {
  productName: string;
  sourceUrl: string;
  reasonForSuggestion: string;
}

import { Check, Bookmark } from 'lucide-react';

export default function TrendScout() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const handleFindTrends = async () => {
    setIsLoading(true);
    setSuggestions([]);
    setSavedIndices(new Set());
    try {
      const client = generateClient<Schema>();
      const { data, errors } = await client.queries.findTrends({ query: 'bestselling tech gadgets' });
      if (data) {
        let trends;
        try {
          trends = typeof data === 'string' ? JSON.parse(data) : data;
          setSuggestions(trends);
        } catch (parseErr) {
          console.error('JSON Parse Error in TrendScout. Data was:', data);
          throw parseErr;
        }
      }
      if (errors) {
        console.error('Error finding trends:', errors);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestionAsProduct = async (suggestion: Suggestion, index: number) => {
    if (savedIndices.has(index)) return; // Already saved

    try {
      const client = generateClient<Schema>();
      await client.models.Suggestion.create({
        productName: suggestion.productName,
        sourceUrl: suggestion.sourceUrl,
        reasonForSuggestion: suggestion.reasonForSuggestion,
      });

      // Update saved state for visual feedback
      setSavedIndices(prev => new Set(prev).add(index));
    } catch (e) {
      console.error('Error saving suggestion:', e);
      alert('Error saving suggestion.');
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={handleFindTrends} disabled={isLoading} className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:bg-purple-300 transition-all flex items-center justify-center gap-2">
        {isLoading ? 'Searching for Trends...' : 'Find Trending Products'}
      </button>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800">Trending Product Suggestions:</h4>
          <ul className="divide-y divide-gray-200">
            {suggestions.map((suggestion, i) => {
              const isSaved = savedIndices.has(i);
              return (
                <li key={i} className="py-4 flex justify-between items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{suggestion.productName}</p>
                    <p className="text-sm text-gray-600">{suggestion.reasonForSuggestion}</p>
                    <a href={suggestion.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1 mt-1">
                      Source
                    </a>
                  </div>
                  <button
                    onClick={() => handleAddSuggestionAsProduct(suggestion, i)}
                    disabled={isSaved}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isSaved
                      ? 'bg-gray-100 text-green-600 cursor-default'
                      : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                      }`}
                  >
                    {isSaved ? (
                      <>
                        <Check size={16} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        Save Suggestion
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
