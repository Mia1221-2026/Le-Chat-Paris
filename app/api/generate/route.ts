import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getLevelInstruction } from "@/lib/levelUtils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Dev mock — activated by MOCK_GENERATE=true in .env.local
const MOCK_STORIES: Record<string, string> = {
  French:
    "Ce matin, je me suis arrêté devant le rayon fleurs du Monoprix. " +
    "Les couleurs vives des tulipes contrastaient avec la grisaille du dehors. " +
    "J'en ai choisi un petit bouquet, presque sans réfléchir. " +
    "C'est souvent dans ces petits gestes du quotidien qu'on trouve un peu de douceur.",
  English:
    "I stopped by the flower section at Monoprix this morning. " +
    "The bright tulips stood out against the grey sky outside. " +
    "I picked up a small bunch almost without thinking. " +
    "It's often in these small everyday moments that you find a quiet kind of joy.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caption, targetLanguage, languageLevel, image } = body;

    if (!caption && !image) {
      return NextResponse.json(
        { error: "Missing caption or image" },
        { status: 400 }
      );
    }

    if (process.env.MOCK_GENERATE === "true") {
      const language: string = targetLanguage ?? "English";
      const story = MOCK_STORIES[language] ?? MOCK_STORIES.English;
      return NextResponse.json({ story });
    }

    const language: string = targetLanguage ?? "English";
    const levelInstr = getLevelInstruction(languageLevel ?? "B1");

    const systemPrompt =
      `You are a writing companion helping someone keep a language-learning journal.\n` +
      `Your task: write a short first-person diary entry of exactly 3–5 sentences about the moment described.\n` +
      `Rules:\n` +
      `- Do NOT repeat or restate the caption verbatim. Expand it into a full narrative.\n` +
      `- If a photo is provided, base the story on what you see in the image.\n` +
      `- Tone: calm, personal, reflective. Grounded in real detail.\n` +
      `- Output language: ${language}. Write the ENTIRE response in ${language}.\n` +
      `- Language level: ${levelInstr}\n` +
      `- Output ONLY the diary text. No titles, no labels, no commentary.`;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

    if (image) {
      userContent.push({ type: "image_url", image_url: { url: image as string } });
    }

    const text = caption ? `Caption: ${caption}` : "Write about this moment.";
    userContent.push({ type: "text", text });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
    });

    const story = completion.choices[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ story });
  } catch (error) {
    console.error("[generate] error:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
