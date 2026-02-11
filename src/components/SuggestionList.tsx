import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Trash2, PlusCircle, ExternalLink } from 'lucide-react';

const client = generateClient<Schema>();

interface SuggestionListProps {
    onApprove: (suggestion: any) => void;
}

export default function SuggestionList({ onApprove }: SuggestionListProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const { data } = await client.models.Suggestion.list();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await client.models.Suggestion.delete({ id });
            setSuggestions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting suggestion:', error);
        }
    };

    if (isLoading) return <div className="text-gray-500 italic">Loading suggestions...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-800">Saved Suggestions</h4>
                <button onClick={fetchSuggestions} className="text-sm text-blue-500 hover:underline">Refresh</button>
            </div>

            {suggestions.length === 0 ? (
                <p className="text-gray-500">No suggestions saved yet.</p>
            ) : (
                <div className="grid gap-4">
                    {suggestions.map((s) => (
                        <div key={s.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-gray-900">{s.productName}</h5>
                                    <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{s.reasonForSuggestion}</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => onApprove(s)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                >
                                    <PlusCircle size={16} />
                                    Create Product
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
