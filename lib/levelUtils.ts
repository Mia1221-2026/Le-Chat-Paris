export const LEVEL_INSTRUCTIONS: Record<string, string> = {
  A1: "A1 (beginner): use only the most basic everyday vocabulary. Very short sentences, maximum one clause each. Avoid all connectors except 'and' and 'but'.",
  A2: "A2 (elementary): use simple, familiar vocabulary. Keep sentences short and clear. Avoid complex tenses or subordinate clauses.",
  B1: "B1 (intermediate): use natural, learner-friendly language. Mix simple and compound sentences. Moderate vocabulary.",
  B2: "B2 (upper-intermediate): use fluent, expressive language. Varied vocabulary and sentence structure. Some complex clauses are fine.",
  C1: "C1 (advanced): use sophisticated, natural language with rich vocabulary, nuanced expression, and complex sentence structures.",
};

export function getLevelInstruction(level: string): string {
  // Normalise: "B1 — Intermediate" → "B1"
  const key = level.trim().slice(0, 2).toUpperCase();
  return LEVEL_INSTRUCTIONS[key] ?? LEVEL_INSTRUCTIONS["B1"];
}
