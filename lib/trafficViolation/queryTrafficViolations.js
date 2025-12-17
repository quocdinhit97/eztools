import { parseTrafficViolationsHTML } from "./parseTrafficViolationsHTML.js";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_CONFIG = {
  BASE_URL: "https://www.csgt.vn",
  ENDPOINTS: {
    CAPTCHA: "/lib/captcha/captcha.class.php",
    SUBMIT_FORM: "/?mod=contact&task=tracuu_post&ajax",
    VIOLATIONS_RESULTS: "/tra-cuu-phuong-tien-vi-pham.html",
  },
  TIMEOUTS: {
    HTTP_REQUEST: 10000,
  },
  RETRY: {
    MAX_ATTEMPTS: 15, // Increased for OCR API reliability
  },
  VEHICLE_TYPES: {
    CAR: "1",
    MOTORCYCLE: "2",
    ELECTRIC_BIKE: "3",
    DEFAULT: "2",
  },
  HTTP_HEADERS: {
    USER_AGENT:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ACCEPT:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    CONTENT_TYPE: "application/x-www-form-urlencoded",
  },
  OCR_API: {
    // OCR.space API - Free tier: 25,000 requests/month
    ENDPOINT: "https://api.ocr.space/parse/image",
    API_KEY: "K87899142388957", // Free public API key
    ENGINE: "2", // OCR Engine 2 (better for captchas)
  },
};

// ============================================================================
// HTTP CLIENT (Using Native Fetch)
// ============================================================================

class HTTPClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.cookies = new Map();
    this.headers = {
      "User-Agent": API_CONFIG.HTTP_HEADERS.USER_AGENT,
      Accept: API_CONFIG.HTTP_HEADERS.ACCEPT,
    };
  }

  _storeCookies(response) {
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      const cookies = setCookieHeader.split(",").map((c) => c.trim());
      cookies.forEach((cookie) => {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        if (name && value) {
          this.cookies.set(name.trim(), value.trim());
        }
      });
    }
  }

  _getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  async get(url, options = {}) {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    const cookieString = this._getCookieString();

    const response = await fetch(fullURL, {
      method: "GET",
      headers: {
        ...this.headers,
        ...(cookieString && { Cookie: cookieString }),
        ...options.headers,
      },
      credentials: "include",
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.HTTP_REQUEST),
    });

    this._storeCookies(response);

    if (options.responseType === "arraybuffer") {
      return { data: await response.arrayBuffer() };
    }

    return { data: await response.text() };
  }

  async post(url, body, options = {}) {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    const cookieString = this._getCookieString();

    const response = await fetch(fullURL, {
      method: "POST",
      headers: {
        ...this.headers,
        ...(cookieString && { Cookie: cookieString }),
        ...options.headers,
      },
      body: body,
      credentials: "include",
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.HTTP_REQUEST),
    });

    this._storeCookies(response);

    const text = await response.text();
    // Handle JSON response
    try {
      return { data: JSON.parse(text) };
    } catch {
      return { data: text };
    }
  }
}

function createHTTPClient() {
  return new HTTPClient();
}

// ============================================================================
// OCR USING EXTERNAL API
// ============================================================================

async function recognizeCaptchaWithOCR(imageBuffer) {
  try {
    const base64Image = imageBuffer.toString("base64");
    
    const formData = new URLSearchParams({
      apikey: API_CONFIG.OCR_API.API_KEY,
      base64Image: `data:image/png;base64,${base64Image}`,
      language: "eng",
      isOverlayRequired: "false",
      detectOrientation: "true",
      scale: "true",
      OCREngine: API_CONFIG.OCR_API.ENGINE,
    });

    const response = await fetch(API_CONFIG.OCR_API.ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.HTTP_REQUEST),
    });

    if (!response.ok) {
      throw new Error(`OCR API failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
    }

    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const text = result.ParsedResults[0].ParsedText;
      // Clean and normalize text
      const normalizedText = text
        .trim()
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, ""); // Remove special chars
      
      return normalizedText;
    }
    
    return "";
  } catch (error) {
    console.error("OCR error:", error.message);
    return "";
  }
}

// ============================================================================
// CAPTCHA HANDLING
// ============================================================================

async function fetchAndRecognizeCaptcha(httpClient) {
  const response = await httpClient.get(API_CONFIG.ENDPOINTS.CAPTCHA, {
    responseType: "arraybuffer",
  });

  const imageBuffer = Buffer.from(response.data);
  const captchaText = await recognizeCaptchaWithOCR(imageBuffer);

  return captchaText;
}

// ============================================================================
// API INTERACTIONS
// ============================================================================

async function submitViolationQuery(httpClient, licensePlate, captchaText, vehicleType) {
  // Sử dụng URLSearchParams thay cho qs.stringify
  const formData = new URLSearchParams({
    BienKS: licensePlate,
    Xe: vehicleType,
    captcha: captchaText,
    ipClient: "9.9.9.91",
    cUrl: "1",
  }).toString();

  return httpClient.post(API_CONFIG.ENDPOINTS.SUBMIT_FORM, formData, {
    headers: { "Content-Type": API_CONFIG.HTTP_HEADERS.CONTENT_TYPE },
  });
}

async function fetchViolationDetails(httpClient, licensePlate) {
  return httpClient.get(
    `${API_CONFIG.ENDPOINTS.VIOLATIONS_RESULTS}?&LoaiXe=1&BienKiemSoat=${licensePlate}`
  );
}

// ============================================================================
// MAIN API FUNCTION
// ============================================================================
export async function queryTrafficViolations(
  licensePlate,
  vehicleType = API_CONFIG.VEHICLE_TYPES.DEFAULT,
  remainingRetries = API_CONFIG.RETRY.MAX_ATTEMPTS
) {
  const startTime = Date.now();
  const currentAttempt = API_CONFIG.RETRY.MAX_ATTEMPTS - remainingRetries + 1;

  try {
    const httpClient = createHTTPClient();
    const captchaText = await fetchAndRecognizeCaptcha(httpClient);

    console.log(
      `[${licensePlate}] Captcha recognized: "${captchaText}" (${Date.now() - startTime}ms)`
    );

    const submitResponse = await submitViolationQuery(
      httpClient,
      licensePlate,
      captchaText,
      vehicleType
    );

    if (submitResponse.data === 404) {
      if (remainingRetries > 0) {
        return queryTrafficViolations(licensePlate, vehicleType, remainingRetries - 1);
      }

      throw new Error(
        `Failed after ${API_CONFIG.RETRY.MAX_ATTEMPTS} attempts. Captcha verification unsuccessful.`
      );
    }

    const detailsResponse = await fetchViolationDetails(httpClient, licensePlate);
    const violations = parseTrafficViolationsHTML(detailsResponse.data);

    const elapsedTime = Date.now() - startTime;
    console.log(`[${licensePlate}] Query completed successfully in ${elapsedTime}ms`);

    return violations;
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(
      `[${licensePlate}] Query failed after ${elapsedTime}ms:`,
      error.message
    );
    return null;
  }
}