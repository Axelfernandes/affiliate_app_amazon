import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Sparkles, Save, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface AddProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function AddProductForm({ initialData, onSuccess }: AddProductFormProps) {
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    description: '',
    whyBuy: [] as string[],
    currentPrice: 0,
    originalPrice: 0
  });

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName || '');
      setProductUrl(initialData.sourceUrl || '');
    }
  }, [initialData]);

  const handleGenerateContent = async () => {
    if (!productName) return;
    setIsLoading(true);
    try {
      const client = generateClient<Schema>();
      const { data, errors } = await client.mutations.generateProductContent({
        productName: productName,
        productUrl: productUrl
      });
      if (data) {
        let content = typeof data === 'string' ? JSON.parse(data) : data;
        setGeneratedContent({
          ...content,
          currentPrice: content.currentPrice || 0,
          originalPrice: content.originalPrice || 0
        });
      }
      if (errors) console.error('Error generating content:', errors);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !generatedContent.title) return;
    try {
      const client = generateClient<Schema>();
      // Using any for casting to skip temporary schema sync issues
      await (client.models.Product as any).create({
        name: generatedContent.title,
        affiliateLink: productUrl,
        description: generatedContent.description,
        aiReview: generatedContent.whyBuy.join('\n'),
        currentPrice: generatedContent.currentPrice,
        originalPrice: generatedContent.originalPrice,
        priceHistory: JSON.stringify([
          { date: new Date().toISOString(), price: generatedContent.currentPrice }
        ]),
        status: 'PUBLISHED',
      });

      if (initialData?.id) {
        await client.models.Suggestion.delete({ id: initialData.id });
      }

      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('Error adding product:', e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Initial Intel</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white transition-all outline-hidden shadow-sm"
            placeholder="Product name or topic..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Affiliate Destination</label>
          <input
            type="text"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white transition-all outline-hidden shadow-sm"
            placeholder="https://www.amazon.com/..."
          />
        </div>
      </div>

      <button
        onClick={handleGenerateContent}
        disabled={isLoading || !productName}
        className="w-full btn-premium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 py-4 shadow-lg shadow-indigo-100"
      >
        <Sparkles size={20} className={cn(isLoading && "animate-spin")} />
        {isLoading ? 'AI FORGING DATA...' : 'FORGE CONTENT WITH AI'}
      </button>

      {generatedContent.title && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-900">
              <Sparkles size={80} />
            </div>

            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={18} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Output Verified</span>
            </div>

            <div className="grid gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engineered Title</span>
                <p className="text-xl font-display font-black text-slate-900">{generatedContent.title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Persuasive Logic</span>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{generatedContent.description}</p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Why Buy Context</span>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {generatedContent.whyBuy.map((point, i) => (
                    <li key={i} className="bg-white p-3 rounded-xl border border-indigo-50 shadow-sm text-xs text-indigo-700 font-semibold leading-tight">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-indigo-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Captured Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-black text-slate-900">${generatedContent.currentPrice}</span>
                    {generatedContent.originalPrice > generatedContent.currentPrice && (
                      <span className="text-sm text-slate-400 line-through font-medium">${generatedContent.originalPrice}</span>
                    )}
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Savings Delta</span>
                  <p className="text-lg font-display font-black text-emerald-600">
                    {generatedContent.originalPrice > 0
                      ? `${Math.round((1 - generatedContent.currentPrice / generatedContent.originalPrice) * 100)}% OFF`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddProduct}
            className="w-full btn-premium bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 py-4 shadow-lg shadow-emerald-100"
          >
            <Save size={20} />
            DEPLOY TO STOREFRONT
          </button>
        </div>
      )}
    </div>
  );
}
