import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("LAMBDA LOADED - Global scope initialization success");

/**
 * Robustly extract and parse JSON from AI response
 */
function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log(
      "JSON.parse failed. Attempting cleanup on string of length:",
      text.length,
    );
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e2: any) {
        throw new Error("Invalid JSON structure: " + e2.message);
      }
    }
    throw new Error("No JSON object found in response");
  }
}

/**
 * Fetch factual data from Rainforest API (Amazon)
 */
async function fetchRainforestData(url: string, apiKey: string) {
  console.log("[RAINFOREST] Fetching data for:", url);
  try {
    const response = await fetch(
      `https://api.rainforestapi.com/request?api_key=${apiKey}&type=product&url=${encodeURIComponent(url)}`,
    );
    const data = (await response.json()) as any;

    if (data.product) {
      const p = data.product;
      return {
        title: p.title,
        price: p.buybox_winner?.price?.value || p.price?.value,
        msrp: p.list_price?.value || p.rrp?.value,
        images: p.images?.map((img: any) => img.link) || [],
        description: p.description || p.feature_bullets?.join(" "),
      };
    }
  } catch (err) {
    console.error("[RAINFOREST ERROR]", err);
  }
  return null;
}

/**
 * Fetch factual data from Best Buy API
 */
async function fetchBestBuyData(url: string, apiKey: string) {
  console.log("[BEST BUY] Fetching data for:", url);
  try {
    // Extract SKU from URL if possible (e.g., /site/.../skuId=12345)
    const skuMatch = url.match(/skuId=(\d+)/);
    const sku = skuMatch ? skuMatch[1] : null;

    if (sku) {
      const response = await fetch(
        `https://api.bestbuy.com/v1/products(${sku}).json?apiKey=${apiKey}&show=name,regularPrice,salePrice,images,shortDescription`,
      );
      const data = (await response.json()) as any;
      if (data.products && data.products[0]) {
        const p = data.products[0];
        return {
          title: p.name,
          price: p.salePrice,
          msrp: p.regularPrice,
          images: p.images?.map((img: any) => img.href) || [],
          description: p.shortDescription,
        };
      }
    }
  } catch (err) {
    console.error("[BEST BUY ERROR]", err);
  }
  return null;
}

/**
 * AppSync Lambda Resolver Handler
 */
export const handler = async (event: any) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] HANDLER INVOKED for:`,
      event.arguments?.productName,
    );

    const { productName, productDescription, productUrl } =
      event.arguments || {};
    if (!productName) throw new Error("productName is required");

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const BB_API_KEY = process.env.BEST_BUY_API_KEY;
    const RAINFOREST_API_KEY = process.env.RAINFOREST_API_AMAZON;

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured.");

    // 1. Fetch factual data if a URL is provided
    let factualData: any = null;
    if (productUrl) {
      if (productUrl.includes("amazon.com") || productUrl.includes("amzn.to")) {
        factualData = await fetchRainforestData(
          productUrl,
          RAINFOREST_API_KEY || "",
        );
      } else if (productUrl.includes("bestbuy.com")) {
        factualData = await fetchBestBuyData(productUrl, BB_API_KEY || "");
      }
    }

    // 2. Prepare Context for Gemini
    const contextTitle = factualData?.title || productName;
    const contextPrice = factualData?.price || "";
    const contextMsrp = factualData?.msrp || "";
    const contextDesc = factualData?.description || productDescription || "";
    const contextImages = factualData?.images || [];

    console.log("Initializing GoogleGenerativeAI SDK...");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite-preview-02-05",
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[MODEL START] Attempting: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are a professional affiliate marketing copywriter. 
        Use the following FACTUAL data to generate a compelling product review.
        
        FACTS:
        - Title: ${contextTitle}
        - Description/Specs: ${contextDesc}
        - Current Price: ${contextPrice}
        - Original/MSRP: ${contextMsrp}
        
        GENERATE:
        1. An SEO-optimized product title.
        2. A 3-sentence persuasive sales description.
        3. 3 key "Why Buy" points based on the specs.
        4. Confirm the current price (return numeric value only).
        5. Confirm the original price (return numeric value only).

        Return ONLY valid JSON:
        {"title": "...", "description": "...", "whyBuy": ["...", "...", "..."], "currentPrice": 0.0, "originalPrice": 0.0}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const parsed = extractJSON(text);

        // 3. Data Fusion: Inject fetched images if missing or empty from AI
        return JSON.stringify({
          ...parsed,
          images:
            contextImages.length > 0 ? contextImages : parsed.images || [],
          // Ensure we use factual prices if AI didn't catch them accurately
          currentPrice: contextPrice || parsed.currentPrice,
          originalPrice: contextMsrp || parsed.originalPrice,
        });
      } catch (error: any) {
        console.error(
          `[ERROR] Model ${modelName} failed:`,
          error?.message || error,
        );
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error("All Gemini 2.x models failed");
  } catch (topLevelError: any) {
    console.error("FATAL LAMBDA CRASH:", topLevelError);
    return JSON.stringify({
      title: `${event.arguments?.productName || "Product"} (Draft)`,
      description: `AI Fail: ${topLevelError.message}`,
      whyBuy: ["Manual update required", "Check API keys"],
      currentPrice: 0,
      originalPrice: 0,
      images: [],
    });
  }
};
