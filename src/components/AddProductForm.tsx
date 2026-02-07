import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export default function AddProductForm() {
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({ title: '', description: '', whyBuy: [] as string[] });

  const handleGenerateContent = async () => {
    if (!productName) {
      alert('Please enter a product name.');
      return;
    }
    setIsLoading(true);
    try {
      const { data, errors } = await client.mutations.generateProductContent({ 
        productName: productName,
        productUrl: productUrl 
      });
      if (data) {
        const content = JSON.parse(data);
        setGeneratedContent(content);
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
      await client.models.Product.create({
        name: generatedContent.title,
        affiliateLink: productUrl,
        description: generatedContent.description,
        aiReview: generatedContent.whyBuy.join('
'),
        status: 'DRAFT',
      });
      alert('Product added successfully!');
      // Reset form
      setProductName('');
      setProductUrl('');
      setGeneratedContent({ title: '', description: '', whyBuy: [] });
    } catch (e) {
      console.error('Error adding product:', e);
      alert('Error adding product.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name or Topic</label>
        <input
          type="text"
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 'High-Quality Mechanical Keyboard'"
        />
      </div>
      <div>
        <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700">Amazon Affiliate Link</label>
        <input
          type="text"
          id="productUrl"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://www.amazon.com/..."
        />
      </div>
      <button onClick={handleGenerateContent} disabled={isLoading} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300">
        {isLoading ? 'Generating...' : 'Generate AI Content'}
      </button>

      {generatedContent.title && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-md font-semibold">Generated Content:</h4>
          <p><strong>Title:</strong> {generatedContent.title}</p>
          <p><strong>Description:</strong> {generatedContent.description}</p>
          <div>
            <strong>Why Buy:</strong>
            <ul className="list-disc list-inside ml-4">
              {generatedContent.whyBuy.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
          <button onClick={handleAddProduct} className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Add Product to Page
          </button>
        </div>
      )}
    </div>
  );
}
