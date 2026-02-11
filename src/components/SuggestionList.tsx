import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Trash2, PlusCircle, ExternalLink, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <Inbox className="text-indigo-600" size={20} />
                    <h4 className="text-lg font-display font-bold text-slate-800 uppercase tracking-wider">Opportunity Inbox</h4>
                </div>
                <button
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
                </button>
            </div>

            {isLoading && suggestions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Fetching leads...</p>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <p className="text-slate-400 font-display font-bold text-xl uppercase tracking-widest">Inbox Clear</p>
                    <p className="text-slate-400/60 mt-2">No new trends captured yet. Use the Scout to find deals.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {suggestions.map((s) => (
                        <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-indigo-100 hover:bg-slate-50/50 transition-all shadow-sm">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h5 className="font-display font-bold text-slate-900 text-xl leading-none">{s.productName}</h5>
                                    <a
                                        href={s.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                                        title="Source"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">{s.reasonForSuggestion}</p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                <button
                                    onClick={() => onApprove(s)}
                                    className="flex-1 md:flex-none btn-premium bg-indigo-600 text-white flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-indigo-100"
                                >
                                    <PlusCircle size={18} />
                                    <span className="text-xs font-black uppercase">Build Product</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Discard"
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
