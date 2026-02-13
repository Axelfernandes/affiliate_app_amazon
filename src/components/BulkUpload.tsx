import { useState, useRef } from "react";
import * as Papa from "papaparse";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

export default function BulkUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<any>) => {
        const data = results.data;

        // Validate headers
        const firstRow = data[0];
        if (
          !firstRow ||
          (!firstRow.name && !firstRow.productName) ||
          (!firstRow.url && !firstRow.sourceUrl)
        ) {
          setError(
            'Invalid CSV format. Please ensure you have "name" and "url" columns.',
          );
          setIsUploading(false);
          return;
        }

        let successCount = 0;
        let failedCount = 0;
        const client = generateClient<Schema>();

        // Batch create suggestions
        for (const row of data) {
          try {
            const name = row.name || row.productName;
            const url = row.url || row.sourceUrl;
            const reason =
              row.reason ||
              row.reasonForSuggestion ||
              "Imported via bulk upload";
            const category = row.category || "Other";
            const store = row.store || "Other";

            if (!name || !url) {
              failedCount++;
              continue;
            }

            await client.models.Suggestion.create({
              productName: name,
              sourceUrl: url,
              reasonForSuggestion: reason,
              category: category,
              store: store,
            });
            successCount++;
          } catch (err: any) {
            console.error("Error importing row:", row, err);
            failedCount++;
          }
        }

        setResult({ success: successCount, failed: failedCount });
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (err: Error) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsUploading(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
            <Upload size={32} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">
              Bulk Upload Products
            </h4>
            <p className="text-gray-500 mt-1">
              Upload a CSV file to add multiple products to your Suggestions
              Inbox.
            </p>
            <a
              href="/sample_template.csv"
              download="auto_niche_template.csv"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 px-3 py-1.5 rounded-full transition-all"
            >
              <FileText size={14} />
              Download CSV Template
            </a>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all disabled:bg-blue-300 flex items-center gap-2"
            >
              <FileText size={20} />
              {isUploading ? "Importing..." : "Select CSV File"}
            </button>
            <p className="text-xs text-gray-400">
              Required columns:{" "}
              <code className="bg-gray-100 px-1 rounded">name</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">url</code>. Optional:{" "}
              <code className="bg-gray-100 px-1 rounded">category</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">store</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">reason</code>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in zoom-in-95">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-6 bg-green-50 border border-green-100 rounded-2xl animate-in slide-in-from-top-2">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h5 className="font-bold text-green-900">Import Complete!</h5>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-green-700">
                    Successfully added{" "}
                    <span className="font-bold">{result.success}</span> products
                    to your inbox.
                  </p>
                  {result.failed > 0 && (
                    <p className="text-sm text-amber-700">
                      Skipped <span className="font-bold">{result.failed}</span>{" "}
                      rows due to errors or missing data.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-green-600 hover:bg-green-100 p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <h5 className="font-bold text-gray-900 mb-3">CSV Template Example</h5>
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <pre className="text-blue-400 text-xs font-mono">
            {`productName,sourceUrl,category,store,reasonForSuggestion
"Logitech MX Master 3S","https://amazon.com/...","Electronics","Amazon","Best office mouse"
"Dyson V15 Detect","https://bestbuy.com/...","Home","Best Buy","Incredible suction"
"Ninja Air Fryer","https://amazon.com/...","Kitchen","Amazon","Best selling air fryer"
`}
          </pre>
        </div>
        <p className="text-sm text-gray-500 mt-3 italic">
          Tip: You can use "productName" or "name", and "sourceUrl" or "url" as
          headers.
        </p>
      </div>
    </div>
  );
}
