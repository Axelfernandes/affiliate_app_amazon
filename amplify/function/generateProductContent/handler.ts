import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("LAMBDA LOADED - Global scope initialization success");

/**
 * Robustly extract and parse JSON from AI response
 */
/**
 * Helper to resolve shortened URLs (like amzn.to)
 */
async function resolveUrl(url: string): Promise<string> {
  if (
    !url.includes("amzn.to") &&
    !url.includes("bit.ly") &&
    !url.includes("tinyurl.com") &&
    !url.includes("t.co")
  ) {
    return url;
  }

  console.log(`[RESOLVER] Resolving shortened URL: ${url}`);
  try {
    // Some redirectors block HEAD or lack of UA
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    console.log(`[RESOLVER] Resolved to: ${response.url}`);
    return response.url;
  } catch (err) {
    console.warn(`[RESOLVER ERROR] Failed to resolve ${url}:`, err);
    return url;
  }
}

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
  const resolvedUrl = await resolveUrl(url);
  console.log("[RAINFOREST] Fetching data for:", resolvedUrl);
  try {
    // Broader ASIN extraction regex
    const asinMatch = resolvedUrl.match(
      /(?:dp|gp\/product|exec\/obidos\/asin|product-reviews|aw\/d|vdp)\/(?:[a-zA-Z0-9-]+\/)?([A-Z0-9]{10})/i,
    );
    const asin = asinMatch ? asinMatch[1] : null;

    let apiUrl = `https://api.rainforestapi.com/request?api_key=${apiKey}&type=product`;
    if (asin) {
      apiUrl += `&asin=${asin}&amazon_domain=amazon.com`;
      console.log(`[RAINFOREST] Using extracted ASIN: ${asin}`);
    } else {
      apiUrl += `&url=${encodeURIComponent(resolvedUrl)}`;
    }

    const response = await fetch(apiUrl);
    const data = (await response.json()) as any;

    if (data.product) {
      const p = data.product;
      console.log(`[RAINFOREST SUCCESS] Found product: ${p.title}`);

      // Rainforest images can be in 'images' array or 'main_image'
      let imgs = p.images?.map((img: any) => img.link) || [];
      if (imgs.length === 0 && p.main_image?.link) {
        imgs = [p.main_image.link];
      }

      return {
        title: p.title,
        price: p.buybox_winner?.price?.value || p.price?.value,
        msrp: p.list_price?.value || p.rrp?.value,
        images: imgs,
        description: p.description || p.feature_bullets?.join(" "),
      };
    } else {
      console.warn(
        "[RAINFOREST] Product not found in response:",
        data.message || "No details",
      );
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
  const resolvedUrl = await resolveUrl(url);
  console.log("[BEST BUY] Fetching data for:", resolvedUrl);
  try {
    const skuMatch = resolvedUrl.match(/skuId=(\d+)/);
    const sku = skuMatch ? skuMatch[1] : null;

    if (sku) {
      console.log(`[BEST BUY] Using SKU: ${sku}`);
      const response = await fetch(
        `https://api.bestbuy.com/v1/products(${sku}).json?apiKey=${apiKey}&show=name,regularPrice,salePrice,images,image,largeImage,shortDescription`,
      );
      const data = (await response.json()) as any;
      if (data.products && data.products[0]) {
        const p = data.products[0];
        console.log(`[BEST BUY SUCCESS] Found product: ${p.name}`);

        let imgs = p.images?.map((img: any) => img.href) || [];
        if (imgs.length === 0) {
          if (p.largeImage) imgs.push(p.largeImage);
          if (p.image) imgs.push(p.image);
        }

        return {
          title: p.name,
          price: p.salePrice,
          msrp: p.regularPrice,
          images: imgs,
          description: p.shortDescription || p.name,
        };
      } else {
        console.warn("[BEST BUY] SKU not found in API response");
      }
    } else {
      console.warn("[BEST BUY] Could not extract SKU from URL");
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
    let detectedStore = "Other";
    if (productUrl) {
      const lowerUrl = productUrl.toLowerCase();
      if (
        lowerUrl.includes("amazon.") ||
        lowerUrl.includes("amzn.to") ||
        lowerUrl.includes("a.co")
      ) {
        detectedStore = "Amazon";
        factualData = await fetchRainforestData(
          productUrl,
          RAINFOREST_API_KEY || "",
        );
      } else if (lowerUrl.includes("bestbuy.com")) {
        detectedStore = "Best Buy";
        factualData = await fetchBestBuyData(productUrl, BB_API_KEY || "");
      } else if (lowerUrl.includes("walmart.com")) {
        detectedStore = "Walmart";
      } else if (lowerUrl.includes("target.com")) {
        detectedStore = "Target";
      }
    }

    // 2. Prepare Context for Gemini
    const contextTitle = factualData?.title || productName;
    const contextPrice = factualData?.price || "";
    const contextMsrp = factualData?.msrp || "";
    const contextDesc = factualData?.description || productDescription || "";
    const contextImages = factualData?.images || [];

    console.log(`[CONTEXT] Images found: ${contextImages.length}`);

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
        6. Determine the most accurate category from this list: Electronics, Fashion, Home, Gaming, Health, Outdoor, Kitchen, Other.

        Return ONLY valid JSON:
        {"title": "...", "description": "...", "whyBuy": ["...", "...", "..."], "currentPrice": 0.0, "originalPrice": 0.0, "category": "..."}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const parsed = extractJSON(text);

        // 3. Data Fusion: Inject fetched images if missing or empty from AI
        const finalResult = {
          ...parsed,
          images:
            contextImages.length > 0 ? contextImages : parsed.images || [],
          // Ensure we use factual prices if AI didn't catch them accurately
          currentPrice: contextPrice || parsed.currentPrice,
          originalPrice: contextMsrp || parsed.originalPrice,
          store: detectedStore,
          category: parsed.category || "Other",
        };

        // Final safety check for images array
        if (!finalResult.images) finalResult.images = [];

        console.log(
          `[FINAL SUCCESS] Returning images: ${finalResult.images.length}`,
        );
        return JSON.stringify(finalResult);
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
