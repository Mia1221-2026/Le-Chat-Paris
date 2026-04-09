import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    if (process.env.MOCK_GENERATE === "true") {
      return NextResponse.json({
        translation:
          "This morning, I stopped by the flower section at Monoprix. " +
          "The bright colours of the tulips caught my eye. " +
          "I chose a small bunch almost without thinking. " +
          "Sometimes it is in these small everyday gestures that we find a little softness.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate the following text into clear, natural English. " +
            "Preserve the meaning and calm, reflective tone. " +
            "Keep it simple and readable for a language learner. " +
            "Output ONLY the translation — no labels, no commentary.",
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const translation = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ translation });
  } catch (error) {
    console.error("[translate] error:", error);
    return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
  }
}
