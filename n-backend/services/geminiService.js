const parseJsonLenient = (text) => {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch {}
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const maybeJson = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(maybeJson);
    } catch {}
  }

  return null;
};

const getTextFromGeminiResponse = (data) => {
  const parts =
    data?.candidates?.[0]?.content?.parts ||
    data?.candidates?.[0]?.content?.parts ||
    [];
  const textPart = parts.find((p) => typeof p.text === "string");
  return textPart?.text || "";
};

exports.analyzeFoodImageWithGemini = async ({ base64, mimeType }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = [
    "You are a food recognition and nutrition assistant.",
    "Given the image, identify the food and return ONLY valid JSON with this exact shape:",
    "{",
    '  "recognition": { "provider": "gemini", "name": string, "confidence": number },',
    '  "ingredients": string[],',
    '  "nutrition": {',
    '    "caloriesKcal": number, "proteinG": number, "carbsG": number, "fatG": number,',
    '    "vitamins": [{ "name": string, "amount": number, "unit": string, "percentDaily": number }],',
    '    "minerals": [{ "name": string, "amount": number, "unit": string, "percentDaily": number }]',
    "  },",
    '  "insights": {',
    '    "benefits": string[], "bestTimeToEat": string[], "warnings": string[]',
    "  }",
    "}",
    "Rules:",
    "- confidence must be 0..1",
    "- If you are not sure, set recognition.name to \"Unknown\" and confidence <= 0.4",
    "- Keep nutrition as a best-effort estimate; do not invent brand-specific facts",
    "- Return JSON only (no markdown, no extra text)"
  ].join("\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  if (!resp.ok) {
    const msg = data?.error?.message || "Gemini request failed";
    throw new Error(msg);
  }

  const text = getTextFromGeminiResponse(data);
  const parsed = parseJsonLenient(text);
  if (!parsed) {
    throw new Error("Gemini returned non-JSON output");
  }

  return parsed;
};

