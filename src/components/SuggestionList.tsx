import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Trash2, PlusCircle, ExternalLink } from 'lucide-react';

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
            const client = generateClient<Schema>();
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
            const client = generateClient<Schema>();
            await client.models.Suggestion.delete({ id });
            setSuggestions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting suggestion:', error);
        }
    };

    if (isLoading) return <div className="text-gray-500 italic p-6 text-center">Loading suggestions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h4 className="text-xl font-bold text-gray-900">Suggestions Inbox</h4>
                <button onClick={fetchSuggestions} className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Refresh</button>
            </div>

            {suggestions.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-500">No suggestions saved yet. Go to Trend Scout to find some!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {suggestions.map((s) => (
                        <div key={s.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-gray-900 text-lg">{s.productName}</h5>
                                    <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all">
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.reasonForSuggestion}</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => onApprove(s)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all"
                                >
                                    <PlusCircle size={18} />
                                    Create Product
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
