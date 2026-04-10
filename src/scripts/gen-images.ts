import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateAndLog(theme: string, prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log(`THEME_START:${theme}`);
        console.log(part.inlineData.data);
        console.log(`THEME_END:${theme}`);
      }
    }
  } catch (error) {
    console.error(`Error for ${theme}:`, error);
  }
}

async function run() {
  await generateAndLog("robots", "Cute cartoon robot workshop background for a kids app, vibrant primary colors, simple soft shapes, friendly toy robots, 2D flat illustration style, no text, high quality, childish aesthetic");
  await generateAndLog("space", "Cute cartoon space background for a kids app, smiling planets, colorful stars, purple and blue nebula, 2D flat illustration style, no text, high quality, childish aesthetic");
  await generateAndLog("dinosaurs", "Cute cartoon dinosaur jungle background for a kids app, friendly baby dinosaurs, happy volcano, bright green and yellow tones, 2D flat illustration style, no text, high quality, childish aesthetic");
  await generateAndLog("princesses", "Cute cartoon princess castle in the clouds background for a kids app, rainbows, sparkles, pink and gold pastel tones, 2D flat illustration style, no text, high quality, childish aesthetic");
  await generateAndLog("cars", "Cute cartoon toy car city background for a kids app, colorful winding roads, simple block buildings, bright red and blue tones, 2D flat illustration style, no text, high quality, childish aesthetic");
}

run();
