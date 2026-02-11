import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Sparkles, Save, X } from 'lucide-react';

interface AddProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function AddProductForm({ initialData, onSuccess }: AddProductFormProps) {
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({ title: '', description: '', whyBuy: [] as string[] });

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName || '');
      setProductUrl(initialData.sourceUrl || '');
    }
  }, [initialData]);

  const handleGenerateContent = async () => {
    if (!productName) {
      alert('Please enter a product name.');
      return;
    }
    setIsLoading(true);
    try {
      const client = generateClient<Schema>();
      const { data, errors } = await client.mutations.generateProductContent({
        productName: productName,
        productUrl: productUrl
      });
      if (data) {
        let content;
        try {
          content = typeof data === 'string' ? JSON.parse(data) : data;
          setGeneratedContent(content);
        } catch (parseErr) {
          console.error('JSON Parse Error in AddProductForm. Data was:', data);
          throw parseErr;
        }
      }
      if (errors) {
        console.error('Error generating content:', errors);
        alert(`Error generating content: ${errors[0].message}`);
      }
    } catch (e) {
      console.error('Error:', e);
      alert('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !generatedContent.title) {
      alert('Please generate content before adding the product.');
      return;
    }
    try {
      const client = generateClient<Schema>();
      await client.models.Product.create({
        name: generatedContent.title,
        affiliateLink: productUrl,
        description: generatedContent.description,
        aiReview: generatedContent.whyBuy.join('\\n'),
        status: 'PUBLISHED', // Default to published for now
      });

      // If we came from a suggestion, mark it as approved
      if (initialData?.id) {
        await client.models.Suggestion.delete({ id: initialData.id });
      }

      alert('Product published successfully!');

      if (onSuccess) {
        onSuccess();
      } else {
        // Reset form if no onSuccess handler
        setProductName('');
        setProductUrl('');
        setGeneratedContent({ title: '', description: '', whyBuy: [] });
      }
    } catch (e) {
      console.error('Error adding product:', e);
      alert('Error adding product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name or Topic</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., 'Ergonomic Standing Desk'"
          />
        </div>
        <div>
          <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700">Amazon Affiliate Link</label>
          <input
            type="text"
            id="productUrl"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="https://www.amazon.com/..."
          />
        </div>
      </div>

      <button
        onClick={handleGenerateContent}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition-all"
      >
        <Sparkles size={20} className={isLoading ? 'animate-pulse' : ''} />
        {isLoading ? 'Wait, AI is writing...' : 'Forge Content with AI'}
      </button>

      {generatedContent.title && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border border-blue-100 rounded-xl bg-blue-50/30">
            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">AI Output</h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                <p className="text-lg font-bold text-gray-900">{generatedContent.title}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                <p className="text-gray-700 leading-relaxed">{generatedContent.description}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Highlights</label>
                <ul className="mt-2 space-y-2">
                  {generatedContent.whyBuy.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-green-500 mt-1">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddProduct}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save size={22} />
            Publish to Storefront
          </button>
        </div>
      )}
    </div>
  );
}
