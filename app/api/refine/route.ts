import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getLevelInstruction } from "@/lib/levelUtils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, targetLanguage, languageLevel } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    if (process.env.MOCK_GENERATE === "true") {
      return NextResponse.json({ story: text });
    }

    const language: string = targetLanguage ?? "English";
    const levelInstr = getLevelInstruction(languageLevel ?? "B1");

    const systemPrompt =
      `You are a gentle language editor helping a learner polish their diary entry.\n` +
      `Polish the text: improve fluency and language quality while STRICTLY preserving the user's meaning and voice.\n` +
      `Rules:\n` +
      `- Do NOT change the events or details described\n` +
      `- Do NOT invent new content\n` +
      `- Tone: calm, personal, reflective\n` +
      `- Output language: ${language}. Write the ENTIRE response in ${language}.\n` +
      `- Language level: ${levelInstr}\n` +
      `- Output ONLY the refined diary text. No titles, no labels.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.5,
    });

    const story = completion.choices[0]?.message?.content?.trim() ?? text;
    return NextResponse.json({ story });
  } catch (error) {
    console.error("[refine] error:", error);
    return NextResponse.json({ error: "Failed to refine" }, { status: 500 });
  }
}
